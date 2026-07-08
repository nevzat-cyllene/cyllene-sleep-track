import Link from "next/link";
import { ArrowRight, Mic, Moon, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Mic,
    title: "Cihaz İçi Analiz",
    description: "Sesler cihazınızda işlenir. Hiçbir kayıt buluta yüklenmez.",
  },
  {
    icon: Moon,
    title: "Gece Takibi",
    description: "Horlama, öksürük ve gürültü olaylarını otomatik tespit eder.",
  },
  {
    icon: Sparkles,
    title: "Sabah Raporu",
    description: "Uyku skoru, zaman çizelgesi ve detaylı istatistikler.",
  },
  {
    icon: Shield,
    title: "Gizlilik Öncelikli",
    description: "Sadece olay metadata'sı senkronize edilir. Tamamen ücretsiz başlangıç.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2 font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
              <Moon className="h-4 w-4 text-primary" />
            </div>
            <span className="text-gradient">CySleep</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Giriş
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Ücretsiz Başla</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-24 text-center sm:px-6">
          <div className="mx-auto max-w-3xl space-y-6">
            <p className="text-sm uppercase tracking-[0.3em] text-primary">
              Uyku Kalitesi Takibi
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Gecenizi dinleyin,{" "}
              <span className="text-gradient">sabah bilinçli uyanın</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              CySleep, gece uykunuzdaki sesleri cihazınızda analiz eder ve sabah
              modern bir dashboard ile raporlar. Sıfır bulut maliyeti, tam gizlilik.
            </p>
            <div className="flex flex-col items-center gap-4 pt-4 sm:flex-row sm:justify-center">
              <Link href="/signup">
                <Button size="lg" className="glow-purple gap-2 rounded-2xl px-8">
                  Ücretsiz Dene
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="rounded-2xl px-8">
                  Giriş Yap
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="glass border-white/5">
                <CardContent className="space-y-3 pt-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} CySleep. Tüm hakları saklıdır.
      </footer>
    </div>
  );
}
