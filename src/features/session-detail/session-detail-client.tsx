"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SleepScoreRing } from "@/features/dashboard/components/sleep-score-ring";
import { DetectedEventsList } from "@/features/dashboard/components/detected-events-list";
import { NightSoundsChart } from "./components/night-sounds-chart";
import {
  fetchSessionById,
  fetchSessionEvents,
  fetchSessionNoiseSamples,
  fetchUserSessions,
} from "@/features/recording/sync-session";
import {
  formatDurationHours,
  formatSessionTimeRange,
  formatWeekdayRange,
  getWeekSessions,
} from "@/lib/sleep-analytics";
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
        if (!s) return;
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
    <div className="space-y-5 pb-4">
      <div className="flex items-center gap-3">
        <Link
          href="/journal"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03]"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold tracking-tight">Gece özeti</h1>
          <p className="truncate text-sm text-muted-foreground capitalize">
            {formatWeekdayRange(session.started_at, session.ended_at)}
          </p>
        </div>
      </div>

      <div className="rounded-[22px] border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent p-5">
        <p className="text-[13px] text-white/45">
          {formatSessionTimeRange(session.started_at, session.ended_at)}
          <span className="mx-2 text-white/20">·</span>
          {formatDurationHours(session.duration_minutes)}
        </p>

        <div className="mt-4 flex justify-center gap-2">
          {["P", "S", "Ç", "P", "C", "C", "P"].map((label, i) => {
            const has = weekSessions[i];
            return (
              <div
                key={i}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border text-[10px]",
                  has
                    ? "border-cyllene-cyan/40 text-cyllene-cyan"
                    : "border-white/[0.08] text-white/25"
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
            size={132}
            label="Kalite"
            showPercent
          />
          <div className="flex flex-col justify-center gap-4">
            <div>
              <p className="text-2xl font-semibold tabular-nums tracking-tight">
                {formatDurationHours(session.duration_minutes)}
              </p>
              <p className="text-sm text-muted-foreground">Yatakta geçen süre</p>
            </div>
            <div>
              <p className="text-2xl font-semibold tabular-nums tracking-tight">
                {formatDurationHours(asleepMinutes)}
              </p>
              <p className="text-sm text-muted-foreground">Tahmini uyku süresi</p>
            </div>
          </div>
        </div>
      </div>

      <NightSoundsChart
        session={session}
        events={events}
        noiseSamples={noiseSamples}
        selectedEventId={selectedEventId}
        onSelectEvent={setSelectedEventId}
        activeFilters={activeFilters}
        onToggleFilter={toggleFilter}
      />

      <div className="rounded-[22px] border border-white/[0.08] bg-white/[0.02] p-4">
        <h2 className="mb-1 text-sm font-medium">Tespit edilen olaylar</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          Ses klipleri yalnızca kaydı yaptığınız telefonda dinlenebilir.
        </p>
        <DetectedEventsList
          events={events}
          selectedEventId={selectedEventId}
          onSelectEvent={setSelectedEventId}
          emptyMessage="Bu gece olay tespit edilmedi."
          audioContext="cloud"
        />
      </div>
    </div>
  );
}
