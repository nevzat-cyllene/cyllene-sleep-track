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

function sessionSubline(session: SleepSession) {
  const duration = formatDurationHours(session.duration_minutes);
  if ((session.snore_count ?? 0) > 0) {
    return `${duration} · ${session.snore_count} horlama`;
  }
  return duration;
}

export function SleepPageClient() {
  const router = useRouter();
  const { setIsRecording } = useRecordingUI();
  const [syncing, setSyncing] = useState(false);
  const [userId, setUserId] = useState<string | undefined>();
  const [lastSession, setLastSession] = useState<SleepSession | null>(null);
  const [lastSessionReady, setLastSessionReady] = useState(false);

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
          setLastSessionReady(true);
        });
      } else {
        setLastSessionReady(true);
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
    <div className="space-y-5 pb-4 md:space-y-8">
      <div className="pt-2 text-center md:pt-0">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] md:mb-5 md:h-16 md:w-16">
          <Moon className="h-6 w-6 text-white/80 md:h-8 md:w-8" />
        </div>
        <h1 className="text-[28px] font-semibold tracking-tight md:text-2xl">İyi geceler</h1>
        <p className="mx-auto mt-2 max-w-xs text-[15px] font-light leading-relaxed text-muted-foreground md:text-base">
          Uykuya başladığınızda ses analizi gece boyunca devam eder.
        </p>

        {lastSessionReady && lastSession ? (
          <Link
            href={`/journal/${lastSession.id}`}
            prefetch
            className="mx-auto mt-4 block max-w-xs rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 transition hover:border-white/[0.14] hover:bg-white/[0.05]"
          >
            <p className="text-[11px] font-medium text-white/40">Son kayıt</p>
            <p className="mt-0.5 text-[17px] font-medium tracking-tight">
              {formatDate(lastSession.started_at)}
            </p>
            <p className="text-sm font-light text-muted-foreground">
              {sessionSubline(lastSession)}
            </p>
          </Link>
        ) : !lastSessionReady && userId ? (
          <div className="mx-auto mt-4 h-[88px] max-w-xs animate-pulse rounded-2xl bg-white/[0.04]" />
        ) : null}
      </div>

      <RecordSetup
        onStart={() => void startRecording()}
        isLoading={status === "preparing" || syncing}
        startLabel="Uykuya Başla"
        compact
      />

      {error && <p className="text-center text-sm text-destructive">{error}</p>}

      <div className="text-center">
        <Button variant="ghost" size="sm" render={<Link href="/journal" prefetch />}>
          Geçmiş gecelere bak →
        </Button>
      </div>
    </div>
  );
}
