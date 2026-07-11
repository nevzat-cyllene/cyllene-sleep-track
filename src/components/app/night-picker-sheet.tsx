"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronLeft, ChevronRight, History } from "lucide-react";
import { useI18n } from "@/i18n/runtime";
import {
  buildMonthGrid,
  getCalendarWeekdayShorts,
  shiftMonth,
  toLocalDateKeyFromParts,
} from "@/lib/locale-dates";
import { formatDate, formatMonthYear } from "@/lib/sleep-utils";
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
  const dateLocale = t("formatting.locale");
  const [dateFilter, setDateFilter] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const openedAtRef = useRef(0);

  useEffect(() => {
    if (!open) {
      setDateFilter("");
      setCalendarOpen(false);
      return;
    }
    openedAtRef.current = Date.now();
    const latest = sessions[0]?.started_at;
    if (latest) {
      const d = new Date(latest);
      setViewMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    } else {
      const now = new Date();
      setViewMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open, sessions]);

  const availableDates = useMemo(() => {
    const keys = new Set(sessions.map((session) => toLocalDateKey(session.started_at)));
    return keys;
  }, [sessions]);

  const visibleSessions = useMemo(() => {
    if (!dateFilter) return sessions;
    return sessions.filter((session) => toLocalDateKey(session.started_at) === dateFilter);
  }, [dateFilter, sessions]);

  const weekdayShorts = useMemo(() => getCalendarWeekdayShorts(dateLocale), [dateLocale]);
  const monthCells = useMemo(
    () => buildMonthGrid(viewMonth.getFullYear(), viewMonth.getMonth()),
    [viewMonth]
  );

  const todayKey = useMemo(() => {
    const now = new Date();
    return toLocalDateKeyFromParts(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const applyDate = (next: string) => {
    setDateFilter(next);
    setCalendarOpen(false);
    if (!next) return;
    const match = sessions.find((session) => toLocalDateKey(session.started_at) === next);
    if (match) {
      onSelectSession(match);
      onOpenChange(false);
      setDateFilter("");
    }
  };

  if (!open || typeof document === "undefined") return null;

  const closeSheet = () => {
    if (Date.now() - openedAtRef.current < 120) return;
    onOpenChange(false);
  };

  const selectedLabel = dateFilter
    ? formatDate(`${dateFilter}T12:00:00`, dateLocale)
    : t("nightPicker.selectDay");

  const sheet = (
    <div
      className="fixed inset-0 z-[400] flex items-end justify-center px-0 sm:items-center sm:px-3 sm:py-[max(1rem,env(safe-area-inset-top))] sm:pb-[max(1rem,env(safe-area-inset-bottom))]"
      role="dialog"
      aria-modal="true"
      aria-label={t("nightPicker.title")}
    >
      <button
        type="button"
        aria-label={t("nightPicker.closeAria")}
        className="absolute inset-0 cursor-default bg-[#02050d]/78"
        onPointerUp={closeSheet}
      />

      <div
        className="relative flex max-h-[min(36rem,88dvh)] w-full max-w-sm flex-col overflow-hidden rounded-t-[1.75rem] border border-white/[0.1] border-b-0 bg-[#07111f] shadow-[0_26px_100px_rgba(0,4,18,.78),inset_0_1px_0_rgba(255,255,255,.08)] sm:rounded-[1.75rem] sm:border-b"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-white/15 sm:hidden" />

        <div className="shrink-0 px-5 pb-2 pt-4 sm:pt-5">
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

          <button
            type="button"
            onClick={() => setCalendarOpen((value) => !value)}
            aria-expanded={calendarOpen}
            className="flex h-11 w-full items-center gap-3 rounded-xl border border-[#78b7ff]/20 bg-[#155eff]/10 px-3.5 text-left transition hover:border-[#78b7ff]/35 hover:bg-[#155eff]/14"
          >
            <CalendarDays className="h-4 w-4 shrink-0 text-[#9bd5ff]" />
            <span
              className={cn(
                "min-w-0 flex-1 truncate text-sm",
                dateFilter ? "font-medium text-white" : "text-white/45"
              )}
            >
              {selectedLabel}
            </span>
          </button>

          {calendarOpen ? (
            <div className="mt-3 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <button
                  type="button"
                  aria-label={t("nightPicker.prevMonth")}
                  onClick={() => setViewMonth((month) => shiftMonth(month, -1))}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-white/55 transition hover:bg-white/[0.06] hover:text-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <p className="text-sm font-medium text-white">
                  {formatMonthYear(viewMonth, dateLocale)}
                </p>
                <button
                  type="button"
                  aria-label={t("nightPicker.nextMonth")}
                  onClick={() => setViewMonth((month) => shiftMonth(month, 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-white/55 transition hover:bg-white/[0.06] hover:text-white"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-1 grid grid-cols-7 gap-1">
                {weekdayShorts.map((label) => (
                  <span
                    key={label}
                    className="py-1 text-center text-[10px] font-medium uppercase tracking-wide text-white/35"
                  >
                    {label}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {monthCells.map((day, index) => {
                  if (day == null) {
                    return <span key={`empty-${index}`} className="h-9" />;
                  }
                  const key = toLocalDateKeyFromParts(
                    viewMonth.getFullYear(),
                    viewMonth.getMonth(),
                    day
                  );
                  const hasNight = availableDates.has(key);
                  const selected = dateFilter === key;
                  const isToday = todayKey === key;

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => applyDate(key)}
                      className={cn(
                        "relative flex h-9 items-center justify-center rounded-xl text-sm tabular-nums transition",
                        selected
                          ? "bg-[#155eff] font-semibold text-white"
                          : hasNight
                            ? "bg-[#155eff]/14 font-medium text-white hover:bg-[#155eff]/22"
                            : "text-white/45 hover:bg-white/[0.05] hover:text-white/75",
                        isToday && !selected && "ring-1 ring-[#78b7ff]/35"
                      )}
                    >
                      {day}
                      {hasNight && !selected ? (
                        <span className="absolute bottom-1 h-1 w-1 rounded-full bg-[#78b7ff]" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {dateFilter && !availableDates.has(dateFilter) ? (
            <p className="mt-2 text-[11px] text-amber-200/70">{t("nightPicker.noNightOnDate")}</p>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto overscroll-contain px-3 pb-3">
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
                      {formatDate(session.started_at, dateLocale)}
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

        <div className="shrink-0 border-t border-white/[0.06] px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
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

  return createPortal(sheet, document.body);
}
