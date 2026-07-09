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
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
      <div className="mx-auto flex max-w-lg items-stretch justify-around">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || (href !== "/sleep" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors",
                active ? "text-cyllene-cyan" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "text-cyllene-cyan")} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
