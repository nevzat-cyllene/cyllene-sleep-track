"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  ChevronRight,
  Clock3,
  MoonStar,
  ShieldCheck,
  Sparkles,
  Waves,
} from "lucide-react";
import { toast } from "sonner";
import { RecordSetup } from "./components/record-setup";
import { SleepModeScreen } from "./components/sleep-mode-screen";
import { useRecording } from "./use-recording";
import { retryUnsyncedSessions, syncSessionToSupabase, fetchUserSessions } from "./sync-session";
import { InstallPWA } from "@/components/install-pwa";
import { useRecordingUI } from "@/components/app/recording-ui-context";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { SleepScoreRing } from "@/features/dashboard/components/sleep-score-ring";
import { formatDate } from "@/lib/sleep-utils";
import { formatDurationHours } from "@/lib/sleep-analytics";
import { getSleepEventSummary } from "@/lib/sleep-event-summary";
import type { LocalSleepSession, SleepSession } from "@/types";

const REPORT_HANDOFF_MIN_MS = 1400;
const waitForReportHandoff = () =>
  new Promise((resolve) => window.setTimeout(resolve, REPORT_HANDOFF_MIN_MS));

export function SleepPageClient() {
  const router = useRouter();
  const { setIsRecording } = useRecordingUI();
  const [syncing, setSyncing] = useState(false);
  const [userId, setUserId] = useState<string | undefined>();
  const [lastSession, setLastSession] = useState<SleepSession | null>(null);
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

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

        await waitForReportHandoff();
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
    eventCount,
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
    const screen = (
      <SleepModeScreen
        elapsedMs={elapsedMs}
        currentDb={currentDb}
        recentDbSamples={recentDbSamples}
        wakeLockActive={wakeLockActive}
        wakeLockMethod={wakeLockMethod}
        eventCount={eventCount}
        syncing={syncing || status === "stopping"}
        onStop={() => void stopRecording()}
      />
    );

    // Must escape .cyllene-route-frame (transform/filter) or fixed fullscreen is clipped.
    if (portalReady) {
      return createPortal(screen, document.body);
    }
    return screen;
  }

  const lastSessionEventSummary = lastSession ? getSleepEventSummary(lastSession) : null;

  return (
    <div className="space-y-5 pb-[calc(7.25rem+env(safe-area-inset-bottom))] sm:space-y-8 sm:pb-3">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-2 text-xs text-[#78b7ff]">
              <Sparkles className="h-3.5 w-3.5" />
              Uyku ritmin hazır
            </span>
            <span className="flex w-fit items-center gap-1.5 rounded-full border border-[#78b7ff]/14 bg-[#155eff]/8 px-2.5 py-1 text-[10px] text-[#9bd5ff]/72">
              <ShieldCheck className="h-3 w-3" />
              Cihaz içi analiz
            </span>
          </div>
          <h1 className="text-4xl font-medium tracking-[-0.055em] sm:text-5xl">
            İyi geceler.
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
            Telefonunu yakınına koy; Cyllene gece sinyallerini sabah raporuna dönüştürsün.
          </p>
        </div>
      </div>

      <InstallPWA variant="banner" className="md:hidden" />

      <RecordSetup
        onStart={() => void startRecording()}
        isLoading={status === "preparing" || syncing}
        startLabel="Bu geceyi başlat"
        compact
      />

      {error && (
        <p className="rounded-2xl border border-destructive/20 bg-destructive/8 px-4 py-3 text-center text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
        {lastSession ? (
          <Link
            href={`/journal/${lastSession.id}`}
            className="surface-panel group rounded-[1.65rem] p-5 transition hover:border-[#6da9ff]/20 sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#78b7ff]">
                  Son gece
                </p>
                <h2 className="mt-2 text-xl font-medium tracking-[-0.03em]">
                  {formatDate(lastSession.started_at)}
                </h2>
              </div>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.04] text-white/30 transition group-hover:bg-[#155eff]/15 group-hover:text-[#78b7ff]">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>

            <div className="mt-6 flex items-center gap-5">
              <SleepScoreRing score={lastSession.sleep_score ?? 0} size={92} />
              <div className="grid flex-1 grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-3">
                  <Clock3 className="mb-2 h-3.5 w-3.5 text-[#78b7ff]" />
                  <p className="text-sm font-medium">
                    {formatDurationHours(lastSession.duration_minutes)}
                  </p>
                  <p className="mt-0.5 text-[10px] text-white/30">Toplam uyku</p>
                </div>
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-3">
                  <Waves className="mb-2 h-3.5 w-3.5 text-[#78b7ff]" />
                  <p className="text-sm font-medium">{lastSessionEventSummary?.count ?? 0}</p>
                  <p className="mt-0.5 text-[10px] text-white/30">
                    {lastSessionEventSummary?.statTitle ?? "Ses olayı"}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ) : (
          <div className="surface-panel rounded-[1.65rem] p-6">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#78b7ff]">
              İlk raporun
            </p>
            <h2 className="mt-3 text-xl font-medium tracking-[-0.03em]">
              Sabah burada bir hikâye olacak.
            </h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              İlk gece tamamlandığında uyku skorun, ses olayların ve zaman çizelgen burada görünür.
            </p>
          </div>
        )}

        <div className="surface-panel flex flex-col justify-between rounded-[1.65rem] p-5 sm:p-6">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#155eff]/12 text-[#78b7ff]">
              <MoonStar className="h-4.5 w-4.5" />
            </div>
            <h2 className="mt-5 text-lg font-medium tracking-[-0.025em]">Gece arşivin</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Tüm kayıtlarını, ses kliplerini ve sabah raporlarını tek yerde incele.
            </p>
          </div>
          <Button
            variant="ghost"
            className="mt-5 h-10 w-full justify-between rounded-xl bg-white/[0.03] px-3 text-white/55 hover:bg-white/[0.06] hover:text-white"
            render={<Link href="/journal" />}
          >
            Geçmiş gecelere bak
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
