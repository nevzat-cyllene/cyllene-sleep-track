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
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { Container } from "@/components/shell/container";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";

const features = [
  {
    icon: AudioWaveform,
    number: "01",
    title: "Uyku sinyalini cihazında çözer",
    description:
      "Horlama, öksürük, konuşma ve ani sesleri telefonunda yakalar. Ham kayıtlar cihazından çıkmaz.",
  },
  {
    icon: Sparkles,
    number: "02",
    title: "Gece ritmini sadeleştirir",
    description:
      "Karmaşık gece verisini; süre, yoğunluk ve önemli anlardan oluşan anlaşılır bir uyku özetine dönüştürür.",
  },
  {
    icon: Headphones,
    number: "03",
    title: "Sabah raporunu netleştirir",
    description:
      "Uyku skorunu, ses zaman çizelgeni ve dinlemek istediğin olayları tek akışta sunar.",
  },
] as const;

const bars = [28, 42, 35, 61, 49, 75, 58, 86, 64, 52, 71, 44, 57, 31, 48, 39, 68, 53];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden">
      <MarketingHeader />

      <main>
        <section className="relative">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="night-stars absolute inset-0 opacity-25" />
            <div className="absolute left-1/2 top-8 h-[34rem] w-[52rem] -translate-x-1/2 rounded-full bg-[#185cff]/12 blur-[140px]" />
            <div className="absolute right-[-12rem] top-36 h-[30rem] w-[30rem] rounded-full bg-[#6fd2ff]/10 blur-[130px]" />
          </div>

          <Container className="relative grid min-h-[calc(100svh-4rem)] items-center gap-14 py-16 lg:grid-cols-[1.02fr_.98fr] lg:py-24">
            <div className="max-w-2xl">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#6da9ff]/20 bg-[#155eff]/10 px-3.5 py-2 text-xs font-medium text-[#91c1ff] shadow-[inset_0_1px_0_rgba(255,255,255,.06)]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inset-0 animate-ping rounded-full bg-[#6da9ff] opacity-60" />
                  <span className="relative h-2 w-2 rounded-full bg-[#6da9ff]" />
                </span>
                Cihaz içi premium uyku analizi
              </div>

              <h1 className="text-balance text-[clamp(3.35rem,8vw,6.8rem)] font-medium leading-[0.89] tracking-[-0.07em]">
                Uyku ritmini gör.
                <span className="mt-2 block text-gradient">Sabaha net uyan.</span>
              </h1>

              <p className="mt-7 max-w-xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                Gece boyunca oluşan horlama, öksürük ve ani sesleri telefonunda analiz et.
                Cyllene, uykunun ritmini sade ve sana ait bir sabah raporuna çevirir.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="glow-purple h-13 rounded-full bg-[#1769ff] px-6 hover:bg-[#2d79ff]"
                  render={<Link href="/signup" />}
                >
                  İlk geceyi başlat
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-13 rounded-full border-white/10 bg-white/[0.035] px-6 backdrop-blur-xl hover:bg-white/[0.07]"
                  render={<Link href="/login" />}
                >
                  Hesabına giriş yap
                </Button>
              </div>

              <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-xs text-muted-foreground">
                {["Kredi kartı gerekmez", "Ham ses yüklenmez", "Uyku skoru ve zaman çizelgesi"].map(
                  (item) => (
                    <span key={item} className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300">
                        <Check className="h-3 w-3" />
                      </span>
                      {item}
                    </span>
                  )
                )}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[34rem] lg:mx-0 lg:ml-auto">
              <div className="absolute -inset-10 rounded-full bg-[#185cff]/18 blur-[100px]" />
              <div className="relative overflow-hidden rounded-[2rem] border border-[#8dbdff]/18 bg-[linear-gradient(145deg,rgba(31,68,128,.78),rgba(12,34,76,.88)_48%,rgba(8,18,42,.9)_100%)] p-4 shadow-[0_28px_110px_rgba(30,112,255,.28),inset_0_1px_0_rgba(255,255,255,.09)] backdrop-blur-2xl sm:p-5">
                <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#6fd2ff]/16 blur-[70px]" />
                <div className="pointer-events-none absolute -left-20 bottom-10 h-56 w-56 rounded-full bg-[#235dff]/18 blur-[80px]" />
                <div className="flex items-center justify-between border-b border-white/[0.07] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1769ff] shadow-[0_8px_30px_rgba(23,105,255,.35)]">
                      <MoonStar className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Günaydın, Deniz</p>
                      <p className="text-xs text-white/35">9 Temmuz gecesi</p>
                    </div>
                  </div>
                  <span className="rounded-full border border-emerald-400/15 bg-emerald-400/8 px-2.5 py-1 text-[10px] font-medium text-emerald-300">
                    Senkronize
                  </span>
                </div>

                <div className="grid gap-3 py-4 sm:grid-cols-[1.15fr_.85fr]">
                  <div className="rounded-[1.45rem] border border-white/[0.08] bg-white/[0.055] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,.06)]">
                    <p className="text-xs text-white/40">Uyku skoru</p>
                    <div className="mt-4 flex items-end justify-between gap-4">
                      <div>
                        <span className="text-6xl font-medium tracking-[-0.07em]">86</span>
                        <span className="ml-1 text-sm text-white/30">/100</span>
                      </div>
                      <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[conic-gradient(#6ea8ff_0deg,#1a6cff_309deg,rgba(255,255,255,.07)_309deg)]">
                        <div className="h-[52px] w-[52px] rounded-full bg-[#10234a]" />
                        <MoonStar className="absolute h-5 w-5 text-[#84b7ff]" />
                      </div>
                    </div>
                    <p className="mt-4 text-xs text-emerald-300">Önceki geceden %8 daha sakin</p>
                  </div>

                  <div className="rounded-[1.45rem] border border-[#8dbdff]/12 bg-[linear-gradient(145deg,rgba(33,105,255,.2),rgba(113,190,255,.08))] p-5">
                    <p className="text-xs text-white/40">Toplam uyku</p>
                    <p className="mt-3 text-3xl font-medium tracking-[-0.04em]">7s 42dk</p>
                    <div className="mt-5 flex items-end gap-1">
                      {[35, 54, 43, 69, 48, 76, 61].map((height, index) => (
                        <span
                          key={`${height}-${index}`}
                          className="flex-1 rounded-full bg-gradient-to-t from-[#1a6cff]/40 to-[#79b5ff]"
                          style={{ height }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.45rem] border border-[#8dbdff]/12 bg-[linear-gradient(145deg,rgba(14,43,93,.86),rgba(7,20,47,.78))] p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Gece sesleri</p>
                      <p className="mt-0.5 text-xs text-white/35">00:18 — 07:56</p>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-white/[0.05] px-2.5 py-1 text-[10px] text-white/45">
                      <Waves className="h-3 w-3 text-[#6da9ff]" />
                      14 olay
                    </div>
                  </div>

                  <div className="mt-7 flex h-24 items-center gap-1">
                    {bars.map((height, index) => (
                      <span
                        key={`${height}-${index}`}
                        className="w-full rounded-full bg-gradient-to-t from-[#3152ff]/35 via-[#1875ff] to-[#76d6ff]"
                        style={{ height: `${height}%`, opacity: 0.55 + (index % 4) * 0.12 }}
                      />
                    ))}
                  </div>
                  <div className="mt-3 flex justify-between text-[10px] text-white/25">
                    <span>00:00</span>
                    <span>02:00</span>
                    <span>04:00</span>
                    <span>06:00</span>
                    <span>08:00</span>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-7 -left-3 flex items-center gap-3 rounded-2xl border border-[#8dbdff]/14 bg-[linear-gradient(135deg,rgba(26,68,128,.84),rgba(9,23,52,.9))] px-4 py-3 shadow-[0_18px_55px_rgba(17,88,210,.28),inset_0_1px_0_rgba(255,255,255,.08)] backdrop-blur-2xl sm:-left-10">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10">
                  <ShieldCheck className="h-4 w-4 text-emerald-300" />
                </div>
                <div>
                  <p className="text-xs font-medium">Cihaz içi analiz</p>
                  <p className="text-[10px] text-white/35">Seslerin sende kalır</p>
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section className="border-y border-white/[0.055] bg-white/[0.018] py-7">
          <Container className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5 text-xs text-white/35 sm:justify-between">
            <span className="text-[10px] font-medium uppercase tracking-[0.28em] text-white/22">
              Mahremiyet tasarımın merkezinde
            </span>
            <span className="flex items-center gap-2">
              <CloudOff className="h-4 w-4 text-[#72aaff]" />
              Ham ses buluta gitmez
            </span>
            <span className="flex items-center gap-2">
              <LockKeyhole className="h-4 w-4 text-[#72aaff]" />
              Güvenli hesap yapısı
            </span>
            <span className="flex items-center gap-2">
              <Mic2 className="h-4 w-4 text-[#72aaff]" />
              Telefonunda gerçek zamanlı analiz
            </span>
          </Container>
        </section>

        <section id="nasil-calisir" className="scroll-mt-24 py-24 sm:py-32">
          <Container>
            <div className="mb-14 grid gap-5 lg:grid-cols-2 lg:items-end">
              <div>
                <p className="mb-4 text-xs font-medium uppercase tracking-[0.28em] text-[#78b7ff]">
                  Uyku sinyalinden içgörüye
                </p>
                <h2 className="max-w-xl text-balance text-4xl font-medium tracking-[-0.045em] sm:text-5xl">
                  Sabahına daha net bir uyku resmiyle başla.
                </h2>
              </div>
              <p className="max-w-lg text-pretty leading-7 text-muted-foreground lg:justify-self-end">
                Cyllene, gece boyunca oluşan ses sinyallerini sade bir sabah raporuna dönüştürür.
                Karmaşa yok; yalnızca uykunu anlamana yarayan net detaylar var.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {features.map((feature) => (
                <article
                  key={feature.title}
                  className="surface-panel group relative overflow-hidden rounded-[1.75rem] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#6da9ff]/25 sm:p-7"
                >
                  <div className="absolute right-5 top-3 text-6xl font-semibold tracking-[-0.08em] text-white/[0.025]">
                    {feature.number}
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#6da9ff]/15 bg-[#155eff]/10 text-[#80b5ff]">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-10 text-xl font-medium tracking-[-0.025em]">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{feature.description}</p>
                  <ChevronRight className="mt-8 h-4 w-4 text-white/20 transition group-hover:translate-x-1 group-hover:text-[#78b7ff]" />
                </article>
              ))}
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
                    Bu gece hazır
                  </p>
                  <h2 className="text-balance text-4xl font-medium tracking-[-0.05em] sm:text-5xl">
                    İlk sabah raporun bu gece hazır olabilir.
                  </h2>
                  <p className="mt-5 max-w-lg leading-7 text-white/48">
                    Ücretsiz hesabını oluştur, telefonu yakınına koy ve uykunun görünmeyen
                    ritmini sabah net bir raporla keşfet.
                  </p>
                </div>
                <Button
                  size="lg"
                  className="h-13 shrink-0 rounded-full bg-white px-6 text-[#07122b] hover:bg-[#dceaff]"
                  render={<Link href="/signup" />}
                >
                  Ücretsiz hesabını aç
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          </Container>
        </section>
      </main>

      <footer className="border-t border-white/[0.055] py-8">
        <Container className="flex flex-col gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <MoonStar className="h-4 w-4 text-[#72aaff]" />
            <span className="font-medium text-foreground">{siteConfig.shortName}</span>
            <span className="text-white/20">© {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-5">
            <Link className="transition hover:text-foreground" href="/login">
              Giriş
            </Link>
            <Link className="transition hover:text-foreground" href="/signup">
              Hesap oluştur
            </Link>
          </div>
        </Container>
      </footer>
    </div>
  );
}
