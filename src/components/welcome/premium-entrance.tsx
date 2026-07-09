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
const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

const MOMENTS = [
  {
    eyebrow: "Işık azalır",
    title: "Karanlık boş değildir.",
    body: "Telefon yanında durur; gece, izlerini sessizce bırakır.",
  },
  {
    eyebrow: siteConfig.shortName,
    title: "Sessizliğin haritasını çıkarır.",
    body: "Horlama, öksürük ve ani sesler sabaha net bir zaman çizelgesi olur.",
  },
  {
    eyebrow: "Mahremiyet",
    title: "Kayıt değil, anlam kalır.",
    body: "Analiz cihazında yapılır; ham ses buluta taşınmaz.",
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

    const second = window.setTimeout(() => setMoment(1), reduceMotion ? 550 : 2200);
    const third = window.setTimeout(() => setMoment(2), reduceMotion ? 1100 : 4600);

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
    await Promise.all([
      soundRef.current?.fadeOut(reduceMotion ? 0.2 : 0.95) ?? Promise.resolve(),
      wait(reduceMotion ? 220 : 1120),
    ]);
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
          [0, 1].map((line) => (
            <motion.span
              key={line}
              className="absolute left-0 h-px w-56 bg-gradient-to-r from-transparent via-[#8cc4ff]/35 to-transparent blur-[0.5px]"
              style={{ top: `${19 + line * 24}%`, rotate: -10 }}
              initial={{ x: "-35vw", opacity: 0 }}
              animate={{ x: "125vw", opacity: [0, 0.38, 0] }}
              transition={{
                duration: 3.1 + line * 0.35,
                repeat: Infinity,
                repeatDelay: 2.2 + line * 0.6,
                delay: line * 0.45,
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
          className="absolute left-1/2 top-[14%] z-[2] h-72 w-72 -translate-x-1/2 rounded-full border border-[#9cc8ff]/18 bg-[radial-gradient(circle,rgba(178,211,255,.12)_0%,rgba(94,143,255,.06)_42%,transparent_70%)] blur-[0.2px] sm:top-[17%] sm:h-96 sm:w-96"
          initial={{ opacity: 0, y: "-36vh", scale: 0.55, rotate: -30 }}
          animate={{
            opacity: exiting ? 0 : started ? 0.18 : [0.16, 0.34, 0.22],
            y: exiting ? "-18vh" : started ? "-1.2rem" : 0,
            scale: exiting ? 0.9 : started ? 1.24 : [0.86, 1.04, 0.98],
            rotate: started ? 18 : 4,
          }}
          transition={{
            duration: reduceMotion ? 0.2 : exiting ? 0.85 : started ? 0.9 : 2.15,
            repeat: !reduceMotion && !started && !exiting ? Infinity : 0,
            repeatDelay: 1.15,
            ease,
          }}
        />
        <motion.div
          className="absolute left-1/2 top-[14%] z-[3] h-48 w-48 sm:top-[17%] sm:h-64 sm:w-64"
          style={{ perspective: 1100 }}
          initial={{
            x: "-50%",
            y: "-46vh",
            opacity: 0,
            scale: 0.56,
            rotateX: 20,
            rotateY: -58,
            rotateZ: -18,
            filter: "blur(18px)",
          }}
          animate={{
            x: "-50%",
            y: exiting ? "-24vh" : started ? "-1rem" : 0,
            opacity: exiting ? 0 : started ? 0.72 : 0.96,
            scale: exiting ? 0.88 : started ? 1.07 : 1,
            rotateX: exiting ? -8 : started ? 6 : 0,
            rotateY: exiting ? 42 : started ? 18 : 0,
            rotateZ: exiting ? 14 : started ? 8 : 0,
            filter: exiting ? "blur(20px)" : "blur(0px)",
          }}
          transition={{ duration: reduceMotion ? 0.2 : exiting ? 0.88 : 1.65, ease }}
        >
          <motion.div
            className="relative h-full w-full overflow-hidden rounded-full border border-white/18 shadow-[0_0_90px_rgba(150,190,255,.32),0_0_220px_rgba(30,105,255,.18)]"
            style={{
              transformStyle: "preserve-3d",
              background:
                "radial-gradient(circle at 30% 24%, rgba(255,255,255,.92) 0 1.4%, transparent 1.9%), radial-gradient(circle at 31% 31%, rgba(88,84,77,.28) 0 7.5%, transparent 8.4%), radial-gradient(circle at 63% 34%, rgba(88,86,82,.31) 0 6.6%, transparent 7.5%), radial-gradient(circle at 47% 53%, rgba(70,69,68,.24) 0 11.5%, transparent 12.7%), radial-gradient(circle at 70% 66%, rgba(64,66,70,.22) 0 8%, transparent 9.2%), radial-gradient(circle at 24% 69%, rgba(102,98,89,.18) 0 6%, transparent 7%), radial-gradient(circle at 43% 37%, #fff8e7 0%, #e8e0cf 32%, #b8b2a6 55%, #7f8490 76%, #39445b 100%)",
            }}
            animate={
              reduceMotion || exiting
                ? undefined
                : { rotate: started ? [0, 1.5, -1, 0] : [0, -1.2, 1.4, 0] }
            }
            transition={{ duration: started ? 7.5 : 6.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_23%,rgba(255,255,255,.45),transparent_21%),radial-gradient(circle_at_70%_52%,transparent_0_48%,rgba(2,5,14,.34)_67%,rgba(0,2,8,.58)_100%)] mix-blend-multiply" />
            <span className="absolute left-[22%] top-[43%] h-7 w-7 rounded-full border border-[#4b4a48]/12 bg-[#4f5360]/16 blur-[0.7px] sm:h-9 sm:w-9" />
            <span className="absolute bottom-[24%] right-[25%] h-8 w-8 rounded-full border border-[#4a4c56]/12 bg-[#3f4554]/15 blur-[1px] sm:h-11 sm:w-11" />
            <span className="absolute right-[18%] top-[23%] h-5 w-5 rounded-full bg-white/16 blur-[1px] sm:h-6 sm:w-6" />
            <span className="absolute left-[47%] top-[18%] h-3 w-8 -rotate-12 rounded-full bg-[#5c5b59]/12 blur-[1.4px]" />
            <span className="absolute inset-0 rounded-full shadow-[inset_-34px_-22px_52px_rgba(3,7,18,.52),inset_18px_14px_30px_rgba(255,255,255,.26)]" />
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute left-1/2 top-[16%] z-[1] h-64 w-[28rem] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(150,190,255,.18)_0%,rgba(78,132,255,.07)_42%,transparent_72%)] blur-2xl sm:top-[19%] sm:h-80 sm:w-[38rem]"
          initial={{ opacity: 0, y: "-24vh", scale: 0.72 }}
          animate={{
            opacity: exiting ? 0 : started ? 0.34 : 0.48,
            y: exiting ? "-12vh" : 0,
            scale: exiting ? 0.9 : started ? 1.1 : 1,
          }}
          transition={{ duration: reduceMotion ? 0.2 : exiting ? 0.85 : 1.55, ease }}
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

        <main className="flex flex-1 items-end pb-[12vh] sm:items-center sm:pb-0">
          <AnimatePresence mode="wait">
            {!started ? (
              <motion.div
                key="invitation"
                className="max-w-xl"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -24, scale: 1.015, filter: "blur(10px)" }}
                transition={{ duration: reduceMotion ? 0.2 : 0.65, ease }}
              >
                <motion.p
                  className="mb-4 text-xs font-medium uppercase tracking-[0.32em] text-[#78b7ff]"
                  initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: reduceMotion ? 0.2 : 0.55, delay: 0.12, ease }}
                >
                  Ay yükselirken
                </motion.p>
                <motion.h1
                  className="max-w-lg text-balance text-[clamp(3rem,10vw,6.5rem)] font-medium leading-[0.92] tracking-[-0.065em]"
                  initial={{ opacity: 0, y: 22, filter: "blur(12px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: reduceMotion ? 0.2 : 0.82, delay: 0.28, ease }}
                >
                  Gece susar.
                  <span className="block bg-gradient-to-r from-white via-[#bcd8ff] to-[#5e9eff] bg-clip-text text-transparent">
                    İzleri kalır.
                  </span>
                </motion.h1>
                <motion.p
                  className="mt-6 max-w-sm text-pretty text-base font-light leading-7 text-white/52 sm:text-lg"
                  initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: reduceMotion ? 0.2 : 0.68, delay: 0.68, ease }}
                >
                  Cyllene, karanlıkta oluşan ses izlerini sabaha sade bir uyku haritası olarak
                  taşır.
                </motion.p>

                <motion.button
                  type="button"
                  onClick={() => void begin()}
                  className="group relative mt-9 flex items-center gap-4 overflow-hidden rounded-full border border-white/12 bg-white/[0.07] py-2.5 pl-5 pr-2.5 shadow-[0_16px_60px_rgba(0,50,160,.25),inset_0_1px_0_rgba(255,255,255,.12)] backdrop-blur-2xl transition duration-300 hover:scale-[1.03] hover:border-[#78b7ff]/35 hover:bg-white/[0.11] active:scale-[0.99]"
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
                    transition={{ duration: reduceMotion ? 0.2 : 0.72, ease }}
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
                      if (moment < MOMENTS.length - 1) setMoment((value) => value + 1);
                      else void finish();
                    }}
                    className="ml-auto flex h-13 items-center gap-3 rounded-full bg-white px-5 text-sm font-semibold text-[#06112a] shadow-[0_12px_42px_rgba(48,112,255,.3)] transition hover:scale-[1.02] sm:ml-0"
                  >
                    {moment === MOMENTS.length - 1 ? "Sabaha geç" : "Devam"}
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
