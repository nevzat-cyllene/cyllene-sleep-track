"use client";

import { useEffect, useState } from "react";
import { formatTime } from "@/lib/sleep-utils";
import { dbToPercent } from "@/lib/sleep-utils";
import type { WakeLockMethod } from "@/features/recording/wake-lock";
import { DetectedEventsList } from "@/features/dashboard/components/detected-events-list";
import { RecordingGuidanceBanner } from "./recording-guidance-banner";
import { cn } from "@/lib/utils";
import type { LocalSleepEvent } from "@/types";

interface SleepModeScreenProps {
  elapsedMs: number;
  currentDb: number;
  eventCount: number;
  detectedEvents: LocalSleepEvent[];
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
  eventCount,
  detectedEvents,
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
  const seconds = Math.floor((elapsedMs % 60000) / 1000);

  const statusLabel =
    wakeLockStatus === "active"
      ? "Ekran açık — kayıt devam ediyor"
      : wakeLockStatus === "fallback"
        ? "Ekran kapanabilir — ayarları kontrol edin"
        : "Kayıt kesilebilir — ayarları yapın";

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black text-white">
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20"
          style={{
            background: `radial-gradient(circle, oklch(0.55 0.2 285 / ${dbToPercent(currentDb) / 100}) 0%, transparent 70%)`,
            animation: "pulse 4s ease-in-out infinite",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-1 flex-col px-4 pb-6 pt-6 sm:px-6">
        {wakeLockStatus !== "active" && (
          <RecordingGuidanceBanner
            mode="recording"
            wakeLockStatus={wakeLockStatus}
            variant="dark"
            className="mb-4"
          />
        )}

        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-5xl font-extralight tracking-wider tabular-nums sm:text-7xl">
            {formatTime(time)}
          </p>

          <div className="flex flex-col items-center gap-1">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">
              Kayıt süresi
            </p>
            <p className="font-mono text-xl tabular-nums text-white/70">
              {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:
              {String(seconds).padStart(2, "0")}
            </p>
          </div>

          <div className="flex flex-col items-center gap-1 text-sm">
            <span className="text-white/50">{eventCount} olay</span>
            <span
              className={cn(
                wakeLockStatus === "active"
                  ? "text-emerald-400/80"
                  : wakeLockStatus === "fallback"
                    ? "text-amber-400/80"
                    : "text-rose-400/80"
              )}
            >
              {statusLabel}
            </span>
          </div>
        </div>

        <div className="mt-4 flex-1 overflow-hidden">
          <p className="mb-3 text-center text-xs uppercase tracking-[0.25em] text-white/40">
            Tespit edilen olaylar
          </p>
          <div className="mx-auto max-h-[calc(100vh-24rem)] max-w-lg overflow-y-auto pr-1">
            <DetectedEventsList
              events={detectedEvents}
              variant="dark"
              emptyMessage="Henüz horlama veya ses olayı tespit edilmedi."
            />
          </div>
        </div>

        <div className="mt-4 flex justify-center">
          <button
            onClick={onStop}
            disabled={syncing}
            className="rounded-full border border-white/20 bg-white/5 px-8 py-3 text-sm uppercase tracking-widest text-white/60 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            {syncing ? "Senkronize ediliyor..." : "Kaydı Bitir"}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.15; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.25; }
        }
      `}</style>
    </div>
  );
}
