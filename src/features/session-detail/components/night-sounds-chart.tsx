"use client";

import { useMemo } from "react";
import { formatTime } from "@/lib/sleep-utils";
import { estimateSleepStages, type SleepStage } from "@/lib/sleep-analytics";
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
const STAGE_STYLES: Record<SleepStage, string> = {
  awake: "top-[12%] h-[22%] bg-[#7dd3fc]/75 shadow-[0_0_22px_rgba(125,211,252,.28)]",
  light: "top-[40%] h-[24%] bg-[#3b82f6]/80 shadow-[0_0_22px_rgba(59,130,246,.25)]",
  deep: "top-[68%] h-[20%] bg-[#1e40af]/90 shadow-[0_0_18px_rgba(30,64,175,.24)]",
};

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

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
  const durationMinutes = Math.max(
    1,
    session.duration_minutes ?? 0,
    ...noiseSamples.map((sample) => sample.minute_offset + 1),
    ...events.map((event) =>
      Math.ceil((new Date(event.occurred_at).getTime() - startMs) / 60000) + 1
    )
  );

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

  const stageSegments = useMemo(() => {
    const ordered = [...stages].sort((a, b) => a.minute - b.minute);
    return ordered.map((point, index) => {
      const nextMinute = ordered[index + 1]?.minute ?? durationMinutes;
      const left = clampPercent((point.minute / durationMinutes) * 100);
      const right = clampPercent((nextMinute / durationMinutes) * 100);

      return {
        key: `${point.minute}-${point.stage}-${index}`,
        stage: point.stage,
        left,
        width: Math.max(1.8, right - left),
      };
    });
  }, [durationMinutes, stages]);

  const soundBars = useMemo(() => {
    const ordered = [...chartData]
      .filter((point) => Number.isFinite(point.db))
      .sort((a, b) => a.minute - b.minute);
    const bucketSize = Math.max(1, Math.ceil(ordered.length / 52));
    const bars = [];

    for (let index = 0; index < ordered.length; index += bucketSize) {
      const bucket = ordered.slice(index, index + bucketSize);
      const peak = Math.max(...bucket.map((point) => point.db));
      const minute = bucket[0]?.minute ?? 0;
      bars.push({
        key: `${minute}-${index}`,
        height: clampPercent(((peak - 20) / 50) * 100),
        minute,
      });
    }

    return bars;
  }, [chartData]);

  const selectedPosition =
    selected !== undefined
      ? clampPercent(
          (((new Date(selected.occurred_at).getTime() - startMs) / 60000) / durationMinutes) * 100
        )
      : null;

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

      {stageSegments.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-[#071222] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.04)]">
          <p className="mb-3 text-xs text-muted-foreground">Tahmini uyku evreleri</p>
          <div className="relative h-24 overflow-hidden rounded-2xl border border-white/[0.06] bg-[#06101f]">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.035)_1px,transparent_1px)] bg-[size:25%_100%,100%_33.333%]" />
            {stageSegments.map((segment) => (
              <span
                key={segment.key}
                className={cn(
                  "absolute rounded-full transition-colors",
                  STAGE_STYLES[segment.stage]
                )}
                style={{
                  left: `${segment.left}%`,
                  width: `${segment.width}%`,
                }}
              />
            ))}
          </div>
          <div className="mt-2 flex gap-4 text-[10px] text-muted-foreground">
            {Object.entries(STAGE_LABELS).map(([key, label]) => (
              <span key={key}>{label}</span>
            ))}
          </div>
        </div>
      )}

      <div className="relative rounded-2xl border border-white/10 bg-[#071222] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.04)]">
        {selected && (
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-sm text-cyllene-cyan">
            <Wind className="h-4 w-4" />
            {formatTime(selected.occurred_at)} {EVENT_LABELS[selected.event_type]}
          </div>
        )}

        <div className="relative h-56 w-full overflow-hidden rounded-2xl border border-white/[0.06] bg-[#06101f] px-3 pb-8 pt-4">
          {soundBars.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Bu gece için ses verisi yok
            </div>
          ) : (
            <>
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.035)_1px,transparent_1px)] bg-[size:25%_100%,100%_25%]" />
              <div className="relative z-10 flex h-full items-end gap-1">
                {soundBars.map((bar) => (
                  <span
                    key={bar.key}
                    className="min-w-0 flex-1 rounded-t-full bg-[linear-gradient(to_top,rgba(23,105,255,.18),rgba(111,210,255,.82))] shadow-[0_0_18px_rgba(111,210,255,.16)]"
                    style={{ height: `${Math.max(8, bar.height)}%` }}
                  />
                ))}
              </div>
              {selectedPosition !== null && (
                <span
                  className="absolute bottom-7 top-4 z-20 w-px bg-white/35"
                  style={{ left: `${selectedPosition}%` }}
                >
                  <span className="absolute -bottom-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-cyllene-cyan shadow-[0_0_18px_rgba(111,210,255,.65)]" />
                </span>
              )}
              <div className="absolute inset-x-3 bottom-2 z-10 flex justify-between text-[10px] text-white/28">
                <span>{formatTime(startMs)}</span>
                <span>{formatTime(startMs + durationMinutes * 60000)}</span>
              </div>
            </>
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
