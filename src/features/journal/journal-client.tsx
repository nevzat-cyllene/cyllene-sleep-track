"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, BookOpen, CalendarDays, Clock3, MoonStar, Waves } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/sleep-utils";
import { Button } from "@/components/ui/button";
import { SwipeAction } from "@/components/ui/swipe-action";
import { cn } from "@/lib/utils";
import { deleteRemoteSleepSession } from "@/features/recording/sync-session";
import type { SleepSession } from "@/types";

interface JournalClientProps {
  sessions: SleepSession[];
}

function groupByMonth(sessions: SleepSession[]) {
  const groups = new Map<string, SleepSession[]>();
  for (const session of sessions) {
    const key = new Intl.DateTimeFormat("tr-TR", {
      month: "long",
      year: "numeric",
    }).format(new Date(session.started_at));
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

export function JournalClient({ sessions }: JournalClientProps) {
  const [deletedSessionIds, setDeletedSessionIds] = useState(() => new Set<string>());
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);

  const visibleSessions = useMemo(
    () => sessions.filter((session) => !deletedSessionIds.has(session.id)),
    [deletedSessionIds, sessions]
  );
  const groups = useMemo(() => groupByMonth(visibleSessions), [visibleSessions]);
  const averageScore = useMemo(() => {
    if (visibleSessions.length === 0) return 0;
    return Math.round(
      visibleSessions.reduce((total, session) => total + (session.sleep_score ?? 0), 0) /
        visibleSessions.length
    );
  }, [visibleSessions]);

  const handleDeleteSession = async (session: SleepSession) => {
    if (!window.confirm("Bu gece kaydı kalıcı olarak silinsin mi?")) return;

    setDeletingSessionId(session.id);
    try {
      await deleteRemoteSleepSession(session.id);
      setDeletedSessionIds((current) => new Set(current).add(session.id));
      toast.success("Gece kaydı silindi.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gece kaydı silinemedi.");
    } finally {
      setDeletingSessionId(null);
    }
  };

  if (visibleSessions.length === 0) {
    return (
      <div className="space-y-6 pb-4">
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.22em] text-[#78b7ff]">
            Gece arşivin
          </p>
          <h1 className="text-4xl font-medium tracking-[-0.05em]">Uyku günlüğü</h1>
        </div>
        <div className="surface-panel flex min-h-80 flex-col items-center justify-center rounded-[1.8rem] p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#155eff]/12 text-[#78b7ff]">
            <BookOpen className="h-6 w-6" />
          </div>
          <h2 className="mt-5 text-xl font-medium">İlk sayfan henüz boş.</h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            İlk gece kaydını tamamladığında raporun ve ses olayların burada görünecek.
          </p>
          <Button
            className="mt-6 h-11 rounded-full bg-[#1769ff] px-5 hover:bg-[#2c78ff]"
            render={<Link href="/sleep" />}
          >
            İlk geceyi başlat
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
            Gece arşivin
          </p>
          <h1 className="text-4xl font-medium tracking-[-0.05em]">Uyku günlüğü</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Geçmiş gecelerin, skorların ve ses kayıtların.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] px-4 py-2.5">
            <p className="text-[9px] uppercase tracking-[0.16em] text-white/25">Gece</p>
            <p className="mt-0.5 text-sm font-medium">{visibleSessions.length}</p>
          </div>
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] px-4 py-2.5">
            <p className="text-[9px] uppercase tracking-[0.16em] text-white/25">Ort. skor</p>
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
              return (
                <SwipeAction
                  key={session.id}
                  actionDisabled={deletingSessionId === session.id}
                  onAction={() => void handleDeleteSession(session)}
                >
                  <Link
                    href={`/journal/${session.id}`}
                    className="surface-panel group block rounded-[1.45rem] p-3 transition duration-150 hover:-translate-y-0.5 hover:border-[#6da9ff]/20 sm:p-4"
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
                          <p className="truncate font-medium">{formatDate(session.started_at)}</p>
                          <span
                            className={cn(
                              "shrink-0 rounded-full border border-white/[0.07] bg-white/[0.035] px-2 py-0.5 text-[10px]",
                              hasScore ? scoreTone(score) : "text-white/32"
                            )}
                          >
                            {hasScore ? `Skor ${score}` : "Skor yok"}
                          </span>
                        </div>
                        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-white/32">
                          <span className="flex items-center gap-1.5">
                            <Clock3 className="h-3 w-3 text-[#78b7ff]" />
                            {session.duration_minutes ?? "—"} dk
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Waves className="h-3 w-3 text-[#78b7ff]" />
                            {session.snore_count} horlama
                          </span>
                        </div>
                      </div>

                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.03] text-white/25 transition group-hover:bg-[#155eff]/15 group-hover:text-[#78b7ff]">
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
    </div>
  );
}
