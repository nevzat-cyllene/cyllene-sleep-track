"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ShieldCheck, Sparkles, Waves } from "lucide-react";
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
  eventCount: number;
  syncing?: boolean;
  onStop: () => void;
}

const ANALYSIS_STEPS = [
  {
    icon: CheckCircle2,
    label: "Kayıt kapandı",
    description: "Gece oturumu güvenle mühürlendi.",
  },
  {
    icon: Waves,
    label: "Ses olayları ayrıştırılıyor",
    description: "Horlama, öksürük ve ani sesler rapor için inceleniyor.",
  },
  {
    icon: ShieldCheck,
    label: "Rapor hazırlanıyor",
    description: "Ham ses cihazında kalır; günlüğe yalnızca özet gider.",
  },
] as const;

function toWakeLockStatus(active: boolean, method: WakeLockMethod) {
  if (active && method === "api") return "active" as const;
  if (active && method === "fallback") return "fallback" as const;
  return "inactive" as const;
}

function AnalysisHandoffScreen({
  elapsedMs,
  eventCount,
}: {
  elapsedMs: number;
  eventCount: number;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex flex-col overflow-hidden bg-[#020816] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="night-stars absolute inset-0 opacity-24" />
        <div className="absolute left-1/2 top-[-12rem] h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-[#1769ff]/20 blur-[120px]" />
        <div className="absolute bottom-[-14rem] right-[-10rem] h-[30rem] w-[30rem] rounded-full bg-[#6fd2ff]/12 blur-[120px]" />
        <div className="absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(151,199,255,.46),transparent)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6 py-10">
        <div className="text-center">
          <div className="relative mx-auto h-36 w-36">
            <div className="absolute inset-0 rounded-full border border-[#8dbdff]/18 bg-[#155eff]/8 shadow-[0_0_90px_rgba(23,105,255,.28)]" />
            <div className="absolute inset-3 animate-ping rounded-full border border-[#6fd2ff]/18" />
            <div className="absolute inset-4 animate-[spin_5.6s_linear_infinite] rounded-full border border-transparent border-r-[#8dbdff]/24 border-t-[#6fd2ff]/70" />
            <div className="absolute inset-9 flex items-center justify-center rounded-full border border-[#8dbdff]/16 bg-[linear-gradient(145deg,rgba(23,105,255,.28),rgba(111,210,255,.08))] shadow-[inset_0_1px_0_rgba(255,255,255,.12)]">
              <Sparkles className="h-8 w-8 text-[#9bd5ff]" />
            </div>
          </div>

          <p className="mt-8 text-xs font-medium uppercase tracking-[0.32em] text-[#78b7ff]">
            Analiz hazırlanıyor
          </p>
          <h1 className="mt-4 text-balance text-4xl font-medium leading-tight tracking-[-0.055em]">
            Gece kaydın rapora dönüşüyor.
          </h1>
          <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-white/48">
            Cyllene ses izlerini inceliyor, olayları ayırıyor ve günlüğe hazır, sakin bir
            sabah özeti hazırlıyor.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-[#8dbdff]/12 bg-white/[0.035] p-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">Süre</p>
            <p className="mt-2 font-mono text-2xl font-light tabular-nums">
              {formatElapsedClock(elapsedMs)}
            </p>
          </div>
          <div className="rounded-2xl border border-[#8dbdff]/12 bg-white/[0.035] p-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">
              İncelenen olay
            </p>
            <p className="mt-2 text-2xl font-medium tracking-[-0.05em]">{eventCount}</p>
          </div>
        </div>

        <div className="mt-4 space-y-2 rounded-[1.5rem] border border-[#8dbdff]/12 bg-[linear-gradient(145deg,rgba(8,20,45,.72),rgba(4,10,24,.82))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,.06)]">
          {ANALYSIS_STEPS.map((step, index) => (
            <div key={step.label} className="flex items-start gap-3 rounded-2xl bg-white/[0.025] p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#8dbdff]/12 bg-[#1769ff]/12 text-[#9bd5ff]">
                <step.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{step.label}</p>
                  {index === 1 && (
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#6fd2ff] opacity-70" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#6fd2ff]" />
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs leading-5 text-white/38">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SleepModeScreen({
  elapsedMs,
  currentDb,
  recentDbSamples,
  wakeLockActive,
  wakeLockMethod,
  eventCount,
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

  if (isFinishing) {
    return <AnalysisHandoffScreen elapsedMs={elapsedMs} eventCount={eventCount} />;
  }

  const statusLabel =
    wakeLockStatus === "active"
      ? "Kayıt devam ediyor"
      : wakeLockStatus === "fallback"
        ? "Ekran kapanabilir"
        : "Kayıt kesilebilir";

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,oklch(0.78_0.14_195/10%),transparent)]" />

      <div className="relative z-10 flex flex-1 flex-col px-4 pb-8 pt-10">
        {wakeLockStatus !== "active" && (
          <RecordingGuidanceBanner
            mode="recording"
            wakeLockStatus={wakeLockStatus}
            variant="dark"
            className="mb-4"
          />
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
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <p className="text-[11px] uppercase tracking-[0.45em] text-white/40">
                Uyku süresi
              </p>
            </div>
            <p className="font-mono text-5xl font-light tabular-nums tracking-tight text-white sm:text-6xl">
              {formatElapsedClock(elapsedMs)}
            </p>
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

        <SwipeToStop onStop={onStop} />
      </div>
    </div>
  );
}
