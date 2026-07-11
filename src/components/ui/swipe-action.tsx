"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SwipeActionProps {
  children: ReactNode;
  actionLabel?: string;
  actionDisabled?: boolean;
  className?: string;
  onAction: () => void | Promise<void>;
}

const ACTION_WIDTH = 84;
const OPEN_THRESHOLD = 30;
const SWIPE_OPEN_EVENT = "cyllene:swipe-action-open";

export function SwipeAction({
  children,
  actionLabel = "Sil",
  actionDisabled,
  className,
  onAction,
}: SwipeActionProps) {
  const id = useId();
  const startX = useRef(0);
  const startY = useRef(0);
  const startOffset = useRef(0);
  const currentOffset = useRef(0);
  const dragged = useRef(false);
  const blockClick = useRef(false);
  const swipeActive = useRef(false);
  const announcedOpen = useRef(false);
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);

  const close = () => {
    currentOffset.current = 0;
    announcedOpen.current = false;
    setOffset(0);
  };

  const announceOpen = () => {
    if (announcedOpen.current) return;
    announcedOpen.current = true;
    window.dispatchEvent(new CustomEvent(SWIPE_OPEN_EVENT, { detail: id }));
  };

  useEffect(() => {
    const onOtherOpen = (event: Event) => {
      const openId = (event as CustomEvent<string>).detail;
      if (openId !== id) close();
    };
    window.addEventListener(SWIPE_OPEN_EVENT, onOtherOpen);
    return () => window.removeEventListener(SWIPE_OPEN_EVENT, onOtherOpen);
  }, [id]);

  return (
    <div className={cn("relative overflow-hidden rounded-[1.45rem] bg-[#071222]", className)}>
      <div
        className="absolute inset-y-0 right-0 flex w-[84px] items-stretch justify-end transition-[opacity,transform] duration-75 ease-out"
        style={{
          opacity: Math.min(1, Math.abs(offset) / 14),
          transform: `translateX(${Math.max(0, ACTION_WIDTH + offset) * 0.18}px)`,
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
          className="my-1 flex w-[76px] flex-col items-center justify-center gap-1 rounded-2xl border border-rose-200/18 bg-[linear-gradient(145deg,rgba(255,72,108,.96),rgba(206,42,78,.94))] text-[10px] font-semibold text-white shadow-[0_14px_36px_rgba(244,63,94,.32),inset_0_1px_0_rgba(255,255,255,.16)] transition duration-75 active:scale-[0.97] disabled:opacity-55"
          aria-label={actionLabel}
        >
          <Trash2 className="h-4 w-4" />
          {actionDisabled ? "..." : actionLabel}
        </button>
      </div>

      <div
        className={cn(
          "relative z-10 touch-pan-y rounded-[inherit] bg-[#071222]",
          dragging ? "transition-none" : "transition-transform duration-100 ease-out"
        )}
        style={{ transform: `translateX(${offset}px)` }}
        onPointerDown={(event) => {
          if (actionDisabled) return;
          // Mouse/pen on desktop: do not hijack clicks (play button must work).
          if (event.pointerType !== "touch") return;

          swipeActive.current = true;
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
          if (!swipeActive.current || !dragging || actionDisabled) return;

          const dx = event.clientX - startX.current;
          const dy = event.clientY - startY.current;
          if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 12) return;
          if (event.cancelable) event.preventDefault();

          const next = Math.min(0, Math.max(-ACTION_WIDTH, startOffset.current + dx));
          if (Math.abs(dx) > 6) {
            dragged.current = true;
            blockClick.current = true;
          }
          if (next < -OPEN_THRESHOLD) {
            announceOpen();
          }
          currentOffset.current = next;
          setOffset(next);
        }}
        onPointerUp={(event) => {
          if (!swipeActive.current || actionDisabled) return;
          swipeActive.current = false;
          setDragging(false);
          const next = currentOffset.current <= -OPEN_THRESHOLD ? -ACTION_WIDTH : 0;
          if (next < 0) {
            announceOpen();
            if (currentOffset.current > -ACTION_WIDTH) {
              navigator.vibrate?.(8);
            }
          } else {
            announcedOpen.current = false;
          }
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
          swipeActive.current = false;
          setDragging(false);
          currentOffset.current = 0;
          announcedOpen.current = false;
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
