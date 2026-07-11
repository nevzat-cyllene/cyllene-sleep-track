"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { hasSeenGuestSplash } from "@/lib/guest-splash-storage";
import { getDevicePlatform } from "@/lib/recording-device";
import {
  clearDeferredInstallPrompt,
  ensureInstallPromptCapture,
  subscribeInstallPrompt,
  type BeforeInstallPromptEvent,
} from "@/lib/install-prompt";
import { cn } from "@/lib/utils";

export const GUEST_SPLASH_COMPLETE_EVENT = "cyllene:guest-splash-complete";

interface InstallPWANavigator extends Navigator {
  standalone?: boolean;
}

interface InstallPWAProps {
  variant?: "button" | "banner" | "toast";
  className?: string;
}

const DISMISS_STORAGE_KEY = "cyllene-pwa-prompt-dismissed-at";
const DISMISS_COOLDOWN_MS = 1000 * 60 * 60 * 24;

function isPromptDismissedRecently() {
  try {
    const raw = window.localStorage.getItem(DISMISS_STORAGE_KEY);
    if (!raw) return false;
    const dismissedAt = Number(raw);
    return Number.isFinite(dismissedAt) && Date.now() - dismissedAt < DISMISS_COOLDOWN_MS;
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
    const nav = window.navigator as InstallPWANavigator;
    return (
      window.matchMedia?.("(display-mode: standalone)").matches === true ||
      nav.standalone === true
    );
  } catch {
    return false;
  }
}

function isMobileInstallTarget() {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  const platform = getDevicePlatform();
  if (platform === "ios" || platform === "android") return true;
  const coarse = window.matchMedia?.("(pointer: coarse)")?.matches === true;
  const narrow = window.matchMedia?.("(max-width: 900px)")?.matches === true;
  return (coarse || narrow) && navigator.maxTouchPoints > 0;
}

function AppIcon({ className, size = 36 }: { className?: string; size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/icons/icon-192.png"
      alt=""
      width={size}
      height={size}
      className={cn("rounded-[0.65rem] object-cover", className)}
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
  const [ready, setReady] = useState(false);
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    ensureInstallPromptCapture();
    const device = getDevicePlatform();
    setIsMobile(isMobileInstallTarget());
    setPlatform(device === "ios" || device === "android" ? device : "other");
    setInstalled(isStandaloneDisplayMode());
    setDismissed(isPromptDismissedRecently());
  }, []);

  useEffect(() => {
    return subscribeInstallPrompt((event) => setDeferredPrompt(event));
  }, []);

  useEffect(() => {
    const onRecording = (event: Event) => {
      setRecording(Boolean((event as CustomEvent<boolean>).detail));
    };
    const onInstalled = () => {
      setInstalled(true);
      clearDeferredInstallPrompt();
    };
    window.addEventListener("cyllene:recording-ui", onRecording);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("cyllene:recording-ui", onRecording);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  useEffect(() => {
    // Top invite only after moon entrance — never during splash / first white flash.
    if (variant !== "toast" || installed || !isMobile || dismissed) return;

    let cancelled = false;
    let timer: number | undefined;
    let poll: number | undefined;

    const arm = () => {
      if (cancelled || !hasSeenGuestSplash()) return;
      timer = window.setTimeout(() => {
        if (!cancelled) setReady(true);
      }, 700);
    };

    if (hasSeenGuestSplash()) arm();

    const onSplashComplete = () => arm();
    window.addEventListener(GUEST_SPLASH_COMPLETE_EVENT, onSplashComplete);

    if (!hasSeenGuestSplash()) {
      poll = window.setInterval(() => {
        if (!hasSeenGuestSplash()) return;
        window.clearInterval(poll);
        poll = undefined;
        arm();
      }, 300);
    }

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
      if (poll) window.clearInterval(poll);
      window.removeEventListener(GUEST_SPLASH_COMPLETE_EVENT, onSplashComplete);
    };
  }, [variant, installed, isMobile, dismissed]);

  if (!isMobile || installed) return null;
  if (variant === "toast" && (dismissed || !ready || recording)) return null;

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setInstalled(true);
    } finally {
      clearDeferredInstallPrompt();
    }
  };

  const handleDismiss = () => {
    storePromptDismissed();
    setDismissed(true);
    setReady(false);
  };

  if (variant === "toast") {
    return (
      <div
        className={cn(
          "pointer-events-none fixed inset-x-0 top-0 z-[320] px-3 pt-[max(0.65rem,env(safe-area-inset-top))]",
          className
        )}
      >
        <div className="pointer-events-auto mx-auto flex max-w-lg items-center gap-3 overflow-hidden rounded-2xl border border-[#78b7ff]/16 bg-[#071627]/92 px-3 py-2.5 shadow-[0_18px_50px_rgba(0,8,24,.45),inset_0_1px_0_rgba(255,255,255,.07)] backdrop-blur-xl">
          <div className="shrink-0 overflow-hidden rounded-xl border border-[#78b7ff]/12">
            <AppIcon size={38} className="rounded-xl" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12.5px] font-medium leading-snug text-white">
              Cyllene Uyku Takipçisini indirmek ister misiniz?
            </p>
            <p className="mt-0.5 text-[10.5px] leading-4 text-white/42">
              {platform === "ios"
                ? "Paylaş → Ana Ekrana Ekle"
                : "Gece kaydı için daha stabil erişim"}
            </p>
          </div>
          {platform === "ios" ? (
            <div className="flex h-8 shrink-0 items-center gap-1 rounded-full bg-[#1769ff] px-2.5 text-[11px] font-semibold text-white">
              <Share className="h-3 w-3" />
              İndir
            </div>
          ) : (
            <button
              type="button"
              onClick={() => void handleInstall()}
              disabled={!deferredPrompt}
              className="h-8 shrink-0 rounded-full bg-[#1769ff] px-3 text-[11px] font-semibold text-white transition active:scale-[0.97] disabled:opacity-55"
            >
              <span className="inline-flex items-center gap-1">
                <Download className="h-3 w-3" />
                İndir
              </span>
            </button>
          )}
          <button
            type="button"
            onClick={handleDismiss}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white/35 transition hover:bg-white/5 hover:text-white/70"
            aria-label="Kapat"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-[#78b7ff]/14 bg-[#071627]/82 p-3",
          className
        )}
      >
        <div className="relative flex items-center gap-3">
          <AppIcon />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium text-white">
              Cyllene Uyku Takipçisini indirmek ister misiniz?
            </p>
            <p className="mt-0.5 text-[11px] text-white/42">
              {platform === "ios" ? "Paylaş → Ana Ekrana Ekle" : "Tek dokunuşla yükle"}
            </p>
          </div>
          {platform !== "ios" && (
            <button
              type="button"
              onClick={() => void handleInstall()}
              disabled={!deferredPrompt}
              className="h-9 shrink-0 rounded-full bg-[#1769ff] px-3 text-[12px] font-semibold text-white disabled:opacity-55"
            >
              İndir
            </button>
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
          <AppIcon className="rounded-xl" />
          <div className="min-w-0 space-y-1">
            <p className="font-medium text-foreground">
              Cyllene Uyku Takipçisini indirmek ister misiniz?
            </p>
            <p>
              Safari’de <Share className="mx-0.5 inline h-3.5 w-3.5 align-text-bottom" /> Paylaş →{" "}
              <span className="text-foreground">Ana Ekrana Ekle</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!deferredPrompt) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => void handleInstall()}
      className={cn("gap-2", className)}
    >
      <Download className="h-4 w-4" />
      İndir
    </Button>
  );
}
