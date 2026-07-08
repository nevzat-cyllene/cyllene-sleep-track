"use client";

import { cn } from "@/lib/utils";

interface SleepScoreRingProps {
  score: number;
  size?: number;
  className?: string;
}

export function SleepScoreRing({ score, size = 160, className }: SleepScoreRingProps) {
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 80) return "oklch(0.72 0.18 155)";
    if (s >= 60) return "oklch(0.78 0.14 195)";
    if (s >= 40) return "oklch(0.75 0.18 85)";
    return "oklch(0.65 0.22 25)";
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
        <span className="text-4xl font-bold tabular-nums">{score}</span>
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          Uyku Skoru
        </span>
      </div>
    </div>
  );
}
