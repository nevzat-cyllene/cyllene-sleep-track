"use client";

import Link from "next/link";
import { formatDate } from "@/lib/sleep-utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { SleepSession } from "@/types";
import { BookOpen, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

interface JournalClientProps {
  sessions: SleepSession[];
}

function groupByMonth(sessions: SleepSession[]) {
  const groups = new Map<string, SleepSession[]>();
  for (const s of sessions) {
    const key = new Intl.DateTimeFormat("tr-TR", {
      month: "long",
      year: "numeric",
    }).format(new Date(s.started_at));
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(s);
  }
  return groups;
}

export function JournalClient({ sessions }: JournalClientProps) {
  if (sessions.length === 0) {
    return (
      <div className="space-y-6 pb-4">
        <h1 className="text-2xl font-semibold">Günlük</h1>
        <Card className="glass border-white/10 shadow-soft">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <BookOpen className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">Henüz kayıtlı gece yok.</p>
            <Button render={<Link href="/sleep" />}>İlk geceyi kaydet</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const groups = groupByMonth(sessions);

  return (
    <div className="space-y-6 pb-4">
      <div>
        <h1 className="text-2xl font-semibold">Günlük</h1>
        <p className="text-sm text-muted-foreground">Geçmiş geceleriniz ve ses kayıtları</p>
      </div>

      {[...groups.entries()].map(([month, monthSessions]) => (
        <div key={month} className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            {month}
          </h2>
          <div className="space-y-2">
            {monthSessions.map((session) => (
              <Link key={session.id} href={`/journal/${session.id}`}>
                <Card className="glass border-white/10 shadow-soft transition hover:border-cyllene-cyan/30">
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Moon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{formatDate(session.started_at)}</p>
                        <p className="text-sm text-muted-foreground">
                          {session.duration_minutes ?? "—"} dk · {session.snore_count} horlama
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={cn(
                        (session.sleep_score ?? 0) >= 70
                          ? "bg-emerald-500/10 text-emerald-400"
                          : (session.sleep_score ?? 0) >= 50
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-red-500/10 text-red-400"
                      )}
                    >
                      {session.sleep_score ?? "—"}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
