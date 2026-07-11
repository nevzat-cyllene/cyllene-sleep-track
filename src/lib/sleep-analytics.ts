import type { SleepNoiseSample, SleepSession } from "@/types";

export type SleepStage = "awake" | "light" | "deep";

export interface StagePoint {
  minute: number;
  stage: SleepStage;
  db: number;
}

export interface StageBlock {
  stage: SleepStage;
  weight: number;
}

/** Evre şeridini sabit sayıda blokta gösterir — yüzlerce ince çizgi (CD izi) oluşmaz. */
export function aggregateStageBand(
  stages: StagePoint[],
  durationMinutes: number,
  maxBlocks = 40
): StageBlock[] {
  if (stages.length === 0 || durationMinutes <= 0) return [];

  const blockCount = Math.min(maxBlocks, Math.max(6, Math.ceil(durationMinutes / 20)));
  const span = durationMinutes / blockCount;
  const blocks: StageBlock[] = [];

  for (let i = 0; i < blockCount; i++) {
    const start = i * span;
    const end = (i + 1) * span;
    const window = stages.filter((s) => s.minute >= start && s.minute < end);
    if (window.length === 0) continue;

    const counts: Record<SleepStage, number> = { awake: 0, light: 0, deep: 0 };
    for (const s of window) counts[s.stage]++;

    const stage = (Object.entries(counts) as [SleepStage, number][]).sort(
      (a, b) => b[1] - a[1]
    )[0]![0];

    blocks.push({ stage, weight: 1 });
  }

  return blocks;
}

export function downsampleNoiseForChart(
  samples: { minute: number; db: number }[],
  maxPoints = 48
): { minute: number; db: number }[] {
  if (samples.length <= maxPoints) return samples;

  const sorted = [...samples].sort((a, b) => a.minute - b.minute);
  const maxMinute = Math.max(...sorted.map((s) => s.minute), 1);
  const span = maxMinute / maxPoints;
  const result: { minute: number; db: number }[] = [];

  for (let i = 0; i < maxPoints; i++) {
    const start = i * span;
    const end = (i + 1) * span;
    const window = sorted.filter((s) => s.minute >= start && s.minute < end);
    if (window.length === 0) continue;
    result.push({
      minute: start + span / 2,
      db: window.reduce((sum, item) => sum + item.db, 0) / window.length,
    });
  }

  return result;
}

export function stageBandGradient(
  blocks: StageBlock[],
  colors: Record<SleepStage, string>
): string {
  if (blocks.length === 0) return "transparent";

  const total = blocks.reduce((sum, block) => sum + block.weight, 0);
  let position = 0;
  const stops: string[] = [];

  for (const block of blocks) {
    const width = (block.weight / total) * 100;
    const color = colors[block.stage];
    stops.push(`${color} ${position}%`, `${color} ${position + width}%`);
    position += width;
  }

  return `linear-gradient(90deg, ${stops.join(", ")})`;
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

export function formatDurationHours(
  minutes: number | null,
  t?: (path: string, params?: Record<string, string | number>) => string
): string {
  if (!minutes) return t ? t("common.emDash") : "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) {
    return t
      ? t("formatting.durationHourMinute", { hours: h, minutes: m })
      : `${h}s ${m}dk`;
  }
  return t ? t("formatting.durationMinute", { minutes: m }) : `${m}dk`;
}

export function formatWeekdayRange(
  startedAt: string,
  endedAt: string | null,
  locale = "tr-TR"
): string {
  const start = new Date(startedAt);
  const end = endedAt ? new Date(endedAt) : start;
  const weekday = new Intl.DateTimeFormat(locale, { weekday: "long" }).format(start);
  const month = new Intl.DateTimeFormat(locale, { month: "long" }).format(start);
  const startDay = start.getDate();
  const endDay = end.getDate();
  const sameDay =
    startDay === endDay &&
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear();
  if (sameDay) return `${weekday} ${startDay} ${month}`;
  return `${weekday} ${startDay}–${endDay} ${month}`;
}

export function formatSessionTimeRange(
  startedAt: string,
  endedAt: string | null,
  locale = "tr-TR"
): string {
  const start = new Date(startedAt);
  const end = endedAt ? new Date(endedAt) : start;
  const fmt = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" });
  return `${fmt.format(start)} – ${fmt.format(end)}`;
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
  period: StatsPeriod,
  locale = "tr-TR"
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
      label: new Intl.DateTimeFormat(locale, {
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
