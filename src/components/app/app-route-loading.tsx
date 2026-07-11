"use client";

import { Sparkles } from "lucide-react";
import { useI18n } from "@/i18n/runtime";

export function AppRouteLoading() {
  const { t } = useI18n();

  return (
    <div className="space-y-5 pb-4">
      <section className="relative overflow-hidden rounded-[1.9rem] border border-[#8dbdff]/14 bg-[linear-gradient(145deg,rgba(8,20,45,.84),rgba(4,10,24,.94))] p-5 shadow-[0_24px_90px_rgba(24,105,255,.16),inset_0_1px_0_rgba(255,255,255,.07)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,rgba(111,210,255,.14),transparent_36%)]" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#155eff]/18 text-[#8fc0ff] shadow-[0_12px_32px_rgba(23,105,255,.22)]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#78b7ff]/72">
              {t("common.flowEyebrow")}
            </p>
            <p className="mt-1 text-sm font-medium text-white/84">{t("common.screenPreparing")}</p>
          </div>
        </div>
        <div className="relative mt-5 h-1 overflow-hidden rounded-full bg-white/[0.055]">
          <div className="h-full w-2/3 rounded-full bg-[linear-gradient(90deg,#1769ff,#6fd2ff)] animate-pulse" />
        </div>
      </section>

      <div className="grid gap-3">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="rounded-[1.45rem] border border-white/[0.065] bg-white/[0.035] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.045)]"
          >
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-[#155eff]/14" />
              <div className="min-w-0 flex-1 space-y-2.5">
                <div className="h-3 w-2/3 rounded-full bg-white/[0.08]" />
                <div className="h-2.5 w-1/2 rounded-full bg-white/[0.045]" />
              </div>
              <div className="h-8 w-8 rounded-full bg-white/[0.045]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
