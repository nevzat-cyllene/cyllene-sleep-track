"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, BookOpen, CalendarDays, Clock3, MoonStar, Waves } from "lucide-react";
import { toast } from "sonner";
import { formatDate, formatMonthYear } from "@/lib/sleep-utils";
import { Button } from "@/components/ui/button";
import { DeleteConfirmSheet } from "@/components/ui/delete-confirm-sheet";
import { SwipeAction } from "@/components/ui/swipe-action";
import { cn } from "@/lib/utils";
import { getSleepEventSummary } from "@/lib/sleep-event-summary";
import { deleteRemoteSleepSession } from "@/features/recording/sync-session";
import { warmSessionDetail, warmUserSessions, seedUserSessions } from "@/features/recording/session-prefetch-cache";
import { useI18n } from "@/i18n/runtime";
import type { SleepSession } from "@/types";

interface JournalClientProps {
  sessions: SleepSession[];
  userId: string;
}

function groupByMonth(sessions: SleepSession[], locale: string) {
  const groups = new Map<string, SleepSession[]>();
  for (const session of sessions) {
    const key = formatMonthYear(session.started_at, locale);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(session);
  }
  return groups;
}

function scoreTone(score: number) {
  if (score >= 70) return "from-emerald-400 to-cyan-300 text-emerald-300";
  if (score >= 50) return "from-amber-400 to-orange-300 text-amber-300";
  return "from-rose-400 to-orange-300 text-rose-300";
}

