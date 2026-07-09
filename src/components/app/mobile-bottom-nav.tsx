"use client";

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

  if (isRecording) return null;

  return (
    <nav className="fixed inset-x-3 bottom-[max(.75rem,env(safe-area-inset-bottom))] z-50 rounded-[1.35rem] border border-white/[0.09] bg-[#081122]/90 p-1.5 shadow-[0_20px_60px_rgba(0,4,18,.55),inset_0_1px_0_rgba(255,255,255,.06)] backdrop-blur-2xl md:hidden">
      <div className="mx-auto flex max-w-lg items-stretch justify-around">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/sleep" && pathname.startsWith(href));

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-2xl text-[9px] font-medium transition",
                active ? "bg-[#155eff]/14 text-white" : "text-white/32 hover:text-white/60"
              )}
            >
              <Icon className={cn("h-[18px] w-[18px]", active && "text-[#78b7ff]")} />
              {label}
              {active && <span className="absolute bottom-1 h-0.5 w-4 rounded-full bg-[#4f91ff]" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
