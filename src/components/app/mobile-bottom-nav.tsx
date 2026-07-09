"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, MoonStar, UserRound } from "lucide-react";
import { useRecordingUI } from "@/components/app/recording-ui-context";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/sleep", label: "Uyku", icon: MoonStar },
  { href: "/journal", label: "Günlük", icon: BookOpen },
  { href: "/statistics", label: "Analiz", icon: BarChart3 },
  { href: "/profile", label: "Profil", icon: UserRound },
] as const;

export function MobileBottomNav() {
  const pathname = usePathname();
  const { isRecording } = useRecordingUI();
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  useEffect(() => {
    if (!pendingPath) return;
    const timeout = window.setTimeout(() => setPendingPath(null), 120);
    return () => window.clearTimeout(timeout);
  }, [pathname, pendingPath]);

  if (isRecording) return null;

  return (
    <nav className="fixed inset-x-3 bottom-[max(.75rem,env(safe-area-inset-bottom))] z-50 rounded-[1.35rem] border border-white/[0.09] bg-[#081122]/92 p-1.5 shadow-[0_16px_48px_rgba(0,4,18,.5),inset_0_1px_0_rgba(255,255,255,.06)] backdrop-blur-xl transition-[border-color,background-color,box-shadow,transform] duration-75 ease-out md:hidden">
      <div className="mx-auto flex max-w-lg items-stretch justify-around">
        {tabs.map(({ href, label, icon: Icon }) => {
          const visiblePath = pendingPath ?? pathname;
          const active =
            visiblePath === href || (href !== "/sleep" && visiblePath.startsWith(href));

          return (
            <Link
              key={href}
              href={href}
              prefetch
              onClick={() => setPendingPath(href)}
              onTouchStart={() => setPendingPath(href)}
              className={cn(
                "relative flex min-h-14 flex-1 touch-manipulation flex-col items-center justify-center gap-1 rounded-2xl text-[9px] font-medium transition-[background-color,color,transform] duration-75 ease-out active:scale-[0.94]",
                active
                  ? "bg-[#155eff]/18 text-white shadow-[inset_0_0_0_1px_rgba(109,169,255,.08)]"
                  : "text-white/34 hover:text-white/64"
              )}
            >
              <Icon
                className={cn(
                  "h-[18px] w-[18px] transition-colors duration-75",
                  active && "text-[#78b7ff]"
                )}
              />
              {label}
              {active && (
                <span className="absolute bottom-1 h-0.5 w-4 rounded-full bg-[#4f91ff] transition-[opacity,transform,width] duration-75" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
