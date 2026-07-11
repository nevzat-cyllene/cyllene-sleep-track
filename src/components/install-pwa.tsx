"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Download, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDevicePlatform } from "@/lib/recording-device";
import { cn } from "@/lib/utils";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface InstallPWANavigator extends Navigator {
  standalone?: boolean;
  getInstalledRelatedApps?: () => Promise<unknown[]>;
}

interface InstallPWAProps {
  variant?: "button" | "banner";
  className?: string;
}

const INSTALL_STORAGE_KEY = "cyllene-pwa-installed";

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
    // localStorage erişimi engelliyse sessiz geç.
  }
}

function isStandaloneDisplayMode() {
  if (typeof window === "undefined") return false;
  try {
    const navigatorWithInstall = window.navigator as InstallPWANavigator;
    return (
      window.matchMedia?.("(display-mode: standalone)").matches === true ||
      navigatorWithInstall.standalone === true ||
      hasStoredInstallFlag()
    );
  } catch {
    return false;
  }
}

function isMobileInstallTarget() {
  const platform = getDevicePlatform();
  return platform === "ios" || platform === "android";
}

function AppIcon({ className }: { className?: string }) {
  return (
    <Image
      src="/icons/icon-192.png"
      alt="Cyllene"
      width={40}
      height={40}
      className={cn("rounded-[0.7rem]", className)}
      priority={false}
    />
  );
}

export function InstallPWA({ variant = "button", className }: InstallPWAProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(isStandaloneDisplayMode);
  const [isMobile, setIsMobile] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "other">("other");

  useEffect(() => {
    const device = getDevicePlatform();
    setIsMobile(isMobileInstallTarget());
    setPlatform(device === "ios" || device === "android" ? device : "other");
  }, []);

  useEffect(() => {
    // Desktop'ta install prompt'u yakalama — konsol uyarısı ve gereksiz UI olmasın.
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

    const navigatorWithInstall = window.navigator as InstallPWANavigator;
    const relatedAppsPromise = navigatorWithInstall.getInstalledRelatedApps?.();
    if (relatedAppsPromise) {
      void relatedAppsPromise
        .then((apps) => {
          if (apps.length > 0) markInstalled();
        })
        .catch(() => {
          // Bu API her tarayıcıda yok; yükleme akışını bozmasın.
        });
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", installPromptHandler);
      window.removeEventListener("appinstalled", markInstalled);
    };
  }, [installed, isMobile]);

  // Android: native install prompt. iOS: Share → Ana Ekrana Ekle rehberi.
  const canShowAndroid = platform === "android" && Boolean(deferredPrompt);
  const canShowIos = platform === "ios";
  if (!isMobile || installed || (!canShowAndroid && !canShowIos)) return null;

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
            <p className="mt-0.5 text-[11px] leading-4 text-white/42">
              {platform === "ios"
                ? "Paylaş → Ana Ekrana Ekle ile ekleyin."
                : "Gece kaydı daha stabil, erişim daha hızlı olur."}
            </p>
          </div>
          {platform === "ios" ? (
            <div className="flex h-9 shrink-0 items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-3 text-[11px] text-white/70">
              <Share className="h-3.5 w-3.5" />
              Paylaş
            </div>
          ) : (
            <button
              type="button"
              onClick={() => void handleInstall()}
              className="h-9 shrink-0 rounded-full bg-[#1769ff] px-3 text-[12px] font-semibold text-white shadow-[0_12px_28px_rgba(24,105,255,.28)] transition duration-100 active:scale-[0.97]"
            >
              Yükle
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

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => void handleInstall()}
      className={cn("gap-2", className)}
    >
      <Download className="h-4 w-4" />
      Ana ekrana ekle
    </Button>
  );
}
