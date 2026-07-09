"use client";

import { useRef, useState, type ReactNode } from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SwipeActionProps {
  children: ReactNode;
  actionLabel?: string;
  actionDisabled?: boolean;
  className?: string;
  onAction: () => void | Promise<void>;
}

const ACTION_WIDTH = 88;

export function SwipeAction({
  children,
  actionLabel = "Sil",
  actionDisabled,
  className,
  onAction,
}: SwipeActionProps) {
  const startX = useRef(0);
  const startY = useRef(0);
  const startOffset = useRef(0);
  const currentOffset = useRef(0);
  const dragged = useRef(false);
  const blockClick = useRef(false);
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);

  const close = () => {
    currentOffset.current = 0;
    setOffset(0);
  };

  return (
    <div className={cn("relative overflow-hidden rounded-[1.45rem] bg-[#071222]", className)}>
      <div
        className="absolute inset-y-0 right-0 flex w-[88px] items-stretch justify-end transition-opacity duration-100"
        style={{
          opacity: Math.min(1, Math.abs(offset) / 26),
          pointerEvents: offset === 0 ? "none" : "auto",
        }}
      >
        <button
          type="button"
          disabled={actionDisabled}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void onAction();
            close();
          }}
          className="my-1 flex w-20 flex-col items-center justify-center gap-1 rounded-2xl border border-rose-300/20 bg-rose-500/90 text-[10px] font-semibold text-white shadow-[0_14px_36px_rgba(244,63,94,.28)] transition duration-150 hover:bg-rose-500 disabled:opacity-55"
          aria-label={actionLabel}
        >
          <Trash2 className="h-4 w-4" />
          {actionDisabled ? "..." : actionLabel}
        </button>
      </div>

      <div
        className={cn(
          "relative z-10 touch-pan-y rounded-[inherit] bg-[#071222]",
          dragging ? "transition-none" : "transition-transform duration-150 ease-out"
        )}
        style={{ transform: `translateX(${offset}px)` }}
        onPointerDown={(event) => {
          if (actionDisabled) return;
          startX.current = event.clientX;
          startY.current = event.clientY;
          startOffset.current = offset;
          currentOffset.current = offset;
          dragged.current = false;
          setDragging(true);
          try {
            event.currentTarget.setPointerCapture(event.pointerId);
          } catch {
            // Some browsers decline capture for synthetic or cancelled pointers.
          }
        }}
        onPointerMove={(event) => {
          if (!dragging || actionDisabled) return;

          const dx = event.clientX - startX.current;
          const dy = event.clientY - startY.current;
          if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 12) return;

          const next = Math.min(0, Math.max(-ACTION_WIDTH, startOffset.current + dx));
          if (Math.abs(dx) > 6) {
            dragged.current = true;
            blockClick.current = true;
          }
          currentOffset.current = next;
          setOffset(next);
        }}
        onPointerUp={(event) => {
          if (actionDisabled) return;
          setDragging(false);
          const next = currentOffset.current <= -ACTION_WIDTH / 2 ? -ACTION_WIDTH : 0;
          currentOffset.current = next;
          setOffset(next);
          try {
            event.currentTarget.releasePointerCapture(event.pointerId);
          } catch {
            // Pointer capture can already be gone on some mobile browsers.
          }
          window.setTimeout(() => {
            blockClick.current = false;
          }, 0);
        }}
        onPointerCancel={() => {
          setDragging(false);
          currentOffset.current = 0;
          setOffset(0);
          window.setTimeout(() => {
            blockClick.current = false;
          }, 0);
        }}
        onClickCapture={(event) => {
          if (blockClick.current || offset < 0) {
            event.preventDefault();
            event.stopPropagation();
            close();
          }
        }}
      >
        {children}
      </div>
    </div>
  );
}
