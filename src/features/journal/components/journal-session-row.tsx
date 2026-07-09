"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Trash2, Moon } from "lucide-react";
import { formatDate } from "@/lib/sleep-utils";
import { formatDurationHours } from "@/lib/sleep-analytics";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { SleepSession } from "@/types";
import { cn } from "@/lib/utils";

const REVEAL_WIDTH = 76;
const SWIPE_OPEN = 40;
const SWIPE_START = 14;

function sessionSubline(session: SleepSession) {
  const duration = formatDurationHours(session.duration_minutes);
  if ((session.snore_count ?? 0) > 0) {
    return `${duration} · ${session.snore_count} horlama`;
  }
  return duration;
}

interface JournalSessionRowProps {
  session: SleepSession;
  onDelete: (session: SleepSession) => void;
  deleting?: boolean;
}

export function JournalSessionRow({ session, onDelete, deleting }: JournalSessionRowProps) {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startRef = useRef({ x: 0, y: 0 });
  const swipingRef = useRef(false);

  const href = `/journal/${session.id}`;
  const isRevealed = offset <= -SWIPE_OPEN;

  const onPointerDown = (e: React.PointerEvent) => {
    if (deleting) return;
    swipingRef.current = false;
    startRef.current = { x: e.clientX, y: e.clientY };
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || deleting) return;

    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;

    if (!swipingRef.current) {
      if (Math.abs(dx) < SWIPE_START || Math.abs(dx) < Math.abs(dy)) return;
      swipingRef.current = true;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }

    if (dx < 0) {
      setOffset(Math.max(-REVEAL_WIDTH, dx));
    } else if (isRevealed) {
      setOffset(Math.min(0, -REVEAL_WIDTH + dx));
    }
  };

  const onPointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    swipingRef.current = false;
    setOffset((current) => (current <= -SWIPE_OPEN ? -REVEAL_WIDTH : 0));
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
          "transition-opacity",
          isRevealed ? "opacity-100" : "pointer-events-none opacity-0",
          deleting && "opacity-60"
        )}
        aria-label="Uyku kaydını sil"
      >
        <Trash2 className="h-5 w-5" />
        <span className="text-[10px] font-semibold uppercase tracking-wide">Sil</span>
      </button>

      <div
        className={cn(
          "relative z-10",
          !dragging && "transition-transform duration-200 ease-out"
        )}
        style={{ transform: `translateX(${offset}px)` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <Link
          href={href}
          prefetch
          onClick={(e) => {
            if (isRevealed || swipingRef.current || offset !== 0) {
              e.preventDefault();
              if (isRevealed) setOffset(0);
            }
          }}
          className={cn("block", deleting && "pointer-events-none opacity-50")}
        >
          <Card className="border-white/[0.08] bg-[oklch(0.14_0.04_240/90)] shadow-none active:scale-[0.99] transition-transform">
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Moon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{formatDate(session.started_at)}</p>
                  <p className="text-sm text-muted-foreground">{sessionSubline(session)}</p>
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
      </div>
    </div>
  );
}
