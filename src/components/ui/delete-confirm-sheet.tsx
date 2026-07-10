"use client";

import { useId } from "react";
import { ShieldAlert, Trash2, X } from "lucide-react";

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
  const titleId = useId();
  const descriptionId = useId();

  if (!open) return null;

  const close = () => {
    if (!isPending) onOpenChange(false);
  };

  return (
    <div
      className="fixed inset-0 z-[260] flex items-end justify-center px-3 pb-[max(.85rem,env(safe-area-inset-bottom))] sm:items-center sm:pb-0"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <button
        type="button"
        aria-label="Silme onayını kapat"
        className="absolute inset-0 cursor-default bg-[#02050d]/72 backdrop-blur-md"
        disabled={isPending}
        onClick={close}
      />

      <div className="relative w-full max-w-sm overflow-hidden rounded-[1.75rem] border border-white/[0.1] bg-[#07111f]/96 shadow-[0_26px_100px_rgba(0,4,18,.78),inset_0_1px_0_rgba(255,255,255,.08)]">
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#78b7ff]/60 to-transparent" />
        <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-rose-500/18 blur-[74px]" />
        <div className="pointer-events-none absolute -bottom-24 left-4 h-52 w-52 rounded-full bg-[#155eff]/16 blur-[72px]" />

        <div className="relative px-5 pb-2 pt-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-300/15 bg-[linear-gradient(135deg,rgba(244,63,94,.22),rgba(59,130,246,.08))] text-rose-100 shadow-[0_14px_40px_rgba(244,63,94,.18)]">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <button
              type="button"
              disabled={isPending}
              onClick={close}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.035] text-white/45 transition duration-100 hover:bg-white/[0.07] hover:text-white disabled:opacity-50"
              aria-label="Vazgeç"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <h2 id={titleId} className="text-xl font-semibold tracking-[-0.03em] text-white">
            {title}
          </h2>
          <p id={descriptionId} className="mt-2 max-w-sm text-[13px] leading-5 text-white/54">
            {description}
          </p>
        </div>

        <div className="relative grid gap-2 px-5 pb-5 pt-3">
          <button
            type="button"
            disabled={isPending}
            onClick={() => void onConfirm()}
            className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,rgba(255,86,118,.98),rgba(214,43,83,.98))] text-sm font-semibold text-white shadow-[0_16px_42px_rgba(244,63,94,.3),inset_0_1px_0_rgba(255,255,255,.2)] transition duration-100 active:scale-[0.985] disabled:opacity-65"
          >
            <Trash2 className="h-4 w-4" />
            {isPending ? "Siliniyor..." : confirmLabel}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={close}
            className="h-11 rounded-2xl border border-white/[0.08] bg-white/[0.035] text-sm font-medium text-white/70 transition duration-100 hover:bg-white/[0.06] hover:text-white active:scale-[0.985] disabled:opacity-55"
          >
            Vazgeç
          </button>
        </div>
      </div>
    </div>
  );
}
