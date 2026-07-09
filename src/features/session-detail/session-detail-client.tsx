"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";
import { SleepScoreRing } from "@/features/dashboard/components/sleep-score-ring";
import { DetectedEventsList } from "@/features/dashboard/components/detected-events-list";
import { NightSoundsChart } from "./components/night-sounds-chart";
import {
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
import type { SleepEvent, SleepNoiseSample, SleepSession } from "@/types";
import { cn } from "@/lib/utils";

interface SessionDetailClientProps {
  sessionId: string;
  userId: string;
}

export function SessionDetailClient({ sessionId, userId }: SessionDetailClientProps) {
  const [session, setSession] = useState<SleepSession | null>(null);
  const [events, setEvents] = useState<SleepEvent[]>([]);
  const [noiseSamples, setNoiseSamples] = useState<SleepNoiseSample[]>([]);
  const [weekSessions, setWeekSessions] = useState<(SleepSession | null)[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState(
    () => new Set(["snore", "cough", "talk", "noise"])
  );
  const [loading, setLoading] = useState(true);

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
    setLoading(true);
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

  if (loading || !session) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
        Yükleniyor...
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
          <h1 className="text-xl font-semibold">Gece seslerinizi dinleyin</h1>
        </div>
        <Calendar className="h-5 w-5 text-muted-foreground" />
      </div>

      <div className="rounded-3xl border border-white/10 bg-[#0A1621]/90 p-5 shadow-soft">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-lg font-medium capitalize">
              {formatWeekdayRange(session.started_at, session.ended_at)}
            </p>
          </div>
        </div>

        <div className="mt-4 flex justify-center gap-2">
          {["P", "S", "Ç", "P", "C", "C", "P"].map((label, i) => {
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
            label="Kalite"
            showPercent
          />
          <div className="flex flex-col justify-center gap-4">
            <div>
              <p className="text-2xl font-semibold tabular-nums">
                {formatDurationHours(session.duration_minutes)}
              </p>
              <p className="text-sm text-muted-foreground">Yatakta geçen süre</p>
            </div>
            <div>
              <p className="text-2xl font-semibold tabular-nums">
                {formatDurationHours(asleepMinutes)}
              </p>
              <p className="text-sm text-muted-foreground">Tahmini uyku süresi</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
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
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Tespit edilen olaylar</h2>
        <DetectedEventsList
          events={events}
          selectedEventId={selectedEventId}
          onSelectEvent={setSelectedEventId}
          emptyMessage="Bu gece olay tespit edilmedi."
        />
      </div>
    </div>
  );
}
