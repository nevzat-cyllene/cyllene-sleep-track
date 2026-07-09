"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface SwipeToStopProps {
  onStop: () => void;
  disabled?: boolean;
}

const THRESHOLD = 88;
const TRACK_H = 72;

export function SwipeToStop({ onStop, disabled }: SwipeToStopProps) {
  const [dragY, setDragY] = useState(0);
  const startYRef = useRef(0);
  const draggingRef = useRef(false);

  const progress = Math.min(1, dragY / THRESHOLD);

  const onPointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    draggingRef.current = true;
    startYRef.current = e.clientY;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current || disabled) return;
    const delta = startYRef.current - e.clientY;
    setDragY(Math.max(0, Math.min(delta, THRESHOLD + 16)));
  };

  const finishDrag = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (dragY >= THRESHOLD) {
      navigator.vibrate?.(12);
      onStop();
    }
    setDragY(0);
  };

  return (
    <div className="mx-auto w-full max-w-[340px] shrink-0 pt-2">
      <p className="mb-4 text-center text-[13px] font-medium text-white/35">
        {disabled ? "Gece kaydediliyor…" : "Uyanmak için yukarı kaydır"}
      </p>

      <div
        className={cn(
          "relative touch-none select-none overflow-hidden rounded-[28px]",
          "border border-white/[0.1] bg-white/[0.05] backdrop-blur-2xl",
          "shadow-[0_8px_40px_oklch(0.62_0.22_285/15%)]",
          disabled && "pointer-events-none opacity-60"
        )}
        style={{ height: TRACK_H }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
      >
        <div
          className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-cyllene-purple/20 via-cyllene-cyan/15 to-transparent transition-[height] duration-75"
          style={{ height: `${28 + progress * (TRACK_H - 28)}px` }}
        />

        <button
          type="button"
          disabled={disabled}
          aria-label={disabled ? "Kayıt kaydediliyor" : "Kaydı bitir"}
          className={cn(
            "absolute left-1/2 bottom-3 z-10 flex h-[48px] w-[72px] -translate-x-1/2 flex-col items-center justify-center gap-1.5 rounded-full",
            "border border-white/[0.14] bg-white/[0.1] backdrop-blur-md",
            "shadow-[0_4px_24px_rgba(0,0,0,0.35)] transition-transform duration-75 ease-out active:scale-[0.97]",
            progress > 0.55 && "border-cyllene-cyan/45 bg-cyllene-cyan/10"
          )}
          style={{ transform: `translate(-50%, calc(-1 * ${dragY}px))` }}
        >
          <span className="h-0.5 w-7 rounded-full bg-white/70" />
          <span
            className={cn(
              "h-0.5 w-5 rounded-full transition-colors",
              progress > 0.55 ? "bg-cyllene-cyan" : "bg-white/45"
            )}
          />
        </button>
      </div>
    </div>
  );
}
