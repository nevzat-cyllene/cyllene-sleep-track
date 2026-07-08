"use client";

import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import {
  getDevicePlatform,
  getPreRecordingGuidance,
  getRecordingGuidance,
  isPwaInstalled,
  type WakeLockStatus,
} from "@/lib/recording-device";
import { cn } from "@/lib/utils";

interface RecordingGuidanceBannerProps {
  mode: "setup" | "recording";
  wakeLockStatus?: WakeLockStatus;
  variant?: "light" | "dark";
  className?: string;
}

const statusStyles = {
  ok: {
    light: "border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300",
    dark: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
    icon: CheckCircle2,
  },
  warning: {
    light: "border-amber-500/20 bg-amber-500/5 text-amber-800 dark:text-amber-300",
    dark: "border-amber-400/30 bg-amber-400/10 text-amber-100",
    icon: Info,
  },
  critical: {
    light: "border-rose-500/20 bg-rose-500/5 text-rose-800 dark:text-rose-300",
    dark: "border-rose-400/30 bg-rose-400/10 text-rose-100",
    icon: AlertCircle,
  },
} as const;

export function RecordingGuidanceBanner({
  mode,
  wakeLockStatus = "inactive",
  variant = "light",
  className,
}: RecordingGuidanceBannerProps) {
  const platform = getDevicePlatform();
  const pwa = isPwaInstalled();

  const guidance =
    mode === "setup"
      ? getPreRecordingGuidance(platform, pwa)
      : getRecordingGuidance(platform, wakeLockStatus, pwa);

  const styles = statusStyles[guidance.status];
  const Icon = styles.icon;

  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        styles[variant],
        className
      )}
    >
      <div className="flex gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="min-w-0 space-y-2">
          <p className="font-medium">{guidance.title}</p>
          <p className={cn("text-sm", variant === "dark" ? "text-white/80" : "text-muted-foreground")}>
            {guidance.message}
          </p>
          {guidance.steps && guidance.steps.length > 0 && (
            <ol className="list-decimal space-y-1 pl-4 text-sm">
              {guidance.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
