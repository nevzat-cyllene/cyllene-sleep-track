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
        <WelcomeGate>
          {children}
          {/* Global mobile install toast — also on landing after moon entrance */}
          <InstallPWA variant="toast" />
        </WelcomeGate>
        <Toaster richColors closeButton />
      </TooltipProvider>
    </ThemeProvider>
  );
}

