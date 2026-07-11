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
import { CylleneTechMark } from "@/components/brand/cyllene-tech-mark";
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
import { useI18n } from "@/i18n/runtime";
import { siteConfig } from "@/lib/site-config";

const primaryNav = [
  { href: "/sleep", key: "sleep", icon: MoonStar },
  { href: "/journal", key: "journal", icon: BookOpen },
  { href: "/statistics", key: "statistics", icon: BarChart3 },
  { href: "/profile", key: "profile", icon: UserRound },
] as const;

const upcomingNav = [
  { key: "routines", icon: Clock3 },
  { key: "audioVault", icon: AudioWaveform },
  { key: "devices", icon: Smartphone },
  { key: "calendar", icon: CalendarDays },
] as const;

const trustNav = [
  { key: "privacy", icon: ShieldCheck },
  { key: "localAnalysis", icon: CloudOff },
  { key: "accountLock", icon: LockKeyhole },
] as const;

const commandTiles = [
  { key: "device", icon: Smartphone },
  { key: "clips", icon: AudioWaveform },
  { key: "rhythm", icon: CalendarDays },
] as const;

export function AppSidebar() {
  const pathname = usePathname();
  const { t } = useI18n();

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
              {t("navigation.sidebar.brandSubtitle")}
            </div>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 pb-2">
        <SidebarGroup className="pb-1">
          <SidebarGroupLabel className="px-3 text-[9px] uppercase tracking-[0.2em] text-white/22">
            {t("navigation.sidebar.nightControl")}
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-2">
            <SidebarMenu className="gap-1.5">
              {primaryNav.map((item) => {
                const active =
                  pathname === item.href || (item.href !== "/sleep" && pathname.startsWith(item.href));
                const label = t(`navigation.primary.${item.key}.label`);
                const description = t(`navigation.primary.${item.key}.description`);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={active}
                      tooltip={label}
                      className="h-auto min-h-12 rounded-xl px-3 data-[active=true]:bg-[#155eff]/15 data-[active=true]:text-white data-[active=true]:shadow-[inset_0_0_0_1px_rgba(109,169,255,.12)]"
                      render={<Link href={item.href} />}
                    >
                      <item.icon className={active ? "text-[#7eb5ff]" : "text-white/35"} />
                      <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5 group-data-[collapsible=icon]/sidebar-wrapper:hidden">
                        <span className="text-sm font-medium">{label}</span>
                        <span className="text-[10px] font-normal text-white/28">{description}</span>
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

        <div className="mx-2 mb-2 rounded-[1.45rem] border border-[#8dbdff]/12 bg-[radial-gradient(circle_at_24%_0%,rgba(111,210,255,.16),transparent_36%),linear-gradient(145deg,rgba(21,94,255,.12),rgba(255,255,255,.025))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,.06)] group-data-[collapsible=icon]/sidebar-wrapper:hidden">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-[#8fc0ff]/70">
                {t("navigation.sidebar.commandPanel")}
              </p>
              <p className="mt-1 text-sm font-medium tracking-[-0.02em]">
                {t("navigation.sidebar.nightFlowReady")}
              </p>
            </div>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1769ff]/18 text-[#8fc0ff]">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-1.5">
            {commandTiles.map((tile) => (
              <div
                key={tile.key}
                className="rounded-2xl border border-white/[0.055] bg-black/10 px-2 py-2"
              >
                <tile.icon className="h-3.5 w-3.5 text-[#78b7ff]/70" />
                <p className="mt-2 truncate text-[9px] text-white/24">
                  {t(`navigation.sidebar.commandTiles.${tile.key}.label`)}
                </p>
                <p className="truncate text-[10px] font-medium text-white/62">
                  {t(`navigation.sidebar.commandTiles.${tile.key}.value`)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <SidebarGroup className="py-1">
          <SidebarGroupLabel className="px-3 text-[9px] uppercase tracking-[0.2em] text-white/22">
            {t("navigation.sidebar.upcoming")}
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-2">
            <SidebarMenu className="gap-1.5">
              {upcomingNav.map((item) => {
                const label = t(`navigation.sidebar.upcomingItems.${item.key}.label`);
                return (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      tooltip={label}
                      type="button"
                      className="h-auto min-h-11 cursor-default rounded-xl border border-[#6da9ff]/10 bg-white/[0.03] px-3 opacity-100 hover:bg-[#155eff]/9 hover:text-white"
                    >
                      <item.icon className="text-[#8fc0ff]/50" />
                      <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5 group-data-[collapsible=icon]/sidebar-wrapper:hidden">
                        <span className="text-sm font-medium text-white/70">{label}</span>
                        <span className="text-[10px] font-normal text-white/34">
                          {t(`navigation.sidebar.upcomingItems.${item.key}.description`)}
                        </span>
                      </span>
                      <span className="rounded-full border border-[#6da9ff]/16 bg-[#155eff]/12 px-2 py-0.5 text-[9px] font-medium text-[#9dccff]/72 group-data-[collapsible=icon]/sidebar-wrapper:hidden">
                        {t(`navigation.sidebar.upcomingItems.${item.key}.badge`)}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="pt-1">
          <SidebarGroupLabel className="px-3 text-[9px] uppercase tracking-[0.2em] text-white/22">
            {t("navigation.sidebar.trustLayer")}
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-2">
            <SidebarMenu className="gap-1.5">
              {trustNav.map((item) => {
                const label = t(`navigation.sidebar.trustItems.${item.key}.label`);
                return (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      tooltip={label}
                      type="button"
                      className="h-auto min-h-10 cursor-default rounded-xl px-3 opacity-100 hover:bg-white/[0.025] hover:text-white"
                    >
                      <item.icon className="text-[#79b7ff]/58" />
                      <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5 group-data-[collapsible=icon]/sidebar-wrapper:hidden">
                        <span className="text-xs font-medium text-white/58">{label}</span>
                        <span className="text-[10px] font-normal text-white/30">
                          {t(`navigation.sidebar.trustItems.${item.key}.description`)}
                        </span>
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="gap-3 p-3">
        <div className="rounded-[1.35rem] border border-[#6da9ff]/12 bg-[linear-gradient(145deg,rgba(21,94,255,.13),rgba(111,210,255,.045))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,.06)] group-data-[collapsible=icon]/sidebar-wrapper:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5 text-[#78b7ff]" />
              {t("navigation.sidebar.tonightReady")}
            </div>
            <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[9px] font-medium text-emerald-300">
              {t("common.live")}
            </span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full w-[72%] rounded-full bg-[linear-gradient(90deg,#1769ff,#74d7ff)]" />
          </div>
          <p className="mt-2 text-[10px] leading-4 text-white/32">
            {t("navigation.sidebar.syncedReportHint")}
          </p>
        </div>
        <div className="group-data-[collapsible=icon]/sidebar-wrapper:hidden md:hidden">
          <InstallPWA />
        </div>
        <CylleneTechMark
          className="pt-1 group-data-[collapsible=icon]/sidebar-wrapper:hidden"
          size="sm"
        />
      </SidebarFooter>
    </Sidebar>
  );
}
