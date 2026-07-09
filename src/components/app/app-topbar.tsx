"use client";

import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserMenu } from "@/components/app/user-menu";
import { useRecordingUI } from "@/components/app/recording-ui-context";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";
import { Moon, Plus } from "lucide-react";

export function AppTopbar() {
  const { isRecording } = useRecordingUI();

  if (isRecording) return null;

  return (
    <div className="sticky top-0 z-30 border-b border-white/5 bg-background/80 backdrop-blur-xl pt-[env(safe-area-inset-top)]">
      <div className="flex h-14 items-center gap-3 px-4">
        <SidebarTrigger className="-ml-1 hidden md:flex" />

        <Link
          href="/"
          prefetch
          className="flex items-center gap-2 text-base font-semibold tracking-tight"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-white/10 md:hidden">
            <Moon className="h-4 w-4 text-primary" />
          </span>
          <span className="md:hidden">{siteConfig.shortName}</span>
          <span className="hidden md:inline">{siteConfig.shortName}</span>
        </Link>

        <div className="hidden flex-1 md:block" />

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="hidden gap-2 md:inline-flex"
            render={<Link href="/sleep" prefetch />}
          >
            <Plus className="h-4 w-4" />
            Uykuya başla
          </Button>
          <UserMenu />
        </div>
      </div>
    </div>
  );
}
