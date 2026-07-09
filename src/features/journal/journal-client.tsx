"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { SleepSession } from "@/types";
import { BookOpen } from "lucide-react";
import { JournalSessionRow } from "./components/journal-session-row";
import { deleteSleepSession } from "./delete-sleep-session";

interface JournalClientProps {
  sessions: SleepSession[];
  userId: string;
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

export function JournalClient({ sessions: initialSessions, userId }: JournalClientProps) {
  const [sessions, setSessions] = useState(initialSessions);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (session: SleepSession) => {
    const label = new Intl.DateTimeFormat("tr-TR", {
      day: "numeric",
      month: "long",
    }).format(new Date(session.started_at));

    if (!window.confirm(`${label} uyku kaydı silinsin mi? Ses klipleri de cihazınızdan kaldırılır.`)) {
      return;
    }

    setDeletingId(session.id);
    const result = await deleteSleepSession(session.id, userId);
    setDeletingId(null);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    setSessions((prev) => prev.filter((s) => s.id !== session.id));
    toast.success("Uyku kaydı silindi.");
  };

  if (sessions.length === 0) {
    return (
      <div className="space-y-6 pb-4">
        <h1 className="text-2xl font-semibold">Günlük</h1>
        <Card className="glass border-white/10 shadow-soft">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <BookOpen className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">Henüz kayıtlı uyku yok.</p>
            <Button render={<Link href="/sleep" />}>İlk uykuyu kaydet</Button>
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
        <p className="text-sm text-muted-foreground">
          Sola kaydırarak silebilirsiniz
        </p>
      </div>

      {[...groups.entries()].map(([month, monthSessions]) => (
        <div key={month} className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            {month}
          </h2>
          <div className="space-y-2">
            {monthSessions.map((session) => (
              <JournalSessionRow
                key={session.id}
                session={session}
                onDelete={handleDelete}
                deleting={deletingId === session.id}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
