"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Check,
  Languages,
  MoonStar,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UserRound,
} from "lucide-react";
import { localeOptions, useI18n, type Locale } from "@/i18n/runtime";
import { cn } from "@/lib/utils";

function MenuBadge({ children, active }: { children: string; active?: boolean }) {
  return (
    <span
      className={cn(
        "ml-auto rounded-full border px-2 py-0.5 text-[9px] font-medium",
        active
          ? "border-[#78b7ff]/24 bg-[#155eff]/16 text-[#a9d7ff]"
          : "border-white/[0.07] bg-white/[0.035] text-white/34"
      )}
    >
      {children}
    </span>
  );
}

function ControlMenuButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex min-h-11 w-full items-center gap-2 rounded-xl px-3 text-left text-sm text-white/74 transition duration-100 hover:bg-[#155eff]/14 hover:text-white focus-visible:bg-[#155eff]/14 focus-visible:text-white focus-visible:outline-none"
    >
      {children}
    </button>
  );
}

export function AppControlMenu() {
  const router = useRouter();
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);

  React.useEffect(() => {
    if (!open) return;

    const closeOnPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (rootRef.current?.contains(target)) return;
      setOpen(false);
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener("pointerdown", closeOnPointerDown, true);
    document.addEventListener("keydown", closeOnEscape, true);

    return () => {
      document.removeEventListener("pointerdown", closeOnPointerDown, true);
      document.removeEventListener("keydown", closeOnEscape, true);
    };
  }, [open]);

  const navigate = (href: string) => {
    setOpen(false);
    router.prefetch(href);
    router.push(href);
  };

  const selectLocale = (nextLocale: Locale) => {
    setLocale(nextLocale);
  };

  return (
    <div ref={rootRef} className="relative" data-i18n-skip>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("appControl.aria")}
        onClick={() => setOpen((value) => !value)}
        className="group relative flex h-10 w-10 touch-manipulation items-center justify-center overflow-hidden rounded-full border border-white/[0.08] bg-white/[0.035] text-white/68 shadow-[inset_0_1px_0_rgba(255,255,255,.055)] transition duration-100 hover:border-[#78b7ff]/20 hover:bg-white/[0.07] hover:text-white active:scale-[0.96]"
      >
        <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,rgba(120,183,255,.14),transparent_58%)] opacity-0 transition duration-150 group-hover:opacity-100" />
        <SlidersHorizontal className="relative h-4.5 w-4.5 text-[#8fc0ff]" />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label={t("appControl.title")}
          className="absolute right-0 top-[calc(100%+.65rem)] z-[80] w-[min(22rem,calc(100vw-1.25rem))] origin-top-right rounded-[1.45rem] border border-[#8dbdff]/12 bg-[#071124]/96 p-2 text-white shadow-[0_24px_90px_rgba(0,5,24,.58),inset_0_1px_0_rgba(255,255,255,.07)] backdrop-blur-2xl animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-100"
        >
          <div className="relative overflow-hidden rounded-[1.1rem] border border-[#8dbdff]/10 bg-[linear-gradient(145deg,rgba(21,94,255,.13),rgba(111,210,255,.045))] p-3">
            <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#6fd2ff]/14 blur-3xl" />
            <div className="relative flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#155eff]/16 text-[#9bd5ff]">
                <Sparkles className="h-4.5 w-4.5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold tracking-[-0.02em]">{t("appControl.title")}</p>
                <p className="mt-1 text-xs leading-5 text-white/40">
                  {t("appControl.subtitle")}
                </p>
              </div>
            </div>
          </div>

          <p className="mt-3 px-2 text-[10px] font-medium uppercase tracking-[0.2em] text-[#78b7ff]/70">
            {t("appControl.quickAccess")}
          </p>
          <div className="mt-1 grid gap-1">
            <ControlMenuButton onClick={() => navigate("/profile")}>
              <UserRound className="h-4 w-4 text-[#8fc0ff]" />
              {t("appControl.profile")}
            </ControlMenuButton>
            <ControlMenuButton onClick={() => navigate("/sleep")}>
              <MoonStar className="h-4 w-4 text-[#8fc0ff]" />
              {t("appControl.newNight")}
            </ControlMenuButton>
            <ControlMenuButton onClick={() => navigate("/journal")}>
              <BookOpen className="h-4 w-4 text-[#8fc0ff]" />
              {t("appControl.journal")}
            </ControlMenuButton>
          </div>

          <div className="my-2 h-px bg-white/[0.07]" />

          <p className="px-2 text-[10px] font-medium uppercase tracking-[0.2em] text-[#78b7ff]/70">
            {t("appControl.language")}
          </p>
          <div className="mt-1 grid gap-1">
            {localeOptions.map((language) => {
              const active = locale === language.code;

              return (
                <button
                  key={language.code}
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  onClick={() => selectLocale(language.code)}
                  className={cn(
                    "flex min-h-11 w-full items-center gap-2 rounded-xl px-3 text-left text-sm text-white/72 transition duration-100 hover:bg-[#155eff]/14 hover:text-white focus-visible:bg-[#155eff]/14 focus-visible:text-white focus-visible:outline-none",
                    active && "bg-[#155eff]/10 text-white"
                  )}
                >
                  <Languages className="h-4 w-4 text-[#8fc0ff]" />
                  <span className="flex min-w-0 flex-1 items-center gap-2">
                    <span className="w-7 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
                      {language.short}
                    </span>
                    <span className="truncate">{language.nativeLabel}</span>
                  </span>
                  {active ? <Check className="h-3.5 w-3.5 text-[#75f2d6]" /> : null}
                  <MenuBadge active={active}>
                    {active ? t("appControl.active") : t("appControl.ready")}
                  </MenuBadge>
                </button>
              );
            })}
          </div>

          <div className="my-2 h-px bg-white/[0.07]" />

          <div className="grid gap-2 p-1">
            <div className="flex items-start gap-3 rounded-xl border border-emerald-300/10 bg-emerald-300/[0.045] px-3 py-2.5">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300/80" />
              <div>
                <p className="text-xs font-medium text-white/72">{t("appControl.privacyTitle")}</p>
                <p className="mt-0.5 text-[11px] leading-4 text-white/32">
                  {t("appControl.privacyBody")}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
