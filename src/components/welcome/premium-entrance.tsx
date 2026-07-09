"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Moon } from "lucide-react";
import { AmbientWelcomeSound } from "@/lib/ambient-welcome-sound";
import { markGuestSplashSeen } from "@/lib/guest-splash-storage";
import { siteConfig } from "@/lib/site-config";

interface PremiumEntranceProps {
  onComplete: () => void;
}

const ease = [0.22, 1, 0.36, 1] as const;
const AUTO_MS = 3800;

export function PremiumEntrance({ onComplete }: PremiumEntranceProps) {
  const soundRef = useRef<AmbientWelcomeSound | null>(null);
  const doneRef = useRef(false);
  const [phase, setPhase] = useState<"enter" | "reveal" | "out">("enter");

  const finish = useCallback(async () => {
    if (doneRef.current) return;
    doneRef.current = true;
    setPhase("out");
    markGuestSplashSeen();
    await soundRef.current?.fadeOut(0.8);
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    soundRef.current = new AmbientWelcomeSound();
    const t1 = setTimeout(() => setPhase("reveal"), 600);
    const t2 = setTimeout(() => void finish(), AUTO_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      soundRef.current?.dispose();
    };
  }, [finish]);

  const onInteract = () => {
    void soundRef.current?.start().catch(() => {});
    if (phase === "enter") setPhase("reveal");
    else void finish();
  };

  return (
    <motion.div
      className="fixed inset-0 z-[250] flex cursor-pointer flex-col items-center justify-center bg-black text-white"
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === "out" ? 0 : 1 }}
      transition={{ duration: 0.7, ease }}
      onClick={onInteract}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onInteract();
      }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute left-1/2 top-1/2 h-[min(70vw,400px)] w-[min(70vw,400px)] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle, oklch(0.78 0.14 195 / 12%) 0%, transparent 65%)",
          }}
          animate={{ scale: [0.9, 1.05, 1], opacity: [0.3, 0.7, 0.4] }}
          transition={{ duration: 3, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 px-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease }}
          className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5"
        >
          <Moon className="h-8 w-8 text-cyllene-cyan" />
        </motion.div>

        <motion.h1
          className="text-4xl font-semibold tracking-tight sm:text-5xl"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: phase !== "enter" ? 1 : 0, y: phase !== "enter" ? 0 : 16 }}
          transition={{ duration: 0.6, ease }}
        >
          {siteConfig.shortName}
        </motion.h1>

        <motion.p
          className="max-w-xs text-sm font-light tracking-wide text-white/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === "reveal" ? 1 : 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease }}
        >
          Geceyi dinle.
          <br />
          <span className="text-white/70">Sabahı ölç.</span>
        </motion.p>

        <motion.p
          className="text-[10px] uppercase tracking-[0.4em] text-white/25"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === "reveal" ? 1 : 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          Dokunun veya bekleyin
        </motion.p>
      </div>
    </motion.div>
  );
}
