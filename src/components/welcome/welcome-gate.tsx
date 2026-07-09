"use client";

import { useEffect, useState } from "react";
import { shouldShowWelcome } from "@/lib/welcome-storage";
import { WelcomeExperience } from "./welcome-experience";

export function WelcomeGate({ children }: { children: React.ReactNode }) {
  const [showWelcome, setShowWelcome] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const show = shouldShowWelcome();
    setShowWelcome(show);
    setReady(true);
    if (show) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, []);

  if (!ready) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      {showWelcome && (
        <WelcomeExperience onComplete={() => setShowWelcome(false)} />
      )}
    </>
  );
}
