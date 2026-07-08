"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RecordSetup } from "./components/record-setup";
import { SleepModeScreen } from "./components/sleep-mode-screen";
import { useRecording } from "./use-recording";
import { syncSessionToSupabase } from "./sync-session";
import { createClient } from "@/lib/supabase/client";
import type { LocalSleepSession } from "@/types";

export function RecordPageClient() {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [userId, setUserId] = useState<string | undefined>();

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id);
    });
  }, []);

  const onSessionComplete = async (session: LocalSleepSession) => {
    if (!userId) {
      router.push("/dashboard");
      return;
    }
    setSyncing(true);
    try {
      await syncSessionToSupabase(session, userId);
    } finally {
      setSyncing(false);
      router.push("/dashboard");
    }
  };

  const {
    status,
    currentDb,
    elapsedMs,
    eventCount,
    error,
    wakeLockActive,
    startRecording,
    stopRecording,
  } = useRecording({ userId, onSessionComplete });

  if (status === "recording") {
    return (
      <SleepModeScreen
        elapsedMs={elapsedMs}
        currentDb={currentDb}
        eventCount={eventCount}
        wakeLockActive={wakeLockActive}
        onStop={() => void stopRecording()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <RecordSetup
        onStart={() => void startRecording()}
        isLoading={status === "preparing" || syncing}
      />
      {error && <p className="text-center text-sm text-destructive">{error}</p>}
    </div>
  );
}
