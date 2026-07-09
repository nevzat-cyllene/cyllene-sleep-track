"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { formatDate } from "@/lib/sleep-utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { SleepSession } from "@/types";
import { cn } from "@/lib/utils";
import { Moon } from "lucide-react";

const REVEAL_WIDTH = 76;
const OPEN_THRESHOLD = 40;

interface JournalSessionRowProps {
  session: SleepSession;
  onDelete: (session: SleepSession) => void;
  deleting?: boolean;
}

export function JournalSessionRow({ session, onDelete, deleting }: JournalSessionRowProps) {
  const router = useRouter();
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startXRef = useRef(0);
  const movedRef = useRef(false);

  const isOpen = offset <= -OPEN_THRESHOLD;

  const onPointerDown = (e: React.PointerEvent) => {
    if (deleting) return;
    setDragging(true);
    movedRef.current = false;
    startXRef.current = e.clientX;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || deleting) return;
    const delta = e.clientX - startXRef.current;
    if (Math.abs(delta) > 6) movedRef.current = true;

    if (delta < 0) {
      setOffset(Math.max(-REVEAL_WIDTH, delta));
    } else if (isOpen) {
      setOffset(Math.min(0, -REVEAL_WIDTH + delta));
    }
  };

  const onPointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    setOffset((current) => (current <= -OPEN_THRESHOLD ? -REVEAL_WIDTH : 0));
  };

  const handleRowClick = () => {
    if (deleting) return;
    if (movedRef.current) {
      if (!isOpen) setOffset(0);
      return;
    }
    if (isOpen) {
      setOffset(0);
      return;
    }
    router.push(`/journal/${session.id}`);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <button
        type="button"
        disabled={deleting}
        onClick={() => onDelete(session)}
        className={cn(
          "absolute inset-y-0 right-0 z-0 flex w-[76px] flex-col items-center justify-center gap-1",
          "bg-red-500/95 text-white touch-manipulation active:bg-red-600",
          deleting && "opacity-60"
        )}
        aria-label="Gece kaydını sil"
      >
        <Trash2 className="h-5 w-5" />
        <span className="text-[10px] font-semibold uppercase tracking-wide">Sil</span>
      </button>

      <div
        className={cn(
          "relative z-10 touch-pan-y select-none",
          !dragging && "transition-transform duration-200 ease-out"
        )}
        style={{ transform: `translateX(${offset}px)` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <Card
          role="button"
          tabIndex={0}
          onClick={handleRowClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleRowClick();
          }}
          className={cn(
            "cursor-pointer border-white/[0.08] bg-[oklch(0.14_0.04_240/90)] shadow-none",
            "active:scale-[0.99] transition-transform",
            deleting && "opacity-50 pointer-events-none"
          )}
        >
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
      </div>
    </div>
  );
}
