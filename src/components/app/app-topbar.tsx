"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoonStar, Plus } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { AppControlMenu } from "@/components/app/app-control-menu";
import { useRecordingUI } from "@/components/app/recording-ui-context";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/runtime";
import { siteConfig } from "@/lib/site-config";

const titlePaths = [
  { path: "/sleep", key: "sleep" },
  { path: "/journal", key: "journal" },
  { path: "/statistics", key: "statistics" },
  { path: "/profile", key: "profile" },
] as const;

export function AppTopbar() {
  const pathname = usePathname();
  const { isRecording } = useRecordingUI();
  const { t } = useI18n();

  if (isRecording) return null;

  const active = titlePaths.find((item) => pathname.startsWith(item.path)) ?? titlePaths[0];

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.055] bg-[#050a16]/72 backdrop-blur-2xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <SidebarTrigger className="-ml-1 hidden rounded-xl text-white/45 hover:bg-white/[0.06] hover:text-white md:flex" />
        <Link
          href="/sleep"
          className="flex shrink-0 items-center gap-2.5 rounded-xl py-1 pr-1 transition hover:opacity-90"
          aria-label={siteConfig.shortName}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#6da9ff]/20 bg-[#155eff]/12">
            <MoonStar className="h-4 w-4 text-[#78b7ff]" />
          </div>
          <span className="hidden text-sm font-semibold tracking-[-0.02em] sm:inline">
            {siteConfig.shortName}
          </span>
        </Link>
        <div className="hidden h-6 w-px bg-white/[0.06] md:block" />
        <div className="min-w-0">
          <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-[#6da9ff]/70">
            {t(`navigation.topbar.${active.key}.eyebrow`)}
          </p>
          <p className="truncate text-sm font-semibold tracking-[-0.015em]">
            {t(`navigation.topbar.${active.key}.title`)}
          </p>
        </div>
        <div className="flex-1" />
        {pathname !== "/sleep" && (
          <Button
            size="sm"
            className="hidden h-9 rounded-full bg-[#1769ff] px-4 hover:bg-[#2c78ff] sm:flex"
            render={<Link href="/sleep" />}
          >
            <Plus className="h-3.5 w-3.5" />
            {t("navigation.topbar.newNight")}
          </Button>
        )}
        <div className="hidden items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-1.5 text-[10px] text-white/35 sm:flex">
          <MoonStar className="h-3 w-3 text-[#72aaff]" />
          {t("navigation.topbar.ready")}
        </div>
        <AppControlMenu />
      </div>
    </header>
  );
}
