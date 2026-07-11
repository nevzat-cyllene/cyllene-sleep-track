"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ShieldCheck, Sparkles, Waves } from "lucide-react";
import { formatElapsedClock, formatWallClock } from "@/lib/sleep-utils";
import type { WakeLockMethod } from "@/features/recording/wake-lock";
import { useI18n } from "@/i18n/runtime";
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

const ANALYSIS_STEP_ICONS = [CheckCircle2, Waves, ShieldCheck] as const;

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
  const { t, m } = useI18n();
  const steps = m<{ label: string; description: string }[]>(
    "recording.analysisHandoff.steps",
    []
  );

  return (
    <div className="fixed inset-0 z-[300] flex flex-col overflow-hidden bg-[#020816] text-white">
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
            {t("recording.analysisHandoff.eyebrow")}
          </p>
          <h1 className="mt-4 text-balance text-4xl font-medium leading-tight tracking-[-0.055em]">
            {t("recording.analysisHandoff.title")}
          </h1>
          <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-white/48">
            {t("recording.analysisHandoff.body")}
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-[#8dbdff]/12 bg-white/[0.035] p-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">
              {t("recording.analysisHandoff.duration")}
            </p>
            <p className="mt-2 font-mono text-2xl font-light tabular-nums">
              {formatElapsedClock(elapsedMs)}
            </p>
          </div>
          <div className="rounded-2xl border border-[#8dbdff]/12 bg-white/[0.035] p-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">
              {t("recording.analysisHandoff.inspectedEvent")}
            </p>
            <p className="mt-2 text-2xl font-medium tracking-[-0.05em]">{eventCount}</p>
          </div>
        </div>

        <div className="mt-4 space-y-2 rounded-[1.5rem] border border-[#8dbdff]/12 bg-[linear-gradient(145deg,rgba(8,20,45,.72),rgba(4,10,24,.82))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,.06)]">
          {steps.map((step, index) => {
            const Icon = ANALYSIS_STEP_ICONS[index] ?? CheckCircle2;
            return (
              <div key={step.label} className="flex items-start gap-3 rounded-2xl bg-white/[0.025] p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#8dbdff]/12 bg-[#1769ff]/12 text-[#9bd5ff]">
                  <Icon className="h-4 w-4" />
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
            );
          })}
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
  const { t } = useI18n();
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
      ? t("recording.sleepMode.recordingContinues")
      : wakeLockStatus === "fallback"
        ? t("recording.sleepMode.screenMayTurnOff")
        : t("recording.sleepMode.recordingMayStop");

  return (
    <div className="fixed inset-0 z-[300] flex flex-col overflow-hidden bg-[#020816] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="night-stars absolute inset-0 opacity-[0.18]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_86%_52%_at_50%_-12%,rgba(111,210,255,.16),transparent_62%),radial-gradient(circle_at_18%_22%,rgba(23,105,255,.12),transparent_34%),linear-gradient(180deg,rgba(2,8,22,.2)_0%,rgba(2,8,22,.88)_72%,rgba(1,5,14,.96)_100%)]" />
        <div className="absolute left-1/2 top-[-13rem] h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-[#1769ff]/18 blur-[115px]" />
        <div className="absolute bottom-[-15rem] right-[-10rem] h-[30rem] w-[30rem] rounded-full bg-[#6fd2ff]/12 blur-[120px]" />
        <div className="absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(151,199,255,.42),transparent)]" />
      </div>

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
            <p className="text-[11px] uppercase tracking-[0.45em] text-[#8dbdff]/45">
              {t("recording.sleepMode.now")}
            </p>
            <p className="mt-2 text-5xl font-extralight tracking-wider tabular-nums text-white sm:text-6xl">
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
                {t("recording.sleepMode.sleepDuration")}
              </p>
            </div>
            <p className="font-mono text-5xl font-light tabular-nums tracking-tight text-[#eef7ff] drop-shadow-[0_0_28px_rgba(111,210,255,.14)] sm:text-6xl">
              {formatElapsedClock(elapsedMs)}
            </p>
          </div>

          <LiveSoundWave samples={recentDbSamples} currentDb={currentDb} />

          <p
            className={cn(
              "text-xs uppercase tracking-[0.2em]",
              wakeLockStatus === "active" ? "text-[#75f2d6]/75" : "text-amber-300/75"
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
