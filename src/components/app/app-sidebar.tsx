"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Mic, Moon } from "lucide-react";
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
import { InstallPWA } from "@/components/install-pwa";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/record", label: "Kayıt", icon: Mic },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="gap-2">
        <Link href="/dashboard" className="flex items-center gap-2 rounded-lg p-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-white/10">
            <Moon className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0 leading-tight group-data-[collapsible=icon]/sidebar-wrapper:hidden">
            <div className="truncate font-semibold">CySleep</div>
            <div className="truncate text-xs text-muted-foreground">
              Sleep Quality Tracker
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
        <div className="group-data-[collapsible=icon]/sidebar-wrapper:hidden">
          <InstallPWA />
        </div>
        <Button
          variant="outline"
          className="group-data-[collapsible=icon]/sidebar-wrapper:hidden"
          render={<Link href="/record" />}
        >
          Bu gece kayda başla
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

