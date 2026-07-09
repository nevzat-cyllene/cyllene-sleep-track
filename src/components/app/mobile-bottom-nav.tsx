"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, Moon, User } from "lucide-react";
import { useRecordingUI } from "@/components/app/recording-ui-context";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/sleep", label: "Uyku", icon: Moon },
  { href: "/journal", label: "Günlük", icon: BookOpen },
  { href: "/statistics", label: "İstatistik", icon: BarChart3 },
  { href: "/profile", label: "Profil", icon: User },
] as const;

export function MobileBottomNav() {
  const pathname = usePathname();
  const { isRecording } = useRecordingUI();

  if (isRecording) {
    return null;
  }

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
      style={{ touchAction: "manipulation" }}
    >
      <div className="mx-auto flex max-w-lg items-stretch">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || (href !== "/sleep" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              prefetch
              className={cn(
                "relative flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5",
                "px-1 py-2 text-[10px] font-medium",
                "touch-manipulation select-none [-webkit-tap-highlight-color:transparent]",
                "transition-transform duration-75 active:scale-[0.92]",
                active ? "text-cyllene-cyan" : "text-muted-foreground active:text-white/80"
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-full max-w-[72px] items-center justify-center rounded-2xl transition-colors duration-75",
                  active ? "bg-cyllene-cyan/10" : "active:bg-white/[0.06]"
                )}
              >
                <Icon className={cn("h-[22px] w-[22px]", active && "text-cyllene-cyan")} />
              </span>
              <span className="leading-none">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
