"use client";

import { ShieldAlert, Trash2, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface DeleteConfirmSheetProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  isPending?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
}

export function DeleteConfirmSheet({
  open,
  title,
  description,
  confirmLabel = "Sil",
  isPending,
  onOpenChange,
  onConfirm,
}: DeleteConfirmSheetProps) {
  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isPending) onOpenChange(nextOpen);
      }}
    >
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="data-[side=bottom]:inset-x-3 data-[side=bottom]:bottom-[max(.75rem,env(safe-area-inset-bottom))] data-[side=bottom]:mx-auto data-[side=bottom]:max-w-md data-[side=bottom]:rounded-[1.8rem] data-[side=bottom]:border data-[side=bottom]:border-white/[0.1] bg-[#07111f]/96 p-0 shadow-[0_24px_90px_rgba(0,4,18,.72),inset_0_1px_0_rgba(255,255,255,.08)] backdrop-blur-2xl"
      >
        <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#78b7ff]/55 to-transparent" />
        <SheetHeader className="px-5 pb-2 pt-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-rose-300/15 bg-rose-500/12 text-rose-200 shadow-[0_12px_34px_rgba(244,63,94,.16)]">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <button
              type="button"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.035] text-white/45 transition duration-100 hover:bg-white/[0.07] hover:text-white disabled:opacity-50"
              aria-label="Vazgeç"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <SheetTitle className="text-xl font-semibold tracking-[-0.03em] text-white">
            {title}
          </SheetTitle>
          <SheetDescription className="max-w-sm text-[13px] leading-5 text-white/52">
            {description}
          </SheetDescription>
        </SheetHeader>

        <div className="grid gap-2 px-5 pb-5 pt-2">
          <button
            type="button"
            disabled={isPending}
            onClick={() => void onConfirm()}
            className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,rgba(255,76,112,.96),rgba(201,41,76,.96))] text-sm font-semibold text-white shadow-[0_16px_42px_rgba(244,63,94,.28),inset_0_1px_0_rgba(255,255,255,.18)] transition duration-100 active:scale-[0.985] disabled:opacity-65"
          >
            <Trash2 className="h-4 w-4" />
            {isPending ? "Siliniyor..." : confirmLabel}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
            className="h-11 rounded-2xl border border-white/[0.08] bg-white/[0.035] text-sm font-medium text-white/70 transition duration-100 hover:bg-white/[0.06] hover:text-white active:scale-[0.985] disabled:opacity-55"
          >
            Vazgeç
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
