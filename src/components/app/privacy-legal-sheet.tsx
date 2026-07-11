"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LockKeyhole, Scale, ShieldCheck } from "lucide-react";
import { useI18n } from "@/i18n/runtime";

interface PrivacyLegalSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PrivacyLegalSheet({ open, onOpenChange }: PrivacyLegalSheetProps) {
  const { t, m } = useI18n();
  const [mounted, setMounted] = useState(false);
  const openedAtRef = useRef(0);
  const points = m<string[]>("privacyLegal.points", []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    openedAtRef.current = Date.now();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open || !mounted || typeof document === "undefined") return null;

  const closeSheet = () => {
    if (Date.now() - openedAtRef.current < 120) return;
    onOpenChange(false);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[400] flex items-end justify-center px-0 sm:items-center sm:px-3 sm:py-[max(1rem,env(safe-area-inset-top))] sm:pb-[max(1rem,env(safe-area-inset-bottom))]"
      role="dialog"
      aria-modal="true"
      aria-label={t("privacyLegal.title")}
    >
      <button
        type="button"
        aria-label={t("privacyLegal.closeAria")}
        className="absolute inset-0 cursor-default bg-[#02050d]/78"
        onPointerUp={closeSheet}
      />

      <div
        className="relative flex max-h-[min(36rem,88dvh)] w-full max-w-sm flex-col overflow-hidden rounded-t-[1.75rem] border border-white/[0.1] border-b-0 bg-[#07111f] shadow-[0_26px_100px_rgba(0,4,18,.78),inset_0_1px_0_rgba(255,255,255,.08)] sm:rounded-[1.75rem] sm:border-b"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-white/15 sm:hidden" />

        <div className="shrink-0 px-5 pb-3 pt-4 sm:pt-5">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.08] text-emerald-200">
              <Scale className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#78b7ff]/75">
                {t("privacyLegal.eyebrow")}
              </p>
              <h2 className="text-lg font-semibold tracking-[-0.03em] text-white">
                {t("privacyLegal.title")}
              </h2>
            </div>
          </div>
          <p className="text-[13px] leading-5 text-white/55">{t("privacyLegal.intro")}</p>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-5 pb-3">
          <div className="space-y-2">
            {points.map((point) => (
              <div
                key={point}
                className="flex items-start gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.025] px-3.5 py-3"
              >
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300/80" />
                <p className="text-[12px] leading-5 text-white/68">{point}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-[#78b7ff]/14 bg-[#155eff]/10 px-3.5 py-3">
            <div className="mb-1.5 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[#9bd5ff]/80">
              <LockKeyhole className="h-3.5 w-3.5" />
              {t("privacyLegal.kvkkTitle")}
            </div>
            <p className="text-[12px] leading-5 text-white/58">{t("privacyLegal.kvkkBody")}</p>
          </div>

          <p className="px-0.5 text-[11px] leading-4 text-white/32">{t("privacyLegal.footer")}</p>
        </div>

        <div className="shrink-0 border-t border-white/[0.06] px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-11 w-full rounded-2xl border border-white/[0.08] bg-white/[0.035] text-sm font-medium text-white/70 active:scale-[0.98]"
          >
            {t("privacyLegal.dismiss")}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
