"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Download, Share, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { hasSeenGuestSplash } from "@/lib/guest-splash-storage";
import { getDevicePlatform } from "@/lib/recording-device";
import {
  clearDeferredInstallPrompt,
  ensureInstallPromptCapture,
  getDeferredInstallPrompt,
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

const SESSION_DISMISS_KEY = "cyllene-install-invite-dismissed";

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

function shouldOfferInstall() {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  if (isStandaloneDisplayMode()) return false;
  const platform = getDevicePlatform();
  if (platform === "ios" || platform === "android") return true;
  // Desktop-site mode on phones still has touch + narrow width.
  const touch = navigator.maxTouchPoints > 0;
  const narrow = window.matchMedia("(max-width: 1024px)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  return touch && (narrow || coarse);
}

function wasDismissedThisSession() {
  try {
    return sessionStorage.getItem(SESSION_DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

function markDismissedThisSession() {
  try {
    sessionStorage.setItem(SESSION_DISMISS_KEY, "1");
  } catch {
    // ignore
  }
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
  const [offer, setOffer] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "other">("other");
  const [dismissed, setDismissed] = useState(false);
  const [ready, setReady] = useState(false);
  const [recording, setRecording] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const [installError, setInstallError] = useState<string | null>(null);

  useEffect(() => {
    ensureInstallPromptCapture();
    setPortalReady(true);
    const device = getDevicePlatform();
    setOffer(shouldOfferInstall());
    setPlatform(device === "ios" || device === "android" ? device : "other");
    setDismissed(wasDismissedThisSession());
    setDeferredPrompt(getDeferredInstallPrompt());
  }, []);

  useEffect(() => subscribeInstallPrompt(setDeferredPrompt), []);

  useEffect(() => {
    const onRecording = (event: Event) => {
      setRecording(Boolean((event as CustomEvent<boolean>).detail));
    };
    const onInstalled = () => {
      setOffer(false);
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
    if (variant !== "toast" || !offer || dismissed) return;

    let cancelled = false;
    let timer: number | undefined;
    let poll: number | undefined;

    const show = () => {
      if (cancelled || !hasSeenGuestSplash()) return;
      // Tiny delay so splash exit finishes; do not wait on Chrome BIP.
      timer = window.setTimeout(() => {
        if (!cancelled) setReady(true);
      }, 500);
    };

    if (hasSeenGuestSplash()) show();

    const onSplashComplete = () => show();
    window.addEventListener(GUEST_SPLASH_COMPLETE_EVENT, onSplashComplete);

    if (!hasSeenGuestSplash()) {
      poll = window.setInterval(() => {
        if (!hasSeenGuestSplash()) return;
        window.clearInterval(poll);
        poll = undefined;
        show();
      }, 250);
    }

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
      if (poll) window.clearInterval(poll);
      window.removeEventListener(GUEST_SPLASH_COMPLETE_EVENT, onSplashComplete);
    };
  }, [variant, offer, dismissed]);

  const handleInstall = async () => {
    setInstallError(null);
    const promptEvent = deferredPrompt ?? getDeferredInstallPrompt();
    if (!promptEvent) {
      setInstallError(
        platform === "ios"
          ? "Safari’de Paylaş → Ana Ekrana Ekle"
          : "Tarayıcı menüsünden Uygulamayı yükle’yi seçin"
      );
      return;
    }
    try {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === "accepted") {
        setOffer(false);
      } else {
        setInstallError("Yükleme iptal edildi");
      }
    } catch {
      setInstallError("Yükleme başlatılamadı");
    } finally {
      clearDeferredInstallPrompt();
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    markDismissedThisSession();
    setDismissed(true);
    setReady(false);
  };

  if (variant === "toast") {
    if (!offer || dismissed || !ready || recording || !portalReady) return null;

    return createPortal(
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[400] px-3 pt-[max(0.7rem,env(safe-area-inset-top))]">
        <div className="pointer-events-auto mx-auto flex max-w-lg items-center gap-3 overflow-hidden rounded-2xl border border-[#78b7ff]/18 bg-[#071627]/95 px-3 py-2.5 shadow-[0_18px_50px_rgba(0,8,24,.5),inset_0_1px_0_rgba(255,255,255,.08)] backdrop-blur-xl">
          <div className="shrink-0 overflow-hidden rounded-xl border border-[#78b7ff]/12">
            <AppIcon size={38} className="rounded-xl" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12.5px] font-medium leading-snug text-white">
              Cyllene Uyku Takipçisini indirmek ister misiniz?
            </p>
            <p className="mt-0.5 text-[10.5px] leading-4 text-white/42">
              {installError ??
                (platform === "ios"
                  ? "Paylaş → Ana Ekrana Ekle"
                  : "İndir’e basınca yükleme başlar")}
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
              className="h-8 shrink-0 rounded-full bg-[#1769ff] px-3 text-[11px] font-semibold text-white transition active:scale-[0.97]"
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
      </div>,
      document.body
    );
  }

  if (!offer) return null;

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
              className="h-9 shrink-0 rounded-full bg-[#1769ff] px-3 text-[12px] font-semibold text-white"
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
