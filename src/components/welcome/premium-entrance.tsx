"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon } from "lucide-react";
import { AmbientWelcomeSound } from "@/lib/ambient-welcome-sound";
import { markGuestSplashSeen } from "@/lib/guest-splash-storage";
import { siteConfig } from "@/lib/site-config";

interface PremiumEntranceProps {
  onComplete: () => void;
}

const ease = [0.22, 1, 0.36, 1] as const;

const LINES = [
  { at: 0, text: null },
  { at: 2800, text: siteConfig.shortName },
  { at: 5200, text: "Geceyi dinle." },
  { at: 7200, text: "Sabahı ölç." },
  { at: 9200, text: "Derin bir nefes alın." },
  { at: 11500, text: null },
] as const;

export function PremiumEntrance({ onComplete }: PremiumEntranceProps) {
  const soundRef = useRef<AmbientWelcomeSound | null>(null);
  const doneRef = useRef(false);
  const startedRef = useRef(false);
  const [lineIndex, setLineIndex] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [soundOn, setSoundOn] = useState(false);

  const finish = useCallback(async () => {
    if (doneRef.current) return;
    doneRef.current = true;
    setExiting(true);
    markGuestSplashSeen();
    await soundRef.current?.fadeOut(2.2);
    onComplete();
  }, [onComplete]);

  const begin = useCallback(async () => {
    if (startedRef.current) return;
    startedRef.current = true;
    try {
      await soundRef.current?.start();
      setSoundOn(true);
    } catch {
      // autoplay blocked — görsel devam eder
    }
  }, []);

  useEffect(() => {
    soundRef.current = new AmbientWelcomeSound();
    void begin();

    const timers = LINES.map((line, i) =>
      setTimeout(() => setLineIndex(i), line.at)
    );
    const endTimer = setTimeout(() => void finish(), 13500);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(endTimer);
      soundRef.current?.dispose();
    };
  }, [begin, finish]);

  const currentLine = LINES[lineIndex]?.text;
  const isBrand = currentLine === siteConfig.shortName;

  return (
    <motion.div
      className="fixed inset-0 z-[250] flex cursor-pointer flex-col items-center justify-center overflow-hidden bg-black text-white"
      initial={{ opacity: 1 }}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: 1.4, ease }}
      onClick={() => {
        if (!startedRef.current) void begin();
        else if (lineIndex >= 2) void finish();
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          if (!startedRef.current) void begin();
          else void finish();
        }
      }}
    >
      <div className="pointer-events-none absolute inset-0">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2 rounded-full border border-cyllene-cyan/20"
            style={{
              width: 120 + i * 90,
              height: 120 + i * 90,
              marginLeft: -(60 + i * 45),
              marginTop: -(60 + i * 45),
            }}
            animate={{
              scale: [1, 1.35, 1],
              opacity: [0.15, 0.45, 0.15],
            }}
            transition={{
              duration: 5 + i * 1.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.8,
            }}
          />
        ))}
        <motion.div
          className="absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle, oklch(0.78 0.14 195 / 18%) 0%, oklch(0.5 0.1 280 / 6%) 40%, transparent 70%)",
          }}
          animate={{ scale: [0.95, 1.08, 0.95], opacity: [0.4, 0.85, 0.4] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 px-8 text-center">
        <motion.div
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] shadow-[0_0_80px_oklch(0.78_0.14_195/25%)]"
        >
          <Moon className="h-9 w-9 text-cyllene-cyan" />
        </motion.div>

        <div className="flex min-h-[120px] items-center justify-center">
          <AnimatePresence mode="wait">
            {currentLine && (
              <motion.p
                key={currentLine}
                initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
                transition={{ duration: 1.1, ease }}
                className={
                  isBrand
                    ? "text-4xl font-semibold tracking-tight sm:text-5xl"
                    : "max-w-xs text-lg font-light leading-relaxed tracking-wide text-white/70"
                }
              >
                {currentLine}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <motion.div
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: lineIndex >= 1 ? 1 : 0 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          <div className="h-px w-16 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          <p className="text-[10px] uppercase tracking-[0.45em] text-white/25">
            {soundOn ? "Dokunun ve devam edin" : "Ses için dokunun"}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
