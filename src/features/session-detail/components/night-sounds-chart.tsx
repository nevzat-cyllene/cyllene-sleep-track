"use client";

import { useMemo } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatTime } from "@/lib/sleep-utils";
import { aggregateStageBand, downsampleNoiseForChart, estimateSleepStages, stageBandGradient } from "@/lib/sleep-analytics";
import type { StageBlock } from "@/lib/sleep-analytics";
import type { SleepEvent, SleepNoiseSample, SleepSession } from "@/types";
import { cn } from "@/lib/utils";
import { Activity, MessageCircle, Volume2, Wind } from "lucide-react";

const EVENT_LABELS: Record<string, string> = {
  snore: "Horlama",
  cough: "Öksürük",
  talk: "Konuşma",
  noise: "Hareket",
};

const EVENT_COLORS: Record<string, string> = {
  snore: "var(--chart-4)",
  cough: "var(--chart-3)",
  talk: "var(--color-cyllene-cyan)",
  noise: "var(--chart-5)",
};

const STAGE_COLORS: Record<string, string> = {
  awake: "oklch(0.75 0.16 55)",
  light: "oklch(0.78 0.14 195)",
  deep: "oklch(0.62 0.22 285)",
};

const STAGE_LABELS = { awake: "Uyanık", light: "Hafif uyku", deep: "Derin uyku" };

const MIN_STAGE_MINUTES = 30;

interface NightSoundsChartProps {
  session: SleepSession;
  events: SleepEvent[];
  noiseSamples: SleepNoiseSample[];
  selectedEventId?: string | null;
  onSelectEvent?: (id: string | null) => void;
  activeFilters: Set<string>;
  onToggleFilter?: (type: string) => void;
}

function formatMinuteTick(startMs: number, minute: number) {
  return formatTime(new Date(startMs + minute * 60000));
}

function StageBand({ blocks }: { blocks: StageBlock[] }) {
  if (blocks.length === 0) return null;

  const gradient = stageBandGradient(blocks, STAGE_COLORS as Record<"awake" | "light" | "deep", string>);

  return (
    <div className="space-y-2">
      <div
        className="h-2.5 overflow-hidden rounded-full border border-white/[0.08]"
        style={{ background: gradient }}
      />
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-white/45">
        {(Object.keys(STAGE_LABELS) as Array<keyof typeof STAGE_LABELS>).map((key) => (
          <span key={key} className="inline-flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: STAGE_COLORS[key] }}
            />
            {STAGE_LABELS[key]}
          </span>
        ))}
      </div>
    </div>
  );
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ payload?: Record<string, unknown> }>;
  startMs: number;
}

