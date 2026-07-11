"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/runtime";

interface CylleneTechMarkProps {
  className?: string;
  size?: "sm" | "md";
  caption?: string;
}

/** Quiet developer credit — market-standard product mark, not a promo block. */
export function CylleneTechMark({
  className,
  size = "sm",
  caption,
}: CylleneTechMarkProps) {
  const { t } = useI18n();
  const resolvedCaption = caption ?? t("brand.developerCredit");
  const width = size === "md" ? 128 : 104;

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1.5 text-center opacity-[0.7] transition-opacity hover:opacity-90",
        className
      )}
    >
      <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-white/28">
        {resolvedCaption}
      </p>
      <Image
        src="/brand/cyllene-tech.webp"
        alt="Cyllene Tech"
        width={width}
        height={Math.round(width * 0.43)}
        className="h-auto select-none object-contain"
        style={{ width }}
      />
    </div>
  );
}
