import type { LocalSleepEvent, LocalSleepSession, SleepEventType } from "@/types";
import {
  formatKuDate,
  formatKuDayMonth,
  formatKuMonthYear,
  isKuDateLocale,
  resolveIntlLocale,
} from "@/lib/locale-dates";

export function calculateSleepScore(session: LocalSleepSession): number {
  const durationHours =
    session.endedAt && session.startedAt
      ? (session.endedAt - session.startedAt) / (1000 * 60 * 60)
      : 0;

  const durationScore = Math.min(100, (durationHours / 8) * 100);

  const snoreEvents = session.events.filter((e) => e.type === "snore");
  const snoreMinutes = snoreEvents.reduce((sum, e) => sum + e.durationMs, 0) / 60000;
  const snorePenalty = Math.min(40, snoreMinutes * 2);

  const eventPenalty = Math.min(30, session.events.length * 0.5);
  const interruptionPenalty = Math.min(20, session.interruptionCount * 5);

  const avgDb =
    session.noiseSamples.length > 0
      ? session.noiseSamples.reduce((sum, s) => sum + s.db, 0) /
        session.noiseSamples.length
      : 30;
  const noisePenalty = Math.min(15, Math.max(0, avgDb - 35) * 0.5);

  return Math.round(
    Math.max(0, Math.min(100, durationScore - snorePenalty - eventPenalty - interruptionPenalty - noisePenalty))
  );
}

export function countEventsByType(events: LocalSleepEvent[]) {
  return events.reduce(
    (acc, event) => {
      acc[event.type] += 1;
      return acc;
    },
    { snore: 0, cough: 0, talk: 0, noise: 0 } as Record<SleepEventType, number>
  );
}

export function formatDuration(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  if (hours > 0) return `${hours}s ${minutes}dk`;
  return `${minutes}dk`;
}

export function formatElapsedClock(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function formatTime(date: Date | number | string, locale = "tr-TR"): string {
  const d = typeof date === "string" ? new Date(date) : typeof date === "number" ? new Date(date) : date;
  return new Intl.DateTimeFormat(resolveIntlLocale(locale), {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatWallClockParts(date: Date): { hours: string; minutes: string; seconds: string } {
  const parts = new Intl.DateTimeFormat("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return { hours: get("hour"), minutes: get("minute"), seconds: get("second") };
}

export function formatWallClock(date: Date): string {
  const { hours, minutes, seconds } = formatWallClockParts(date);
  return `${hours}:${minutes}:${seconds}`;
}

export function formatElapsedParts(ms: number): { hours: string; minutes: string; seconds: string } {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return {
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
  };
}

export function formatDate(date: Date | string, locale = "tr-TR"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isKuDateLocale(locale)) return formatKuDate(d, "short");
  return new Intl.DateTimeFormat(resolveIntlLocale(locale), {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

/** Month + year heading (journal groups, etc.). */
export function formatMonthYear(date: Date | string, locale = "tr-TR"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isKuDateLocale(locale)) return formatKuMonthYear(d);
  return new Intl.DateTimeFormat(resolveIntlLocale(locale), {
    month: "long",
    year: "numeric",
  }).format(d);
}

export function formatDayMonth(date: Date | string, locale = "tr-TR"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isKuDateLocale(locale)) return formatKuDayMonth(d);
  return new Intl.DateTimeFormat(resolveIntlLocale(locale), {
    day: "numeric",
    month: "short",
  }).format(d);
}

export function dbToPercent(db: number): number {
  return Math.min(100, Math.max(0, ((db - 20) / 60) * 100));
}