function ChartTooltip({ active, payload, startMs }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload;
  if (!item) return null;

  if (item.kind === "event") {
    const minute = Number(item.minute);
    return (
      <div className="rounded-xl border border-cyllene-cyan/20 bg-[oklch(0.12_0.04_265/96%)] px-3 py-2 text-xs shadow-lg backdrop-blur-md">
        <p className="font-medium text-cyllene-cyan">{EVENT_LABELS[String(item.type)]}</p>
        <p className="mt-0.5 text-white/60">
          {formatMinuteTick(startMs, minute)} · {Math.round(Number(item.db))} dB
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[oklch(0.12_0.04_265/96%)] px-3 py-2 text-xs shadow-lg backdrop-blur-md">
      <p className="text-white/50">Ortam sesi</p>
      <p className="font-medium text-white">{Math.round(Number(item.db))} dB</p>
    </div>
  );
}

export function NightSoundsChart({
  session,
  events,
  noiseSamples,
  selectedEventId,
  onSelectEvent,
  activeFilters,
  onToggleFilter,
}: NightSoundsChartProps) {
  const startMs = new Date(session.started_at).getTime();
  const durationMinutes = session.duration_minutes ?? 0;
  const stages = estimateSleepStages(session, noiseSamples);
  const stageBlocks = useMemo(
    () => aggregateStageBand(stages, durationMinutes),
    [stages, durationMinutes]
  );
  const showStages = durationMinutes >= MIN_STAGE_MINUTES && stageBlocks.length > 0;

  const filteredEvents = events.filter((e) => activeFilters.has(e.event_type));
  const selected =
    filteredEvents.find((e) => e.id === selectedEventId) ?? filteredEvents[0] ?? null;

  const noiseData = useMemo(
    () =>
      downsampleNoiseForChart(
        noiseSamples.map((s) => ({
          minute: s.minute_offset,
          db: Number(s.avg_db),
        })),
        56
      ).map((point) => ({
        ...point,
        kind: "noise" as const,
      })),
    [noiseSamples]
  );

  const eventData = useMemo(
    () =>
      filteredEvents.map((e) => ({
        minute: Math.max(
          0,
          Math.floor((new Date(e.occurred_at).getTime() - startMs) / 60000)
        ),
        db: Number(e.peak_db),
        type: e.event_type,
        id: e.id,
        kind: "event" as const,
      })),
    [filteredEvents, startMs]
  );

  const maxMinute = Math.max(
    durationMinutes,
    ...noiseData.map((d) => d.minute),
    ...eventData.map((d) => d.minute),
    1
  );

  const tickInterval = maxMinute <= 30 ? 5 : maxMinute <= 120 ? 15 : Math.ceil(maxMinute / 6);

  const selectedMinute = selected
    ? Math.floor((new Date(selected.occurred_at).getTime() - startMs) / 60000)
    : null;

  const filterIcons = {
    snore: Wind,
    cough: Activity,
    talk: MessageCircle,
    noise: Volume2,
  };

  return (
    <div className="space-y-4">
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {(["snore", "cough", "talk", "noise"] as const).map((type) => {
          const Icon = filterIcons[type];
          const active = activeFilters.has(type);
          return (
            <button
              key={type}
              type="button"
              onClick={() => onToggleFilter?.(type)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                active
                  ? "border-cyllene-cyan/35 bg-cyllene-cyan/10 text-cyllene-cyan"
                  : "border-white/[0.08] bg-white/[0.03] text-white/40"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {EVENT_LABELS[type]}
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-[22px] border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-4 backdrop-blur-sm">
        {selected && (
          <p className="mb-3 text-[13px] font-medium text-white/70">
            <span className="text-cyllene-cyan">{formatTime(selected.occurred_at)}</span>
            <span className="mx-2 text-white/20">·</span>
            {EVENT_LABELS[selected.event_type]}
          </p>
        )}

        {showStages && (
          <div className="mb-4">
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">
              Tahmini evreler
            </p>
            <StageBand blocks={stageBlocks} />
          </div>
        )}

        {durationMinutes > 0 && durationMinutes < MIN_STAGE_MINUTES && (
          <p className="mb-3 text-[11px] text-white/35">
            Kısa kayıt — evre tahmini gösterilmiyor.
          </p>
        )}

        <div className="h-[240px] w-full min-w-0 sm:h-[260px]">
          {noiseData.length === 0 && eventData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-white/40">
              Bu uyku için grafik verisi yok
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="cylleneNoiseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.78 0.14 195)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="oklch(0.62 0.22 285)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 5%)" vertical={false} />
                <XAxis
                  dataKey="minute"
                  type="number"
                  domain={[0, maxMinute]}
                  tickFormatter={(m) => formatMinuteTick(startMs, Number(m))}
                  interval={tickInterval}
                  stroke="oklch(0.7 0.04 265 / 60%)"
                  fontSize={10}
                  tickLine={false}
                />
                <YAxis hide domain={[20, 75]} />
                <Tooltip
                  content={<ChartTooltip startMs={startMs} />}
                  cursor={{ stroke: "oklch(0.78 0.14 195 / 25%)", strokeWidth: 1 }}
                />
                {noiseData.length > 0 && (
                  <Area
                    data={noiseData}
                    type="basis"
                    dataKey="db"
                    stroke="oklch(0.78 0.14 195)"
                    fill="url(#cylleneNoiseGradient)"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                )}
                {eventData.length > 0 && (
                  <Scatter
                    data={eventData}
                    dataKey="db"
                    fill="oklch(0.78 0.14 195)"
                    isAnimationActive={false}
                    shape={(props: { cx?: number; cy?: number; payload?: { type?: string; id?: string } }) => {
                      const { cx, cy, payload } = props;
                      if (cx == null || cy == null || !payload?.id) return <g />;
                      const color = EVENT_COLORS[payload.type ?? "noise"] ?? EVENT_COLORS.noise;
                      const isSelected = payload.id === (selectedEventId ?? selected?.id);
                      return (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={isSelected ? 7 : 5}
                          fill={color}
                          stroke={isSelected ? "white" : "oklch(0.12 0.04 265)"}
                          strokeWidth={isSelected ? 2 : 1}
                          style={{ cursor: "pointer" }}
                          onClick={() => onSelectEvent?.(payload.id!)}
                        />
                      );
                    }}
                  />
                )}
                {selectedMinute != null && (
                  <ReferenceLine
                    x={selectedMinute}
                    stroke="oklch(1 0 0 / 20%)"
                    strokeDasharray="4 4"
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>

        <p className="mt-3 text-center text-[10px] text-white/30">
          Noktalara dokunarak olayı seçin · Alan eğrisi ortam ses seviyesini gösterir
        </p>
      </div>
    </div>
  );
}
