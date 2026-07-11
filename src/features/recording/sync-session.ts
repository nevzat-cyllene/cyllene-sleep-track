import { createClient } from "@/lib/supabase/client";
import { calculateSleepScore, countEventsByType } from "@/lib/sleep-utils";
import type { LocalSleepSession, SleepEventType } from "@/types";
import { getUnsyncedSessions, saveSession } from "./session-store";
import { deleteEventClip } from "./audio-clip-store";
import { toast } from "sonner";

function toMinuteBuckets(session: LocalSleepSession) {
  const buckets = new Map<number, number[]>();
  for (const sample of session.noiseSamples) {
    const minute = Math.floor((sample.timestamp - session.startedAt) / 60000);
    if (!buckets.has(minute)) buckets.set(minute, []);
    buckets.get(minute)!.push(sample.db);
  }
  return Array.from(buckets.entries()).map(([minute_offset, dbs]) => ({
    minute_offset,
    avg_db: Math.round((dbs.reduce((a, b) => a + b, 0) / dbs.length) * 100) / 100,
  }));
}

function clampDb(value: number) {
  return Math.min(999.99, Math.max(0, value));
}

function clampConfidence(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function formatSyncError(context: string, error: { message?: string; code?: string }) {
  const msg = error.message ?? "Bilinmeyen hata";
  if (error.code === "42P01" || msg.includes("sleep_noise_samples")) {
    return `${context}: sleep_noise_samples tablosu eksik. Supabase'de 002_noise_samples.sql migration'ını çalıştırın.`;
  }
  if (msg.includes("profiles") || error.code === "23503") {
    return `${context}: Kullanıcı profili bulunamadı. Çıkış yapıp tekrar giriş yapın.`;
  }
  return `${context}: ${msg}`;
}

async function findExistingSessionId(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  startedAt: number
) {
  const startedAtIso = new Date(startedAt).toISOString();
  const { data } = await supabase
    .from("sleep_sessions")
    .select("id")
    .eq("user_id", userId)
    .eq("started_at", startedAtIso)
    .maybeSingle();
  return data?.id ?? null;
}

async function syncNoiseSamples(
  supabase: ReturnType<typeof createClient>,
  sessionId: string,
  session: LocalSleepSession
) {
  const noiseBuckets = toMinuteBuckets(session);
  if (noiseBuckets.length === 0) return;

  await supabase.from("sleep_noise_samples").delete().eq("session_id", sessionId);

  const noiseRows = noiseBuckets.map((row) => ({
    session_id: sessionId,
    minute_offset: row.minute_offset,
    avg_db: row.avg_db,
  }));

  const { error } = await supabase.from("sleep_noise_samples").insert(noiseRows);
  if (error) {
    // Tablo yoksa veya migration uygulanmadıysa oturumu düşürme
    console.warn("Noise samples sync skipped:", error.message);
  }
}

export async function syncSessionToSupabase(
  session: LocalSleepSession,
  userId: string
): Promise<{ id: string } | { error: string }> {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) {
    return {
      error:
        "Kullanıcı profili bulunamadı. Çıkış yapıp tekrar giriş yapın veya hesabınızı yeniden oluşturun.",
    };
  }

  const endedAt = session.endedAt ?? Date.now();
  const durationMinutes = Math.round((endedAt - session.startedAt) / 60000);
  const counts = countEventsByType(session.events);
  const sleepScore = session.sleepScore ?? calculateSleepScore(session);

  const avgDb =
    session.noiseSamples.length > 0
      ? session.noiseSamples.reduce((s, n) => s + n.db, 0) / session.noiseSamples.length
      : null;
  const peakDb =
    session.noiseSamples.length > 0
      ? Math.max(...session.noiseSamples.map((n) => n.db))
      : null;

  const sessionPayload = {
    user_id: userId,
    started_at: new Date(session.startedAt).toISOString(),
    ended_at: new Date(endedAt).toISOString(),
    duration_minutes: durationMinutes,
    sleep_score: sleepScore,
    avg_db: avgDb !== null ? clampDb(avgDb) : null,
    peak_db: peakDb !== null ? clampDb(peakDb) : null,
    snore_count: counts.snore,
    cough_count: counts.cough,
    talk_count: counts.talk,
    noise_count: counts.noise,
    interruption_count: session.interruptionCount,
  };

  let remoteSessionId = await findExistingSessionId(supabase, userId, session.startedAt);

  if (remoteSessionId) {
    const { error: updateError } = await supabase
      .from("sleep_sessions")
      .update(sessionPayload)
      .eq("id", remoteSessionId);

    if (updateError) {
      console.error("Session update error:", updateError);
      return { error: formatSyncError("Oturum güncellenemedi", updateError) };
    }
  } else {
    const { data: insertedSession, error: sessionError } = await supabase
      .from("sleep_sessions")
      .insert(sessionPayload)
      .select("id")
      .single();

    if (sessionError || !insertedSession) {
      console.error("Session sync error:", sessionError);
      return { error: formatSyncError("Oturum kaydedilemedi", sessionError ?? {}) };
    }
    remoteSessionId = insertedSession.id;
  }

  await supabase.from("sleep_events").delete().eq("session_id", remoteSessionId);

  if (session.events.length > 0) {
    const events = session.events.map((event) => ({
      id: event.id,
      session_id: remoteSessionId,
      occurred_at: new Date(event.timestamp).toISOString(),
      duration_ms: Math.max(0, Math.round(event.durationMs)),
      event_type: event.type,
      peak_db: clampDb(event.peakDb),
      confidence: clampConfidence(event.confidence),
    }));

    const { error: eventsError } = await supabase.from("sleep_events").insert(events);
    if (eventsError) {
      console.error("Events sync error:", eventsError);
      return { error: formatSyncError("Olaylar kaydedilemedi", eventsError) };
    }
  }

  await syncNoiseSamples(supabase, remoteSessionId, session);

  session.synced = true;
  await saveSession(session);

  return { id: remoteSessionId };
}

