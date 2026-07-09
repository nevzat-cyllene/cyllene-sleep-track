import { createClient } from "@/lib/supabase/server";
import type { SleepSession } from "@/types";

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
