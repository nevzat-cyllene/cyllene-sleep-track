"use client";

import { useEffect } from "react";
import * as React from "react";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { WelcomeGate } from "@/components/welcome/welcome-gate";
import { InstallPWA } from "@/components/install-pwa";
import { ensureInstallPromptCapture } from "@/lib/install-prompt";

function InstallPromptCapture() {
  useEffect(() => {
    ensureInstallPromptCapture();
  }, []);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider delay={150}>
        <InstallPromptCapture />
        <WelcomeGate>{children}</WelcomeGate>
        <InstallPWA variant="toast" />
        <Toaster richColors closeButton />
      </TooltipProvider>
    </ThemeProvider>
  );
}
