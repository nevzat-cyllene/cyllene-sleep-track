"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatTime } from "@/lib/sleep-utils";
import { estimateSleepStages } from "@/lib/sleep-analytics";
import type { SleepEvent, SleepNoiseSample, SleepSession } from "@/types";
import { cn } from "@/lib/utils";
import { Wind, MessageCircle, Activity, Volume2 } from "lucide-react";

const EVENT_LABELS: Record<string, string> = {
  snore: "Horlama",
  cough: "Öksürük",
  talk: "Konuşma",
  noise: "Hareket",
};

const EVENT_COLORS: Record<string, string> = {
  snore: "var(--chart-4)",
  cough: "var(--chart-3)",
  talk: "var(--chart-1)",
  noise: "var(--chart-5)",
};

const STAGE_LABELS = { awake: "Uyanık", light: "Uyku", deep: "Derin uyku" };
const STAGE_Y = { awake: 3, light: 2, deep: 1 };

interface NightSoundsChartProps {
  session: SleepSession;
  events: SleepEvent[];
  noiseSamples: SleepNoiseSample[];
  selectedEventId?: string | null;
  onSelectEvent?: (id: string | null) => void;
  activeFilters: Set<string>;
  onToggleFilter?: (type: string) => void;
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
  const stages = estimateSleepStages(session, noiseSamples);

  const chartData = useMemo(() => {
    if (noiseSamples.length > 0) {
      return noiseSamples.map((s) => ({
        time: formatTime(startMs + s.minute_offset * 60000),
        db: Number(s.avg_db),
        minute: s.minute_offset,
      }));
    }
    const filtered = events.filter((e) => activeFilters.has(e.event_type));
    return filtered.map((e) => ({
      time: formatTime(e.occurred_at),
      db: Number(e.peak_db),
      minute: Math.floor((new Date(e.occurred_at).getTime() - startMs) / 60000),
    }));
  }, [noiseSamples, events, activeFilters, startMs]);

  const filteredEvents = events.filter((e) => activeFilters.has(e.event_type));
  const selected = filteredEvents.find((e) => e.id === selectedEventId) ?? filteredEvents[0];

  const stageData = stages.map((s) => ({
    time: formatTime(startMs + s.minute * 60000),
    stageY: STAGE_Y[s.stage],
    stage: s.stage,
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["snore", "cough", "talk", "noise"] as const).map((type) => {
          const icons = { snore: Wind, cough: Activity, talk: MessageCircle, noise: Volume2 };
          const Icon = icons[type];
          const active = activeFilters.has(type);
          return (
            <button
              key={type}
              type="button"
              onClick={() => onToggleFilter?.(type)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition",
                active
                  ? "border-cyllene-cyan/40 bg-cyllene-cyan/10 text-cyllene-cyan"
                  : "border-white/10 text-white/40"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {EVENT_LABELS[type]}
            </button>
          );
        })}
      </div>

      {stageData.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-[#0A1621]/80 p-4">
          <p className="mb-2 text-xs text-muted-foreground">Tahmini uyku evreleri</p>
          <div className="h-20 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stageData}>
                <YAxis hide domain={[0.5, 3.5]} />
                <XAxis dataKey="time" hide />
                <Area
                  type="stepAfter"
                  dataKey="stageY"
                  stroke="var(--chart-2)"
                  fill="var(--chart-2)"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex gap-4 text-[10px] text-muted-foreground">
            {Object.entries(STAGE_LABELS).map(([k, v]) => (
              <span key={k}>{v}</span>
            ))}
          </div>
        </div>
      )}

      <div className="relative rounded-2xl border border-white/10 bg-[#0A1621]/80 p-4">
        {selected && (
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-sm text-cyllene-cyan">
            <Wind className="h-4 w-4" />
            {formatTime(selected.occurred_at)} {EVENT_LABELS[selected.event_type]}
          </div>
        )}

        <div className="h-56 w-full">
          {chartData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Bu gece için ses verisi yok
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="nightGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 6%)" vertical={false} />
                <XAxis dataKey="time" stroke="oklch(0.7 0.04 265)" fontSize={11} />
                <YAxis stroke="oklch(0.7 0.04 265)" fontSize={11} domain={[20, 70]} hide />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.12 0.03 265 / 95%)",
                    border: "1px solid oklch(1 0 0 / 10%)",
                    borderRadius: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="db"
                  stroke="var(--chart-2)"
                  fill="url(#nightGradient)"
                  strokeWidth={2.5}
                  dot={false}
                />
                {selected && (
                  <ReferenceLine
                    x={formatTime(selected.occurred_at)}
                    stroke="oklch(1 0 0 / 30%)"
                    strokeWidth={1}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="mt-4 flex items-end justify-between gap-1 px-2">
          {filteredEvents.slice(0, 12).map((event) => {
            const isSelected = event.id === (selectedEventId ?? selected?.id);
            return (
              <button
                key={event.id}
                type="button"
                onClick={() => onSelectEvent?.(event.id)}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border transition",
                  isSelected
                    ? "border-white bg-white/10"
                    : "border-transparent hover:border-white/20"
                )}
                aria-label={EVENT_LABELS[event.event_type]}
              >
                <div
                  className="flex h-4 items-end gap-px"
                  style={{ color: EVENT_COLORS[event.event_type] }}
                >
                  {[3, 5, 4, 6, 3].map((h, i) => (
                    <span
                      key={i}
                      className="w-0.5 rounded-full bg-current"
                      style={{ height: `${h}px` }}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
