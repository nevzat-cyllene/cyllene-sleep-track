import { createClient } from "@/lib/supabase/client";
import { deleteSessionClips } from "@/features/recording/audio-clip-store";
import { deleteSession, getAllSessions } from "@/features/recording/session-store";

function matchesStartedAt(localStartedMs: number, remoteStartedIso: string) {
  return Math.abs(localStartedMs - new Date(remoteStartedIso).getTime()) < 3000;
}

async function purgeLocalSessionData(userId: string, startedAtIso: string) {
  const locals = await getAllSessions();
  const matches = locals.filter(
    (s) => s.userId === userId && matchesStartedAt(s.startedAt, startedAtIso)
  );

  for (const local of matches) {
    await deleteSessionClips(local.id);
    await deleteSession(local.id);
  }
}

export async function deleteSleepSession(
  sessionId: string,
  userId: string
): Promise<{ error?: string }> {
  const supabase = createClient();

  const { data: session, error: fetchError } = await supabase
    .from("sleep_sessions")
    .select("id, user_id, started_at")
    .eq("id", sessionId)
    .maybeSingle();

  if (fetchError) {
    return { error: fetchError.message };
  }
  if (!session || session.user_id !== userId) {
    return { error: "Kayıt bulunamadı." };
  }

  const { error: deleteError } = await supabase
    .from("sleep_sessions")
    .delete()
    .eq("id", sessionId)
    .eq("user_id", userId);

  if (deleteError) {
    return { error: deleteError.message };
  }

  await purgeLocalSessionData(userId, session.started_at);
  await deleteSessionClips(sessionId);

  return {};
}
