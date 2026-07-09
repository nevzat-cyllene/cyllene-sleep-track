"use client";

import { siteConfig } from "@/lib/site-config";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, Moon, User } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const nav = [
  { href: "/sleep", label: "Uyku", icon: Moon },
  { href: "/journal", label: "Günlük", icon: BookOpen },
  { href: "/statistics", label: "İstatistik", icon: BarChart3 },
  { href: "/profile", label: "Profil", icon: User },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar variant="inset" collapsible="icon" className="hidden md:flex">
      <SidebarHeader className="gap-2">
        <Link href="/sleep" className="flex items-center gap-2 rounded-lg p-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-white/10">
            <Moon className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0 leading-tight group-data-[collapsible=icon]/sidebar-wrapper:hidden">
            <div className="truncate font-semibold">{siteConfig.shortName}</div>
            <div className="truncate text-xs text-muted-foreground">
              {siteConfig.tagline}
            </div>
          </div>
        </Link>
        <SidebarSeparator />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Uygulama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={active}
                      tooltip={item.label}
                      render={
                        <Link
                          href={item.href}
                          className={cn("flex items-center gap-2")}
                        />
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="gap-2">
        <Button
          variant="outline"
          className="group-data-[collapsible=icon]/sidebar-wrapper:hidden"
          render={<Link href="/sleep" />}
        >
          Uykuya başla
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

