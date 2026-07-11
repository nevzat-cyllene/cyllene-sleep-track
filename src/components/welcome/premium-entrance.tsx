"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, MoonStar, Volume2, VolumeX } from "lucide-react";
import { AmbientWelcomeSound } from "@/lib/ambient-welcome-sound";
import { markGuestSplashSeen } from "@/lib/guest-splash-storage";
import { GUEST_SPLASH_COMPLETE_EVENT } from "@/components/install-pwa";
import { siteConfig } from "@/lib/site-config";

interface PremiumEntranceProps {
  onComplete: () => void;
}

const ease = [0.22, 1, 0.36, 1] as const;
const moonFlowEase = [0.2, 0.72, 0.18, 1] as const;
const moonEntryDuration = 9.1;
const momentReadDuration = 7000;
const centerTransform = (_: unknown, generated: string) => `translateX(-50%) ${generated}`;
const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

const MOMENTS = [
  {
    eyebrow: "Cihaz içi analiz",
    title: "Ham ses cihazında kalır.",
    body: "Cyllene gece boyunca oluşan ses sinyallerini telefonunda işler.",
  },
  {
    eyebrow: siteConfig.shortName,
    title: "Gece olayları işaretlenir.",
    body: "Horlama, öksürük ve ani sesler sabah raporunda okunabilir anlara dönüşür.",
  },
  {
    eyebrow: "Sabah raporu",
    title: "Uyku ritmin netleşir.",
    body: "Skor, zaman çizelgesi ve tespit edilen anlar sade bir özet halinde açılır.",
  },
] as const;

