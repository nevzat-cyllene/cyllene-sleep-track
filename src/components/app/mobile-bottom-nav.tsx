"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, BookOpen, MoonStar, UserRound } from "lucide-react";
import { useRecordingUI } from "@/components/app/recording-ui-context";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/sleep", label: "Uyku", icon: MoonStar },
  { href: "/journal", label: "Günlük", icon: BookOpen },
  { href: "/statistics", label: "Analiz", icon: BarChart3 },
  { href: "/profile", label: "Profil", icon: UserRound },
] as const;

function isActivePath(pathname: string, href: string) {
  return pathname === href || (href !== "/sleep" && pathname.startsWith(href));
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { isRecording } = useRecordingUI();
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const pushFrameRef = useRef<number | null>(null);

  const warmRoute = useCallback(
    (href: string) => {
      try {
        router.prefetch(href);
      } catch {
        // Prefetch can be ignored by the runtime in edge cases; navigation still works.
      }
    },
    [router]
  );

  useEffect(() => {
    tabs.forEach(({ href }) => warmRoute(href));
  }, [warmRoute]);

  useEffect(() => {
    return () => {
      if (pushFrameRef.current !== null) {
        window.cancelAnimationFrame(pushFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!pendingPath) return;

    if (isActivePath(pathname, pendingPath)) {
      const done = window.setTimeout(() => setPendingPath(null), 80);
      return () => window.clearTimeout(done);
    }

    const timeout = window.setTimeout(() => setPendingPath(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [pathname, pendingPath]);

  const navigate = useCallback(
    (href: string) => {
      warmRoute(href);

      if (isActivePath(pathname, href)) {
        setPendingPath(null);
        return;
      }

      flushSync(() => setPendingPath(href));
      if (pushFrameRef.current !== null) {
        window.cancelAnimationFrame(pushFrameRef.current);
      }
      pushFrameRef.current = window.requestAnimationFrame(() => {
        pushFrameRef.current = null;
        router.push(href, { scroll: false });
      });
    },
    [pathname, router, warmRoute]
  );

  if (isRecording) return null;

  const visiblePath = pendingPath ?? pathname;
  const isNavigating = Boolean(pendingPath && !isActivePath(pathname, pendingPath));
  const pendingTab = tabs.find((tab) => tab.href === pendingPath);
  const PendingIcon = pendingTab?.icon;

  return (
    <>
      {isNavigating && pendingTab && PendingIcon && (
        <div className="pointer-events-none fixed inset-x-3 bottom-[calc(6.25rem+env(safe-area-inset-bottom))] top-[max(4.75rem,env(safe-area-inset-top))] z-40 md:hidden">
          <div className="relative h-full overflow-hidden rounded-[2rem] border border-[#8dbdff]/14 bg-[#050c18]/82 p-4 shadow-[0_24px_90px_rgba(0,4,18,.55),inset_0_1px_0_rgba(255,255,255,.07)] backdrop-blur-2xl animate-in fade-in-0 zoom-in-95 duration-100">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(23,105,255,.16),transparent_36%)]" />
            <div className="relative">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#155eff]/18 text-[#8fc0ff] shadow-[0_12px_32px_rgba(23,105,255,.22)]">
                  <PendingIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-[#78b7ff]/72">
                    Cyllene Flow
                  </p>
                  <p className="mt-1 text-sm font-medium">{pendingTab.label} hazırlanıyor</p>
                </div>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-white/[0.055]">
                <div className="h-full w-2/3 rounded-full bg-[linear-gradient(90deg,#1769ff,#6fd2ff)] animate-pulse" />
              </div>
              <div className="mt-5 grid gap-3">
                {[0, 1, 2].map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.35rem] border border-white/[0.055] bg-white/[0.035] p-4"
                  >
                    <div className="h-3 w-2/3 rounded-full bg-white/[0.08]" />
                    <div className="mt-3 h-2.5 w-1/2 rounded-full bg-white/[0.045]" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <nav
        aria-busy={isNavigating}
        className="fixed inset-x-3 bottom-[max(.75rem,env(safe-area-inset-bottom))] z-50 overflow-hidden rounded-[1.35rem] border border-white/[0.09] bg-[#081122]/94 p-1.5 shadow-[0_16px_48px_rgba(0,4,18,.5),inset_0_1px_0_rgba(255,255,255,.06)] backdrop-blur-xl transition-[border-color,background-color,box-shadow,transform] duration-75 ease-out [transform:translateZ(0)] md:hidden"
      >
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-x-6 top-0 h-px origin-left rounded-full bg-gradient-to-r from-transparent via-[#62a4ff] to-transparent opacity-0 transition-[opacity,transform] duration-100",
            isNavigating && "opacity-100 animate-pulse"
          )}
        />
        <div className="mx-auto flex max-w-lg items-stretch justify-around">
          {tabs.map(({ href, label, icon: Icon }) => {
            const active = isActivePath(visiblePath, href);
            const pending = pendingPath === href && !isActivePath(pathname, href);

            return (
              <Link
                key={href}
                href={href}
                prefetch
                scroll={false}
                aria-current={active ? "page" : undefined}
                onClick={(event) => {
                  if (
                    event.defaultPrevented ||
                    event.button !== 0 ||
                    event.metaKey ||
                    event.altKey ||
                    event.ctrlKey ||
                    event.shiftKey
                  ) {
                    return;
                  }

                  event.preventDefault();
                  navigate(href);
                }}
                onPointerDown={() => {
                  warmRoute(href);
                  if (!isActivePath(pathname, href)) {
                    flushSync(() => setPendingPath(href));
                  }
                }}
                onPointerEnter={() => warmRoute(href)}
                onFocus={() => warmRoute(href)}
                className={cn(
                  "relative flex min-h-14 flex-1 touch-manipulation flex-col items-center justify-center gap-1 rounded-2xl text-[9px] font-medium transition-[background-color,color,transform,box-shadow] duration-75 ease-out will-change-transform active:scale-[0.94]",
                  active
                    ? "bg-[#155eff]/20 text-white shadow-[0_10px_28px_rgba(21,94,255,.18),inset_0_0_0_1px_rgba(109,169,255,.1)]"
                    : "text-white/34 hover:text-white/64"
                )}
              >
                <Icon
                  className={cn(
                    "h-[18px] w-[18px] transition-[color,transform,opacity] duration-75",
                    pending && "scale-95 opacity-80",
                    active && "text-[#78b7ff]"
                  )}
                />
                {label}
                {active && (
                  <span
                    className={cn(
                      "absolute bottom-1 h-0.5 rounded-full bg-[#4f91ff] transition-[opacity,transform,width] duration-75",
                      pending ? "w-7 animate-pulse" : "w-4"
                    )}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
