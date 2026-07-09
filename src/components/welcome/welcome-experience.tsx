"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AmbientWelcomeSound } from "@/lib/ambient-welcome-sound";
import { markWelcomeSeen } from "@/lib/welcome-storage";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

interface WelcomeExperienceProps {
  onComplete: () => void;
}

type Phase = "idle" | "playing" | "outro";

const ease = [0.22, 1, 0.36, 1] as const;

const lineVariants = {
  hidden: { opacity: 0, y: 28, filter: "blur(8px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { delay: 0.15 + i * 0.18, duration: 1.1, ease },
  }),
};

export function WelcomeExperience({ onComplete }: WelcomeExperienceProps) {
  const soundRef = useRef<AmbientWelcomeSound | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    soundRef.current = new AmbientWelcomeSound();
    return () => soundRef.current?.dispose();
  }, []);

  const begin = useCallback(async () => {
    if (phase !== "idle") return;
    setPhase("playing");

    if (!muted) {
      try {
        await soundRef.current?.start();
      } catch {
        // iOS autoplay kısıtı — görsel devam eder
      }
    }
  }, [muted, phase]);

  const finish = useCallback(async () => {
    if (phase === "outro") return;
    setPhase("outro");
    markWelcomeSeen();
    await soundRef.current?.fadeOut(1.8);
    onComplete();
  }, [onComplete, phase]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden bg-[#030308] text-white"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.2, ease }}
      >
        <div className="pointer-events-none absolute inset-0">
          <motion.div
            className="absolute left-1/2 top-1/2 h-[min(90vw,520px)] w-[min(90vw,520px)] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(circle, oklch(0.45 0.14 285 / 18%) 0%, oklch(0.35 0.1 240 / 6%) 45%, transparent 70%)",
            }}
            animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.85, 0.5] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <div
            className="absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                "linear-gradient(to right, oklch(1 0 0 / 3%) 1px, transparent 1px), linear-gradient(to bottom, oklch(1 0 0 / 3%) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
              maskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, black, transparent)",
            }}
          />
        </div>

        <div className="relative z-10 flex max-w-lg flex-col items-center px-8 text-center">
          {phase === "idle" && (
            <motion.button
              type="button"
              className="group flex flex-col items-center gap-8"
              onClick={() => void begin()}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, ease }}
            >
              <motion.div
                className="h-px w-12 bg-white/20"
                animate={{ width: ["2rem", "4rem", "2rem"], opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="space-y-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.55em] text-white/35">
                  Dokunun
                </p>
                <h1 className="text-4xl font-extralight tracking-[0.35em] text-white/90 sm:text-5xl">
                  {siteConfig.shortName.toUpperCase()}
                </h1>
              </div>
              <p className="max-w-xs text-sm font-light leading-relaxed text-white/40">
                Derin bir nefes. Gece analizi başlamak üzere.
              </p>
            </motion.button>
          )}

          {phase === "playing" && (
            <motion.div
              className="flex flex-col items-center gap-10"
              initial="hidden"
              animate="visible"
            >
              <motion.div
                custom={0}
                variants={lineVariants}
                className="h-px w-16 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              />

              <motion.h1
                custom={1}
                variants={lineVariants}
                className="text-[2.75rem] font-extralight leading-none tracking-[0.28em] text-white sm:text-6xl"
              >
                {siteConfig.shortName.toUpperCase()}
              </motion.h1>

              <motion.p
                custom={2}
                variants={lineVariants}
                className="text-sm font-light uppercase tracking-[0.42em] text-white/45"
              >
                Uyku Takipçisi
              </motion.p>

              <motion.p
                custom={3}
                variants={lineVariants}
                className="max-w-sm text-base font-light leading-[1.85] tracking-wide text-white/55"
              >
                Geceyi dinleyin.
                <br />
                <span className="text-white/35">Sabahı ölçün.</span>
              </motion.p>

              <motion.p
                custom={4}
                variants={lineVariants}
                className="max-w-xs text-xs font-light leading-relaxed text-white/30"
              >
                Ses analizi cihazınızda kalır. Hiçbir kayıt buluta gitmez.
              </motion.p>

              <motion.div custom={5} variants={lineVariants} className="flex flex-col items-center gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => void finish()}
                  className={cn(
                    "rounded-full border border-white/15 bg-white/[0.04] px-10 py-3.5",
                    "text-[11px] font-medium uppercase tracking-[0.45em] text-white/70",
                    "transition hover:border-white/25 hover:bg-white/[0.07] hover:text-white"
                  )}
                >
                  Devam
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMuted((m) => {
                      if (!m) void soundRef.current?.fadeOut(0.6);
                      return !m;
                    });
                  }}
                  className="text-[10px] uppercase tracking-[0.35em] text-white/25 transition hover:text-white/45"
                >
                  {muted ? "Sesi aç" : "Sessiz devam"}
                </button>
              </motion.div>
            </motion.div>
          )}
        </div>

        <motion.p
          className="absolute bottom-8 text-[10px] uppercase tracking-[0.4em] text-white/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === "playing" ? 1 : 0 }}
          transition={{ delay: 2, duration: 1 }}
        >
          {siteConfig.tagline}
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
}
