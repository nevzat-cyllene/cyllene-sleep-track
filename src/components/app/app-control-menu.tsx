"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Check,
  History,
  Languages,
  Scale,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UserRound,
} from "lucide-react";
import { NightPickerSheet } from "@/components/app/night-picker-sheet";
import { PrivacyLegalSheet } from "@/components/app/privacy-legal-sheet";
import { createClient } from "@/lib/supabase/client";
import { localeOptions, useI18n, type Locale } from "@/i18n/runtime";
import type { SleepSession } from "@/types";
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
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className="flex min-h-11 w-full items-center gap-2 rounded-xl px-3 text-left text-sm text-white/74 transition duration-100 hover:bg-[#155eff]/14 hover:text-white focus-visible:bg-[#155eff]/14 focus-visible:text-white focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-55"
    >
      {children}
    </button>
  );
}

export function AppControlMenu() {
  const router = useRouter();
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = React.useState(false);
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [legalOpen, setLegalOpen] = React.useState(false);
  const [sessions, setSessions] = React.useState<SleepSession[]>([]);
  const [loadingSessions, setLoadingSessions] = React.useState(false);
  const [menuPos, setMenuPos] = React.useState<{ top: number; right: number } | null>(null);
  const [portalReady, setPortalReady] = React.useState(false);
  const userIdRef = React.useRef<string | null>(null);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const menuRef = React.useRef<HTMLDivElement | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const openedAtRef = React.useRef(0);

  React.useEffect(() => {
    setPortalReady(true);
  }, []);

  const ensureSessions = React.useCallback(async (force = false) => {
    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id ?? null;
      userIdRef.current = uid;
      if (!uid) {
        setSessions([]);
        return;
      }

      const { getCachedUserSessions, loadUserSessionsCached } = await import(
        "@/features/recording/session-prefetch-cache"
      );
      if (!force) {
        const cached = getCachedUserSessions(uid);
        if (cached) {
          setSessions(cached);
          cached.slice(0, 8).forEach((session) => {
            try {
              router.prefetch(`/journal/${session.id}`);
            } catch {
              // ignore
            }
          });
          return;
        }
      }

      setLoadingSessions(true);
      const next = await loadUserSessionsCached(uid);
      setSessions(next);
      next.slice(0, 8).forEach((session) => {
        try {
          router.prefetch(`/journal/${session.id}`);
        } catch {
          // ignore
        }
      });
    } catch {
      setSessions([]);
    } finally {
      setLoadingSessions(false);
    }
  }, [router]);

  const updateMenuPosition = React.useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    setMenuPos({
      top: Math.round(rect.bottom + 10),
      right: Math.round(window.innerWidth - rect.right),
    });
  }, []);

  React.useEffect(() => {
    if (open) {
      openedAtRef.current = Date.now();
      updateMenuPosition();
      void ensureSessions(false);
    } else {
      setMenuPos(null);
    }

    const header = document.querySelector("header.sticky");
    if (header instanceof HTMLElement) {
      if (open) header.setAttribute("data-control-menu-open", "true");
      else header.removeAttribute("data-control-menu-open");
    }

    return () => {
      header?.removeAttribute("data-control-menu-open");
    };
  }, [ensureSessions, open, updateMenuPosition]);

  React.useEffect(() => {
    if (!open) return;

    const onResize = () => updateMenuPosition();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [open, updateMenuPosition]);

  React.useEffect(() => {
    if (!open) return;

    const closeOnPointerDown = (event: PointerEvent) => {
      // Ignore the same gesture that opened the menu (mobile ghost/outside race).
      if (Date.now() - openedAtRef.current < 350) return;

      const target = event.target;
      if (!(target instanceof Node)) return;
      if (rootRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
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
    router.push(href);
  };

  const selectLocale = (next: Locale) => {
    setLocale(next);
  };

  const openHistory = () => {
    setOpen(false);
    setHistoryOpen(true);
    void ensureSessions(false);
  };

  const openLegal = () => {
    setOpen(false);
    setLegalOpen(true);
  };

  const menuPanel =
    open && menuPos && portalReady
      ? createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-label={t("appControl.title")}
            style={{ top: menuPos.top, right: menuPos.right }}
            className="fixed z-[120] w-[min(22rem,calc(100vw-1.25rem))] max-h-[min(32rem,calc(100dvh-5.5rem))] origin-top-right overflow-y-auto overscroll-contain rounded-[1.45rem] border border-[#8dbdff]/14 bg-[#071124] p-2 text-white shadow-[0_24px_90px_rgba(0,5,24,.72),inset_0_1px_0_rgba(255,255,255,.07)]"
          >
            <div className="relative overflow-hidden rounded-[1.1rem] border border-[#8dbdff]/10 bg-[linear-gradient(145deg,rgba(21,94,255,.13),rgba(111,210,255,.045))] p-3">
              <div className="relative flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#155eff]/16 text-[#9bd5ff]">
                  <Sparkles className="h-4.5 w-4.5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold tracking-[-0.02em]">{t("appControl.title")}</p>
                  <p className="mt-1 min-h-[2.5rem] text-xs leading-5 text-white/40">
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
              <ControlMenuButton onClick={openHistory}>
                <History className="h-4 w-4 text-[#8fc0ff]" />
                <span className="min-w-0 flex-1">
                  <span className="block">{t("appControl.history")}</span>
                  <span className="block text-[10px] text-white/35">{t("appControl.historyHint")}</span>
                </span>
              </ControlMenuButton>
              <ControlMenuButton onClick={openLegal}>
                <Scale className="h-4 w-4 text-[#8fc0ff]" />
                <span className="min-w-0 flex-1">
                  <span className="block">{t("appControl.legal")}</span>
                  <span className="block text-[10px] text-white/35">{t("appControl.legalHint")}</span>
                </span>
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
                  <ControlMenuButton key={language.code} onClick={() => selectLocale(language.code)}>
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
                  </ControlMenuButton>
                );
              })}
            </div>

            <div className="my-2 h-px bg-white/[0.07]" />

            <p className="px-2 text-[10px] font-medium uppercase tracking-[0.2em] text-[#78b7ff]/70">
              {t("appControl.privacySection")}
            </p>
            <div className="mt-1 grid gap-2 p-1">
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
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <div ref={rootRef} className="relative">
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
      </div>

      {menuPanel}

      <NightPickerSheet
        open={historyOpen}
        sessions={sessions}
        loading={loadingSessions && sessions.length === 0}
        onOpenChange={setHistoryOpen}
        onSelectSession={(session) => {
          const uid = userIdRef.current;
          if (uid) {
            void import("@/features/recording/session-prefetch-cache").then(
              ({ warmSessionDetail }) => warmSessionDetail(session.id, uid)
            );
          }
          try {
            router.prefetch(`/journal/${session.id}`);
          } catch {
            // ignore
          }
          setHistoryOpen(false);
          router.push(`/journal/${session.id}`);
        }}
      />

      <PrivacyLegalSheet open={legalOpen} onOpenChange={setLegalOpen} />
    </>
  );
}
