import Link from "next/link";
import { ArrowRight, Lock, Mic, Moon, ShieldCheck, Sparkles } from "lucide-react";
import { MarketingHeader } from "@/components/marketing/marketing-header";
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
    title: "On-device ses analizi",
    description:
      "Horlama/öksürük/gürültü tespiti cihazınızda çalışır. Ses dosyası yüklenmez.",
  },
  {
    icon: ShieldCheck,
    title: "Sabah raporu ve grafikler",
    description:
      "Gece zaman çizelgesi, uyku skoru ve olay sayıları tek ekranda toplanır.",
  },
  {
    icon: Lock,
    title: "Gizlilik odaklı mimari",
    description:
      "Buluta yalnızca küçük metadata gider. Ses kaydı varsayılan olarak cihazda kalır.",
  },
  {
    icon: Sparkles,
    title: "SaaS'a hazır iskelet",
    description:
      "Auth, dashboard ve premium modülü hazır. Faz 2'de paketleri eklemek kolay.",
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
                  <span>Zero-cost başlangıç · On-device analiz</span>
                </div>

                <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                  Gecenizi izleyin.
                  <span className="block text-gradient">
                    Sabah net, ölçülebilir rapor alın.
                  </span>
                </h1>

                <p className="text-pretty text-lg text-muted-foreground">
                  CySleep, gece uykunuzdaki sesleri cihazınızda analiz eder. Horlama,
                  öksürük ve gürültü olaylarını sabah modern bir dashboard ile gösterir.
                </p>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    size="lg"
                    className="glow-purple rounded-2xl gap-2"
                    render={<Link href="/signup" />}
                  >
                    Ücretsiz Başla <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-2xl"
                    render={<Link href="/login" />}
                  >
                    Giriş Yap
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary/80" />
                    Ses dosyası yüklenmez
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary/80" />
                    Şık grafikler
                  </div>
                  <div className="flex items-center gap-2">
                    <Mic className="h-4 w-4 text-primary/80" />
                    PWA kurulabilir
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-6 rounded-3xl bg-gradient-to-r from-primary/20 to-cyan-400/10 blur-2xl" />
                <Card className="glass relative border-white/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Moon className="h-4 w-4 text-primary" />
                      Sabah Raporu (Örnek)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-3">
                      {["Skor", "Horlama", "En yüksek dB"].map((label) => (
                        <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-3">
                          <div className="text-xs text-muted-foreground">{label}</div>
                          <div className="mt-1 text-2xl font-semibold tabular-nums">—</div>
                        </div>
                      ))}
                    </div>
                    <div className="h-40 rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent" />
                    <div className="text-xs text-muted-foreground">
                      Bu ekran gerçek verilerle dashboard&apos;ta otomatik dolacak.
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
                Modern SaaS UX, gerçekçi MVP
              </h2>
              <p className="max-w-2xl text-muted-foreground">
                Klişe “card grid” yerine; net hiyerarşi, boşluk, tipografi ve premium
                hissi veren yüzeyler.
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
                      Hayır. Varsayılan olarak analiz cihaz içinde yapılır. Supabase&apos;e yalnızca küçük
                      olay metadata&apos;sı (zaman, tip, süre, dB) gider.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="q2">
                    <AccordionTrigger>iPhone ekranı kilitlenince kayıt devam eder mi?</AccordionTrigger>
                    <AccordionContent>
                      Web/PWA tarafında ekran kilitliyken mikrofon erişimi kısıtlanır. Bu yüzden
                      Uyku Modu ekranı düşük parlaklıkta açık kalacak şekilde tasarlandı.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="q3">
                    <AccordionTrigger>Premium paket nasıl eklenecek?</AccordionTrigger>
                    <AccordionContent>
                      DB&apos;de `subscriptions` tablosu ve uygulamada billing modülü hazır. Faz 2&apos;de Stripe
                      webhook entegrasyonu ekleyip plan bazlı özellikleri açacağız.
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
                  <h3 className="text-xl font-semibold">Bu gece ilk kaydını başlat</h3>
                  <p className="mt-1 text-muted-foreground">
                    2 dakikada kur, sabah dashboard&apos;u gör.
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
              © {new Date().getFullYear()} CySleep
            </div>
            <div className="text-sm text-muted-foreground">
              <Link className="hover:text-foreground" href="/login">
                Giriş
              </Link>
              <span className="mx-2">·</span>
              <Link className="hover:text-foreground" href="/signup">
                Ücretsiz Başla
              </Link>
            </div>
          </Container>
        </footer>
      </main>
    </div>
  );
}
