"use client";

import { useEffect, useState } from "react";
import { formatElapsedClock, formatWallClock } from "@/lib/sleep-utils";
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

  const statusLabel = isFinishing
    ? "Gece kaydediliyor"
    : wakeLockStatus === "active"
      ? "Kayıt devam ediyor"
      : wakeLockStatus === "fallback"
        ? "Ekran kapanabilir"
        : "Kayıt kesilebilir";

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,oklch(0.78_0.14_195/10%),transparent)]" />

      <div className="relative z-10 flex flex-1 flex-col px-4 pb-8 pt-10">
        {!isFinishing && wakeLockStatus !== "active" && (
          <RecordingGuidanceBanner
            mode="recording"
            wakeLockStatus={wakeLockStatus}
            variant="dark"
            className="mb-4"
          />
        )}

        {isFinishing && (
          <div className="mb-6 rounded-2xl border border-cyllene-cyan/20 bg-cyllene-cyan/10 px-5 py-4 text-center">
            <p className="text-sm font-medium text-cyllene-cyan">Günaydın</p>
            <p className="mt-1 text-sm text-white/65">
              Gece kaydınız güvenle sonlandırıldı. Analiz edilip günlüğe ekleniyor.
            </p>
          </div>
        )}

        <div className="flex flex-1 flex-col items-center justify-center gap-10">
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-[0.45em] text-white/30">Şu an</p>
            <p className="mt-2 text-5xl font-extralight tracking-wider tabular-nums sm:text-6xl">
              {formatWallClock(wallClock)}
            </p>
          </div>

          <div className="text-center">
            <div className="mb-3 flex items-center justify-center gap-2">
              {!isFinishing ? (
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
              ) : (
                <span className="h-2 w-2 rounded-full bg-cyllene-cyan/80" />
              )}
              <p className="text-[11px] uppercase tracking-[0.45em] text-white/40">
                {isFinishing ? "Toplam uyku" : "Uyku süresi"}
              </p>
            </div>
            <p className="font-mono text-5xl font-light tabular-nums tracking-tight text-white sm:text-6xl">
              {formatElapsedClock(elapsedMs)}
            </p>
          </div>

          {!isFinishing && (
            <LiveSoundWave samples={recentDbSamples} currentDb={currentDb} />
          )}

          <p
            className={cn(
              "text-xs uppercase tracking-[0.2em]",
              isFinishing
                ? "text-cyllene-cyan/80"
                : wakeLockStatus === "active"
                  ? "text-emerald-400/70"
                  : "text-amber-400/70"
            )}
          >
            {statusLabel}
          </p>
        </div>

        <SwipeToStop onStop={onStop} disabled={isFinishing} />
      </div>
    </div>
  );
}
