"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, ChevronRight, MoonStar, Sparkles, UserRound } from "lucide-react";
import { InstallPWA } from "@/components/install-pwa";
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
} from "@/components/ui/sidebar";
import { siteConfig } from "@/lib/site-config";

const nav = [
  { href: "/sleep", label: "Uyku", description: "Geceyi başlat", icon: MoonStar },
  { href: "/journal", label: "Günlük", description: "Gece geçmişi", icon: BookOpen },
  { href: "/statistics", label: "İstatistik", description: "Uyku eğilimleri", icon: BarChart3 },
  { href: "/profile", label: "Profil", description: "Hesap ve ayarlar", icon: UserRound },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar
      variant="inset"
      collapsible="icon"
      className="hidden border-r border-white/[0.055] bg-[#060c1a]/80 md:flex"
    >
      <SidebarHeader className="px-3 pb-4 pt-3">
        <Link href="/sleep" className="flex items-center gap-3 rounded-2xl p-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#1769ff] shadow-[0_10px_32px_rgba(23,105,255,.32)]">
            <MoonStar className="h-4.5 w-4.5 text-white" />
          </div>
          <div className="min-w-0 leading-tight group-data-[collapsible=icon]/sidebar-wrapper:hidden">
            <div className="truncate font-semibold tracking-[-0.02em]">{siteConfig.shortName}</div>
            <div className="mt-0.5 truncate text-[9px] uppercase tracking-[0.18em] text-white/25">
              Sleep intelligence
            </div>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[9px] uppercase tracking-[0.2em] text-white/22">
            Gece alanın
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-2">
            <SidebarMenu className="gap-1.5">
              {nav.map((item) => {
                const active =
                  pathname === item.href || (item.href !== "/sleep" && pathname.startsWith(item.href));

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={active}
                      tooltip={item.label}
                      className="h-auto min-h-12 rounded-xl px-3 data-[active=true]:bg-[#155eff]/15 data-[active=true]:text-white data-[active=true]:shadow-[inset_0_0_0_1px_rgba(109,169,255,.12)]"
                      render={<Link href={item.href} />}
                    >
                      <item.icon className={active ? "text-[#7eb5ff]" : "text-white/35"} />
                      <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5 group-data-[collapsible=icon]/sidebar-wrapper:hidden">
                        <span className="text-sm font-medium">{item.label}</span>
                        <span className="text-[10px] font-normal text-white/28">{item.description}</span>
                      </span>
                      {active && (
                        <ChevronRight className="h-3.5 w-3.5 text-[#70aaff]/60 group-data-[collapsible=icon]/sidebar-wrapper:hidden" />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="gap-3 p-3">
        <div className="rounded-2xl border border-[#6da9ff]/12 bg-[#155eff]/8 p-3 group-data-[collapsible=icon]/sidebar-wrapper:hidden">
          <div className="flex items-center gap-2 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5 text-[#78b7ff]" />
            Her gece yeni bir içgörü
          </div>
          <p className="mt-1.5 text-[10px] leading-4 text-white/30">
            Telefonunu yakınına koy; gerisini Cyllene dinlesin.
          </p>
        </div>
        <div className="group-data-[collapsible=icon]/sidebar-wrapper:hidden">
          <InstallPWA />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
