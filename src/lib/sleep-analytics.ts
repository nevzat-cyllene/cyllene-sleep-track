import type { SleepNoiseSample, SleepSession } from "@/types";

export type SleepStage = "awake" | "light" | "deep";

export interface StagePoint {
  minute: number;
  stage: SleepStage;
  db: number;
}

export function estimateSleepStages(
  session: SleepSession,
  noiseSamples: SleepNoiseSample[]
): StagePoint[] {
  if (noiseSamples.length === 0) return [];

  return noiseSamples.map((sample) => {
    const db = Number(sample.avg_db);
    let stage: SleepStage = "light";
    if (db >= 48) stage = "awake";
    else if (db <= 34) stage = "deep";
    return { minute: sample.minute_offset, stage, db };
  });
}

export function formatDurationHours(minutes: number | null): string {
  if (!minutes) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}s ${m}dk`;
  return `${m}dk`;
}

export function formatWeekdayRange(startedAt: string, endedAt: string | null): string {
  const start = new Date(startedAt);
  const end = endedAt ? new Date(endedAt) : start;
  const weekday = new Intl.DateTimeFormat("tr-TR", { weekday: "long" }).format(start);
  const dayFmt = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long" });
  const startDay = start.getDate();
  const endDay = end.getDate();
  const month = dayFmt.format(start).split(" ")[1] ?? "";
  if (startDay === endDay) return `${weekday} ${startDay} ${month}`;
  return `${weekday} ${startDay}–${endDay} ${month}`;
}

export type StatsPeriod = "days" | "weeks" | "months" | "all";

export interface TrendPoint {
  label: string;
  quality: number;
  regularity: number;
}

function bedtimeHour(iso: string) {
  const d = new Date(iso);
  const h = d.getHours() + d.getMinutes() / 60;
  return h < 12 ? h + 24 : h;
}

export function buildTrendData(
  sessions: SleepSession[],
  period: StatsPeriod
): TrendPoint[] {
  if (sessions.length === 0) return [];

  const sorted = [...sessions].sort(
    (a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime()
  );

  const limit =
    period === "days" ? 7 : period === "weeks" ? 8 : period === "months" ? 6 : sorted.length;

  const slice = sorted.slice(-limit);
  const bedtimes = slice.map((s) => bedtimeHour(s.started_at));
  const avgBedtime = bedtimes.reduce((a, b) => a + b, 0) / bedtimes.length;

  return slice.map((session) => {
    const bt = bedtimeHour(session.started_at);
    const deviation = Math.abs(bt - avgBedtime);
    const regularity = Math.round(Math.max(40, 100 - deviation * 12));

    return {
      label: new Intl.DateTimeFormat("tr-TR", {
        day: "numeric",
        month: "short",
      }).format(new Date(session.started_at)),
      quality: session.sleep_score ?? 0,
      regularity,
    };
  });
}

export function getWeekSessions(sessions: SleepSession[], anchorDate: string) {
  const anchor = new Date(anchorDate);
  const day = anchor.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(anchor);
  monday.setDate(anchor.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);

  const week: (SleepSession | null)[] = Array.from({ length: 7 }, () => null);

  for (const session of sessions) {
    const d = new Date(session.started_at);
    d.setHours(0, 0, 0, 0);
    const diff = Math.round((d.getTime() - monday.getTime()) / 86400000);
    if (diff >= 0 && diff < 7) week[diff] = session;
  }

  return week;
}
