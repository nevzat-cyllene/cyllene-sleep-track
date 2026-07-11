"use client";

import Link from "next/link";
import { ArrowLeft, Check, MoonStar, ShieldCheck } from "lucide-react";
import { SignupForm } from "@/features/auth/signup-form";
import { siteConfig } from "@/lib/site-config";
import { useI18n } from "@/i18n/runtime";

export default function SignupPage() {
  const { t, m } = useI18n();
  const benefits = m<string[]>("auth.signupPage.chips", []);

  return (
    <main className="relative grid min-h-dvh overflow-hidden bg-[#020816] lg:grid-cols-[.9fr_1.1fr]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_20%,rgba(23,105,255,.18),transparent_34%),radial-gradient(circle_at_18%_72%,rgba(111,210,255,.1),transparent_32%)]" />

      <section className="relative hidden overflow-hidden border-r border-[#8dbdff]/10 bg-[linear-gradient(150deg,rgba(8,21,48,.96),rgba(4,11,26,.98)_58%,rgba(2,7,18,.98))] lg:flex lg:flex-col lg:justify-between lg:p-10">
        <div className="night-stars absolute inset-0 opacity-38" />
        <div className="absolute -left-36 top-1/4 h-[28rem] w-[28rem] rounded-full bg-[#1769ff]/28 blur-[120px]" />
        <div className="absolute -right-32 bottom-10 h-80 w-80 rounded-full bg-[#6fd2ff]/12 blur-[100px]" />
        <div className="absolute inset-x-10 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(151,199,255,.5),transparent)]" />
        <Link href="/" className="relative flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#8dbdff]/18 bg-[linear-gradient(135deg,rgba(23,105,255,.24),rgba(111,210,255,.1))] shadow-[0_12px_38px_rgba(23,105,255,.24),inset_0_1px_0_rgba(255,255,255,.12)]">
            <MoonStar className="h-4.5 w-4.5 text-[#78b7ff]" />
          </span>
          <span className="font-semibold tracking-tight">{siteConfig.shortName}</span>
        </Link>
        <div className="relative max-w-lg">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-[#78b7ff]">
            {t("auth.signupPage.eyebrow")}
          </p>
          <h2 className="mt-5 text-balance text-4xl font-medium leading-tight tracking-[-0.045em]">
            {t("auth.signupPage.title")}
          </h2>
          <p className="mt-5 max-w-md text-sm leading-7 text-white/44">{t("auth.signupPage.body")}</p>
          <div className="mt-8 space-y-3">
            {benefits.map((benefit) => (
              <p key={benefit} className="flex items-center gap-3 text-sm text-white/58">
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#8dbdff]/14 bg-[#1769ff]/14 text-[#9bd5ff]">
                  <Check className="h-3 w-3" />
                </span>
                {benefit}
              </p>
            ))}
          </div>
          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-emerald-300/12 bg-emerald-300/[0.06] px-3.5 py-2 text-xs text-emerald-200/72">
            <ShieldCheck className="h-3.5 w-3.5" />
            {t("auth.signupPage.trust")}
          </div>
        </div>
        <p className="relative text-xs text-white/22">© {new Date().getFullYear()} Cyllene</p>
      </section>

      <section className="relative flex min-h-dvh items-center justify-center px-6 py-16 sm:px-10">
        <div className="night-stars pointer-events-none absolute inset-0 opacity-18" />
        <div className="pointer-events-none absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-[#1769ff]/18 blur-[95px]" />
        <div className="pointer-events-none absolute bottom-[-8rem] right-[-7rem] h-96 w-96 rounded-full bg-[#6fd2ff]/10 blur-[110px]" />
        <Link
          href="/"
          className="absolute left-6 top-6 flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.035] px-3 py-2 text-xs text-white/45 backdrop-blur-xl transition hover:border-[#8dbdff]/18 hover:bg-white/[0.06] hover:text-white sm:left-10 sm:top-8"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("auth.signupPage.home")}
        </Link>
        <div className="relative w-full max-w-md">
          <div className="absolute -inset-5 rounded-[2.4rem] bg-[radial-gradient(circle_at_30%_0%,rgba(111,210,255,.12),transparent_38%),radial-gradient(circle_at_80%_80%,rgba(23,105,255,.16),transparent_42%)] blur-2xl" />
          <div className="relative rounded-[2rem] border border-[#8dbdff]/12 bg-[linear-gradient(145deg,rgba(8,20,45,.74),rgba(4,10,24,.88))] p-5 shadow-[0_28px_100px_rgba(10,54,160,.26),inset_0_1px_0_rgba(255,255,255,.075)] backdrop-blur-2xl sm:p-6">
            <SignupForm />
          </div>
        </div>
      </section>
    </main>
  );
}
