"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Moon } from "lucide-react";
import { AmbientWelcomeSound } from "@/lib/ambient-welcome-sound";
import {
  type OnboardingAnswers,
  markOnboardingComplete,
} from "@/lib/onboarding-storage";
import { ONBOARDING_STEPS, type OnboardingStepId } from "@/lib/onboarding-questions";
import { siteConfig } from "@/lib/site-config";
import { OnboardingProgress } from "./onboarding-progress";
import { OnboardingOptionButton } from "./onboarding-option-button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface OnboardingFlowProps {
  onComplete: () => void;
}

const ease = [0.22, 1, 0.36, 1] as const;

const questionSteps = ONBOARDING_STEPS.filter(
  (s) => s.id !== "intro" && s.id !== "ready"
);

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const router = useRouter();
  const soundRef = useRef<AmbientWelcomeSound | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>({});
  const [muted, setMuted] = useState(false);

  const step = ONBOARDING_STEPS[stepIndex];
  const progressIndex =
    step.id === "intro" ? 0 : questionSteps.findIndex((s) => s.id === step.id) + 1;

  useEffect(() => {
    soundRef.current = new AmbientWelcomeSound();
    return () => soundRef.current?.dispose();
  }, []);

  const startSound = useCallback(async () => {
    if (muted) return;
    try {
      await soundRef.current?.start();
    } catch {
      // autoplay blocked
    }
  }, [muted]);

  const goNext = useCallback(() => {
    if (stepIndex < ONBOARDING_STEPS.length - 1) {
      setStepIndex((i) => i + 1);
    }
  }, [stepIndex]);

  const goBack = useCallback(() => {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  }, [stepIndex]);

  const finish = useCallback(async () => {
    markOnboardingComplete(answers);
    await soundRef.current?.fadeOut(1);
    onComplete();
    router.push("/sleep");
  }, [answers, onComplete, router]);

  const selectOption = (stepId: OnboardingStepId, optionId: string) => {
    if (stepId === "satisfaction") {
      setAnswers((a) => ({
        ...a,
        sleepSatisfaction: optionId as OnboardingAnswers["sleepSatisfaction"],
      }));
      goNext();
    } else if (stepId === "sleep_hours") {
      setAnswers((a) => ({
        ...a,
        sleepHours: optionId as OnboardingAnswers["sleepHours"],
      }));
      goNext();
    } else if (stepId === "night_waking") {
      setAnswers((a) => ({
        ...a,
        nightWaking: optionId as OnboardingAnswers["nightWaking"],
      }));
      goNext();
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col bg-black text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <header className="relative z-10 flex items-center justify-between px-4 pt-4 pb-2">
        {stepIndex > 0 ? (
          <button
            type="button"
            onClick={goBack}
            className="flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10"
            aria-label="Geri"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        ) : (
          <div className="w-10" />
        )}
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10">
          <Moon className="h-5 w-5 text-cyllene-cyan" />
        </div>
        <button
          type="button"
          onClick={() => {
            setMuted((m) => {
              if (!m) void soundRef.current?.fadeOut(0.4);
              else void startSound();
              return !m;
            });
          }}
          className="text-[10px] uppercase tracking-wider text-white/30"
        >
          {muted ? "Ses" : "Sessiz"}
        </button>
      </header>

      <main className="relative z-10 flex flex-1 flex-col px-6 pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease }}
            className="flex flex-1 flex-col"
          >
            {step.id === "intro" && (
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <button
                  type="button"
                  className="flex flex-col items-center gap-6"
                  onClick={() => void startSound().then(goNext)}
                >
                  <h1 className="text-3xl font-semibold">{siteConfig.shortName}</h1>
                  <p className="max-w-xs text-sm text-white/50">{step.subtitle}</p>
                  <span className="rounded-full border border-white/15 px-8 py-3 text-xs uppercase tracking-widest text-white/60">
                    Başla
                  </span>
                </button>
              </div>
            )}

            {step.id === "ready" && (
              <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
                <Moon className="h-12 w-12 text-cyllene-cyan" />
                <h2 className="text-2xl font-semibold">{step.title}</h2>
                <p className="max-w-sm text-sm text-white/50">{step.subtitle}</p>
              </div>
            )}

            {step.options && (
              <div className="flex flex-1 flex-col gap-5 pt-2">
                <h2 className="text-xl font-semibold leading-snug">{step.title}</h2>
                <div className="space-y-3">
                  {step.options.map((opt) => (
                    <OnboardingOptionButton
                      key={opt.id}
                      label={opt.label}
                      emoji={opt.emoji}
                      onClick={() => selectOption(step.id, opt.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="relative z-10 space-y-5 px-6 pb-10">
        {step.id !== "intro" && (
          <OnboardingProgress current={progressIndex} total={questionSteps.length + 1} />
        )}
        {step.id === "ready" && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => void finish()}
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-full",
                "bg-cyllene-cyan text-black shadow-lg shadow-cyllene-cyan/30",
                "transition hover:scale-105 active:scale-95"
              )}
              aria-label="Uykuya başla"
            >
              <ArrowRight className="h-6 w-6" />
            </button>
          </div>
        )}
      </footer>
    </motion.div>
  );
}
