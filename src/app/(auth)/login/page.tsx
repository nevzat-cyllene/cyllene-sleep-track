"use client";

import Link from "next/link";
import { ArrowLeft, MoonStar, ShieldCheck } from "lucide-react";
import { LoginForm } from "@/features/auth/login-form";
import { siteConfig } from "@/lib/site-config";
import { useI18n } from "@/i18n/runtime";

export default function LoginPage() {
  const { t } = useI18n();

  return (
    <main className="relative grid min-h-dvh overflow-hidden lg:grid-cols-[.9fr_1.1fr]">
      <section className="relative hidden overflow-hidden border-r border-white/[0.06] bg-[#071127] lg:flex lg:flex-col lg:justify-between lg:p-10">
        <div className="night-stars absolute inset-0 opacity-35" />
        <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-[#1769ff]/22 blur-[110px]" />
        <Link href="/" className="relative flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#6da9ff]/20 bg-[#155eff]/15">
            <MoonStar className="h-4.5 w-4.5 text-[#78b7ff]" />
          </span>
          <span className="font-semibold tracking-tight">{siteConfig.shortName}</span>
        </Link>
        <div className="relative max-w-lg">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-[#78b7ff]">
            {t("auth.loginPage.eyebrow")}
          </p>
          <blockquote className="mt-5 text-balance text-4xl font-medium leading-tight tracking-[-0.045em]">
            {t("auth.loginPage.quote")}
          </blockquote>
          <div className="mt-8 flex items-center gap-3 text-xs text-white/40">
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
            {t("auth.loginPage.privacy")}
          </div>
        </div>
        <p className="relative text-xs text-white/22">© {new Date().getFullYear()} Cyllene</p>
      </section>

      <section className="relative flex min-h-dvh items-center justify-center px-6 py-16 sm:px-10">
        <div className="night-stars pointer-events-none absolute inset-0 opacity-15" />
        <Link
          href="/"
          className="absolute left-6 top-6 flex items-center gap-2 text-xs text-white/40 transition hover:text-white sm:left-10 sm:top-8"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("auth.loginPage.home")}
        </Link>
        <div className="relative w-full max-w-md">
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
