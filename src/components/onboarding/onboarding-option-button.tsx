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
        "group flex w-full items-center gap-4 rounded-2xl border px-4 py-3.5 text-left transition duration-150",
        "border-white/[0.075] bg-[#071126]/72 shadow-[inset_0_1px_0_rgba(255,255,255,.045)]",
        "hover:border-[#78b7ff]/24 hover:bg-[#0b1830]/90 active:scale-[0.99]",
        selected && "border-[#78b7ff]/50 bg-[#155eff]/12"
      )}
    >
      {emoji && (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.055] text-xl">
          {emoji}
        </span>
      )}
      <span className="text-[15px] font-medium text-white/82 transition group-hover:text-white">
        {label}
      </span>
    </button>
  );
}
