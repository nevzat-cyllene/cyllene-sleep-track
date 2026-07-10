"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandaloneDisplayMode() {
  if (typeof window === "undefined") return false;
  try {
    return window.matchMedia?.("(display-mode: standalone)").matches ?? false;
  } catch {
    return false;
  }
}

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(isStandaloneDisplayMode);

  useEffect(() => {
    if (installed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [installed]);

  if (installed || !deferredPrompt) return null;

  const handleInstall = async () => {
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setInstalled(true);
    } finally {
      setDeferredPrompt(null);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleInstall} className="gap-2">
      <Download className="h-4 w-4" />
      Uygulamayı Yükle
    </Button>
  );
}
