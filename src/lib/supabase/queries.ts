import { createClient } from "@/lib/supabase/server";
import type { SleepEvent, SleepSession } from "@/types";

export async function fetchUserSessionsServer(userId: string): Promise<SleepSession[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sleep_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("started_at", { ascending: false })
    .limit(90);

  if (error) throw error;
  return (data ?? []) as SleepSession[];
}

export async function fetchEventsForSessionsServer(sessionIds: string[]): Promise<SleepEvent[]> {
  if (sessionIds.length === 0) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sleep_events")
    .select("*")
    .in("session_id", sessionIds)
    .order("occurred_at", { ascending: false })
    .limit(80);

  if (error) {
    console.warn("Statistics events fetch skipped:", error.message);
    return [];
  }

  return (data ?? []) as SleepEvent[];
}
