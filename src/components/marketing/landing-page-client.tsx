"use client";

import Link from "next/link";
import {
  ArrowRight,
  AudioWaveform,
  Check,
  ChevronRight,
  CloudOff,
  Headphones,
  LockKeyhole,
  Mic2,
  MoonStar,
  ShieldCheck,
  Sparkles,
  Waves,
} from "lucide-react";
import { CylleneTechMark } from "@/components/brand/cyllene-tech-mark";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { LandingFooterLinks } from "@/components/marketing/landing-footer-links";
import { Container } from "@/components/shell/container";
import { Button } from "@/components/ui/button";
import { useAuthUser } from "@/hooks/use-auth-user";
import { useI18n } from "@/i18n/runtime";
import { siteConfig } from "@/lib/site-config";

const featureIcons = [AudioWaveform, Sparkles, Headphones] as const;
const featureNumbers = ["01", "02", "03"] as const;

const sleepStageLayout = [
  { key: "light" as const, left: "2%", width: "18%", className: "from-[#4f7dff]/45 to-[#79b7ff]/65" },
  { key: "deep" as const, left: "23%", width: "24%", className: "from-[#1769ff]/80 to-[#69d5ff]/85" },
  { key: "rem" as const, left: "51%", width: "18%", className: "from-[#8f7cff]/65 to-[#70d7ff]/75" },
  { key: "light" as const, left: "72%", width: "24%", className: "from-[#2f6dff]/45 to-[#91c1ff]/65" },
] as const;

const eventConfig = [
  { key: "snoreCluster" as const, time: "01:14", tone: "bg-[#79b7ff]" },
  { key: "coughSeries" as const, time: "03:42", tone: "bg-[#75f2d6]" },
  { key: "suddenNoise" as const, time: "06:08", tone: "bg-[#9c8cff]" },
] as const;

type MarketingFeature = { title: string; description: string };
type EventSample = { title: string; meta: string };
type EventSamples = {
  snoreCluster: EventSample;
  coughSeries: EventSample;
  suddenNoise: EventSample;
};

