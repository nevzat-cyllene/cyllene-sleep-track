"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AudioWaveform,
  BarChart3,
  BookOpen,
  CalendarDays,
  ChevronRight,
  Clock3,
  CloudOff,
  LockKeyhole,
  MoonStar,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserRound,
} from "lucide-react";
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

const primaryNav = [
  { href: "/sleep", label: "Uyku", description: "Geceyi başlat", icon: MoonStar },
  { href: "/journal", label: "Günlük", description: "Rapor arşivi", icon: BookOpen },
  { href: "/statistics", label: "İstatistik", description: "Uyku eğilimleri", icon: BarChart3 },
  { href: "/profile", label: "Profil", description: "Hesap ve cihazlar", icon: UserRound },
];

const upcomingNav = [
  { label: "Rutinler", description: "Akşam hazırlığı", badge: "Yakında", icon: Clock3 },
  { label: "Ses kasası", description: "Yerel klipler", badge: "Cihaz", icon: AudioWaveform },
  { label: "Cihazlar", description: "Telefon eşleşmeleri", badge: "Beta", icon: Smartphone },
  { label: "Takvim", description: "Haftalık ritim", badge: "Plan", icon: CalendarDays },
] as const;

const trustNav = [
  { label: "Mahremiyet", description: "Ham ses yüklenmez", icon: ShieldCheck },
  { label: "Yerel analiz", description: "Klip cihazda kalır", icon: CloudOff },
  { label: "Hesap kilidi", description: "Güvenli oturum", icon: LockKeyhole },
] as const;

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar
      variant="inset"
      collapsible="icon"
      className="hidden border-r border-white/[0.055] bg-[#060c1a]/80 md:flex"
    >
      <SidebarHeader className="px-3 pb-3 pt-3">
        <Link
          href="/sleep"
          className="group flex items-center gap-3 rounded-[1.35rem] border border-[#8dbdff]/10 bg-white/[0.025] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,.04)] transition hover:border-[#8dbdff]/18 hover:bg-white/[0.04]"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#1f7aff,#69d5ff)] shadow-[0_10px_32px_rgba(23,105,255,.32)]">
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

      <SidebarContent className="px-2 pb-2">
        <SidebarGroup className="pb-1">
          <SidebarGroupLabel className="px-3 text-[9px] uppercase tracking-[0.2em] text-white/22">
            Gece kontrolü
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-2">
            <SidebarMenu className="gap-1.5">
              {primaryNav.map((item) => {
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

        <SidebarGroup className="py-1">
          <SidebarGroupLabel className="px-3 text-[9px] uppercase tracking-[0.2em] text-white/22">
            Yakında
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-2">
            <SidebarMenu className="gap-1.5">
              {upcomingNav.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    tooltip={item.label}
                    disabled
                    className="h-auto min-h-11 rounded-xl border border-white/[0.045] bg-white/[0.018] px-3 opacity-100 disabled:opacity-100"
                  >
                    <item.icon className="text-white/28" />
                    <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5 group-data-[collapsible=icon]/sidebar-wrapper:hidden">
                      <span className="text-sm font-medium text-white/55">{item.label}</span>
                      <span className="text-[10px] font-normal text-white/24">{item.description}</span>
                    </span>
                    <span className="rounded-full border border-[#6da9ff]/12 bg-[#155eff]/8 px-2 py-0.5 text-[9px] font-medium text-[#89bdff]/55 group-data-[collapsible=icon]/sidebar-wrapper:hidden">
                      {item.badge}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="pt-1">
          <SidebarGroupLabel className="px-3 text-[9px] uppercase tracking-[0.2em] text-white/22">
            Güven katmanı
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-2">
            <SidebarMenu className="gap-1.5">
              {trustNav.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    tooltip={item.label}
                    disabled
                    className="h-auto min-h-10 rounded-xl px-3 opacity-100 disabled:opacity-100"
                  >
                    <item.icon className="text-[#79b7ff]/45" />
                    <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5 group-data-[collapsible=icon]/sidebar-wrapper:hidden">
                      <span className="text-xs font-medium text-white/46">{item.label}</span>
                      <span className="text-[10px] font-normal text-white/22">{item.description}</span>
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="gap-3 p-3">
        <div className="rounded-[1.35rem] border border-[#6da9ff]/12 bg-[linear-gradient(145deg,rgba(21,94,255,.13),rgba(111,210,255,.045))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,.06)] group-data-[collapsible=icon]/sidebar-wrapper:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5 text-[#78b7ff]" />
              Bu gece hazır
            </div>
            <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[9px] font-medium text-emerald-300">
              Live
            </span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full w-[72%] rounded-full bg-[linear-gradient(90deg,#1769ff,#74d7ff)]" />
          </div>
          <p className="mt-2 text-[10px] leading-4 text-white/32">
            Ham ses cihazında kalır. Sabah raporu hesabınla senkron görünür.
          </p>
        </div>
        <div className="group-data-[collapsible=icon]/sidebar-wrapper:hidden">
          <InstallPWA />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
