"use client";

import { useEffect, useState } from "react";
import { formatElapsedParts, formatWallClockParts } from "@/lib/sleep-utils";
import type { WakeLockMethod } from "@/features/recording/wake-lock";
import { RecordingGuidanceBanner } from "./recording-guidance-banner";
import { LiveSoundWave } from "./live-sound-wave";
import { SwipeToStop } from "./swipe-to-stop";
import { cn } from "@/lib/utils";

interface SleepModeScreenProps {
  elapsedMs: number;
  currentDb: number;
  recentDbSamples: number[];
  wakeLockActive: boolean;
  wakeLockMethod: WakeLockMethod;
  syncing?: boolean;
  onStop: () => void;
}

function toWakeLockStatus(active: boolean, method: WakeLockMethod) {
  if (active && method === "api") return "active" as const;
  if (active && method === "fallback") return "fallback" as const;
  return "inactive" as const;
}

function ClockDisplay({ hours, minutes, seconds }: { hours: string; minutes: string; seconds: string }) {
  return (
    <div className="flex items-baseline justify-center tabular-nums tracking-tight">
      <span className="bg-gradient-to-b from-white to-white/80 bg-clip-text text-[4.25rem] font-extralight leading-none text-transparent sm:text-[5rem]">
        {hours}
        <span className="text-white/30">:</span>
        {minutes}
      </span>
      <span className="ml-1.5 text-2xl font-light text-cyllene-cyan/80 sm:text-3xl">{seconds}</span>
    </div>
  );
}

export function SleepModeScreen({
  elapsedMs,
  currentDb,
  recentDbSamples,
  wakeLockActive,
  wakeLockMethod,
  syncing,
  onStop,
}: SleepModeScreenProps) {
  const [wallClock, setWallClock] = useState(new Date());
  const wakeLockStatus = toWakeLockStatus(wakeLockActive, wakeLockMethod);
  const isFinishing = Boolean(syncing);

  useEffect(() => {
    const interval = setInterval(() => setWallClock(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const wall = formatWallClockParts(wallClock);
  const elapsed = formatElapsedParts(elapsedMs);

  const statusLabel = isFinishing
    ? "Gece kaydediliyor"
    : wakeLockStatus === "active"
      ? "Kayıt aktif"
      : wakeLockStatus === "fallback"
        ? "Ekran kapanabilir"
        : "Bağlantıyı kontrol edin";

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-[oklch(0.08_0.04_265)] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_-5%,oklch(0.62_0.22_285/18%),transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_40%_at_80%_100%,oklch(0.78_0.14_195/10%),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[oklch(0.06_0.04_265)] to-transparent" />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(2.5rem,env(safe-area-inset-top))]">
        {!isFinishing && wakeLockStatus !== "active" && (
          <RecordingGuidanceBanner
            mode="recording"
            wakeLockStatus={wakeLockStatus}
            variant="dark"
            className="mb-5 shrink-0"
          />
        )}

        {isFinishing && (
          <div className="mb-5 shrink-0 rounded-[20px] border border-cyllene-cyan/20 bg-gradient-to-br from-cyllene-purple/10 to-cyllene-cyan/5 px-5 py-4 backdrop-blur-xl">
            <p className="text-[15px] font-medium text-white">Günaydın</p>
            <p className="mt-1 text-sm font-light leading-relaxed text-white/55">
              Gece kaydınız tamamlandı. Analiz edilip günlüğe ekleniyor.
            </p>
          </div>
        )}

        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-8">
          <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3.5 py-1.5 backdrop-blur-md">
            {!isFinishing ? (
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyllene-cyan/50" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyllene-cyan" />
              </span>
            ) : (
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyllene-cyan" />
            )}
            <span className="text-[11px] font-medium tracking-wide text-white/50">{statusLabel}</span>
          </div>

          <div className="text-center">
            <p className="mb-3 text-[13px] font-medium tracking-wide text-white/35">Şimdi</p>
            <ClockDisplay hours={wall.hours} minutes={wall.minutes} seconds={wall.seconds} />
          </div>

          <div className="rounded-[22px] border border-white/[0.1] bg-white/[0.04] px-8 py-4 shadow-[0_0_40px_oklch(0.62_0.22_285/8%)] backdrop-blur-xl">
            <p className="mb-2 text-center text-[11px] font-medium tracking-wide text-white/35">
              {isFinishing ? "Toplam uyku" : "Uyku süresi"}
            </p>
            <div className="flex items-baseline justify-center gap-1 tabular-nums">
              <span className="text-3xl font-light tracking-tight text-white/95">
                {elapsed.hours}
                <span className="text-cyllene-cyan/30">:</span>
                {elapsed.minutes}
                <span className="text-cyllene-cyan/30">:</span>
                {elapsed.seconds}
              </span>
            </div>
          </div>

          {!isFinishing && (
            <LiveSoundWave samples={recentDbSamples} currentDb={currentDb} className="w-full max-w-md" />
          )}
        </div>

        <SwipeToStop onStop={onStop} disabled={isFinishing} />
      </div>
    </div>
  );
}