export async function retryUnsyncedSessions(userId: string) {
  const unsynced = await getUnsyncedSessions();
  let failed = 0;
  for (const session of unsynced) {
    if (session.userId === userId && session.endedAt) {
      const result = await syncSessionToSupabase(session, userId);
      if ("error" in result) failed += 1;
    }
  }
  if (failed > 0) {
    toast.error(`${failed} gece kaydı senkronize edilemedi.`);
  }
}

export async function fetchUserSessions(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("sleep_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("started_at", { ascending: false })
    .limit(90);

  if (error) throw error;
  return data ?? [];
}

export async function fetchSessionEvents(sessionId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("sleep_events")
    .select("*")
    .eq("session_id", sessionId)
    .order("occurred_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function fetchEventsForSessions(sessionIds: string[]) {
  if (sessionIds.length === 0) return [];
  const supabase = createClient();
  const { data, error } = await supabase
    .from("sleep_events")
    .select("*")
    .in("session_id", sessionIds)
    .order("occurred_at", { ascending: false })
    .limit(120);

  if (error) throw error;
  return data ?? [];
}

export async function fetchSessionNoiseSamples(sessionId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("sleep_noise_samples")
    .select("*")
    .eq("session_id", sessionId)
    .order("minute_offset", { ascending: true });

  if (error) {
    console.warn("Noise samples fetch skipped:", error.message);
    return [];
  }
  return data ?? [];
}

export async function fetchSessionById(sessionId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("sleep_sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (error) throw error;
  return data;
}

const eventCountColumns: Record<
  SleepEventType,
  "snore_count" | "cough_count" | "talk_count" | "noise_count"
> = {
  snore: "snore_count",
  cough: "cough_count",
  talk: "talk_count",
  noise: "noise_count",
};

type EventCountColumn = (typeof eventCountColumns)[SleepEventType];
type EventCountRow = Partial<Record<EventCountColumn, number | null>>;

export async function deleteRemoteSleepEvent(
  eventId: string,
  sessionId?: string,
  eventType?: SleepEventType
) {
  const supabase = createClient();
  const { error } = await supabase.from("sleep_events").delete().eq("id", eventId);
  if (error) throw error;

  if (sessionId && eventType) {
    const countColumn = eventCountColumns[eventType];
    const { data } = await supabase
      .from("sleep_sessions")
      .select("snore_count,cough_count,talk_count,noise_count")
      .eq("id", sessionId)
      .maybeSingle();
    const current = Number((data as EventCountRow | null)?.[countColumn] ?? 0);
    await supabase
      .from("sleep_sessions")
      .update({ [countColumn]: Math.max(0, current - 1) })
      .eq("id", sessionId);
  }

  await deleteEventClip(eventId);
}

export async function deleteRemoteSleepSession(sessionId: string) {
  const supabase = createClient();

  const { data: events } = await supabase
    .from("sleep_events")
    .select("id")
    .eq("session_id", sessionId);
  const eventIds = events?.map((event) => event.id) ?? [];

  const noiseDelete = await supabase
    .from("sleep_noise_samples")
    .delete()
    .eq("session_id", sessionId);
  if (noiseDelete.error) {
    console.warn("Noise samples delete skipped:", noiseDelete.error.message);
  }

  const eventsDelete = await supabase.from("sleep_events").delete().eq("session_id", sessionId);
  if (eventsDelete.error) throw eventsDelete.error;

  const sessionDelete = await supabase.from("sleep_sessions").delete().eq("id", sessionId);
  if (sessionDelete.error) throw sessionDelete.error;

  await Promise.allSettled(eventIds.map((eventId) => deleteEventClip(eventId)));
}
