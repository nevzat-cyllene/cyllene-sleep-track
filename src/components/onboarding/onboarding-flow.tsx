"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Moon,
  ShieldCheck,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import { AmbientWelcomeSound } from "@/lib/ambient-welcome-sound";
import {
  type OnboardingAnswers,
  markOnboardingComplete,
} from "@/lib/onboarding-storage";
import { ONBOARDING_STEPS, type OnboardingStepId } from "@/lib/onboarding-questions";
import { siteConfig } from "@/lib/site-config";
import { OnboardingProgress } from "./onboarding-progress";
import { OnboardingOptionButton } from "./onboarding-option-button";

interface OnboardingFlowProps {
  onComplete: () => void;
}

const ease = [0.22, 1, 0.36, 1] as const;
const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

const questionSteps = ONBOARDING_STEPS.filter(
  (step) => step.id !== "intro" && step.id !== "ready"
);

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const router = useRouter();
  const soundRef = useRef<AmbientWelcomeSound | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>({});
  const [muted, setMuted] = useState(false);
  const [finishing, setFinishing] = useState(false);

  const step = ONBOARDING_STEPS[stepIndex];
  const progressIndex =
    step.id === "intro" ? 0 : questionSteps.findIndex((item) => item.id === step.id) + 1;
  const showProgress = step.id !== "intro" && step.id !== "ready";

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
      setStepIndex((index) => index + 1);
    }
  }, [stepIndex]);

  const goBack = useCallback(() => {
    if (stepIndex > 0 && !finishing) setStepIndex((index) => index - 1);
  }, [finishing, stepIndex]);

  const beginProfile = useCallback(async () => {
    await startSound();
    goNext();
  }, [goNext, startSound]);

  const finish = useCallback(async () => {
    if (finishing) return;
    setFinishing(true);
    markOnboardingComplete(answers);

    void soundRef.current?.fadeOut(0.9);
    await wait(760);

    router.push("/sleep");
    await wait(420);
    onComplete();
  }, [answers, finishing, onComplete, router]);

  const selectOption = (stepId: OnboardingStepId, optionId: string) => {
    if (stepId === "satisfaction") {
      setAnswers((current) => ({
        ...current,
        sleepSatisfaction: optionId as OnboardingAnswers["sleepSatisfaction"],
      }));
      goNext();
    } else if (stepId === "sleep_hours") {
      setAnswers((current) => ({
        ...current,
        sleepHours: optionId as OnboardingAnswers["sleepHours"],
      }));
      goNext();
    } else if (stepId === "night_waking") {
      setAnswers((current) => ({
        ...current,
        nightWaking: optionId as OnboardingAnswers["nightWaking"],
      }));
      goNext();
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[200] isolate overflow-hidden bg-[#02050d] text-white"
      initial={{ opacity: 0 }}
      animate={{
        opacity: finishing ? 0 : 1,
        scale: finishing ? 1.015 : 1,
        filter: finishing ? "blur(12px)" : "blur(0px)",
      }}
      exit={{ opacity: 0 }}
      transition={{ duration: finishing ? 0.68 : 0.45, ease }}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="night-stars absolute inset-0 opacity-45" />
        <div className="absolute -left-28 top-[-9rem] h-96 w-96 rounded-full bg-[#155eff]/20 blur-[110px]" />
        <div className="absolute -right-24 bottom-[-10rem] h-[28rem] w-[28rem] rounded-full bg-[#6fd2ff]/12 blur-[120px]" />
        <div className="absolute inset-x-0 bottom-0 h-[36%] bg-[linear-gradient(180deg,transparent,#02050d_78%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-5 pb-[max(1.4rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:px-8">
        <header className="flex items-center justify-between">
          {stepIndex > 0 ? (
            <button
              type="button"
              onClick={goBack}
              disabled={finishing}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-white/70 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-40"
              aria-label="Geri"
            >
              <ArrowLeft className="h-4.5 w-4.5" />
            </button>
          ) : (
            <div className="h-10 w-10" />
          )}

          <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.045] px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,.07)]">
            <Moon className="h-4 w-4 text-[#78b7ff]" />
            <span className="text-[10px] font-medium uppercase tracking-[0.24em] text-white/42">
              {siteConfig.shortName}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setMuted((current) => {
                if (!current) void soundRef.current?.fadeOut(0.4);
                else void startSound();
                return !current;
              });
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.035] text-white/38 transition hover:bg-white/[0.08] hover:text-white/70"
            aria-label={muted ? "Sesi aç" : "Sessize al"}
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </header>

        <main className="flex flex-1 flex-col justify-center py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 22, scale: 0.985, filter: "blur(12px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -18, scale: 1.01, filter: "blur(12px)" }}
              transition={{ duration: 0.42, ease }}
              className="flex flex-col"
            >
              {step.id === "intro" && (
                <button
                  type="button"
                  className="group relative overflow-hidden rounded-[2rem] border border-[#8dbdff]/16 bg-[radial-gradient(circle_at_20%_0%,rgba(111,210,255,.16),transparent_34%),linear-gradient(145deg,rgba(22,49,96,.78),rgba(8,20,46,.92)_54%,rgba(4,10,24,.96)_100%)] p-6 text-left shadow-[0_28px_110px_rgba(24,105,255,.24),inset_0_1px_0_rgba(255,255,255,.09)] backdrop-blur-2xl sm:p-8"
                  onClick={() => void beginProfile()}
                >
                  <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#6fd2ff]/18 blur-[72px]" />
                  <div className="relative">
                    <div className="mb-9 flex items-center justify-between gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.055] text-[#9bd5ff] shadow-[inset_0_1px_0_rgba(255,255,255,.08)]">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <span className="rounded-full border border-[#78b7ff]/16 bg-[#155eff]/10 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-[#9bd5ff]/70">
                        30 saniye
                      </span>
                    </div>

                    <p className="mb-3 text-xs font-medium uppercase tracking-[0.28em] text-[#78b7ff]">
                      Uyku profilin
                    </p>
                    <h1 className="max-w-md text-balance text-[2.45rem] font-medium leading-[0.98] tracking-[-0.055em] sm:text-5xl">
                      Gece raporunu sana göre ayarlayalım.
                    </h1>
                    <p className="mt-5 max-w-md text-pretty text-sm leading-6 text-white/50">
                      Üç kısa cevapla Cyllene, ilk rapor dilini ve analiz önceliklerini daha kişisel
                      hale getirir.
                    </p>

                    <div className="mt-7 grid gap-2 sm:grid-cols-3">
                      {["Skor dili", "Gece ritmi", "Uyanma izi"].map((label) => (
                        <span
                          key={label}
                          className="rounded-2xl border border-white/[0.07] bg-white/[0.04] px-3 py-2 text-[11px] text-white/42"
                        >
                          {label}
                        </span>
                      ))}
                    </div>

                    <span className="mt-8 inline-flex h-12 items-center gap-3 rounded-full bg-white px-5 text-sm font-semibold text-[#07122b] shadow-[0_14px_42px_rgba(48,112,255,.28)] transition group-hover:scale-[1.02]">
                      Profili başlat
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </button>
              )}

              {step.id === "ready" && (
                <div className="relative overflow-hidden rounded-[2rem] border border-[#8dbdff]/16 bg-[linear-gradient(145deg,rgba(18,41,82,.78),rgba(6,15,35,.95))] p-6 text-center shadow-[0_28px_110px_rgba(24,105,255,.2),inset_0_1px_0_rgba(255,255,255,.08)] sm:p-8">
                  <div className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-[#78b7ff]/55 to-transparent" />
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-300/14 bg-emerald-400/10 text-emerald-200 shadow-[0_18px_60px_rgba(16,185,129,.14)]">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <p className="mt-7 text-xs font-medium uppercase tracking-[0.28em] text-[#78b7ff]">
                    Profil hazır
                  </p>
                  <h2 className="mt-3 text-balance text-4xl font-medium tracking-[-0.055em]">
                    İlk gece raporun daha kişisel başlayacak.
                  </h2>
                  <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-white/48">
                    Şimdi doğrudan kayıt ekranına geçiyoruz. Ham ses yine cihazında kalır; hesabına
                    yalnızca özet metrikler senkronize edilir.
                  </p>
                  <button
                    type="button"
                    onClick={() => void finish()}
                    disabled={finishing}
                    className="mt-8 inline-flex h-13 w-full items-center justify-center gap-3 rounded-full bg-[linear-gradient(135deg,#8fd1ff_0%,#2d79ff_45%,#165dff_100%)] px-6 text-sm font-semibold text-white shadow-[0_18px_55px_rgba(24,105,255,.34),inset_0_1px_0_rgba(255,255,255,.18)] transition hover:brightness-110 active:scale-[0.985] disabled:opacity-70 sm:w-auto"
                  >
                    {finishing ? "Uyku alanı hazırlanıyor..." : "İlk geceyi başlat"}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-white/30">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-300/70" />
                    Cihaz içi analiz, sade sabah raporu
                  </div>
                </div>
              )}

              {step.options && (
                <div className="relative overflow-hidden rounded-[1.8rem] border border-white/[0.08] bg-white/[0.035] p-5 shadow-[0_24px_90px_rgba(0,5,20,.34),inset_0_1px_0_rgba(255,255,255,.055)] backdrop-blur-2xl sm:p-6">
                  <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.24em] text-[#78b7ff]">
                    {progressIndex}/{questionSteps.length} · profil ayarı
                  </p>
                  <h2 className="text-balance text-2xl font-medium leading-tight tracking-[-0.04em]">
                    {step.title}
                  </h2>
                  <div className="mt-5 space-y-3">
                    {step.options.map((option) => (
                      <OnboardingOptionButton
                        key={option.id}
                        label={option.label}
                        emoji={option.emoji}
                        onClick={() => selectOption(step.id, option.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {showProgress && (
          <footer className="pb-3">
            <OnboardingProgress current={progressIndex} total={questionSteps.length} />
          </footer>
        )}
      </div>
    </motion.div>
  );
}
