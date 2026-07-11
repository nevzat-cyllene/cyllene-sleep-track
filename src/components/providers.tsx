"use client";

import { useEffect } from "react";
import * as React from "react";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { WelcomeGate } from "@/components/welcome/welcome-gate";
import { InstallPWA } from "@/components/install-pwa";
import { LocaleProvider } from "@/i18n/runtime";
import type { Locale } from "@/i18n/locales";
import { ensureInstallPromptCapture } from "@/lib/install-prompt";

function InstallPromptCapture() {
  useEffect(() => {
    ensureInstallPromptCapture();
  }, []);
  return null;
}

export function Providers({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <LocaleProvider initialLocale={initialLocale}>
        <TooltipProvider delay={150}>
          <InstallPromptCapture />
          <WelcomeGate>{children}</WelcomeGate>
          <InstallPWA variant="toast" />
          <Toaster richColors closeButton />
        </TooltipProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}
