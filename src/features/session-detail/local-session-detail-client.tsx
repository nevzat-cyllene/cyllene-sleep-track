"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CloudOff } from "lucide-react";
import { getSession } from "@/features/recording/session-store";
import { SleepScoreRing } from "@/features/dashboard/components/sleep-score-ring";
import { DetectedEventsList } from "@/features/dashboard/components/detected-events-list";
import { NightSoundsChart } from "@/features/session-detail/components/night-sounds-chart";
import { formatDurationHours, formatSessionTimeRange, formatWeekdayRange } from "@/lib/sleep-analytics";
import { formatDate } from "@/lib/sleep-utils";
import type { LocalSleepEvent, LocalSleepSession, SleepEvent, SleepNoiseSample, SleepSession } from "@/types";
import { Button } from "@/components/ui/button";
import { syncSessionToSupabase } from "@/features/recording/sync-session";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface LocalSessionDetailClientProps {
  localSessionId: string;
  userId?: string;
}

function toSleepSession(local: LocalSleepSession): SleepSession {
  const endedAt = local.endedAt ?? Date.now();
  const counts = local.events.reduce(
    (acc, e) => {
      acc[e.type] += 1;
      return acc;
    },
    { snore: 0, cough: 0, talk: 0, noise: 0 }
  );

  return {
    id: local.id,
    user_id: local.userId ?? "",
    started_at: new Date(local.startedAt).toISOString(),
    ended_at: new Date(endedAt).toISOString(),
    duration_minutes: Math.round((endedAt - local.startedAt) / 60000),
    sleep_score: local.sleepScore ?? null,
    avg_db: local.avgDb ?? null,
    peak_db: local.peakDb ?? null,
    snore_count: counts.snore,
    cough_count: counts.cough,
    talk_count: counts.talk,
    noise_count: counts.noise,
    interruption_count: local.interruptionCount,
    created_at: new Date(local.startedAt).toISOString(),
  };
}

function toSleepEvents(events: LocalSleepEvent[]): SleepEvent[] {
  return events.map((e) => ({
    id: e.id,
    session_id: "",
    occurred_at: new Date(e.timestamp).toISOString(),
    duration_ms: e.durationMs,
    event_type: e.type,
    peak_db: e.peakDb,
    confidence: e.confidence,
    created_at: new Date(e.timestamp).toISOString(),
  }));
}

function toNoiseSamples(local: LocalSleepSession): SleepNoiseSample[] {
  const buckets = new Map<number, number[]>();
  for (const s of local.noiseSamples) {
    const minute = Math.floor((s.timestamp - local.startedAt) / 60000);
    if (!buckets.has(minute)) buckets.set(minute, []);
    buckets.get(minute)!.push(s.db);
  }
  return Array.from(buckets.entries()).map(([minute_offset, dbs]) => ({
    id: `${minute_offset}`,
    session_id: local.id,
    minute_offset,
    avg_db: dbs.reduce((a, b) => a + b, 0) / dbs.length,
    created_at: new Date(local.startedAt + minute_offset * 60000).toISOString(),
  }));
}

export function LocalSessionDetailClient({
  localSessionId,
  userId,
}: LocalSessionDetailClientProps) {
  const router = useRouter();
  const [local, setLocal] = useState<LocalSleepSession | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState(
    () => new Set(["snore", "cough", "talk", "noise"])
  );

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
    void getSession(localSessionId).then((s) => {
      setLocal(s ?? null);
      if (s?.events[0]) setSelectedEventId(s.events[0].id);
    });
  }, [localSessionId]);

  const retrySync = async () => {
    if (!local || !userId) return;
    setSyncing(true);
    const result = await syncSessionToSupabase(local, userId);
    setSyncing(false);
    if ("id" in result) {
      toast.success("Kayıt senkronize edildi.");
      router.push(`/journal/${result.id}`);
    } else {
      toast.error(result.error);
    }
  };

  if (!local) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-muted-foreground">
        <p>Yerel kayıt bulunamadı.</p>
        <Button render={<Link href="/journal" />}>Günlüğe dön</Button>
      </div>
    );
  }

  const session = toSleepSession(local);
  const events = toSleepEvents(local.events);
  const noiseSamples = toNoiseSamples(local);
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
          <h1 className="text-xl font-semibold">Uyku kaydı</h1>
          <p className="text-sm text-muted-foreground">{formatDate(session.started_at)}</p>
        </div>
      </div>

      {!local.synced && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
          <CloudOff className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          <div className="flex-1 space-y-2">
            <p className="text-sm text-amber-100">
              Bu kayıt henüz buluta senkronize edilmedi. Olaylar ve ses klipleri cihazınızda.
            </p>
            {userId && (
              <Button size="sm" disabled={syncing} onClick={() => void retrySync()}>
                {syncing ? "Senkronize ediliyor..." : "Tekrar dene"}
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="rounded-[22px] border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent p-5">
        <p className="capitalize text-lg font-medium tracking-tight">
          {formatWeekdayRange(session.started_at, session.ended_at)}
        </p>
        <p className="mt-1 text-[13px] text-white/45">
          {formatSessionTimeRange(session.started_at, session.ended_at)}
          <span className="mx-2 text-white/20">·</span>
          {formatDurationHours(session.duration_minutes)}
        </p>

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
        <h2 className="mb-3 text-sm font-medium">
          Tespit edilen olaylar ({events.length})
        </h2>
        <DetectedEventsList
          events={events}
          selectedEventId={selectedEventId}
          onSelectEvent={setSelectedEventId}
          emptyMessage="Bu uyku için olay tespit edilmedi."
          audioContext="local"
        />
      </div>
    </div>
  );
}
