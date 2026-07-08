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
    setSyncing(true);
    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      const uid = userId ?? data.user?.id;

      if (uid) {
        const remoteId = await syncSessionToSupabase(session, uid);
        router.push(remoteId ? `/dashboard?session=${remoteId}` : "/dashboard");
      } else {
        router.push("/dashboard");
      }
    } finally {
      setSyncing(false);
    }
  };

  const {
    status,
    currentDb,
    elapsedMs,
    eventCount,
    detectedEvents,
    error,
    wakeLockActive,
    wakeLockMethod,
    startRecording,
    stopRecording,
  } = useRecording({ userId, onSessionComplete });

  if (status === "recording" || status === "stopping") {
    return (
      <SleepModeScreen
        elapsedMs={elapsedMs}
        currentDb={currentDb}
        eventCount={eventCount}
        detectedEvents={detectedEvents}
        wakeLockActive={wakeLockActive}
        wakeLockMethod={wakeLockMethod}
        syncing={syncing || status === "stopping"}
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
