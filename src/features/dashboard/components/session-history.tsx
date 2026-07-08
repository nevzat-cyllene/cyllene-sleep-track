"use client";

import Link from "next/link";
import { formatDate } from "@/lib/sleep-utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { SleepSession } from "@/types";
import { Moon } from "lucide-react";

interface SessionHistoryProps {
  sessions: SleepSession[];
}

export function SessionHistory({ sessions }: SessionHistoryProps) {
  if (sessions.length === 0) {
    return (
      <Card className="glass border-white/10 shadow-soft">
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <Moon className="h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">Henüz kayıtlı gece yok.</p>
          <Link href="/record" className="text-sm text-primary hover:underline">
            İlk gece kaydınızı başlatın →
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map((session) => (
        <Link key={session.id} href={`/dashboard?session=${session.id}`}>
          <Card className="glass border-white/10 shadow-soft transition hover:border-white/20">
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium">{formatDate(session.started_at)}</p>
                <p className="text-sm text-muted-foreground">
                  {session.duration_minutes ?? "—"} dk · {session.snore_count} horlama
                </p>
              </div>
              <Badge
                variant="secondary"
                className={
                  (session.sleep_score ?? 0) >= 70
                    ? "bg-emerald-500/10 text-emerald-400"
                    : (session.sleep_score ?? 0) >= 50
                      ? "bg-amber-500/10 text-amber-400"
                      : "bg-red-500/10 text-red-400"
                }
              >
                {session.sleep_score ?? "—"}
              </Badge>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
