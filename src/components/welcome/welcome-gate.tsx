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
    return <>{children}</>;
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
