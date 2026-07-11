"use client";

import { useMemo } from "react";
import { formatTime } from "@/lib/sleep-utils";
import { estimateSleepStages, type SleepStage } from "@/lib/sleep-analytics";
import type { SleepEvent, SleepNoiseSample, SleepSession } from "@/types";
import { cn } from "@/lib/utils";
import { Wind, MessageCircle, Activity, Volume2 } from "lucide-react";
import { useI18n } from "@/i18n/runtime";

const EVENT_COLORS: Record<string, string> = {
  snore: "#fbbf24",
  cough: "#fb7185",
  talk: "#38bdf8",
  noise: "#a1a1aa",
};

const EVENT_ICONS = { snore: Wind, cough: Activity, talk: MessageCircle, noise: Volume2 };

const STAGE_BAR: Record<SleepStage, string> = {
  awake: "bg-[#7dd3fc]/80",
  light: "bg-[#3b82f6]/85",
  deep: "bg-[#1e40af]/90",
};
const STAGE_ROW: Record<SleepStage, string> = {
  awake: "top-[14%]",
  light: "top-[42%]",
  deep: "top-[70%]",
};

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

function toFiniteDb(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
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
  const { t } = useI18n();
  const locale = t("formatting.locale");
  const eventLabel = (type: string) => t(`events.types.${type}.title`);
  const stageLabels = {
    awake: t("sessionDetail.stages.awake"),
    light: t("sessionDetail.stages.light"),
    deep: t("sessionDetail.stages.deep"),
  } as const;

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
      return noiseSamples
        .map((s) => ({
          time: formatTime(startMs + s.minute_offset * 60000, locale),
          db: toFiniteDb(s.avg_db),
          minute: s.minute_offset,
        }))
        .filter((point): point is { time: string; db: number; minute: number } => point.db !== null);
    }
    return events
      .filter((e) => activeFilters.has(e.event_type))
      .map((e) => ({
        time: formatTime(e.occurred_at, locale),
        db: toFiniteDb(e.peak_db),
        minute: Math.floor((new Date(e.occurred_at).getTime() - startMs) / 60000),
      }))
      .filter((point): point is { time: string; db: number; minute: number } => point.db !== null);
  }, [noiseSamples, events, activeFilters, startMs, locale]);

  const filteredEvents = events.filter((e) => activeFilters.has(e.event_type));
  const selected = filteredEvents.find((e) => e.id === selectedEventId) ?? filteredEvents[0];
  const SelectedIcon = selected ? EVENT_ICONS[selected.event_type] : Wind;

  // Merge consecutive same-stage minutes — one bar per run (not 1 DOM node per minute).
  const stageSegments = useMemo(() => {
    const ordered = [...stages].sort((a, b) => a.minute - b.minute);
    if (ordered.length === 0) return [];

    const merged: { key: string; stage: SleepStage; start: number; end: number }[] = [];
    let current = {
      stage: ordered[0].stage,
      start: ordered[0].minute,
      end: ordered[0].minute + 1,
    };

    for (let i = 1; i < ordered.length; i++) {
      const point = ordered[i];
      if (point.stage === current.stage && point.minute <= current.end + 1) {
        current.end = Math.max(current.end, point.minute + 1);
      } else {
        merged.push({
          key: `${current.start}-${current.stage}-${merged.length}`,
          stage: current.stage,
          start: current.start,
          end: current.end,
        });
        current = { stage: point.stage, start: point.minute, end: point.minute + 1 };
      }
    }
    merged.push({
      key: `${current.start}-${current.stage}-${merged.length}`,
      stage: current.stage,
      start: current.start,
      end: current.end,
    });

    return merged.map((segment) => {
      const left = clampPercent((segment.start / durationMinutes) * 100);
      const right = clampPercent((segment.end / durationMinutes) * 100);
      return {
        key: segment.key,
        stage: segment.stage,
        left,
        width: Math.max(0.8, right - left),
      };
    });
  }, [durationMinutes, stages]);

  const signalPath = useMemo(() => {
    const ordered = [...chartData].sort((a, b) => a.minute - b.minute);
    if (ordered.length === 0) return "";

    const bucketSize = Math.max(1, Math.ceil(ordered.length / 36));
    const points: { x: number; y: number }[] = [];

    for (let index = 0; index < ordered.length; index += bucketSize) {
      const bucket = ordered.slice(index, index + bucketSize);
      const peak = Math.max(...bucket.map((point) => point.db));
      const minute = bucket[0]?.minute ?? 0;
      points.push({
        x: clampPercent((minute / durationMinutes) * 100),
        y: clampPercent(88 - ((peak - 20) / 55) * 70),
      });
    }

    if (points.length === 1) {
      return `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
    }

    return points
      .map((point, index) =>
        `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`
      )
      .join(" ");
  }, [chartData, durationMinutes]);

  const selectedPosition =
    selected !== undefined
      ? clampPercent(
          (((new Date(selected.occurred_at).getTime() - startMs) / 60000) / durationMinutes) * 100
        )
      : null;

  const eventMarkers = filteredEvents.slice(0, 20).map((event) => ({
    id: event.id,
    type: event.event_type,
    left: clampPercent(
      (((new Date(event.occurred_at).getTime() - startMs) / 60000) / durationMinutes) * 100
    ),
    selected: event.id === (selectedEventId ?? selected?.id),
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["snore", "cough", "talk", "noise"] as const).map((type) => {
          const Icon = EVENT_ICONS[type];
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
              {eventLabel(type)}
            </button>
          );
        })}
      </div>

      {stageSegments.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-[#071222] p-4">
          <p className="mb-3 text-xs text-muted-foreground">{t("sessionDetail.estimatedStages")}</p>
          <div className="relative h-24 overflow-hidden rounded-xl border border-white/[0.06] bg-[#06101f]">
            <div className="pointer-events-none absolute inset-y-0 left-0 right-0 grid grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="border-r border-white/[0.04] last:border-r-0" />
              ))}
            </div>
            <div className="pointer-events-none absolute inset-x-0 top-0 bottom-0 grid grid-rows-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border-b border-white/[0.04] last:border-b-0" />
              ))}
            </div>
            {stageSegments.map((segment) => (
              <span
                key={segment.key}
                className={cn(
                  "absolute h-[18%] rounded-md",
                  STAGE_ROW[segment.stage],
                  STAGE_BAR[segment.stage]
                )}
                style={{
                  left: `${segment.left}%`,
                  width: `${segment.width}%`,
                }}
              />
            ))}
          </div>
          <div className="mt-2 flex gap-4 text-[10px] text-muted-foreground">
            {Object.entries(stageLabels).map(([key, label]) => (
              <span key={key} className="inline-flex items-center gap-1.5">
                <span
                  className={cn(
                    "h-2 w-2 rounded-sm",
                    STAGE_BAR[key as SleepStage]
                  )}
                />
                {label}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="relative rounded-2xl border border-white/10 bg-[#071222] p-4">
        {selected && (
          <div className="mb-3 inline-flex max-w-full items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 text-sm text-cyllene-cyan">
            <SelectedIcon className="h-4 w-4 shrink-0" />
            <span className="truncate">
              {formatTime(selected.occurred_at, locale)} {eventLabel(selected.event_type)}
            </span>
          </div>
        )}

        <div className="relative h-44 w-full overflow-hidden rounded-xl border border-white/[0.06] bg-[#050f22]">
          {signalPath === "" && eventMarkers.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              {t("sessionDetail.noSoundData")}
            </div>
          ) : (
            <>
              <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-white/[0.06]" />
              {signalPath !== "" && (
                <svg
                  className="absolute inset-x-3 bottom-7 top-4 z-10"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d={signalPath}
                    fill="none"
                    stroke="#6fd2ff"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    opacity="0.9"
                  />
                </svg>
              )}
              <div className="absolute inset-x-3 bottom-7 top-4 z-20">
                {eventMarkers.map((marker) => (
                  <button
                    key={marker.id}
                    type="button"
                    onClick={() => onSelectEvent?.(marker.id)}
                    className={cn(
                      "absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border",
                      marker.selected
                        ? "border-white bg-white"
                        : "border-[#8dbdff]/50 bg-[#6fd2ff]"
                    )}
                    style={{ left: `${marker.left}%` }}
                    aria-label={eventLabel(marker.type) || t("common.event")}
                  />
                ))}
              </div>
              {selectedPosition !== null && (
                <span
                  className="pointer-events-none absolute bottom-7 top-4 z-30 w-px bg-white/30"
                  style={{ left: `calc(0.75rem + (100% - 1.5rem) * ${selectedPosition / 100})` }}
                />
              )}
              <div className="absolute inset-x-3 bottom-2 z-10 flex justify-between text-[10px] text-white/30">
                <span>{formatTime(startMs, locale)}</span>
                <span>{formatTime(startMs + durationMinutes * 60000, locale)}</span>
              </div>
            </>
          )}
        </div>

        {filteredEvents.length > 0 && (
          <div className="mt-4 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {filteredEvents.slice(0, 16).map((event) => {
              const isSelected = event.id === (selectedEventId ?? selected?.id);
              return (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => onSelectEvent?.(event.id)}
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition",
                    isSelected
                      ? "border-white/50 bg-white/10"
                      : "border-white/10 bg-white/[0.03]"
                  )}
                  aria-label={eventLabel(event.event_type)}
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
        )}
      </div>
    </div>
  );
}
