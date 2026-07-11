"use client";

import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/runtime";

interface SleepScoreRingProps {
  score: number;
  size?: number;
  className?: string;
  label?: string;
  showPercent?: boolean;
}

export function SleepScoreRing({
  score,
  size = 160,
  className,
  label,
  showPercent = false,
}: SleepScoreRingProps) {
  const { t } = useI18n();
  const resolvedLabel = label ?? t("dashboard.sleepScore");
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const valueClass =
    size < 110 ? "text-3xl" : size < 150 ? "text-4xl" : "text-5xl";
  const percentClass =
    size < 110 ? "text-base" : size < 150 ? "text-xl" : "text-2xl";

  const getColor = (s: number) => {
    if (s >= 80) return "var(--chart-2)";
    if (s >= 60) return "var(--color-sleep-quality)";
    if (s >= 40) return "var(--chart-3)";
    return "var(--chart-4)";
  };

  return (
    <div className={cn("inline-flex flex-col items-center justify-center gap-2", className)}>
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="oklch(0.25 0.05 265)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={getColor(score)}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <span
          className={cn(
            "absolute font-semibold tracking-tight tabular-nums leading-none",
            valueClass
          )}
        >
          {score}
          {showPercent && <span className={percentClass}>%</span>}
        </span>
      </div>
      <span className="max-w-[8rem] text-center text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
        {resolvedLabel}
      </span>
    </div>
  );
}
