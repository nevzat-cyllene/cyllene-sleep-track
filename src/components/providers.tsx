"use client";

import * as React from "react";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { WelcomeGate } from "@/components/welcome/welcome-gate";
import { InstallPWA } from "@/components/install-pwa";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider delay={150}>
        <WelcomeGate>{children}</WelcomeGate>
        {/* Outside WelcomeGate so toast stays mounted during splash/loading. */}
        <InstallPWA variant="toast" />
        <Toaster richColors closeButton />
      </TooltipProvider>
    </ThemeProvider>
  );
}

