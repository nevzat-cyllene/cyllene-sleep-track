"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface SwipeToStopProps {
  onStop: () => void;
  disabled?: boolean;
}

const THRESHOLD = 72;
const TRACK_H = 80;

export function SwipeToStop({ onStop, disabled }: SwipeToStopProps) {
  const [dragY, setDragY] = useState(0);
  const dragYRef = useRef(0);
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
    const next = Math.max(0, Math.min(delta, THRESHOLD + 12));
    dragYRef.current = next;
    setDragY(next);
  };

  const finishDrag = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (dragYRef.current >= THRESHOLD) {
      navigator.vibrate?.(12);
      onStop();
    }
    dragYRef.current = 0;
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
          style={{ height: `${32 + progress * (TRACK_H - 32)}px` }}
        />

        <div
          className="absolute inset-x-0 flex justify-center"
          style={{
            bottom: 12,
            transform: `translateY(-${dragY}px)`,
          }}
        >
          <div
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-label={disabled ? "Kayıt kaydediliyor" : "Kaydı bitir"}
            className={cn(
              "flex h-12 w-12 flex-col items-center justify-center gap-[5px] rounded-full",
              "border border-white/[0.14] bg-white/[0.1] backdrop-blur-md",
              "shadow-[0_4px_24px_rgba(0,0,0,0.35)]",
              "transition-[border-color,background-color,box-shadow] duration-75",
              progress > 0.5 && "border-cyllene-cyan/45 bg-cyllene-cyan/10 shadow-[0_0_20px_oklch(0.78_0.14_195/25%)]"
            )}
          >
            <span
              className={cn(
                "block h-[2px] w-6 rounded-full",
                progress > 0.5 ? "bg-cyllene-cyan" : "bg-white/70"
              )}
            />
            <span
              className={cn(
                "block h-[2px] w-6 rounded-full",
                progress > 0.5 ? "bg-cyllene-cyan/80" : "bg-white/50"
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
