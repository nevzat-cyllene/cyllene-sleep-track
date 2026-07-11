"use client";

import Link from "next/link";
import {
  BookOpen,
  Check,
  Languages,
  MoonStar,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UserRound,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const languageOptions = [
  { code: "TR", label: "Türkçe", status: "Aktif", active: true },
  { code: "EN", label: "English", status: "Hazırlandı", active: false },
  { code: "DE", label: "Deutsch", status: "Yakında", active: false },
  { code: "FR", label: "Français", status: "Yakında", active: false },
  { code: "ES", label: "Español", status: "Yakında", active: false },
] as const;

function MenuBadge({ children, active }: { children: string; active?: boolean }) {
  return (
    <span
      className={cn(
        "ml-auto rounded-full border px-2 py-0.5 text-[9px] font-medium",
        active
          ? "border-[#78b7ff]/24 bg-[#155eff]/16 text-[#a9d7ff]"
          : "border-white/[0.07] bg-white/[0.035] text-white/34"
      )}
    >
      {children}
    </span>
  );
}

export function AppControlMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="group relative flex h-10 w-10 touch-manipulation items-center justify-center overflow-hidden rounded-full border border-white/[0.08] bg-white/[0.035] text-white/68 shadow-[inset_0_1px_0_rgba(255,255,255,.055)] transition duration-100 hover:border-[#78b7ff]/20 hover:bg-white/[0.07] hover:text-white active:scale-[0.96]"
        aria-label="Ayarlar ve dil"
      >
        <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,rgba(120,183,255,.14),transparent_58%)] opacity-0 transition duration-150 group-hover:opacity-100" />
        <SlidersHorizontal className="relative h-4.5 w-4.5 text-[#8fc0ff]" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-[min(22rem,calc(100vw-1.25rem))] rounded-[1.45rem] border border-[#8dbdff]/12 bg-[#071124]/96 p-2 text-white shadow-[0_24px_90px_rgba(0,5,24,.58),inset_0_1px_0_rgba(255,255,255,.07)] backdrop-blur-2xl"
      >
        <div className="relative overflow-hidden rounded-[1.1rem] border border-[#8dbdff]/10 bg-[linear-gradient(145deg,rgba(21,94,255,.13),rgba(111,210,255,.045))] p-3">
          <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#6fd2ff]/14 blur-3xl" />
          <div className="relative flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#155eff]/16 text-[#9bd5ff]">
              <Sparkles className="h-4.5 w-4.5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold tracking-[-0.02em]">Cyllene kontrol</p>
              <p className="mt-1 text-xs leading-5 text-white/40">
                Dil, hesap ve gece akışı tek, sakin bir menüde.
              </p>
            </div>
          </div>
        </div>

        <DropdownMenuLabel className="mt-2 px-2 text-[10px] uppercase tracking-[0.2em] text-[#78b7ff]/70">
          Hızlı erişim
        </DropdownMenuLabel>
        <DropdownMenuItem
          render={<Link href="/profile" prefetch />}
          className="min-h-11 rounded-xl px-3 text-white/74 focus:bg-[#155eff]/14 focus:text-white"
        >
          <UserRound className="h-4 w-4 text-[#8fc0ff]" />
          Profil ve ayarlar
        </DropdownMenuItem>
        <DropdownMenuItem
          render={<Link href="/sleep" prefetch />}
          className="min-h-11 rounded-xl px-3 text-white/74 focus:bg-[#155eff]/14 focus:text-white"
        >
          <MoonStar className="h-4 w-4 text-[#8fc0ff]" />
          Yeni gece başlat
        </DropdownMenuItem>
        <DropdownMenuItem
          render={<Link href="/journal" prefetch />}
          className="min-h-11 rounded-xl px-3 text-white/74 focus:bg-[#155eff]/14 focus:text-white"
        >
          <BookOpen className="h-4 w-4 text-[#8fc0ff]" />
          Uyku günlüğü
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-2 bg-white/[0.07]" />

        <DropdownMenuLabel className="px-2 text-[10px] uppercase tracking-[0.2em] text-[#78b7ff]/70">
          Dil
        </DropdownMenuLabel>
        <div className="grid gap-1">
          {languageOptions.map((language) => (
            <DropdownMenuItem
              key={language.code}
              disabled={!language.active}
              className={cn(
                "min-h-11 rounded-xl px-3 text-white/72 focus:bg-[#155eff]/14 focus:text-white",
                !language.active && "opacity-55"
              )}
            >
              <Languages className="h-4 w-4 text-[#8fc0ff]" />
              <span className="flex min-w-0 flex-1 items-center gap-2">
                <span className="w-7 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
                  {language.code}
                </span>
                <span className="truncate">{language.label}</span>
              </span>
              {language.active ? <Check className="h-3.5 w-3.5 text-[#75f2d6]" /> : null}
              <MenuBadge active={language.active}>{language.status}</MenuBadge>
            </DropdownMenuItem>
          ))}
        </div>

        <DropdownMenuSeparator className="my-2 bg-white/[0.07]" />

        <div className="grid gap-2 p-1">
          <div className="flex items-start gap-3 rounded-xl border border-emerald-300/10 bg-emerald-300/[0.045] px-3 py-2.5">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300/80" />
            <div>
              <p className="text-xs font-medium text-white/72">Ham ses cihazında kalır</p>
              <p className="mt-0.5 text-[11px] leading-4 text-white/32">
                Hesabına yalnızca rapor ve özet metrikler senkronize edilir.
              </p>
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
