"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { shouldShowOnboarding } from "@/lib/onboarding-storage";
import { shouldShowGuestSplash } from "@/lib/guest-splash-storage";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { PremiumEntrance } from "./premium-entrance";

type GateMode = "none" | "guest" | "onboarding";

export function WelcomeGate({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<GateMode>("none");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    void supabase.auth.getUser().then(({ data }) => {
      const isLoggedIn = !!data.user;

      if (!isLoggedIn && shouldShowGuestSplash()) {
        setMode("guest");
      } else if (isLoggedIn && shouldShowOnboarding()) {
        setMode("onboarding");
      } else {
        setMode("none");
      }
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (mode !== "none") {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [mode]);

  if (!ready) {
    return (
      <div className="fixed inset-0 z-[260] flex items-center justify-center overflow-hidden bg-[#02050d] text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="night-stars absolute inset-0 opacity-20" />
          <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#155eff]/14 blur-[78px]" />
        </div>
        <div className="relative flex items-center gap-3 rounded-full border border-white/[0.08] bg-white/[0.035] px-4 py-2 text-xs tracking-[0.24em] text-white/38 shadow-[inset_0_1px_0_rgba(255,255,255,.07)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#78b7ff] shadow-[0_0_18px_rgba(120,183,255,.8)]" />
          CYLLENE
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      {mode === "guest" && (
        <PremiumEntrance onComplete={() => setMode("none")} />
      )}
      {mode === "onboarding" && (
        <OnboardingFlow onComplete={() => setMode("none")} />
      )}
    </>
  );
}
