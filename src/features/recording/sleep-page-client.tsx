"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Moon } from "lucide-react";
import { toast } from "sonner";
import { RecordSetup } from "./components/record-setup";
import { SleepModeScreen } from "./components/sleep-mode-screen";
import { useRecording } from "./use-recording";
import { retryUnsyncedSessions, syncSessionToSupabase, fetchUserSessions } from "./sync-session";
import { useRecordingUI } from "@/components/app/recording-ui-context";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { LocalSleepSession, SleepSession } from "@/types";
import { formatDate } from "@/lib/sleep-utils";
import { formatDurationHours } from "@/lib/sleep-analytics";
import { Card, CardContent } from "@/components/ui/card";
import { SleepScoreRing } from "@/features/dashboard/components/sleep-score-ring";

export function SleepPageClient() {
  const router = useRouter();
  const { setIsRecording } = useRecordingUI();
  const [syncing, setSyncing] = useState(false);
  const [userId, setUserId] = useState<string | undefined>();
  const [lastSession, setLastSession] = useState<SleepSession | null>(null);

  const onSessionComplete = useCallback(
    async (session: LocalSleepSession) => {
      setSyncing(true);
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        const uid = userId ?? data.user?.id;

        if (uid) {
          const result = await syncSessionToSupabase(session, uid);
          if ("id" in result) {
            router.push(`/journal/${result.id}`);
          } else {
            toast.error(result.error);
            router.push(`/journal/local/${session.id}`);
          }
        } else {
          toast.message("Giriş yapmadan kayıt cihazınızda saklandı.");
          router.push(`/journal/local/${session.id}`);
        }
      } finally {
        setSyncing(false);
      }
    },
    [router, userId]
  );

  const {
    status,
    currentDb,
    recentDbSamples,
    elapsedMs,
    wakeLockActive,
    wakeLockMethod,
    startRecording,
    stopRecording,
    error,
  } = useRecording({ userId, onSessionComplete });

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id;
      setUserId(uid);
      if (uid) void retryUnsyncedSessions(uid);
      if (uid) {
        void fetchUserSessions(uid).then((sessions) => {
          setLastSession(sessions[0] ?? null);
        });
      }
    });
  }, []);

  useEffect(() => {
    const recording = status === "recording" || status === "stopping";
    setIsRecording(recording);
    return () => setIsRecording(false);
  }, [status, setIsRecording]);

  if (status === "recording" || status === "stopping") {
    return (
      <SleepModeScreen
        elapsedMs={elapsedMs}
        currentDb={currentDb}
        recentDbSamples={recentDbSamples}
        wakeLockActive={wakeLockActive}
        wakeLockMethod={wakeLockMethod}
        syncing={syncing || status === "stopping"}
        onStop={() => void stopRecording()}
      />
    );
  }

  return (
    <div className="space-y-8 pb-4">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/15">
          <Moon className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-semibold">İyi geceler</h1>
        <p className="mt-2 text-muted-foreground">
          Uykuya başladığınızda ses analizi gece boyunca devam eder.
        </p>
      </div>

      {lastSession && (
        <Link href={`/journal/${lastSession.id}`}>
          <Card className="border-white/10 bg-sleep-card/80 shadow-soft transition hover:border-cyllene-cyan/30">
            <CardContent className="flex items-center gap-4 py-4">
              <SleepScoreRing score={lastSession.sleep_score ?? 0} size={64} compact />
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Son gece
                </p>
                <p className="font-medium">{formatDate(lastSession.started_at)}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDurationHours(lastSession.duration_minutes)} ·{" "}
                  {lastSession.snore_count} horlama
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      )}

      <RecordSetup
        onStart={() => void startRecording()}
        isLoading={status === "preparing" || syncing}
        startLabel="Uykuya Başla"
        compact
      />

      {error && <p className="text-center text-sm text-destructive">{error}</p>}

      <div className="text-center">
        <Button variant="ghost" size="sm" render={<Link href="/journal" />}>
          Geçmiş gecelere bak →
        </Button>
      </div>
    </div>
  );
}
