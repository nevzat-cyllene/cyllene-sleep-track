"use client";

import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeMenu } from "@/components/app/theme-menu";
import { UserMenu } from "@/components/app/user-menu";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function AppTopbar() {
  return (
    <div className="sticky top-0 z-30 border-b border-white/5 bg-background/70 backdrop-blur-xl">
      <div className="flex h-14 items-center gap-2 px-3 sm:px-4">
        <SidebarTrigger className="-ml-1" />
        <div className="flex-1" />
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          render={<Link href="/record" />}
        >
          <Plus className="h-4 w-4" />
          Yeni kayıt
        </Button>
        <ThemeMenu />
        <UserMenu />
      </div>
    </div>
  );
}

