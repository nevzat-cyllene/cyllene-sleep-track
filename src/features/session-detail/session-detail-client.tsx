"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";
import { toast } from "sonner";
import { DeleteConfirmSheet } from "@/components/ui/delete-confirm-sheet";
import { SleepScoreRing } from "@/features/dashboard/components/sleep-score-ring";
import { DetectedEventsList } from "@/features/dashboard/components/detected-events-list";
import { NightSoundsChart } from "./components/night-sounds-chart";
import {
  deleteRemoteSleepEvent,
  fetchSessionById,
  fetchSessionEvents,
  fetchSessionNoiseSamples,
} from "@/features/recording/sync-session";
import {
  formatDurationHours,
  formatWeekdayRange,
  getWeekSessions,
} from "@/lib/sleep-analytics";
import { fetchUserSessions } from "@/features/recording/sync-session";
import { useI18n } from "@/i18n/runtime";
import type { SleepEvent, SleepEventType, SleepNoiseSample, SleepSession } from "@/types";
import { cn } from "@/lib/utils";

interface SessionDetailClientProps {
  sessionId: string;
  userId: string;
}

const countKeys: Record<
  SleepEventType,
  "snore_count" | "cough_count" | "talk_count" | "noise_count"
> = {
  snore: "snore_count",
  cough: "cough_count",
  talk: "talk_count",
  noise: "noise_count",
};

export function SessionDetailClient({ sessionId, userId }: SessionDetailClientProps) {
  const { t, m } = useI18n();
  const weekdayLabels = m<string[]>("sessionDetail.weekdayLabels", [
    "P",
    "S",
    "Ç",
    "P",
    "C",
    "C",
    "P",
  ]);
  const [session, setSession] = useState<SleepSession | null>(null);
  const [events, setEvents] = useState<SleepEvent[]>([]);
  const [noiseSamples, setNoiseSamples] = useState<SleepNoiseSample[]>([]);
  const [weekSessions, setWeekSessions] = useState<(SleepSession | null)[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState(
    () => new Set(["snore", "cough", "talk", "noise"])
  );
  const [loading, setLoading] = useState(true);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const [eventToDelete, setEventToDelete] = useState<SleepEvent | null>(null);

  const toggleFilter = (type: string) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        if (next.size > 1) next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  useEffect(() => {
    void Promise.all([
      fetchSessionById(sessionId),
      fetchSessionEvents(sessionId),
      fetchSessionNoiseSamples(sessionId),
      fetchUserSessions(userId),
    ])
      .then(([s, ev, noise, all]) => {
        setSession(s);
        setEvents(ev);
        setNoiseSamples(noise);
        setWeekSessions(getWeekSessions(all, s.started_at));
        if (ev[0]) setSelectedEventId(ev[0].id);
      })
      .finally(() => setLoading(false));
  }, [sessionId, userId]);

  const handleDeleteEvent = (event: SleepEvent) => {
    setEventToDelete(event);
  };

  const confirmDeleteEvent = async () => {
    const event = eventToDelete;
    if (!event) return;

    const previousEvents = events;
    const previousSelectedEventId = selectedEventId;
    const previousSession = session;
    const nextEvents = events.filter((item) => item.id !== event.id);

    setEventToDelete(null);
    setDeletingEventId(event.id);
    setEvents(nextEvents);
    setSelectedEventId((selected) => (selected === event.id ? nextEvents[0]?.id ?? null : selected));
    setSession((current) => {
      if (!current) return current;
      const key = countKeys[event.event_type];
      return { ...current, [key]: Math.max(0, current[key] - 1) };
    });

    try {
      await deleteRemoteSleepEvent(event.id, event.session_id, event.event_type);
      toast.success(t("events.deleteSuccess"));
    } catch (error) {
      setEvents(previousEvents);
      setSelectedEventId(previousSelectedEventId);
      setSession(previousSession);
      toast.error(error instanceof Error ? error.message : t("events.deleteError"));
    } finally {
      setDeletingEventId(null);
    }
  };

  if (loading || !session) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
        {t("sessionDetail.loading")}
      </div>
    );
  }

  const asleepMinutes = Math.round((session.duration_minutes ?? 0) * 0.92);

  return (
    <div className="space-y-6 pb-4">
      <div className="flex items-center gap-3">
        <Link
          href="/journal"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-semibold">{t("sessionDetail.title")}</h1>
        </div>
        <Calendar className="h-5 w-5 text-muted-foreground" />
      </div>

      <div className="rounded-3xl border border-white/10 bg-[#0A1621]/90 p-5 shadow-soft">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-lg font-medium capitalize">
              {formatWeekdayRange(session.started_at, session.ended_at, t("formatting.locale"))}
            </p>
          </div>
        </div>

        <div className="mt-4 flex justify-center gap-2">
          {weekdayLabels.map((label, i) => {
            const has = weekSessions[i];
            return (
              <div
                key={i}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border text-xs",
                  has
                    ? "border-orange-400/60 text-orange-300"
                    : "border-white/10 text-white/30"
                )}
              >
                {label}
              </div>
            );
          })}
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-[auto_1fr]">
          <SleepScoreRing
            score={session.sleep_score ?? 0}
            size={140}
            label={t("sessionDetail.quality")}
            showPercent
          />
          <div className="flex flex-col justify-center gap-4">
            <div>
              <p className="text-2xl font-semibold tabular-nums">
                {formatDurationHours(session.duration_minutes, t)}
              </p>
              <p className="text-sm text-muted-foreground">{t("sessionDetail.timeInBed")}</p>
            </div>
            <div>
              <p className="text-2xl font-semibold tabular-nums">
                {formatDurationHours(asleepMinutes, t)}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("sessionDetail.estimatedSleep")}
              </p>
            </div>
          </div>
        </div>

        {/* Night charts are desktop-only for now — mobile SVG/stage cards still render broken. */}
        <div className="mt-6 hidden md:block">
          <NightSoundsChart
            session={session}
            events={events}
            noiseSamples={noiseSamples}
            selectedEventId={selectedEventId}
            onSelectEvent={setSelectedEventId}
            activeFilters={activeFilters}
            onToggleFilter={toggleFilter}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-card/40 p-4">
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          {t("sessionDetail.detectedEvents")}
        </h2>
        <DetectedEventsList
          events={events}
          selectedEventId={selectedEventId}
          onSelectEvent={setSelectedEventId}
          deletingEventId={deletingEventId}
          onDeleteEvent={(event) => void handleDeleteEvent(event as SleepEvent)}
          emptyMessage={t("sessionDetail.noEvents")}
        />
      </div>

      <DeleteConfirmSheet
        open={Boolean(eventToDelete)}
        title={t("events.deleteRemoteTitle")}
        description={t("events.deleteRemoteDescription")}
        confirmLabel={t("events.deleteConfirm")}
        isPending={Boolean(deletingEventId)}
        onOpenChange={(open) => {
          if (!open) setEventToDelete(null);
        }}
        onConfirm={confirmDeleteEvent}
      />
    </div>
  );
}
