"use client";

import { useEffect, useState } from "react";
import { formatTime } from "@/lib/sleep-utils";
import { dbToPercent } from "@/lib/sleep-utils";
import { cn } from "@/lib/utils";

interface SleepModeScreenProps {
  elapsedMs: number;
  currentDb: number;
  eventCount: number;
  wakeLockActive: boolean;
  onStop: () => void;
}

export function SleepModeScreen({
  elapsedMs,
  currentDb,
  eventCount,
  wakeLockActive,
  onStop,
}: SleepModeScreenProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = Math.floor(elapsedMs / 3600000);
  const minutes = Math.floor((elapsedMs % 3600000) / 60000);
  const seconds = Math.floor((elapsedMs % 60000) / 1000);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white">
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20"
          style={{
            background: `radial-gradient(circle, oklch(0.55 0.2 285 / ${dbToPercent(currentDb) / 100}) 0%, transparent 70%)`,
            animation: "pulse 4s ease-in-out infinite",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">
        <p className="text-6xl font-extralight tracking-wider tabular-nums sm:text-8xl">
          {formatTime(time)}
        </p>

        <div className="flex flex-col items-center gap-2">
          <p className="text-sm uppercase tracking-[0.3em] text-white/40">
            Kayıt süresi
          </p>
          <p className="font-mono text-2xl tabular-nums text-white/70">
            {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:
            {String(seconds).padStart(2, "0")}
          </p>
        </div>

        <div className="flex items-center gap-6 text-sm text-white/50">
          <span>{eventCount} olay</span>
          <span className={cn(wakeLockActive ? "text-emerald-400/70" : "text-amber-400/70")}>
            {wakeLockActive ? "Ekran açık" : "Wake lock yok"}
          </span>
        </div>

        <button
          onClick={onStop}
          className="mt-8 rounded-full border border-white/20 bg-white/5 px-8 py-3 text-sm uppercase tracking-widest text-white/60 transition hover:bg-white/10 hover:text-white"
        >
          Kaydı Bitir
        </button>
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
