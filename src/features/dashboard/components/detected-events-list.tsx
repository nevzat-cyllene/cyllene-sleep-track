"use client";

import { Wind, Mic, MessageCircle, Volume2 } from "lucide-react";
import { EventAudioPlayer } from "./event-audio-player";
import { SwipeAction } from "@/components/ui/swipe-action";
import { formatEventTime, EVENT_TYPE_LABELS } from "@/lib/audio-clip-utils";
import { cn } from "@/lib/utils";
import type { LocalSleepEvent, SleepEvent, SleepEventType } from "@/types";

const EVENT_ICONS: Record<SleepEventType, typeof Wind> = {
  snore: Wind,
  cough: Mic,
  talk: MessageCircle,
  noise: Volume2,
};

const EVENT_COLORS: Record<SleepEventType, string> = {
  snore: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  cough: "text-rose-400 bg-rose-400/10 border-rose-400/20",
  talk: "text-sky-400 bg-sky-400/10 border-sky-400/20",
  noise: "text-zinc-400 bg-zinc-400/10 border-zinc-400/20",
};

interface DetectedEventItemProps {
  event: LocalSleepEvent | SleepEvent;
  variant?: "dark" | "light";
}

function isSleepEvent(event: LocalSleepEvent | SleepEvent): event is SleepEvent {
  return "occurred_at" in event;
}

export function DetectedEventItem({ event, variant = "light" }: DetectedEventItemProps) {
  const type = isSleepEvent(event) ? event.event_type : event.type;
  const timestamp = isSleepEvent(event)
    ? new Date(event.occurred_at).getTime()
    : event.timestamp;
  const durationMs = isSleepEvent(event) ? event.duration_ms : event.durationMs;
  const confidence = event.confidence;
  const eventId = event.id;

  const Icon = EVENT_ICONS[type];
  const colorClass = EVENT_COLORS[type];
  const isDark = variant === "dark";

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,.035)]",
        isDark
          ? "border-white/10 bg-[#071222]"
          : "border-white/10 bg-[#071222]"
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
          colorClass
        )}
      >
        <Icon className="h-4.5 w-4.5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <p className={cn("font-medium", isDark ? "text-white" : "text-foreground")}>
            {EVENT_TYPE_LABELS[type]}
          </p>
          {confidence > 0 && (
            <span className="text-xs text-muted-foreground">
              %{Math.round(confidence * 100)}
            </span>
          )}
        </div>
        <p className={cn("text-sm tabular-nums", isDark ? "text-white/60" : "text-muted-foreground")}>
          {formatEventTime(timestamp)}
          <span className="mx-1.5">·</span>
          {Math.round(durationMs / 1000)} sn
        </p>
      </div>

      <EventAudioPlayer eventId={eventId} compact />
    </div>
  );
}

interface DetectedEventsListProps {
  events: (LocalSleepEvent | SleepEvent)[];
  variant?: "dark" | "light";
  emptyMessage?: string;
  selectedEventId?: string | null;
  onSelectEvent?: (id: string) => void;
  deletingEventId?: string | null;
  onDeleteEvent?: (event: LocalSleepEvent | SleepEvent) => void | Promise<void>;
}

export function DetectedEventsList({
  events,
  variant = "light",
  emptyMessage = "Henüz olay tespit edilmedi.",
  selectedEventId,
  onSelectEvent,
  deletingEventId,
  onDeleteEvent,
}: DetectedEventsListProps) {
  if (events.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground py-6">{emptyMessage}</p>
    );
  }

  const sorted = [...events].sort((a, b) => {
    const ta = "occurred_at" in a ? new Date(a.occurred_at).getTime() : a.timestamp;
    const tb = "occurred_at" in b ? new Date(b.occurred_at).getTime() : b.timestamp;
    return tb - ta;
  });

  return (
    <div className="space-y-2">
      {sorted.map((event) => {
        const card = (
          <div
            role={onSelectEvent ? "button" : undefined}
            tabIndex={onSelectEvent ? 0 : undefined}
            onClick={() => onSelectEvent?.(event.id)}
            onKeyDown={(e) => {
              if (onSelectEvent && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                onSelectEvent(event.id);
              }
            }}
            className={cn(
              onSelectEvent && "cursor-pointer",
              selectedEventId === event.id && "rounded-xl ring-1 ring-cyllene-cyan/50"
            )}
          >
            <DetectedEventItem event={event} variant={variant} />
          </div>
        );

        if (!onDeleteEvent) {
          return <div key={event.id}>{card}</div>;
        }

        return (
          <SwipeAction
            key={event.id}
            actionDisabled={deletingEventId === event.id}
            onAction={() => void onDeleteEvent(event)}
          >
            {card}
          </SwipeAction>
        );
      })}
    </div>
  );
}