export function PremiumEntrance({ onComplete }: PremiumEntranceProps) {
  const soundRef = useRef<AmbientWelcomeSound | null>(null);
  const doneRef = useRef(false);
  const reduceMotion = useReducedMotion();
  const [started, setStarted] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [moment, setMoment] = useState(0);
  const [hasSeenMomentCycle, setHasSeenMomentCycle] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    soundRef.current = new AmbientWelcomeSound();
    return () => soundRef.current?.dispose();
  }, []);

  useEffect(() => {
    if (!started || exiting) return;

    const next = window.setTimeout(() => {
      const nextMoment = (moment + 1) % MOMENTS.length;
      if (nextMoment === MOMENTS.length - 1) {
        setHasSeenMomentCycle(true);
      }
      setMoment(nextMoment);
    }, reduceMotion ? 2400 : momentReadDuration);

    return () => {
      window.clearTimeout(next);
    };
  }, [exiting, moment, reduceMotion, started]);

  const begin = useCallback(async () => {
    if (started) return;
    setMoment(0);
    setHasSeenMomentCycle(false);
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
    window.dispatchEvent(new Event(GUEST_SPLASH_COMPLETE_EVENT));
    // #region agent log
    fetch("http://127.0.0.1:7668/ingest/6ebf33a3-e317-467b-8188-4ae3fc7f8fb1", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "d5fe36" },
      body: JSON.stringify({
        sessionId: "d5fe36",
        runId: "pre-fix",
        hypothesisId: "D",
        location: "premium-entrance.tsx:finish",
        message: "Sabaha gec pressed / splash finish",
        data: { path: window.location.pathname },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    fetch("/api/debug-ingest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "d5fe36",
        runId: "pre-fix",
        hypothesisId: "D",
        location: "premium-entrance.tsx:finish",
        message: "Sabaha gec pressed / splash finish",
        data: { path: window.location.pathname },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    // Hard-stop ambience so it cannot leak into sleep recording.
    soundRef.current?.dispose();
    soundRef.current = null;
    await wait(reduceMotion ? 180 : 520);
    onComplete();
  }, [onComplete, reduceMotion]);

  const toggleSound = useCallback(() => {
    if (soundOn) {
      void soundRef.current?.fadeOut(3.2);
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
      animate={{
        opacity: exiting ? 0 : 1,
        scale: exiting ? 1.018 : 1,
        filter: exiting ? "blur(14px)" : "blur(0px)",
      }}
      transition={{ duration: reduceMotion ? 0.2 : 0.95, ease }}
    >
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <motion.div
          className="absolute -left-[15%] top-[-18%] h-[65vw] min-h-[420px] w-[65vw] min-w-[420px] rounded-full bg-[#194eff]/20 blur-[110px]"
          animate={
            reduceMotion
              ? undefined
              : { x: [0, 54, -16, 0], y: [0, 32, 6, 0], scale: [1, 1.08, 0.98, 1] }
          }
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-[30%] right-[-10%] h-[70vw] min-h-[460px] w-[70vw] min-w-[460px] rounded-full bg-[#17b4e8]/15 blur-[130px]"
          animate={
            reduceMotion
              ? undefined
              : { x: [0, -48, 14, 0], y: [0, -30, 10, 0], scale: [1, 1.06, 0.98, 1] }
          }
          transition={{ duration: 12.5, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          className="night-stars absolute -inset-10 opacity-75"
          animate={reduceMotion ? undefined : { x: [0, 14, 0], y: [0, -10, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        />
        {!reduceMotion &&
          [0, 1, 2, 3].map((line) => (
            <motion.span
              key={line}
              className="absolute left-0 h-px w-48 bg-gradient-to-r from-transparent via-[#d8ecff]/45 to-transparent blur-[0.45px] sm:w-64"
              style={{ top: `${16 + line * 15}%`, rotate: -11 + line * 1.5 }}
              initial={{ x: "-42vw", opacity: 0 }}
              animate={{ x: "128vw", opacity: [0, 0.46, 0] }}
              transition={{
                duration: 3.25 + line * 0.28,
                repeat: Infinity,
                repeatDelay: 1.65 + line * 0.32,
                delay: line * 0.42,
                ease: "easeInOut",
              }}
            />
          ))}
        <motion.div
          className="absolute inset-x-0 top-0 h-[2px] origin-left bg-gradient-to-r from-transparent via-[#71aaff] to-transparent"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: [0, 1, 1], opacity: [0, 0.35, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, repeatDelay: 2.4, ease }}
        />
        <div className="absolute inset-x-0 bottom-0 h-[44%] bg-[linear-gradient(180deg,transparent_0%,#02050d_82%)]" />

        <motion.div
          className="absolute left-1/2 top-[14%] z-[2] h-72 w-72 rounded-full border border-[#9cc8ff]/18 bg-[radial-gradient(circle,rgba(178,211,255,.16)_0%,rgba(94,143,255,.07)_45%,transparent_72%)] blur-[0.3px] will-change-transform sm:h-96 sm:w-96"
          transformTemplate={centerTransform}
          initial={{ x: "64vw", y: "-17vh", opacity: 0, scale: 0.24, rotate: -34 }}
          animate={{
            x: exiting
              ? "20vw"
              : started
                ? "0vw"
                : "0vw",
            y: exiting ? "-22vh" : started ? "1vh" : "0vh",
            opacity: exiting ? 0 : started ? 0.18 : 0.22,
            scale: exiting ? 0.88 : started ? 1.2 : 1,
            rotate: exiting ? 24 : started ? 14 : 10,
          }}
          transition={{
            duration: reduceMotion ? 0.2 : exiting ? 0.9 : started ? 1.05 : moonEntryDuration,
            ease: moonFlowEase,
          }}
        />
        <motion.div
          className="absolute left-1/2 top-[14%] z-[3] h-52 w-52 will-change-transform sm:h-72 sm:w-72"
          style={{ perspective: 1100 }}
          transformTemplate={centerTransform}
          initial={{
            x: "68vw",
            y: "-18vh",
            opacity: 0,
            scale: 0.2,
            rotateX: 22,
            rotateY: -58,
            rotateZ: 26,
            filter: "blur(16px)",
          }}
          animate={{
            x: exiting
              ? "20vw"
              : started
                ? "0vw"
                : "0vw",
            y: exiting ? "-24vh" : started ? "0vh" : "0vh",
            opacity: exiting ? 0 : started ? 0.78 : 0.97,
            scale: exiting ? 0.86 : started ? 1.04 : 1,
            rotateX: exiting ? -8 : started ? 5 : 0,
            rotateY: exiting ? 42 : started ? 14 : 0,
            rotateZ: exiting ? 16 : started ? 7 : 0,
            filter: exiting ? "blur(18px)" : "blur(0px)",
          }}
          transition={{
            duration: reduceMotion ? 0.2 : exiting ? 0.9 : started ? 1.05 : moonEntryDuration,
            ease: moonFlowEase,
          }}
        >
          <div
            className="relative h-full w-full overflow-hidden rounded-full border border-white/16 bg-[#07111f]/35 shadow-[0_0_88px_rgba(152,198,255,.34),0_0_210px_rgba(30,118,255,.18)] [contain:paint]"
            style={{ transformStyle: "preserve-3d" }}
          >
            <Image
              src="/brand/cyllene-moon.webp"
              alt=""
              fill
              priority
              sizes="(max-width: 640px) 13rem, 18rem"
              className={`object-cover [filter:contrast(1.05)_brightness(.86)] ${
                reduceMotion || exiting ? "scale-[1.08]" : "moon-texture-spin"
              }`}
            />
            <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_22%,rgba(255,255,255,.22),transparent_24%),radial-gradient(circle_at_68%_52%,transparent_0_44%,rgba(3,7,18,.34)_65%,rgba(0,2,8,.62)_100%)] mix-blend-multiply" />
            <span className="absolute inset-0 rounded-full shadow-[inset_-32px_-22px_50px_rgba(3,7,18,.52),inset_18px_14px_28px_rgba(255,255,255,.18)]" />
          </div>
        </motion.div>

        <motion.div
          className="absolute left-1/2 top-[16%] z-[1] h-64 w-[28rem] rounded-full bg-[radial-gradient(ellipse,rgba(150,190,255,.2)_0%,rgba(78,132,255,.075)_43%,transparent_73%)] blur-2xl will-change-transform sm:h-80 sm:w-[38rem]"
          transformTemplate={centerTransform}
          initial={{ x: "62vw", y: "-15vh", opacity: 0, scale: 0.3 }}
          animate={{
            x: exiting
              ? "14vw"
              : started
                ? "0vw"
                : "0vw",
            y: exiting ? "-20vh" : started ? "0vh" : "0vh",
            opacity: exiting ? 0 : started ? 0.34 : [0, 0.22, 0.5, 0.46],
            scale: exiting ? 0.86 : started ? 1.08 : 1,
          }}
          transition={{
            duration: reduceMotion ? 0.2 : exiting ? 0.9 : started ? 1.05 : moonEntryDuration,
            ease: moonFlowEase,
          }}
        />

        <div className="absolute inset-x-0 bottom-0 h-[28%] opacity-80">
          <div className="night-horizon absolute inset-x-0 bottom-0 h-full" />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#4e8cff]/40 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))] sm:px-10">
        <motion.header
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0.2 : 0.45, ease }}
        >
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
        </motion.header>

        <main className="flex flex-1 items-end pb-[7vh] sm:items-center sm:pb-0">
          <AnimatePresence mode="wait">
            {!started ? (
              <motion.div
                key="invitation"
                className="grid w-full max-w-5xl gap-7 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -24, scale: 1.015, filter: "blur(10px)" }}
                transition={{ duration: reduceMotion ? 0.2 : 0.65, ease }}
              >
                <div>
                  <motion.p
                    className="mb-4 text-xs font-medium uppercase tracking-[0.32em] text-[#78b7ff]"
                    initial={{ opacity: 0, y: 12, filter: "blur(16px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: reduceMotion ? 0.2 : moonEntryDuration, delay: 0.08, ease: moonFlowEase }}
                  >
                    Ay yükselirken
                  </motion.p>
                  <motion.h1
                    className="max-w-[25rem] text-balance text-[clamp(2.35rem,8.4vw,5.4rem)] font-medium leading-[0.96] tracking-[-0.06em] sm:max-w-2xl"
                    initial={{ opacity: 0, y: 22, filter: "blur(18px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: reduceMotion ? 0.2 : moonEntryDuration, delay: 0.12, ease: moonFlowEase }}
                  >
                    Uykunun sessiz dilini keşfedin.
                  </motion.h1>
                  <motion.p
                    className="mt-5 max-w-[31rem] text-pretty text-sm font-light leading-6 text-white/54 sm:text-base sm:leading-7"
                    initial={{ opacity: 0, y: 16, filter: "blur(16px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: reduceMotion ? 0.2 : moonEntryDuration, delay: 0.18, ease: moonFlowEase }}
                  >
                    Uyku, bedenin gece boyunca anlattığı bir hikayedir. Cyllene, akıllı
                    akustik tanıma mimarisiyle bu hikayenin detaylarını cihaz içi işleme
                    gücüyle analiz eder.
                  </motion.p>

                <motion.button
                  type="button"
                  onClick={() => void begin()}
                  className="group relative mt-7 flex items-center gap-4 overflow-hidden rounded-full border border-white/12 bg-white/[0.07] py-2.5 pl-5 pr-2.5 shadow-[0_16px_60px_rgba(0,50,160,.25),inset_0_1px_0_rgba(255,255,255,.12)] backdrop-blur-2xl transition duration-300 hover:scale-[1.03] hover:border-[#78b7ff]/35 hover:bg-white/[0.11] active:scale-[0.99]"
                  initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: reduceMotion ? 0.2 : 0.5, delay: 0.98, ease }}
                >
                  {!reduceMotion && (
                    <motion.span
                      className="pointer-events-none absolute inset-y-0 w-16 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/18 to-transparent"
                      initial={{ x: -100 }}
                      animate={{ x: 320 }}
                      transition={{ duration: 0.85, repeat: Infinity, repeatDelay: 1.1, ease }}
                    />
                  )}
                  <span className="relative text-sm font-medium">Gece modunu başlat</span>
                  <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[#1769ff] text-white shadow-[0_0_32px_rgba(23,105,255,.55)]">
                    <span className="absolute inset-0 animate-ping rounded-full border border-[#78b7ff]/40 [animation-duration:1.35s]" />
                    <Volume2 className="h-4 w-4" />
                  </span>
                </motion.button>
                </div>

                <motion.div
                  className="hidden rounded-[1.6rem] border border-[#8dbdff]/14 bg-white/[0.04] p-4 shadow-[0_18px_70px_rgba(24,105,255,.16),inset_0_1px_0_rgba(255,255,255,.07)] backdrop-blur-2xl lg:block"
                  initial={{ opacity: 0, x: 18, filter: "blur(10px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  transition={{ duration: reduceMotion ? 0.2 : 0.7, delay: 0.62, ease }}
                >
                  <p className="text-[10px] uppercase tracking-[0.22em] text-[#8fc0ff]/70">
                    Cihaz içi akustik tanıma
                  </p>
                  <div className="mt-4 space-y-2">
                    {["Nefes ritmi", "Öksürük", "Çevresel ses"].map((item) => (
                      <div
                        key={item}
                        className="flex items-center justify-between rounded-2xl bg-white/[0.035] px-3 py-2"
                      >
                        <span className="text-xs text-white/58">{item}</span>
                        <span className="h-1.5 w-12 rounded-full bg-[linear-gradient(90deg,#1769ff,#6fd2ff)]" />
                      </div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="journey"
                className="flex w-full flex-col gap-8 sm:grid sm:grid-cols-[1fr_auto] sm:items-end"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: reduceMotion ? 0.2 : 0.38 }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={moment}
                    initial={{ opacity: 0, y: 26, scale: 0.99, filter: "blur(14px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -18, scale: 1.01, filter: "blur(12px)" }}
                    transition={{ duration: reduceMotion ? 0.2 : 0.9, ease }}
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
                        className={`h-1 rounded-full transition-all duration-300 ${
                          index === moment ? "w-9 bg-[#6da9ff]" : "w-3 bg-white/15"
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (hasSeenMomentCycle) void finish();
                      else {
                        const nextMoment = Math.min(moment + 1, MOMENTS.length - 1);
                        if (nextMoment === MOMENTS.length - 1) {
                          setHasSeenMomentCycle(true);
                        }
                        setMoment(nextMoment);
                      }
                    }}
                    className="ml-auto flex h-13 items-center gap-3 rounded-full bg-white px-5 text-sm font-semibold text-[#06112a] shadow-[0_12px_42px_rgba(48,112,255,.3)] transition hover:scale-[1.02] sm:ml-0"
                  >
                    {hasSeenMomentCycle ? "Sabaha geç" : "Devam"}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <p className="text-[10px] uppercase tracking-[0.24em] text-white/25">
          {started && soundOn ? "Ay ambiyansı açık" : "Ses dokunuşla başlar"}
        </p>
      </div>
    </motion.div>
  );
}
