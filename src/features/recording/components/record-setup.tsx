"use client";

import { BatteryCharging, LockKeyhole, Mic2, MoonStar, Smartphone, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/i18n/runtime";
import { RecordingGuidanceBanner } from "./recording-guidance-banner";

interface RecordSetupProps {
  onStart: () => void;
  isLoading?: boolean;
  startLabel?: string;
  compact?: boolean;
}

const tipIcons = [BatteryCharging, Smartphone, Volume2, MoonStar] as const;

export function RecordSetup({ onStart, isLoading, startLabel, compact }: RecordSetupProps) {
  const { t, m } = useI18n();
  const tips = m<{ title: string; description: string }[]>("recording.setup.tips", []);
  const loadingLabel = t("recording.setup.loading");
  const defaultStartLabel = t("recording.setup.startSleepMode");

  if (compact) {
    return (
      <div className="space-y-4 -translate-y-2 sm:translate-y-0">
        <div className="relative overflow-hidden rounded-[1.8rem] border border-[#8dbdff]/13 bg-[linear-gradient(145deg,rgba(16,31,62,.86)_0%,rgba(8,17,38,.92)_54%,rgba(4,10,24,.96)_100%)] p-6 shadow-[0_26px_90px_rgba(0,8,28,.38),inset_0_1px_0_rgba(255,255,255,.075)] sm:p-8">
          <div className="night-stars pointer-events-none absolute inset-0 opacity-[0.1]" />
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#6fd2ff]/12 blur-[82px]" />
          <div className="absolute -left-28 bottom-[-8rem] h-72 w-72 rounded-full bg-[#1769ff]/13 blur-[94px]" />
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(143,193,255,.44),transparent)]" />

          <div className="relative grid gap-7 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <div className="mb-4 flex items-center gap-2 text-xs text-[#8bbdff]/80">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inset-0 animate-ping rounded-full bg-[#6da9ff] opacity-35" />
                  <span className="relative h-2 w-2 rounded-full bg-[#6da9ff]" />
                </span>
                {t("recording.setup.readyEyebrow")}
              </div>
              <h2 className="max-w-md text-balance text-3xl font-medium tracking-[-0.045em] sm:text-4xl">
                {t("recording.setup.compactTitle")}
              </h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-white/45">
                {t("recording.setup.compactBody")}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="flex items-center gap-1.5 rounded-full border border-[#8dbdff]/10 bg-white/[0.025] px-3 py-1.5 text-[10px] text-white/42">
                  <Mic2 className="h-3 w-3 text-[#78b7ff]" />
                  {t("recording.setup.realtimeAnalysis")}
                </span>
                <span className="flex items-center gap-1.5 rounded-full border border-[#8dbdff]/10 bg-white/[0.025] px-3 py-1.5 text-[10px] text-white/42">
                  <LockKeyhole className="h-3 w-3 text-emerald-300" />
                  {t("recording.setup.staysOnDevice")}
                </span>
              </div>
            </div>

            <Button
              size="lg"
              onClick={onStart}
              disabled={isLoading}
              className="h-14 w-full rounded-2xl bg-[linear-gradient(135deg,#8fd1ff_0%,#2d79ff_42%,#165dff_100%)] px-7 text-base font-semibold text-white shadow-[0_18px_50px_rgba(24,105,255,.38),inset_0_1px_0_rgba(255,255,255,.18)] transition duration-150 hover:brightness-110 active:scale-[0.98] sm:w-auto"
            >
              <MoonStar className="mr-1 h-4.5 w-4.5" />
              {isLoading ? loadingLabel : startLabel ?? defaultStartLabel}
            </Button>
          </div>
        </div>

        <RecordingGuidanceBanner
          mode="setup"
          className="rounded-2xl border-white/[0.07] bg-white/[0.025] text-xs"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">{t("recording.setup.fullTitle")}</h1>
        <p className="text-muted-foreground">{t("recording.setup.fullBody")}</p>
      </div>

      <RecordingGuidanceBanner mode="setup" />

      <div className="grid gap-4 sm:grid-cols-2">
        {tips.map((tip, index) => {
          const Icon = tipIcons[index] ?? MoonStar;
          return (
            <Card key={tip.title} className="glass border-white/[0.08] shadow-soft">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">{tip.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{tip.description}</CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-center pt-2">
        <Button
          size="lg"
          onClick={onStart}
          disabled={isLoading}
          className="h-14 w-full max-w-sm rounded-2xl bg-[linear-gradient(135deg,#8fd1ff_0%,#2d79ff_45%,#165dff_100%)] text-lg text-white shadow-[0_18px_50px_rgba(24,105,255,.35)] transition duration-150 hover:brightness-110 active:scale-[0.98] sm:w-auto sm:px-12"
        >
          {isLoading ? loadingLabel : startLabel ?? defaultStartLabel}
        </Button>
      </div>
    </div>
  );
}
