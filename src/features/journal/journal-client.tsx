"use client";

import Link from "next/link";
import { ArrowUpRight, BookOpen, CalendarDays, Clock3, Waves } from "lucide-react";
import { formatDate } from "@/lib/sleep-utils";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
  if (sessions.length === 0) {
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

  const groups = groupByMonth(sessions);
  const averageScore = Math.round(
    sessions.reduce((total, session) => total + (session.sleep_score ?? 0), 0) / sessions.length
  );

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
            <p className="mt-0.5 text-sm font-medium">{sessions.length}</p>
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
              return (
                <Link
                  key={session.id}
                  href={`/journal/${session.id}`}
                  className="surface-panel group rounded-[1.45rem] p-4 transition duration-300 hover:-translate-y-0.5 hover:border-[#6da9ff]/20 sm:p-5"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/[0.035]">
                      <div
                        className={cn(
                          "absolute inset-0 rounded-full bg-gradient-to-br opacity-20",
                          scoreTone(score)
                        )}
                      />
                      <div className={cn("relative text-xl font-semibold", scoreTone(score))}>
                        {session.sleep_score ?? "—"}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{formatDate(session.started_at)}</p>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-white/32">
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

                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.03] text-white/25 transition group-hover:bg-[#155eff]/15 group-hover:text-[#78b7ff]">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
