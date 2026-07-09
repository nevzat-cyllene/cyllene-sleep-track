import { siteConfig } from "@/lib/site-config";
import Link from "next/link";
import { Moon, ShieldCheck, Smartphone, Mic, Headphones, Lock } from "lucide-react";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { LandingHeroCta } from "@/components/marketing/landing-hero-cta";
import { LandingFooterLinks } from "@/components/marketing/landing-footer-links";
import { Container } from "@/components/shell/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const features = [
  {
    icon: Mic,
    title: "Ses analizi telefonunda",
    description:
      "Horlama, öksürük ve ani gürültüler uyku boyunca cihazında tespit edilir. Ses kaydı sunucuya gönderilmez.",
  },
  {
    icon: Moon,
    title: "Sabah raporu",
    description:
      "Uyku skoru, zaman çizelgesi ve olay sayıları tek bakışta. Her sabah net bir özet.",
  },
  {
    icon: Headphones,
    title: "Olayları dinle",
    description:
      "Tespit edilen horlama ve sesleri saat bilgisiyle gör, istersen klibi dinle.",
  },
  {
    icon: Lock,
    title: "Gizliliğin korunur",
    description:
      "Analiz telefonunda kalır. Buluta yalnızca olayın saati, türü ve süresi gibi özet bilgiler gider.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <MarketingHeader />

      <main>
        <section className="relative overflow-hidden py-16 sm:py-24">
          <Container>
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground">
                  <Moon className="h-3.5 w-3.5 text-primary" />
                  <span>Ücretsiz başlangıç · Telefonda analiz</span>
                </div>

                <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                  Uykunuzu izleyin.
                  <span className="block text-gradient">Sabah net, ölçülebilir rapor alın.</span>
                </h1>

                <p className="text-pretty text-lg text-muted-foreground">
                  {siteConfig.name}, uykunuzdaki sesleri telefonunuzda analiz eder. Horlama, öksürük
                  ve gürültü olaylarını sabah raporunda gösterir.
                </p>

                <LandingHeroCta />

                <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary/80" />
                    Ses dosyası yüklenmez
                  </div>
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-primary/80" />
                    Ana ekrana eklenebilir
                  </div>
                  <div className="flex items-center gap-2">
                    <Mic className="h-4 w-4 text-primary/80" />
                    Uyku boyunca kayıt
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-6 rounded-3xl bg-gradient-to-r from-primary/20 to-cyan-400/10 blur-2xl" />
                <Card className="glass relative border-white/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Moon className="h-4 w-4 text-primary" />
                      Sabah Raporu
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-3">
                      {[
                        { label: "Skor", value: "78" },
                        { label: "Horlama", value: "12" },
                        { label: "En yüksek ses", value: "54 dB" },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="rounded-xl border border-white/10 bg-white/5 p-3"
                        >
                          <div className="text-xs text-muted-foreground">{item.label}</div>
                          <div className="mt-1 text-2xl font-semibold tabular-nums">{item.value}</div>
                        </div>
                      ))}
                    </div>
                    <div className="h-40 rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent" />
                    <div className="text-xs text-muted-foreground">
                      Dünkü uyku — örnek görünüm
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </Container>
        </section>

        <section className="py-16">
          <Container>
            <div className="mb-10 space-y-3">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Uyku boyunca ne olur?
              </h2>
              <p className="max-w-2xl text-muted-foreground">
                Telefonu yatağının yakınına koy, uyu. Sabah kalktığında uykuya dair net bir özet seni
                beklesin.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((f) => (
                <Card key={f.title} className="glass border-white/10 transition hover:border-white/20">
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-white/10">
                      <f.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <div className="font-medium">{f.title}</div>
                      <div className="text-sm text-muted-foreground">{f.description}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Container>
        </section>

        <section className="py-16">
          <Container>
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="text-xl">Sık sorulanlar</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion className="w-full" defaultValue={["q1"]}>
                  <AccordionItem value="q1">
                    <AccordionTrigger>Sesim buluta gidiyor mu?</AccordionTrigger>
                    <AccordionContent>
                      Hayır. Ses kayıtları telefonunuzda kalır. Buluta yalnızca olayın saati, türü
                      ve süresi gibi özet bilgiler gider — horlama sesinin kendisi değil.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="q2">
                    <AccordionTrigger>iPhone ekranı kilitlenince kayıt devam eder mi?</AccordionTrigger>
                    <AccordionContent>
                      Ekran kilitlenirse mikrofon durabilir. Kayıt sırasında uyku modu ekranını açık
                      bırakın; uygulama ekranı uyanık tutmaya çalışır.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="q3">
                    <AccordionTrigger>Premium plan ne sunacak?</AccordionTrigger>
                    <AccordionContent>
                      Detaylı uyku analizi, sınırsız geçmiş kayıtları ve gelişmiş raporlar premium
                      planda olacak. Çok yakında.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </Container>
        </section>

        <section className="py-16">
          <Container>
            <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-primary/15 to-cyan-400/10 p-8 sm:p-10">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-xl font-semibold">İlk uyku kaydını başlat</h3>
                  <p className="mt-1 text-muted-foreground">
                    Birkaç dakikada kur, sabah raporunu gör.
                  </p>
                </div>
                <Button
                  size="lg"
                  className="rounded-2xl glow-purple"
                  render={<Link href="/signup" />}
                >
                  Ücretsiz Başla
                </Button>
              </div>
            </div>
          </Container>
        </section>

        <footer className="border-t border-white/5 py-10">
          <Container className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} {siteConfig.name}
            </div>
            <div className="text-sm text-muted-foreground">
              <LandingFooterLinks />
            </div>
          </Container>
        </footer>
      </main>
    </div>
  );
}
