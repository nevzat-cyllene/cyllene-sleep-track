"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, MoonStar, Volume2, VolumeX } from "lucide-react";
import { AmbientWelcomeSound } from "@/lib/ambient-welcome-sound";
import { markGuestSplashSeen } from "@/lib/guest-splash-storage";
import { siteConfig } from "@/lib/site-config";

interface PremiumEntranceProps {
  onComplete: () => void;
}

const ease = [0.22, 1, 0.36, 1] as const;

const MOMENTS = [
  {
    eyebrow: "Gece başlıyor",
    title: "Bir an dur.",
    body: "Omuzlarını bırak ve derin bir nefes al.",
  },
  {
    eyebrow: siteConfig.shortName,
    title: "Geceni dinler.",
    body: "Sabah, uykuna dair anlaşılır bir hikâyeye uyanırsın.",
  },
  {
    eyebrow: "Gizlilik önce",
    title: "Sesin sende kalır.",
    body: "Analiz cihazında gerçekleşir; ham ses kayıtların buluta gönderilmez.",
  },
] as const;

export function PremiumEntrance({ onComplete }: PremiumEntranceProps) {
  const soundRef = useRef<AmbientWelcomeSound | null>(null);
  const doneRef = useRef(false);
  const reduceMotion = useReducedMotion();
  const [started, setStarted] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [moment, setMoment] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    soundRef.current = new AmbientWelcomeSound();
    return () => soundRef.current?.dispose();
  }, []);

  useEffect(() => {
    if (!started) return;

    const second = window.setTimeout(() => setMoment(1), reduceMotion ? 900 : 3600);
    const third = window.setTimeout(() => setMoment(2), reduceMotion ? 1800 : 7000);

    return () => {
      window.clearTimeout(second);
      window.clearTimeout(third);
    };
  }, [reduceMotion, started]);

  const begin = useCallback(async () => {
    if (started) return;
    setStarted(true);

    try {
      await soundRef.current?.start();
      setSoundOn(true);
    } catch {
      setSoundOn(false);
    }
  }, [started]);

  const finish = useCallback(async () => {
    if (doneRef.current) return;
    doneRef.current = true;
    setExiting(true);
    markGuestSplashSeen();
    await soundRef.current?.fadeOut(reduceMotion ? 0.2 : 1.3);
    onComplete();
  }, [onComplete, reduceMotion]);

  const toggleSound = useCallback(() => {
    if (soundOn) {
      void soundRef.current?.fadeOut(0.5);
      setSoundOn(false);
      return;
    }

    soundRef.current = new AmbientWelcomeSound();
    void soundRef.current
      .start()
      .then(() => setSoundOn(true))
      .catch(() => setSoundOn(false));
  }, [soundOn]);

  const current = MOMENTS[moment];

  return (
    <motion.div
      className="fixed inset-0 z-[250] isolate overflow-hidden bg-[#02050d] text-white"
      initial={{ opacity: 1 }}
      animate={{ opacity: exiting ? 0 : 1, scale: exiting ? 1.015 : 1 }}
      transition={{ duration: reduceMotion ? 0.2 : 1.2, ease }}
    >
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <motion.div
          className="absolute -left-[15%] top-[-18%] h-[65vw] min-h-[420px] w-[65vw] min-w-[420px] rounded-full bg-[#194eff]/20 blur-[110px]"
          animate={reduceMotion ? undefined : { x: [0, 40, -10, 0], y: [0, 30, 10, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-[30%] right-[-10%] h-[70vw] min-h-[460px] w-[70vw] min-w-[460px] rounded-full bg-[#17b4e8]/15 blur-[130px]"
          animate={reduceMotion ? undefined : { x: [0, -35, 0], y: [0, -25, 0] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="night-stars absolute inset-0 opacity-75" />
        <div className="absolute inset-x-0 bottom-0 h-[44%] bg-[linear-gradient(180deg,transparent_0%,#02050d_82%)]" />

        <motion.div
          className="absolute left-1/2 top-[24%] h-40 w-40 -translate-x-1/2 rounded-full border border-white/10 bg-[radial-gradient(circle_at_34%_30%,#ffffff_0%,#d8e7ff_26%,#5a79ca_68%,#183276_100%)] shadow-[0_0_90px_rgba(96,145,255,0.28)] sm:h-52 sm:w-52"
          initial={{ opacity: 0, y: 30, scale: 0.86 }}
          animate={{
            opacity: started ? 0.42 : 0.72,
            y: started ? -22 : 0,
            scale: started ? 1.2 : 1,
          }}
          transition={{ duration: reduceMotion ? 0.2 : 2.6, ease }}
        >
          <span className="absolute left-[24%] top-[30%] h-7 w-7 rounded-full bg-[#6f8bd1]/20 blur-[1px]" />
          <span className="absolute bottom-[27%] right-[19%] h-10 w-10 rounded-full bg-[#6f8bd1]/15 blur-[1px]" />
        </motion.div>

        <div className="absolute inset-x-0 bottom-0 h-[28%] opacity-80">
          <div className="night-horizon absolute inset-x-0 bottom-0 h-full" />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#4e8cff]/40 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))] sm:px-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,.08)] backdrop-blur-xl">
              <MoonStar className="h-4.5 w-4.5 text-[#78b7ff]" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight">{siteConfig.shortName}</p>
              <p className="text-[10px] uppercase tracking-[0.24em] text-white/35">
                Uyku zekâsı
              </p>
            </div>
          </div>

          {started && (
            <motion.button
              type="button"
              onClick={toggleSound}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/55 backdrop-blur-xl transition hover:bg-white/10 hover:text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              aria-label={soundOn ? "Sesi kapat" : "Sesi aç"}
            >
              {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </motion.button>
          )}
        </header>

        <main className="flex flex-1 items-end pb-[12vh] sm:items-center sm:pb-0">
          <AnimatePresence mode="wait">
            {!started ? (
              <motion.div
                key="invitation"
                className="max-w-xl"
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18, filter: "blur(8px)" }}
                transition={{ duration: reduceMotion ? 0.2 : 1.2, delay: 0.25, ease }}
              >
                <p className="mb-4 text-xs font-medium uppercase tracking-[0.32em] text-[#78b7ff]">
                  İlk gecene hoş geldin
                </p>
                <h1 className="max-w-lg text-balance text-[clamp(3rem,10vw,6.5rem)] font-medium leading-[0.92] tracking-[-0.065em]">
                  Geceyi
                  <span className="block bg-gradient-to-r from-white via-[#bcd8ff] to-[#5e9eff] bg-clip-text text-transparent">
                    yavaşlat.
                  </span>
                </h1>
                <p className="mt-6 max-w-sm text-pretty text-base font-light leading-7 text-white/52 sm:text-lg">
                  Kısa bir nefes alanıyla başla. Ambiyans yalnızca sen dokunduğunda açılır.
                </p>

                <button
                  type="button"
                  onClick={() => void begin()}
                  className="group mt-9 flex items-center gap-4 rounded-full border border-white/12 bg-white/[0.07] py-2.5 pl-5 pr-2.5 shadow-[0_16px_60px_rgba(0,50,160,.25),inset_0_1px_0_rgba(255,255,255,.12)] backdrop-blur-2xl transition hover:border-[#78b7ff]/35 hover:bg-white/[0.1]"
                >
                  <span className="text-sm font-medium">Dokun ve nefes al</span>
                  <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[#1769ff] text-white shadow-[0_0_32px_rgba(23,105,255,.55)]">
                    <span className="absolute inset-0 animate-ping rounded-full border border-[#78b7ff]/40 [animation-duration:2.8s]" />
                    <Volume2 className="h-4 w-4" />
                  </span>
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="journey"
                className="flex w-full flex-col gap-8 sm:grid sm:grid-cols-[1fr_auto] sm:items-end"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: reduceMotion ? 0.2 : 1 }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={moment}
                    initial={{ opacity: 0, y: 28, filter: "blur(10px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -18, filter: "blur(8px)" }}
                    transition={{ duration: reduceMotion ? 0.2 : 1.1, ease }}
                    className="max-w-2xl"
                  >
                    <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-[#78b7ff]">
                      {current.eyebrow}
                    </p>
                    <h2 className="text-balance text-[clamp(2.8rem,8vw,5.8rem)] font-medium leading-[0.96] tracking-[-0.06em]">
                      {current.title}
                    </h2>
                    <p className="mt-5 max-w-md text-pretty text-base font-light leading-7 text-white/50 sm:text-lg">
                      {current.body}
                    </p>
                  </motion.div>
                </AnimatePresence>

                <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                  <div className="flex gap-1.5">
                    {MOMENTS.map((item, index) => (
                      <span
                        key={item.title}
                        className={`h-1 rounded-full transition-all duration-700 ${
                          index === moment ? "w-9 bg-[#6da9ff]" : "w-3 bg-white/15"
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (moment < MOMENTS.length - 1) setMoment((value) => value + 1);
                      else void finish();
                    }}
                    className="ml-auto flex h-13 items-center gap-3 rounded-full bg-white px-5 text-sm font-semibold text-[#06112a] shadow-[0_12px_42px_rgba(48,112,255,.3)] transition hover:scale-[1.02] sm:ml-0"
                  >
                    {moment === MOMENTS.length - 1 ? "Cyllene’i keşfet" : "Devam"}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <p className="text-[10px] uppercase tracking-[0.24em] text-white/25">
          {started && soundOn ? "Meditasyon ambiyansı açık" : "Ses senin kontrolünde"}
        </p>
      </div>
    </motion.div>
  );
}
