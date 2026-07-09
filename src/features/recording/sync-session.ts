import { createClient } from "@/lib/supabase/client";
import { calculateSleepScore, countEventsByType } from "@/lib/sleep-utils";
import type { LocalSleepSession } from "@/types";
import { getUnsyncedSessions, saveSession } from "./session-store";
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
    avg_db: dbs.reduce((a, b) => a + b, 0) / dbs.length,
  }));
}

export async function syncSessionToSupabase(
  session: LocalSleepSession,
  userId: string
): Promise<string | null> {
  const supabase = createClient();

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

  const { data: insertedSession, error: sessionError } = await supabase
    .from("sleep_sessions")
    .insert({
      user_id: userId,
      started_at: new Date(session.startedAt).toISOString(),
      ended_at: new Date(endedAt).toISOString(),
      duration_minutes: durationMinutes,
      sleep_score: sleepScore,
      avg_db: avgDb,
      peak_db: peakDb,
      snore_count: counts.snore,
      cough_count: counts.cough,
      talk_count: counts.talk,
      noise_count: counts.noise,
      interruption_count: session.interruptionCount,
    })
    .select("id")
    .single();

  if (sessionError || !insertedSession) {
    console.error("Session sync error:", sessionError);
    return null;
  }

  if (session.events.length > 0) {
    const events = session.events.map((event) => ({
      id: event.id,
      session_id: insertedSession.id,
      occurred_at: new Date(event.timestamp).toISOString(),
      duration_ms: event.durationMs,
      event_type: event.type,
      peak_db: event.peakDb,
      confidence: event.confidence,
    }));

    const { error: eventsError } = await supabase.from("sleep_events").insert(events);
    if (eventsError) {
      console.error("Events sync error:", eventsError);
      return null;
    }
  }

  const noiseBuckets = toMinuteBuckets(session);
  if (noiseBuckets.length > 0) {
    const noiseRows = noiseBuckets.map((row) => ({
      session_id: insertedSession.id,
      minute_offset: row.minute_offset,
      avg_db: row.avg_db,
    }));

    const { error: noiseError } = await supabase.from("sleep_noise_samples").insert(noiseRows);
    if (noiseError) {
      console.error("Noise samples sync error:", noiseError);
      return null;
    }
  }

  session.synced = true;
  await saveSession(session);

  return insertedSession.id;
}

export async function retryUnsyncedSessions(userId: string) {
  const unsynced = await getUnsyncedSessions();
  let failed = 0;
  for (const session of unsynced) {
    if (session.userId === userId && session.endedAt) {
      const id = await syncSessionToSupabase(session, userId);
      if (!id) failed += 1;
    }
  }
  if (failed > 0) {
    toast.error(`${failed} gece kaydı senkronize edilemedi. Tekrar denenecek.`);
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

export async function fetchSessionNoiseSamples(sessionId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("sleep_noise_samples")
    .select("*")
    .eq("session_id", sessionId)
    .order("minute_offset", { ascending: true });

  if (error) throw error;
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
