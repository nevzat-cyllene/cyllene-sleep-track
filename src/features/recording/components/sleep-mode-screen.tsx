"use client";

import { useEffect, useState } from "react";
import { formatTime } from "@/lib/sleep-utils";
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
  const [time, setTime] = useState(new Date());
  const wakeLockStatus = toWakeLockStatus(wakeLockActive, wakeLockMethod);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = Math.floor(elapsedMs / 3600000);
  const minutes = Math.floor((elapsedMs % 3600000) / 60000);

  const statusLabel =
    wakeLockStatus === "active"
      ? "Kayıt devam ediyor"
      : wakeLockStatus === "fallback"
        ? "Ekran kapanabilir"
        : "Kayıt kesilebilir";

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black text-white">
      <div className="relative z-10 flex flex-1 flex-col px-4 pb-8 pt-10">
        {wakeLockStatus !== "active" && (
          <RecordingGuidanceBanner
            mode="recording"
            wakeLockStatus={wakeLockStatus}
            variant="dark"
            className="mb-4"
          />
        )}

        <div className="flex flex-1 flex-col items-center justify-center gap-8">
          <div className="text-center">
            <p className="text-6xl font-extralight tracking-wider tabular-nums sm:text-8xl">
              {formatTime(time)}
            </p>
            <p className="mt-4 font-mono text-lg tabular-nums text-white/50">
              {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}
            </p>
            <p className="mt-2 text-xs text-white/30">uyku süresi</p>
          </div>

          <LiveSoundWave samples={recentDbSamples} currentDb={currentDb} />

          <p
            className={cn(
              "text-xs uppercase tracking-[0.2em]",
              wakeLockStatus === "active" ? "text-emerald-400/70" : "text-amber-400/70"
            )}
          >
            {statusLabel}
          </p>
        </div>

        <SwipeToStop onStop={onStop} disabled={syncing} />
      </div>
    </div>
  );
}
