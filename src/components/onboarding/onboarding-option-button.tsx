"use client";

import { cn } from "@/lib/utils";

interface OnboardingOptionButtonProps {
  label: string;
  emoji?: string;
  selected?: boolean;
  onClick: () => void;
}

export function OnboardingOptionButton({
  label,
  emoji,
  selected,
  onClick,
}: OnboardingOptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-4 rounded-2xl border px-5 py-4 text-left transition",
        "bg-[#1C1C1E] border-white/[0.06]",
        "hover:border-white/15 hover:bg-[#252528]",
        selected && "border-cyllene-cyan/50 bg-cyllene-cyan/10"
      )}
    >
      {emoji && <span className="text-2xl">{emoji}</span>}
      <span className="text-[15px] font-medium text-white">{label}</span>
    </button>
  );
}
