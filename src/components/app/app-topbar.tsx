"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoonStar, Plus } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { AppControlMenu } from "@/components/app/app-control-menu";
import { useRecordingUI } from "@/components/app/recording-ui-context";
import { Button } from "@/components/ui/button";

const titles = [
  { path: "/sleep", eyebrow: "Bu gece", title: "Uyku alanı" },
  { path: "/journal", eyebrow: "Arşivin", title: "Uyku günlüğü" },
  { path: "/statistics", eyebrow: "İçgörüler", title: "İstatistikler" },
  { path: "/profile", eyebrow: "Hesabın", title: "Profil ve ayarlar" },
] as const;

export function AppTopbar() {
  const pathname = usePathname();
  const { isRecording } = useRecordingUI();

  if (isRecording) return null;

  const active = titles.find((item) => pathname.startsWith(item.path)) ?? titles[0];

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.055] bg-[#050a16]/72 backdrop-blur-2xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <SidebarTrigger className="-ml-1 hidden rounded-xl text-white/45 hover:bg-white/[0.06] hover:text-white md:flex" />
        <div className="hidden h-6 w-px bg-white/[0.06] md:block" />
        <div className="min-w-0">
          <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-[#6da9ff]/70">
            {active.eyebrow}
          </p>
          <p className="truncate text-sm font-semibold tracking-[-0.015em]">{active.title}</p>
        </div>
        <div className="flex-1" />
        {pathname !== "/sleep" && (
          <Button
            size="sm"
            className="hidden h-9 rounded-full bg-[#1769ff] px-4 hover:bg-[#2c78ff] sm:flex"
            render={<Link href="/sleep" />}
          >
            <Plus className="h-3.5 w-3.5" />
            Yeni gece
          </Button>
        )}
        <div className="hidden items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-1.5 text-[10px] text-white/35 sm:flex">
          <MoonStar className="h-3 w-3 text-[#72aaff]" />
          Hazır
        </div>
        <AppControlMenu />
      </div>
    </header>
  );
}
