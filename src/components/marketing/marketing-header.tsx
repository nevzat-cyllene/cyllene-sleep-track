"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shell/container";
import { cn } from "@/lib/utils";

export function MarketingHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-background/70 backdrop-blur-xl">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-white/10">
            <Moon className="h-4 w-4 text-primary" />
          </div>
          <div className="leading-tight">
            <div className="font-semibold tracking-tight">
              <span className="text-gradient">CySleep</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Privacy-first sleep insights
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className={cn(pathname === "/login" && "bg-muted")}
            render={<Link href="/login" />}
          >
            Giriş
          </Button>
          <Button size="sm" className="glow-purple" render={<Link href="/signup" />}>
            Ücretsiz Başla
          </Button>
        </div>
      </Container>
    </header>
  );
}