export function JournalClient({ sessions, userId }: JournalClientProps) {
  const router = useRouter();
  const { t } = useI18n();
  const [deletedSessionIds, setDeletedSessionIds] = useState(() => new Set<string>());
  const [sessionToDelete, setSessionToDelete] = useState<SleepSession | null>(null);

  const monthLocale = t("formatting.locale");

  const visibleSessions = useMemo(
    () => sessions.filter((session) => !deletedSessionIds.has(session.id)),
    [deletedSessionIds, sessions]
  );

  useEffect(() => {
    seedUserSessions(userId, sessions);
    warmUserSessions(userId);
    visibleSessions.slice(0, 6).forEach((session) => {
      try {
        router.prefetch(`/journal/${session.id}`);
      } catch {
        // ignore
      }
      warmSessionDetail(session.id, userId);
    });
  }, [router, sessions, userId, visibleSessions]);
  const groups = useMemo(
    () => groupByMonth(visibleSessions, monthLocale),
    [visibleSessions, monthLocale]
  );
  const averageScore = useMemo(() => {
    if (visibleSessions.length === 0) return 0;
    return Math.round(
      visibleSessions.reduce((total, session) => total + (session.sleep_score ?? 0), 0) /
        visibleSessions.length
    );
  }, [visibleSessions]);

  const handleDeleteSession = (session: SleepSession) => {
    setSessionToDelete(session);
  };

  const confirmDeleteSession = async () => {
    const session = sessionToDelete;
    if (!session) return;

    // Snap the row out immediately — network work stays in the background.
    setSessionToDelete(null);
    setDeletedSessionIds((current) => new Set(current).add(session.id));
    navigator.vibrate?.(14);

    try {
      await deleteRemoteSleepSession(session.id);
      toast.success(t("journal.deleteSuccess"));
    } catch (error) {
      setDeletedSessionIds((current) => {
        const next = new Set(current);
        next.delete(session.id);
        return next;
      });
      toast.error(error instanceof Error ? error.message : t("journal.deleteError"));
    }
  };

  if (visibleSessions.length === 0) {
    return (
      <div className="space-y-6 pb-4">
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.22em] text-[#78b7ff]">
            {t("journal.archiveEyebrow")}
          </p>
          <h1 className="text-4xl font-medium tracking-[-0.05em]">{t("journal.title")}</h1>
        </div>
        <div className="surface-panel flex min-h-80 flex-col items-center justify-center rounded-[1.8rem] p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#155eff]/12 text-[#78b7ff]">
            <BookOpen className="h-6 w-6" />
          </div>
          <h2 className="mt-5 text-xl font-medium">{t("journal.emptyTitle")}</h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            {t("journal.emptyBody")}
          </p>
          <Button
            className="mt-6 h-11 rounded-full bg-[#1769ff] px-5 hover:bg-[#2c78ff]"
            render={<Link href="/sleep" />}
          >
            {t("journal.emptyCta")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.22em] text-[#78b7ff]">
            {t("journal.archiveEyebrow")}
          </p>
          <h1 className="text-4xl font-medium tracking-[-0.05em]">{t("journal.title")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("journal.body")}</p>
        </div>
        <div className="flex gap-2">
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] px-4 py-2.5">
            <p className="text-[9px] uppercase tracking-[0.16em] text-white/25">
              {t("journal.nights")}
            </p>
            <p className="mt-0.5 text-sm font-medium">{visibleSessions.length}</p>
          </div>
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] px-4 py-2.5">
            <p className="text-[9px] uppercase tracking-[0.16em] text-white/25">
              {t("journal.averageScore")}
            </p>
            <p className="mt-0.5 text-sm font-medium">{averageScore}</p>
          </div>
        </div>
      </div>

      {[...groups.entries()].map(([month, monthSessions]) => (
        <section key={month} className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <CalendarDays className="h-3.5 w-3.5 text-[#78b7ff]" />
            <h2 className="text-xs font-medium capitalize tracking-wide text-white/45">{month}</h2>
            <span className="h-px flex-1 bg-white/[0.055]" />
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            {monthSessions.map((session) => {
              const score = session.sleep_score ?? 0;
              const hasScore = session.sleep_score !== null && session.sleep_score !== undefined;
              const eventSummary = getSleepEventSummary(session, t);
              return (
                <SwipeAction
                  key={session.id}
                  actionLabel={t("common.delete")}
                  onAction={() => void handleDeleteSession(session)}
                >
                  <Link
                    href={`/journal/${session.id}`}
                    prefetch
                    onPointerEnter={() => warmSessionDetail(session.id, userId)}
                    onTouchStart={() => warmSessionDetail(session.id, userId)}
                    className="surface-panel group block rounded-[1.45rem] p-3 hover:-translate-y-0.5 hover:border-[#6da9ff]/20 sm:p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "h-12 w-1.5 shrink-0 rounded-full bg-gradient-to-b",
                          hasScore ? scoreTone(score) : "from-white/18 to-white/5"
                        )}
                      />

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-[#6da9ff]/12 bg-[#155eff]/10 text-[#78b7ff]">
                        <MoonStar className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-medium">
                            {formatDate(session.started_at, t("formatting.locale"))}
                          </p>
                          <span
                            className={cn(
                              "shrink-0 rounded-full border border-white/[0.07] bg-white/[0.035] px-2 py-0.5 text-[10px]",
                              hasScore ? scoreTone(score) : "text-white/32"
                            )}
                          >
                            {hasScore
                              ? t("journal.scorePrefix", { score })
                              : t("journal.scoreEmpty")}
                          </span>
                        </div>
                        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-white/32">
                          <span className="flex items-center gap-1.5">
                            <Clock3 className="h-3 w-3 text-[#78b7ff]" />
                            {session.duration_minutes ?? t("common.emDash")}{" "}
                            {t("common.minutesShort")}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Waves className="h-3 w-3 text-[#78b7ff]" />
                            {eventSummary.compactLabel}
                          </span>
                        </div>
                      </div>

                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.03] text-white/25 group-hover:bg-[#155eff]/15 group-hover:text-[#78b7ff]">
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Link>
                </SwipeAction>
              );
            })}
          </div>
        </section>
      ))}

      <DeleteConfirmSheet
        open={Boolean(sessionToDelete)}
        title={t("journal.deleteSessionTitle")}
        description={t("journal.deleteSessionDescription")}
        confirmLabel={t("journal.deleteSessionConfirm")}
        isPending={false}
        onOpenChange={(open) => {
          if (!open) setSessionToDelete(null);
        }}
        onConfirm={confirmDeleteSession}
      />
    </div>
  );
}
