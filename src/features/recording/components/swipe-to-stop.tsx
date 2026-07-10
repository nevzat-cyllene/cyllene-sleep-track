"use client";

import { useRef, useState } from "react";
import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface SwipeToStopProps {
  onStop: () => void;
  disabled?: boolean;
}

const THRESHOLD = 72;

export function SwipeToStop({ onStop, disabled }: SwipeToStopProps) {
  const [dragY, setDragY] = useState(0);
  const startYRef = useRef(0);
  const draggingRef = useRef(false);

  const progress = Math.min(1, dragY / THRESHOLD);

  const onPointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    draggingRef.current = true;
    startYRef.current = e.clientY;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current || disabled) return;
    const delta = startYRef.current - e.clientY;
    setDragY(Math.max(0, Math.min(delta, THRESHOLD + 20)));
  };

  const onPointerUp = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (dragY >= THRESHOLD) {
      onStop();
    }
    setDragY(0);
  };

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-3 pb-4">
      <p className="text-xs uppercase tracking-[0.25em] text-white/40">
        {disabled ? "Rapor hazırlanıyor…" : "Kaydı tamamlamak için yukarı kaydır"}
      </p>
      <div
        className={cn(
          "relative flex h-16 w-full touch-none select-none items-end justify-center rounded-full border border-white/10 bg-white/5",
          disabled && "opacity-50"
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          className="absolute inset-x-0 bottom-0 rounded-full bg-cyllene-cyan/20 transition-all"
          style={{ height: `${Math.max(28, 28 + progress * 36)}px` }}
        />
        <button
          type="button"
          disabled={disabled}
          className="relative z-10 mb-2 flex flex-col items-center gap-1 rounded-full px-6 py-2 text-white/70 transition-transform"
          style={{ transform: `translateY(-${dragY}px)` }}
        >
          <ChevronUp className={cn("h-5 w-5", progress > 0.6 && "text-cyllene-cyan")} />
          <span className="text-[10px] uppercase tracking-widest">
            {disabled ? "Analiz" : "Kaydı tamamla"}
          </span>
        </button>
      </div>
    </div>
  );
}
