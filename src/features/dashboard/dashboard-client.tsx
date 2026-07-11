"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, Clock, Moon, Volume2, Wind } from "lucide-react";
import { SleepScoreRing } from "./components/sleep-score-ring";
import { NightTimelineChart } from "./components/night-timeline-chart";
import { StatCard } from "./components/stat-card";
import { SessionHistory } from "./components/session-history";
import { DetectedEventsList } from "./components/detected-events-list";
import { PremiumPlaceholder } from "@/features/billing/premium-placeholder";
import { fetchSessionEvents, fetchUserSessions } from "@/features/recording/sync-session";
import { createClient } from "@/lib/supabase/client";
import { formatDate, formatTime } from "@/lib/sleep-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { SleepEvent, SleepSession } from "@/types";
import { useI18n } from "@/i18n/runtime";
import { getSleepEventSummary } from "@/lib/sleep-event-summary";

interface DashboardClientProps {
  initialSessions: SleepSession[];
  userId: string;
  selectedSessionId?: string;
}

export function DashboardClient({
  initialSessions,
  userId,
  selectedSessionId,
}: DashboardClientProps) {
  const { t } = useI18n();
  const [sessions, setSessions] = useState(initialSessions);
  const [events, setEvents] = useState<SleepEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const activeSession =
    sessions.find((s) => s.id === selectedSessionId) ?? sessions[0];

  useEffect(() => {
    if (!activeSession) return;
    let cancelled = false;

    const timer = window.setTimeout(() => {
      setLoadingEvents(true);
      void fetchSessionEvents(activeSession.id)
        .then((nextEvents) => {
          if (!cancelled) setEvents(nextEvents);
        })
        .finally(() => {
          if (!cancelled) setLoadingEvents(false);
        });
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [activeSession]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("sleep_sessions")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sleep_sessions", filter: `user_id=eq.${userId}` },
        () => {
          void fetchUserSessions(userId).then(setSessions);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId]);

  if (!activeSession) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">{t("dashboard.morningReport")}</h1>
          <p className="mt-2 text-muted-foreground">{t("dashboard.emptyReport")}</p>
        </div>
        <SessionHistory sessions={[]} />
        <PremiumPlaceholder />
      </div>
    );
  }

  const totalEvents =
    activeSession.snore_count +
    activeSession.cough_count +
    activeSession.talk_count +
    activeSession.noise_count;
  const keyEventSummary = getSleepEventSummary(activeSession, t);
  const KeyEventIcon =
    keyEventSummary.type === "snore"
      ? Wind
      : keyEventSummary.type === "cough"
        ? Activity
        : Volume2;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">
              {t("dashboard.morningReport")}
            </h1>
            <span className="hidden sm:inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground">
              {formatDate(activeSession.started_at, t("formatting.locale"))}
            </span>
          </div>
          <p className="text-muted-foreground">
            {formatDate(activeSession.started_at, t("formatting.locale"))}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <p className="hidden text-sm text-muted-foreground sm:block">
            {formatTime(activeSession.started_at, t("formatting.locale"))} —{" "}
            {activeSession.ended_at
              ? formatTime(activeSession.ended_at, t("formatting.locale"))
              : t("dashboard.ongoing")}
          </p>
          <Button size="sm" className="rounded-xl" render={<Link href="/record" />}>
            {t("dashboard.startTonight")}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
        <Card className="glass flex items-center justify-center border-white/10 p-6 shadow-soft">
          <SleepScoreRing score={activeSession.sleep_score ?? 0} size={190} />
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title={t("dashboard.totalSleep")}
            value={`${activeSession.duration_minutes ?? 0} ${t("common.minutesShort")}`}
            icon={Clock}
          />
          <StatCard
            title={keyEventSummary.statTitle}
            value={`${keyEventSummary.count}`}
            subtitle={keyEventSummary.statSubtitle}
            icon={KeyEventIcon}
          />
          <StatCard
            title={t("dashboard.totalEvents")}
            value={`${totalEvents}`}
            icon={Activity}
          />
          <StatCard
            title={t("dashboard.peakSound")}
            value={`${activeSession.peak_db?.toFixed(0) ?? t("common.emDash")} ${t("common.decibel")}`}
            icon={Volume2}
          />
        </div>
      </div>

      <Card className="glass border-white/10 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wind className="h-5 w-5 text-primary" />
            {t("dashboard.detectedEvents")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingEvents ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              {t("common.loadingDots")}
            </div>
          ) : (
            <DetectedEventsList
              events={events}
              emptyMessage={t("dashboard.noDetectedEventsTonight")}
            />
          )}
        </CardContent>
      </Card>

      <Card className="glass border-white/10 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Moon className="h-5 w-5 text-primary" />
            {t("dashboard.timeline")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingEvents ? (
            <div className="flex h-64 items-center justify-center text-muted-foreground">
              {t("common.loadingDots")}
            </div>
          ) : (
            <NightTimelineChart
              sessionStart={activeSession.started_at}
              events={events}
              avgDb={activeSession.avg_db}
            />
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-4 text-xl font-semibold">{t("dashboard.pastNights")}</h2>
        <SessionHistory sessions={sessions} />
      </div>

      <PremiumPlaceholder />
    </div>
  );
}
