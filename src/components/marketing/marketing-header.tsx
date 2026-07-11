"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, MoonStar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shell/container";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";

export function MarketingHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.055] bg-[#050a16]/75 backdrop-blur-2xl">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#6da9ff]/20 bg-[#155eff]/12 shadow-[inset_0_1px_0_rgba(255,255,255,.07)]">
            <MoonStar className="h-4 w-4 text-[#78b7ff]" />
          </div>
          <div className="leading-tight">
            <div className="font-semibold tracking-[-0.02em]">{siteConfig.shortName}</div>
            <div className="text-[9px] uppercase tracking-[0.2em] text-white/28">
              Sleep intelligence
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-9 rounded-full px-4 text-white/55 hover:bg-white/[0.06] hover:text-white",
              pathname === "/login" && "bg-white/[0.06] text-white"
            )}
            render={<Link href="/login" />}
          >
            Giriş
          </Button>
          <Button
            size="sm"
            className="h-9 rounded-full bg-white px-4 text-[#07122b] hover:bg-[#dceaff]"
            render={<Link href="/signup" />}
          >
            <span className="hidden sm:inline">Ücretsiz başla</span>
            <span className="sm:hidden">Başla</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </Container>
    </header>
  );
}
