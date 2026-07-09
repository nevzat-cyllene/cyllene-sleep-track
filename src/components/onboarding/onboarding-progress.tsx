"use client";

import { cn } from "@/lib/utils";

interface OnboardingProgressProps {
  current: number;
  total: number;
  className?: string;
}

export function OnboardingProgress({ current, total, className }: OnboardingProgressProps) {
  const pct = Math.min(100, ((current + 1) / total) * 100);

  return (
    <div className={cn("mx-auto w-full max-w-xs", className)}>
      <div className="h-1 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-cyllene-cyan transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
