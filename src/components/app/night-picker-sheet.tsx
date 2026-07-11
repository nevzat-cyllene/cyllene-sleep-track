"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, History } from "lucide-react";
import { useI18n } from "@/i18n/runtime";
import { formatDate } from "@/lib/sleep-utils";
import type { SleepSession } from "@/types";
import { cn } from "@/lib/utils";

function toLocalDateKey(iso: string) {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

interface NightPickerSheetProps {
  open: boolean;
  sessions: SleepSession[];
  loading?: boolean;
  activeSessionId?: string | null;
  onOpenChange: (open: boolean) => void;
  onSelectSession: (session: SleepSession) => void;
}

export function NightPickerSheet({
  open,
  sessions,
  loading = false,
  activeSessionId,
  onOpenChange,
  onSelectSession,
}: NightPickerSheetProps) {
  const { t } = useI18n();
  const [dateFilter, setDateFilter] = useState("");
  const openedAtRef = useRef(0);

  useEffect(() => {
    if (!open) {
      setDateFilter("");
      return;
    }
    openedAtRef.current = Date.now();
  }, [open]);

  const availableDates = useMemo(() => {
    const keys = new Set(sessions.map((session) => toLocalDateKey(session.started_at)));
    return keys;
  }, [sessions]);

  const visibleSessions = useMemo(() => {
    if (!dateFilter) return sessions;
    return sessions.filter((session) => toLocalDateKey(session.started_at) === dateFilter);
  }, [dateFilter, sessions]);

  if (!open) return null;

  const closeSheet = () => {
    // Ignore the same tap that opened the sheet (ghost click on backdrop).
    if (Date.now() - openedAtRef.current < 450) return;
    onOpenChange(false);
  };

  return (
    <div
      className="fixed inset-0 z-[260] flex items-end justify-center px-3 pb-[max(.85rem,env(safe-area-inset-bottom))] sm:items-center sm:pb-0"
      role="dialog"
      aria-modal="true"
      aria-label={t("nightPicker.title")}
    >
      <button
        type="button"
        aria-label={t("nightPicker.closeAria")}
        className="absolute inset-0 cursor-default bg-[#02050d]/72"
        onPointerUp={closeSheet}
      />

      <div
        className="relative w-full max-w-sm overflow-hidden rounded-[1.75rem] border border-white/[0.1] bg-[#07111f] shadow-[0_26px_100px_rgba(0,4,18,.78),inset_0_1px_0_rgba(255,255,255,.08)]"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div className="px-5 pb-2 pt-5">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#78b7ff]/15 bg-[#155eff]/12 text-[#9bd5ff]">
              <History className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold tracking-[-0.03em] text-white">
                {t("nightPicker.title")}
              </h2>
              <p className="mt-0.5 text-[12px] text-white/45">{t("nightPicker.body")}</p>
            </div>
          </div>

          <label className="block space-y-1.5">
            <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-[#78b7ff]/75">
              <CalendarDays className="h-3.5 w-3.5" />
              {t("nightPicker.pickDate")}
            </span>
            <div className="relative">
              <input
                type="date"
                value={dateFilter}
                onChange={(event) => {
                  const next = event.target.value;
                  setDateFilter(next);
                  if (!next) return;
                  const match = sessions.find(
                    (session) => toLocalDateKey(session.started_at) === next
                  );
                  if (match) {
                    onSelectSession(match);
                    onOpenChange(false);
                    setDateFilter("");
                  }
                }}
                className="h-11 w-full rounded-xl border border-[#78b7ff]/20 bg-[#155eff]/10 px-3 pr-10 text-sm text-white outline-none [color-scheme:dark] focus:border-[#78b7ff]/45"
              />
              <CalendarDays className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9bd5ff]/80" />
            </div>
          </label>
          {dateFilter && !availableDates.has(dateFilter) ? (
            <p className="mt-2 text-[11px] text-amber-200/70">{t("nightPicker.noNightOnDate")}</p>
          ) : null}
        </div>

        <div className="max-h-[min(22rem,50vh)] space-y-1.5 overflow-y-auto px-3 pb-4">
          <p className="px-1.5 pb-1 text-[11px] font-medium uppercase tracking-[0.16em] text-white/35">
            {t("nightPicker.recentNights")}
          </p>
          {loading ? (
            <p className="px-2 py-8 text-center text-sm text-white/40">
              {t("common.loadingDots")}
            </p>
          ) : visibleSessions.length === 0 ? (
            <p className="px-2 py-8 text-center text-sm text-white/40">
              {t("nightPicker.empty")}
            </p>
          ) : (
            visibleSessions.map((session) => {
              const active = session.id === activeSessionId;
              return (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => {
                    onSelectSession(session);
                    onOpenChange(false);
                    setDateFilter("");
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-2xl border px-3.5 py-3 text-left transition",
                    active
                      ? "border-[#78b7ff]/35 bg-[#155eff]/16"
                      : "border-white/[0.06] bg-white/[0.025] hover:border-white/[0.12] hover:bg-white/[0.04]"
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-white">
                      {formatDate(session.started_at, t("formatting.locale"))}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-white/35">
                      {session.duration_minutes ?? t("common.emDash")}{" "}
                      {t("common.minutesShort")}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-semibold tabular-nums",
                      (session.sleep_score ?? 0) >= 70
                        ? "border-emerald-400/30 text-emerald-300"
                        : (session.sleep_score ?? 0) >= 50
                          ? "border-amber-400/30 text-amber-300"
                          : "border-white/15 text-white/55"
                    )}
                  >
                    {session.sleep_score ?? t("common.emDash")}
                  </span>
                </button>
              );
            })
          )}
        </div>

        <div className="border-t border-white/[0.06] px-5 py-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-11 w-full rounded-2xl border border-white/[0.08] bg-white/[0.035] text-sm font-medium text-white/70 transition hover:bg-white/[0.06] hover:text-white"
          >
            {t("common.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
