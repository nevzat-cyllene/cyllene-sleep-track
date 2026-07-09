"use client";

import { siteConfig } from "@/lib/site-config";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon } from "lucide-react";
import { UserMenu } from "@/components/app/user-menu";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shell/container";
import { useAuthUser } from "@/hooks/use-auth-user";
import { cn } from "@/lib/utils";

export function MarketingHeader() {
  const pathname = usePathname();
  const { user, ready } = useAuthUser();

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-background/70 backdrop-blur-xl">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2" prefetch>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-white/10">
            <Moon className="h-4 w-4 text-primary" />
          </div>
          <div className="leading-tight">
            <div className="font-semibold tracking-tight">
              <span className="text-gradient">{siteConfig.shortName}</span>
            </div>
            <div className="text-xs text-muted-foreground">{siteConfig.tagline}</div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {ready && user ? (
            <UserMenu />
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className={cn(pathname === "/login" && "bg-muted")}
                render={<Link href="/login" prefetch />}
              >
                Giriş
              </Button>
              <Button size="sm" className="glow-purple" render={<Link href="/signup" prefetch />}>
                Ücretsiz Başla
              </Button>
            </>
          )}
        </div>
      </Container>
    </header>
  );
}
