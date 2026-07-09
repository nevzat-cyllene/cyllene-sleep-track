"use client";

import { cn } from "@/lib/utils";

interface SleepScoreRingProps {
  score: number;
  size?: number;
  className?: string;
  label?: string;
  showPercent?: boolean;
  /** Küçük kartlarda etiketi gizler */
  compact?: boolean;
}

export function SleepScoreRing({
  score,
  size = 160,
  className,
  label = "Uyku Skoru",
  showPercent = false,
  compact = false,
}: SleepScoreRingProps) {
  const stroke = Math.max(4, Math.round(size * 0.07));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const showLabel = !compact && size >= 96;
  const scoreClass =
    size <= 72 ? "text-lg font-semibold" : size <= 120 ? "text-3xl font-semibold" : "text-5xl font-semibold";
  const labelClass =
    size <= 72 ? "text-[9px] tracking-wider" : "text-xs uppercase tracking-widest";

  const getColor = (s: number) => {
    if (s >= 80) return "var(--chart-2)";
    if (s >= 60) return "var(--color-sleep-quality)";
    if (s >= 40) return "var(--chart-3)";
    return "var(--chart-4)";
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
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
      <div className="absolute flex flex-col items-center">
        <span className={cn("tracking-tight tabular-nums", scoreClass)}>
          {score}
          {showPercent && <span className="text-2xl">%</span>}
        </span>
        {showLabel && (
          <span className={cn("text-muted-foreground", labelClass)}>{label}</span>
        )}
      </div>
    </div>
  );
}
