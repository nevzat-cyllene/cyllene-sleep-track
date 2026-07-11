"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { hasSeenGuestSplash } from "@/lib/guest-splash-storage";
import { getDevicePlatform } from "@/lib/recording-device";
import { cn } from "@/lib/utils";

/** After moon entrance finishes, wait a beat then show install prompt. */
const TOAST_DELAY_MS = 2800;
export const GUEST_SPLASH_COMPLETE_EVENT = "cyllene:guest-splash-complete";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface InstallPWANavigator extends Navigator {
  standalone?: boolean;
}

interface InstallPWAProps {
  variant?: "button" | "banner" | "toast";
  className?: string;
}

const INSTALL_STORAGE_KEY = "cyllene-pwa-installed";
const DISMISS_STORAGE_KEY = "cyllene-pwa-prompt-dismissed-at";
const DISMISS_COOLDOWN_MS = 1000 * 60 * 60 * 12; // 12 saat

function hasStoredInstallFlag() {
  try {
    return window.localStorage.getItem(INSTALL_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function storeInstallFlag() {
  try {
    window.localStorage.setItem(INSTALL_STORAGE_KEY, "1");
  } catch {
    // ignore
  }
}

function isPromptDismissedRecently() {
  try {
    const raw = window.localStorage.getItem(DISMISS_STORAGE_KEY);
    if (!raw) return false;
    const dismissedAt = Number(raw);
    if (!Number.isFinite(dismissedAt)) return false;
    return Date.now() - dismissedAt < DISMISS_COOLDOWN_MS;
  } catch {
    return false;
  }
}

function storePromptDismissed() {
  try {
    window.localStorage.setItem(DISMISS_STORAGE_KEY, String(Date.now()));
  } catch {
    // ignore
  }
}

function isStandaloneDisplayMode() {
  if (typeof window === "undefined") return false;
  try {
    const navigatorWithInstall = window.navigator as InstallPWANavigator;
    return (
      window.matchMedia?.("(display-mode: standalone)").matches === true ||
      navigatorWithInstall.standalone === true
    );
  } catch {
    return false;
  }
}

function isMobileInstallTarget() {
  const platform = getDevicePlatform();
  return platform === "ios" || platform === "android";
}

function AppIcon({ className, size = 40 }: { className?: string; size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/icons/icon-192.png"
      alt="Cyllene"
      width={size}
      height={size}
      className={cn("rounded-[0.7rem] object-cover", className)}
      decoding="async"
    />
  );
}

export function InstallPWA({ variant = "button", className }: InstallPWAProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "other">("other");
  const [dismissed, setDismissed] = useState(false);
  const [toastReady, setToastReady] = useState(false);
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    const device = getDevicePlatform();
    setIsMobile(isMobileInstallTarget());
    setPlatform(device === "ios" || device === "android" ? device : "other");
    setInstalled(isStandaloneDisplayMode() || hasStoredInstallFlag());
    setDismissed(isPromptDismissedRecently());
  }, []);

  useEffect(() => {
    const onRecording = (event: Event) => {
      const detail = (event as CustomEvent<boolean>).detail;
      setRecording(Boolean(detail));
    };
    window.addEventListener("cyllene:recording-ui", onRecording);
    return () => window.removeEventListener("cyllene:recording-ui", onRecording);
  }, []);

  useEffect(() => {
    if (installed || !isMobile) return;

    const markInstalled = () => {
      storeInstallFlag();
      setInstalled(true);
      setDeferredPrompt(null);
    };

    const installPromptHandler = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", installPromptHandler);
    window.addEventListener("appinstalled", markInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", installPromptHandler);
      window.removeEventListener("appinstalled", markInstalled);
    };
  }, [installed, isMobile]);

  useEffect(() => {
    if (variant !== "toast" || installed || !isMobile || dismissed) return;

    let cancelled = false;
    let delayTimer: number | undefined;
    let pollTimer: number | undefined;

    const showAfterDelay = () => {
      if (delayTimer) window.clearTimeout(delayTimer);
      delayTimer = window.setTimeout(() => {
        if (!cancelled) setToastReady(true);
      }, TOAST_DELAY_MS);
    };

    const arm = () => {
      if (hasSeenGuestSplash()) showAfterDelay();
    };

    arm();

    // First visit: splash marks storage + fires event when finished.
    const onSplashComplete = () => showAfterDelay();
    window.addEventListener(GUEST_SPLASH_COMPLETE_EVENT, onSplashComplete);

    if (!hasSeenGuestSplash()) {
      pollTimer = window.setInterval(() => {
        if (!hasSeenGuestSplash()) return;
        window.clearInterval(pollTimer);
        pollTimer = undefined;
        showAfterDelay();
      }, 350);
    }

    return () => {
      cancelled = true;
      if (delayTimer) window.clearTimeout(delayTimer);
      if (pollTimer) window.clearInterval(pollTimer);
      window.removeEventListener(GUEST_SPLASH_COMPLETE_EVENT, onSplashComplete);
    };
  }, [variant, installed, isMobile, dismissed]);

  if (!isMobile || installed) return null;
  if (variant === "toast" && (dismissed || !toastReady || recording)) return null;

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        storeInstallFlag();
        setInstalled(true);
      }
    } finally {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    storePromptDismissed();
    setDismissed(true);
    setToastReady(false);
  };

  const subtitle =
    platform === "ios"
      ? "Paylaş → Ana Ekrana Ekle ile Cyllene ikonunu ekleyin."
      : deferredPrompt
        ? "Gece kaydı daha stabil çalışır."
        : "Menü → Ana ekrana ekle / Uygulamayı yükle";

  if (variant === "toast") {
    return (
      <div
        className={cn(
          "pointer-events-none fixed inset-x-3 z-[220] md:hidden",
          "bottom-[calc(6.4rem+env(safe-area-inset-bottom))]",
          className
        )}
      >
        <div className="pointer-events-auto relative overflow-hidden rounded-[1.35rem] border border-[#78b7ff]/18 bg-[#071627]/96 p-3.5 shadow-[0_20px_60px_rgba(0,8,24,.55),inset_0_1px_0_rgba(255,255,255,.08)] backdrop-blur-xl">
          <div className="pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full bg-[#155eff]/22 blur-[42px]" />
          <button
            type="button"
            onClick={handleDismiss}
            className="absolute right-2.5 top-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full text-white/40 transition hover:bg-white/5 hover:text-white/70"
            aria-label="Kapat"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <div className="relative flex items-center gap-3 pr-6">
            <div className="shrink-0 overflow-hidden rounded-2xl border border-[#78b7ff]/12 shadow-[0_8px_24px_rgba(0,0,0,.35)]">
              <AppIcon size={44} className="rounded-2xl" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-white">Cyllene’i yükle</p>
              <p className="mt-0.5 text-[11px] leading-4 text-white/45">{subtitle}</p>
            </div>
          </div>
          <div className="relative mt-3 flex gap-2">
            <button
              type="button"
              onClick={handleDismiss}
              className="h-10 flex-1 rounded-full border border-white/10 bg-white/[0.03] text-[12px] font-medium text-white/55 transition active:scale-[0.98]"
            >
              Sonra
            </button>
            {platform === "ios" ? (
              <div className="flex h-10 flex-[1.35] items-center justify-center gap-1.5 rounded-full bg-[#1769ff] px-3 text-[12px] font-semibold text-white shadow-[0_12px_28px_rgba(24,105,255,.28)]">
                <Share className="h-3.5 w-3.5" />
                Paylaş → Ekle
              </div>
            ) : deferredPrompt ? (
              <button
                type="button"
                onClick={() => void handleInstall()}
                className="h-10 flex-[1.35] rounded-full bg-[#1769ff] px-3 text-[12px] font-semibold text-white shadow-[0_12px_28px_rgba(24,105,255,.28)] transition active:scale-[0.98]"
              >
                Uygulamayı yükle
              </button>
            ) : (
              <div className="flex h-10 flex-[1.35] items-center justify-center gap-1.5 rounded-full bg-[#1769ff] px-3 text-[12px] font-semibold text-white shadow-[0_12px_28px_rgba(24,105,255,.28)]">
                <Download className="h-3.5 w-3.5" />
                Menüden yükle
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-[1.35rem] border border-[#78b7ff]/14 bg-[#071627]/82 p-3 shadow-[0_18px_60px_rgba(11,75,180,.18),inset_0_1px_0_rgba(255,255,255,.07)]",
          className
        )}
      >
        <div className="pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full bg-[#155eff]/22 blur-[42px]" />
        <div className="relative flex items-center gap-3">
          <div className="shrink-0 overflow-hidden rounded-2xl border border-[#78b7ff]/12 shadow-[0_8px_24px_rgba(0,0,0,.35)]">
            <AppIcon />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium text-white">Cyllene’i ana ekrana ekle</p>
            <p className="mt-0.5 text-[11px] leading-4 text-white/42">{subtitle}</p>
          </div>
          {platform === "ios" ? (
            <div className="flex h-9 shrink-0 items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-3 text-[11px] text-white/70">
              <Share className="h-3.5 w-3.5" />
              Paylaş
            </div>
          ) : deferredPrompt ? (
            <button
              type="button"
              onClick={() => void handleInstall()}
              className="h-9 shrink-0 rounded-full bg-[#1769ff] px-3 text-[12px] font-semibold text-white shadow-[0_12px_28px_rgba(24,105,255,.28)] transition duration-100 active:scale-[0.97]"
            >
              Yükle
            </button>
          ) : (
            <div className="flex h-9 shrink-0 items-center rounded-full border border-white/10 bg-white/[0.04] px-3 text-[11px] text-white/70">
              Menü
            </div>
          )}
        </div>
      </div>
    );
  }

  if (platform === "ios") {
    return (
      <div
        className={cn(
          "rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-muted-foreground",
          className
        )}
      >
        <div className="flex items-start gap-3">
          <div className="shrink-0 overflow-hidden rounded-xl border border-white/10">
            <AppIcon className="rounded-xl" />
          </div>
          <div className="min-w-0 space-y-1">
            <p className="font-medium text-foreground">Ana ekrana ekle</p>
            <p>
              Safari’de <Share className="mx-0.5 inline h-3.5 w-3.5 align-text-bottom" /> Paylaş →{" "}
              <span className="text-foreground">Ana Ekrana Ekle</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!deferredPrompt) {
    return (
      <div
        className={cn(
          "rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-muted-foreground",
          className
        )}
      >
        <div className="flex items-start gap-3">
          <div className="shrink-0 overflow-hidden rounded-xl border border-white/10">
            <AppIcon className="rounded-xl" />
          </div>
          <div className="min-w-0 space-y-1">
            <p className="font-medium text-foreground">Uygulamayı yükle</p>
            <p>Tarayıcı menüsünden Ana ekrana ekle / Uygulamayı yükle.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => void handleInstall()}
      className={cn("gap-2", className)}
    >
      <Download className="h-4 w-4" />
      Uygulamayı yükle
    </Button>
  );
}
