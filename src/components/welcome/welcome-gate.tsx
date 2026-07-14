"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { shouldShowOnboarding } from "@/lib/onboarding-storage";
import { shouldShowGuestSplash } from "@/lib/guest-splash-storage";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { PremiumEntrance } from "./premium-entrance";

type GateMode = "loading" | "none" | "guest" | "onboarding";

/** Survive remounts so we don't flash the opaque CYLLENE overlay mid-session. */
let gateResolved: GateMode | null = null;

export function WelcomeGate({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<GateMode>(() =>
    gateResolved === "none" ? "none" : "loading"
  );

  useEffect(() => {
    if (gateResolved === "none") {
      setMode("none");
      return;
    }

    let cancelled = false;

    const fallback = window.setTimeout(() => {
      if (cancelled) return;
      setMode((current) => {
        if (current !== "loading") return current;
        const next = shouldShowGuestSplash() ? "guest" : "none";
        if (next === "none") gateResolved = "none";
        return next;
      });
    }, 1200);

    void createClient()
      .auth.getUser()
      .then(({ data }) => {
        if (cancelled) return;
        const isLoggedIn = !!data.user;
        let next: GateMode = "none";
        if (!isLoggedIn && shouldShowGuestSplash()) next = "guest";
        else if (isLoggedIn && shouldShowOnboarding()) next = "onboarding";
        setMode(next);
        if (next === "none") gateResolved = "none";
      })
      .catch(() => {
        if (cancelled) return;
        const next: GateMode = shouldShowGuestSplash() ? "guest" : "none";
        setMode(next);
        if (next === "none") gateResolved = "none";
      });

    return () => {
      cancelled = true;
      window.clearTimeout(fallback);
    };
  }, []);

  useEffect(() => {
    if (mode === "guest" || mode === "onboarding") {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [mode]);

  return (
    <>
      {/* Keep the app mounted under the splash so remounts can't blank the UI. */}
      {children}
      {mode === "loading" && (
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
      )}
      {mode === "guest" && (
        <PremiumEntrance
          onComplete={() => {
            gateResolved = "none";
            setMode("none");
          }}
        />
      )}
      {mode === "onboarding" && (
        <OnboardingFlow
          onComplete={() => {
            gateResolved = "none";
            setMode("none");
          }}
        />
      )}
    </>
  );
}