export function LandingPageClient() {
  const { t, m } = useI18n();
  const { user, ready } = useAuthUser();

  const features = m<MarketingFeature[]>("marketing.features", []);
  const eventSamples = m<EventSamples>("marketing.eventSamples", {
    snoreCluster: { title: "", meta: "" },
    coughSeries: { title: "", meta: "" },
    suddenNoise: { title: "", meta: "" },
  });
  const heroTitleLines = m<string[]>("marketing.hero.titleLines", []);
  const heroAssurances = m<string[]>("marketing.hero.assurances", []);

  const sleepMetrics = [
    {
      label: t("marketing.reportPreview.sleepScore"),
      value: "86",
      meta: t("marketing.reportPreview.calmerMeta"),
    },
    {
      label: t("marketing.reportPreview.totalSleep"),
      value: t("marketing.reportPreview.totalSleepValue"),
      meta: "00:18—07:56",
    },
    {
      label: t("marketing.reportPreview.soundTrace"),
      value: "14",
      meta: t("marketing.reportPreview.markedMoment"),
    },
  ] as const;

  const sleepStages = sleepStageLayout.map((stage, index) => ({
    ...stage,
    label:
      stage.key === "deep"
        ? t("marketing.reportPreview.stageDeep")
        : stage.key === "rem"
          ? t("marketing.reportPreview.stageRem")
          : t("marketing.reportPreview.stageLight"),
    id: `${stage.key}-${index}`,
  }));

  return (
    <div className="min-h-screen overflow-x-hidden">
      <MarketingHeader />

      <main>
        <section className="relative">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="night-stars absolute inset-0 opacity-25" />
            <div className="absolute left-1/2 top-8 hidden h-[34rem] w-[52rem] -translate-x-1/2 rounded-full bg-[#185cff]/12 blur-[140px] sm:block" />
            <div className="absolute right-[-12rem] top-36 hidden h-[30rem] w-[30rem] rounded-full bg-[#6fd2ff]/10 blur-[130px] sm:block" />
          </div>

          <Container className="relative grid min-h-[calc(100svh-4rem)] items-center gap-8 py-6 pb-10 sm:gap-9 sm:py-12 lg:grid-cols-[.98fr_1.02fr] lg:py-14">
            <div className="max-w-xl sm:max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#6da9ff]/20 bg-[#155eff]/10 px-3.5 py-2 text-xs font-medium text-[#91c1ff] shadow-[inset_0_1px_0_rgba(255,255,255,.06)] sm:mb-5">
                <span className="relative flex h-2 w-2">
                  <span className="relative h-2 w-2 rounded-full bg-[#6da9ff]" />
                </span>
                {t("marketing.hero.eyebrow")}
              </div>

              <h1 className="text-balance text-[clamp(2.45rem,11vw,5.45rem)] font-medium leading-[0.92] tracking-[-0.065em] sm:text-[clamp(2.75rem,6.4vw,5.45rem)] sm:leading-[0.9]">
                {heroTitleLines.map((line, index) => (
                  <span
                    key={`${line}-${index}`}
                    className={`block ${index >= heroTitleLines.length - 2 ? "text-gradient" : ""}`}
                  >
                    {line}
                  </span>
                ))}
              </h1>

              <p className="mt-4 max-w-lg text-pretty text-sm leading-6 text-muted-foreground sm:mt-5 sm:text-base sm:leading-7">
                {t("marketing.hero.body")}
              </p>

              <div className="mt-5 flex flex-col gap-3 sm:mt-6 sm:flex-row">
                {ready && user ? (
                  <>
                    <Button
                      size="lg"
                      className="glow-purple h-12 rounded-full bg-[#1769ff] px-6 hover:bg-[#2d79ff] sm:h-13"
                      render={<Link href="/sleep" />}
                    >
                      {t("marketing.hero.loggedInCta")}
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-12 rounded-full border-white/10 bg-white/[0.035] px-6 backdrop-blur-xl hover:bg-white/[0.07] sm:h-13"
                      render={<Link href="/journal" />}
                    >
                      {t("marketing.hero.journalCta")}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="lg"
                      className="glow-purple h-12 rounded-full bg-[#1769ff] px-6 hover:bg-[#2d79ff] sm:h-13"
                      render={<Link href="/signup" />}
                    >
                      {t("marketing.hero.primaryCta")}
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-12 rounded-full border-white/10 bg-white/[0.035] px-6 backdrop-blur-xl hover:bg-white/[0.07] sm:h-13"
                      render={<Link href="/login" />}
                    >
                      {t("marketing.hero.secondaryCta")}
                    </Button>
                  </>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2.5 text-xs text-muted-foreground sm:mt-5">
                {heroAssurances.map((item) => (
                  <span key={item} className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300">
                      <Check className="h-3 w-3" />
                    </span>
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative mx-auto hidden w-full max-w-[35rem] md:block lg:mx-0 lg:ml-auto">
              <div className="absolute -inset-8 rounded-full bg-[#1c67ff]/14 blur-[110px]" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.075] bg-[linear-gradient(145deg,rgba(7,17,39,.96),rgba(4,10,24,.98)_58%,rgba(3,7,18,.98))] p-4 shadow-[0_30px_120px_rgba(20,82,190,.24),inset_0_1px_0_rgba(255,255,255,.075)] backdrop-blur-2xl">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(105,181,255,.14),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(23,105,255,.12),transparent_34%)]" />
                <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(158,205,255,.42),transparent)]" />

                <div className="relative flex items-center justify-between rounded-[1.25rem] border border-white/[0.06] bg-white/[0.035] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#1769ff,#6fd2ff)] shadow-[0_10px_34px_rgba(23,105,255,.35)]">
                      <MoonStar className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold tracking-[-0.02em]">
                        {t("marketing.reportPreview.title")}
                      </p>
                      <p className="text-xs text-white/36">{t("marketing.reportPreview.subtitle")}</p>
                    </div>
                  </div>
                  <span className="rounded-full border border-emerald-300/15 bg-emerald-300/8 px-2.5 py-1 text-[10px] font-medium text-emerald-300">
                    {t("marketing.reportPreview.privacyBadge")}
                  </span>
                </div>

                <div className="relative mt-4 grid gap-3 lg:grid-cols-[1.05fr_.72fr]">
                  <section className="rounded-[1.55rem] border border-[#8dbdff]/12 bg-[linear-gradient(150deg,rgba(14,35,77,.72),rgba(7,17,39,.86))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.055)]">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.22em] text-[#91c1ff]/65">
                          {t("marketing.reportPreview.sleepScore")}
                        </p>
                        <div className="mt-2 flex items-end gap-2">
                          <span className="text-5xl font-medium leading-none tracking-[-0.08em]">86</span>
                          <span className="pb-1 text-sm text-white/38">/100</span>
                        </div>
                      </div>
                      <div className="rounded-full border border-[#8dbdff]/12 bg-[#1769ff]/10 px-3 py-1.5 text-[10px] text-[#a9d7ff]">
                        {t("marketing.reportPreview.calmerThanPrevious")}
                      </div>
                    </div>

                    <div className="mt-5 h-36 overflow-hidden rounded-[1.15rem] border border-white/[0.055] bg-[#06142f]/78">
                      <div className="relative h-full">
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] bg-[size:100%_33%,25%_100%] opacity-45" />
                        <div className="absolute inset-x-4 top-3 flex justify-between text-[9px] text-white/24">
                          <span>00:00</span>
                          <span>02:00</span>
                          <span>04:00</span>
                          <span>06:00</span>
                          <span>08:00</span>
                        </div>
                        <svg
                          className="absolute inset-x-4 bottom-5 top-8 h-[5.8rem] w-[calc(100%-2rem)]"
                          viewBox="0 0 420 110"
                          preserveAspectRatio="none"
                          aria-hidden="true"
                        >
                          <defs>
                            <linearGradient id="landing-saas-signal" x1="0" x2="1" y1="0" y2="0">
                              <stop offset="0%" stopColor="#326bff" stopOpacity="0.28" />
                              <stop offset="46%" stopColor="#6fd2ff" stopOpacity="0.95" />
                              <stop offset="100%" stopColor="#9c8cff" stopOpacity="0.55" />
                            </linearGradient>
                          </defs>
                          <path
                            d="M0 74 C38 62 62 68 92 51 C126 31 162 38 196 58 C232 80 258 84 292 62 C326 40 356 42 420 25"
                            fill="none"
                            stroke="url(#landing-saas-signal)"
                            strokeLinecap="round"
                            strokeWidth="4.5"
                          />
                          <path
                            d="M0 88 C48 82 86 84 130 72 C178 60 220 88 266 82 C318 76 352 52 420 58"
                            fill="none"
                            stroke="#91c1ff"
                            strokeLinecap="round"
                            strokeOpacity=".16"
                            strokeWidth="2"
                          />
                        </svg>
                        <span className="absolute left-[22%] top-[56%] h-2.5 w-2.5 rounded-full border border-[#9dd7ff] bg-[#6fd2ff] shadow-[0_0_18px_rgba(111,210,255,.78)]" />
                        <span className="absolute left-[61%] top-[41%] h-2.5 w-2.5 rounded-full border border-[#b8adff] bg-[#8f7cff] shadow-[0_0_18px_rgba(143,124,255,.68)]" />
                        <span className="absolute left-[84%] top-[29%] h-2.5 w-2.5 rounded-full border border-[#9dd7ff] bg-[#6fd2ff] shadow-[0_0_18px_rgba(111,210,255,.78)]" />
                      </div>
                    </div>
                  </section>

                  <aside className="grid gap-3">
                    {sleepMetrics.slice(1).map((metric) => (
                      <div
                        key={metric.label}
                        className="rounded-[1.35rem] border border-white/[0.065] bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.045)]"
                      >
                        <p className="text-[10px] uppercase tracking-[0.18em] text-white/32">{metric.label}</p>
                        <p className="mt-2 text-2xl font-medium tracking-[-0.055em] text-white">{metric.value}</p>
                        <p className="mt-1 text-[10px] text-[#8fc0ff]/68">{metric.meta}</p>
                      </div>
                    ))}
                    <div className="rounded-[1.35rem] border border-emerald-300/12 bg-[linear-gradient(145deg,rgba(22,163,116,.105),rgba(21,94,255,.06))] p-4">
                      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-emerald-300/72">
                        <LockKeyhole className="h-3.5 w-3.5" />
                        {t("marketing.reportPreview.privacyLabel")}
                      </div>
                      <p className="mt-3 text-sm leading-5 text-white/62">
                        {t("marketing.reportPreview.notAudioFile")}
                      </p>
                    </div>
                  </aside>
                </div>

                <div className="relative mt-3 rounded-[1.45rem] border border-white/[0.065] bg-white/[0.035] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{t("marketing.reportPreview.detectedMoments")}</p>
                      <p className="mt-0.5 text-xs text-white/34">
                        {t("marketing.reportPreview.playableEvents")}
                      </p>
                    </div>
                    <span className="flex items-center gap-1.5 rounded-full bg-[#1769ff]/10 px-2.5 py-1 text-[10px] text-[#9bd5ff]">
                      <AudioWaveform className="h-3 w-3" />
                      {t("marketing.reportPreview.eventCount")}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2">
                    {eventConfig.map((event) => {
                      const sample = eventSamples[event.key];
                      return (
                        <div
                          key={event.key}
                          className="flex items-center gap-3 rounded-2xl border border-white/[0.045] bg-black/10 px-3 py-2.5"
                        >
                          <span
                            className={`h-2 w-2 shrink-0 rounded-full ${event.tone} shadow-[0_0_18px_currentColor]`}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-3">
                              <p className="truncate text-xs font-medium text-white/78">{sample.title}</p>
                              <span className="text-[10px] tabular-nums text-white/34">{event.time}</span>
                            </div>
                            <p className="mt-0.5 text-[10px] text-white/30">{sample.meta}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-5 flex items-center gap-3 rounded-2xl border border-[#8dbdff]/14 bg-[linear-gradient(135deg,rgba(18,48,102,.9),rgba(6,16,38,.94))] px-4 py-3 shadow-[0_18px_55px_rgba(17,88,210,.24),inset_0_1px_0_rgba(255,255,255,.08)] backdrop-blur-2xl">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#155eff]/14">
                  <Sparkles className="h-4 w-4 text-[#8fc0ff]" />
                </div>
                <div>
                  <p className="text-xs font-medium">{t("marketing.reportPreview.reportReady")}</p>
                  <p className="text-[10px] text-white/35">{t("marketing.reportPreview.reportReadyMeta")}</p>
                </div>
              </div>
            </div>

            <div className="hidden">
              <div className="absolute -inset-10 rounded-full bg-[#185cff]/18 blur-[100px]" />
              <div className="relative overflow-hidden rounded-[2.15rem] border border-[#8dbdff]/16 bg-[radial-gradient(circle_at_18%_0%,rgba(111,210,255,.18),transparent_34%),linear-gradient(145deg,rgba(22,49,96,.92),rgba(8,20,46,.94)_54%,rgba(4,10,24,.96)_100%)] p-4 shadow-[0_28px_120px_rgba(30,112,255,.26),inset_0_1px_0_rgba(255,255,255,.09)] backdrop-blur-2xl sm:p-5">
                <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#6fd2ff]/16 blur-[70px]" />
                <div className="pointer-events-none absolute -left-20 bottom-10 h-56 w-56 rounded-full bg-[#235dff]/18 blur-[80px]" />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(145,193,255,.45),transparent)]" />

                <div className="relative flex items-center justify-between border-b border-white/[0.07] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#1f7aff,#69d5ff)] shadow-[0_8px_30px_rgba(23,105,255,.35)]">
                      <MoonStar className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold tracking-[-0.02em]">
                        {t("marketing.reportPreview.nightReport")}
                      </p>
                      <p className="text-xs text-white/35">{t("marketing.reportPreview.sampleDateRange")}</p>
                    </div>
                  </div>
                  <span className="rounded-full border border-emerald-400/15 bg-emerald-400/8 px-2.5 py-1 text-[10px] font-medium text-emerald-300">
                    {t("marketing.reportPreview.processedOnDevice")}
                  </span>
                </div>

                <div className="relative mt-4 grid gap-2.5 sm:grid-cols-3">
                  {sleepMetrics.map((metric) => (
                    <div
                      key={metric.label}
                      className="rounded-[1.15rem] border border-white/[0.07] bg-white/[0.045] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,.055)]"
                    >
                      <p className="text-[10px] uppercase tracking-[0.16em] text-white/30">{metric.label}</p>
                      <p className="mt-2 text-xl font-medium tracking-[-0.04em] text-white">{metric.value}</p>
                      <p className="mt-1 text-[10px] text-[#8fc0ff]/70">{metric.meta}</p>
                    </div>
                  ))}
                </div>

                <div className="relative mt-3 rounded-[1.55rem] border border-[#8dbdff]/12 bg-[linear-gradient(145deg,rgba(10,31,72,.82),rgba(5,14,34,.78))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.055)]">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">{t("marketing.reportPreview.sleepSignature")}</p>
                      <p className="mt-0.5 text-xs text-white/35">{t("marketing.reportPreview.signatureMeta")}</p>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-white/[0.05] px-2.5 py-1 text-[10px] text-white/45">
                      <AudioWaveform className="h-3 w-3 text-[#6da9ff]" />
                      {t("marketing.reportPreview.liveAnalysis")}
                    </div>
                  </div>

                  <div className="relative mt-5 h-44 overflow-hidden rounded-[1.25rem] border border-white/[0.055] bg-[#06142f]/78">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] bg-[size:100%_25%,20%_100%] opacity-50" />
                    <div className="absolute inset-x-5 top-5 flex justify-between text-[10px] text-white/25">
                      <span>00:00</span>
                      <span>02:00</span>
                      <span>04:00</span>
                      <span>06:00</span>
                      <span>08:00</span>
                    </div>

                    <svg
                      className="absolute inset-x-4 bottom-7 top-9 h-[7.5rem] w-[calc(100%-2rem)]"
                      viewBox="0 0 420 130"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <defs>
                        <linearGradient id="sleep-signal-gradient" x1="0" x2="1" y1="0" y2="0">
                          <stop offset="0%" stopColor="#3152ff" stopOpacity="0.25" />
                          <stop offset="48%" stopColor="#6fd2ff" stopOpacity="0.95" />
                          <stop offset="100%" stopColor="#8f7cff" stopOpacity="0.55" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0 82 C42 58 68 78 98 56 C128 34 160 42 190 64 C226 90 254 98 286 70 C318 42 350 48 420 32"
                        fill="none"
                        stroke="url(#sleep-signal-gradient)"
                        strokeLinecap="round"
                        strokeWidth="5"
                      />
                      <path
                        d="M0 96 C48 88 88 92 132 78 C182 62 218 94 262 88 C318 80 350 54 420 62"
                        fill="none"
                        stroke="#91c1ff"
                        strokeLinecap="round"
                        strokeOpacity=".18"
                        strokeWidth="2"
                      />
                    </svg>

                    <span className="absolute left-[19%] top-[58%] h-2.5 w-2.5 rounded-full border border-[#9dd7ff] bg-[#6fd2ff] shadow-[0_0_22px_rgba(111,210,255,.85)]" />
                    <span className="absolute left-[57%] top-[43%] h-2.5 w-2.5 rounded-full border border-[#b8adff] bg-[#8f7cff] shadow-[0_0_22px_rgba(143,124,255,.75)]" />
                    <span className="absolute left-[82%] top-[30%] h-2.5 w-2.5 rounded-full border border-[#9dd7ff] bg-[#6fd2ff] shadow-[0_0_22px_rgba(111,210,255,.85)]" />
                  </div>

                  <div className="relative mt-4 h-10 rounded-full border border-white/[0.06] bg-white/[0.035] p-1">
                    {sleepStages.map((stage) => (
                      <div
                        key={stage.id}
                        className={`absolute inset-y-1 rounded-full bg-gradient-to-r ${stage.className}`}
                        style={{ left: stage.left, width: stage.width }}
                      />
                    ))}
                  </div>
                  <div className="mt-2 flex justify-between px-1 text-[10px] text-white/26">
                    {sleepStages.map((stage) => (
                      <span key={`${stage.id}-label`}>{stage.label}</span>
                    ))}
                  </div>
                </div>

                <div className="relative mt-3 grid gap-3 sm:grid-cols-[1fr_.9fr]">
                  <div className="rounded-[1.35rem] border border-[#8dbdff]/12 bg-white/[0.035] p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{t("marketing.reportPreview.detectedMoments")}</p>
                      <span className="flex items-center gap-1 rounded-full bg-white/[0.05] px-2 py-0.5 text-[10px] text-white/38">
                        <Waves className="h-3 w-3 text-[#6da9ff]" />
                        {t("marketing.reportPreview.eventCount")}
                      </span>
                    </div>
                    <div className="mt-3 space-y-2">
                      {eventConfig.map((event) => {
                        const sample = eventSamples[event.key];
                        return (
                          <div
                            key={event.key}
                            className="flex items-center gap-3 rounded-2xl bg-black/10 px-3 py-2"
                          >
                            <span
                              className={`h-2 w-2 shrink-0 rounded-full ${event.tone} shadow-[0_0_18px_currentColor]`}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <p className="truncate text-xs font-medium text-white/78">{sample.title}</p>
                                <span className="text-[10px] tabular-nums text-white/32">{event.time}</span>
                              </div>
                              <p className="mt-0.5 text-[10px] text-white/30">{sample.meta}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-[1.35rem] border border-emerald-300/12 bg-[linear-gradient(145deg,rgba(22,163,116,.12),rgba(21,94,255,.07))] p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/10">
                      <ShieldCheck className="h-4.5 w-4.5 text-emerald-300" />
                    </div>
                    <p className="mt-4 text-sm font-medium">
                      {t("marketing.reportPreview.localAudioProtection")}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-white/36">
                      {t("marketing.reportPreview.localAudioProtectionBody")}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-[10px] text-emerald-300/75">
                      <LockKeyhole className="h-3 w-3" />
                      {t("marketing.reportPreview.noRawTransfer")}
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-7 -left-3 flex items-center gap-3 rounded-2xl border border-[#8dbdff]/14 bg-[linear-gradient(135deg,rgba(26,68,128,.84),rgba(9,23,52,.9))] px-4 py-3 shadow-[0_18px_55px_rgba(17,88,210,.28),inset_0_1px_0_rgba(255,255,255,.08)] backdrop-blur-2xl sm:-left-8">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#155eff]/14">
                  <Sparkles className="h-4 w-4 text-[#8fc0ff]" />
                </div>
                <div>
                  <p className="text-xs font-medium">{t("marketing.reportPreview.morningSummaryReady")}</p>
                  <p className="text-[10px] text-white/35">{t("marketing.reportPreview.morningSummaryMeta")}</p>
                </div>
              </div>
            </div>
          </Container>

          <Container className="relative z-10 pt-[22svh] pb-9 md:hidden">
            <div className="rounded-[1.55rem] border border-[#8dbdff]/14 bg-[linear-gradient(145deg,rgba(18,38,76,.82),rgba(6,15,35,.92))] p-4 shadow-[0_18px_70px_rgba(24,105,255,.16),inset_0_1px_0_rgba(255,255,255,.07)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{t("marketing.reportPreview.sleepSignature")}</p>
                  <p className="mt-0.5 text-[11px] text-white/35">
                    {t("marketing.reportPreview.exampleReportView")}
                  </p>
                </div>
                <span className="rounded-full bg-[#155eff]/14 px-2.5 py-1 text-[10px] text-[#9bd5ff]/75">
                  {t("marketing.reportPreview.onDevice")}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {sleepMetrics.map((metric) => (
                  <div key={metric.label} className="rounded-2xl bg-white/[0.045] p-3">
                    <p className="text-[9px] uppercase tracking-[0.12em] text-white/28">{metric.label}</p>
                    <p className="mt-1 text-lg font-medium tracking-[-0.04em]">{metric.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 h-2 rounded-full bg-white/[0.05]">
                <div className="h-full w-[68%] rounded-full bg-[linear-gradient(90deg,#1769ff,#6fd2ff)]" />
              </div>
            </div>
          </Container>
        </section>

        <section className="border-y border-white/[0.055] bg-white/[0.018] py-7">
          <Container className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5 text-xs text-white/35 sm:justify-between">
            <span className="text-[10px] font-medium uppercase tracking-[0.28em] text-white/22">
              {t("marketing.privacy.title")}
            </span>
            <span className="flex items-center gap-2">
              <CloudOff className="h-4 w-4 text-[#72aaff]" />
              {t("marketing.privacy.rawAudioStaysLocal")}
            </span>
            <span className="flex items-center gap-2">
              <LockKeyhole className="h-4 w-4 text-[#72aaff]" />
              {t("marketing.privacy.secureAccount")}
            </span>
            <span className="flex items-center gap-2">
              <Mic2 className="h-4 w-4 text-[#72aaff]" />
              {t("marketing.privacy.realtimeAnalysis")}
            </span>
          </Container>
        </section>

        <section id="nasil-calisir" className="scroll-mt-24 py-24 sm:py-32">
          <Container>
            <div className="mb-14 grid gap-5 lg:grid-cols-2 lg:items-end">
              <div>
                <p className="mb-4 text-xs font-medium uppercase tracking-[0.28em] text-[#78b7ff]">
                  {t("marketing.insight.title")}
                </p>
                <h2 className="max-w-xl text-balance text-4xl font-medium tracking-[-0.045em] sm:text-5xl">
                  {t("marketing.insight.subtitle")}
                </h2>
              </div>
              <p className="max-w-lg text-pretty leading-7 text-muted-foreground lg:justify-self-end">
                {t("marketing.insight.body")}
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {features.map((feature, index) => {
                const Icon = featureIcons[index];
                return (
                  <article
                    key={feature.title}
                    className="surface-panel group relative overflow-hidden rounded-[1.75rem] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#6da9ff]/25 sm:p-7"
                  >
                    <div className="absolute right-5 top-3 text-6xl font-semibold tracking-[-0.08em] text-white/[0.025]">
                      {featureNumbers[index]}
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#6da9ff]/15 bg-[#155eff]/10 text-[#80b5ff]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-10 text-xl font-medium tracking-[-0.025em]">{feature.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{feature.description}</p>
                    <ChevronRight className="mt-8 h-4 w-4 text-white/20 transition group-hover:translate-x-1 group-hover:text-[#78b7ff]" />
                  </article>
                );
              })}
            </div>
          </Container>
        </section>

        <section className="pb-24 sm:pb-32">
          <Container>
            <div className="relative overflow-hidden rounded-[2rem] border border-[#6da9ff]/15 bg-[linear-gradient(120deg,#10285b_0%,#0c1835_48%,#071023_100%)] px-6 py-14 shadow-[0_28px_100px_rgba(0,30,100,.24)] sm:px-12 sm:py-16">
              <div className="night-stars absolute inset-0 opacity-20" />
              <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#1769ff]/22 blur-[90px]" />
              <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <p className="mb-4 text-xs font-medium uppercase tracking-[0.28em] text-[#8fc0ff]">
                    {t("marketing.closing.eyebrow")}
                  </p>
                  <h2 className="text-balance text-4xl font-medium tracking-[-0.05em] sm:text-5xl">
                    {t("marketing.closing.title")}
                  </h2>
                  <p className="mt-5 max-w-lg leading-7 text-white/48">{t("marketing.closing.body")}</p>
                </div>
                <Button
                  size="lg"
                  className="h-13 shrink-0 rounded-full bg-white px-6 text-[#07122b] hover:bg-[#dceaff]"
                  render={<Link href={user ? "/sleep" : "/signup"} />}
                >
                  {user ? t("marketing.hero.loggedInCta") : t("marketing.closing.primaryCta")}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          </Container>
        </section>
      </main>

      <footer className="border-t border-white/[0.055] py-8">
        <Container className="flex flex-col gap-6 text-sm text-muted-foreground">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <MoonStar className="h-4 w-4 text-[#72aaff]" />
              <span className="font-medium text-foreground">{siteConfig.shortName}</span>
              <span className="text-white/20">© {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-5">
              <LandingFooterLinks />
            </div>
          </div>
          <CylleneTechMark className="sm:items-start sm:text-left" size="sm" />
        </Container>
      </footer>
    </div>
  );
}
