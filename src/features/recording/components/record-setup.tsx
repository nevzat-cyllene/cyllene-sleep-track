"use client";

import { BatteryCharging, LockKeyhole, Mic2, MoonStar, Smartphone, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RecordingGuidanceBanner } from "./recording-guidance-banner";

interface RecordSetupProps {
  onStart: () => void;
  isLoading?: boolean;
  startLabel?: string;
  compact?: boolean;
}

const tips = [
  {
    icon: BatteryCharging,
    title: "Şarja takın",
    description: "Gece boyunca kesintisiz kayıt için telefonunuzu şarjda tutun.",
  },
  {
    icon: Smartphone,
    title: "Ekran açık kalsın",
    description: "Kayıt ekranını açık bırakın; Cyllene ekranın uyanık kalmasını sağlar.",
  },
  {
    icon: Volume2,
    title: "Yakına yerleştirin",
    description: "Telefonu yatağınıza 30–50 cm mesafede, mikrofon yukarı bakacak şekilde koyun.",
  },
  {
    icon: MoonStar,
    title: "Ortamı hazırlayın",
    description: "Mümkünse televizyonu ve sürekli gürültü üreten cihazları kapatın.",
  },
];

export function RecordSetup({ onStart, isLoading, startLabel, compact }: RecordSetupProps) {
  if (compact) {
    return (
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-[1.8rem] border border-[#8dbdff]/20 bg-[linear-gradient(135deg,rgba(35,92,168,.42)_0%,rgba(21,96,255,.25)_38%,rgba(12,31,73,.88)_100%)] p-6 shadow-[0_30px_100px_rgba(28,105,255,.24),inset_0_1px_0_rgba(255,255,255,.09)] sm:p-8">
          <div className="night-stars pointer-events-none absolute inset-0 opacity-[0.16]" />
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#6fd2ff]/22 blur-[78px]" />
          <div className="absolute -left-24 bottom-[-7rem] h-72 w-72 rounded-full bg-[#1769ff]/24 blur-[90px]" />

          <div className="relative grid gap-7 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <div className="mb-4 flex items-center gap-2 text-xs text-[#8bbdff]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inset-0 animate-ping rounded-full bg-[#6da9ff] opacity-50" />
                  <span className="relative h-2 w-2 rounded-full bg-[#6da9ff]" />
                </span>
                Cyllene analizi hazır
              </div>
              <h2 className="max-w-md text-balance text-3xl font-medium tracking-[-0.045em] sm:text-4xl">
                Uyku ritmini kaydetmeye hazır mısın?
              </h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-white/45">
                Telefonunu yakınına koy. Sesler cihazında analiz edilir ve ham kayıtların
                buluta gönderilmez.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.04] px-3 py-1.5 text-[10px] text-white/40">
                  <Mic2 className="h-3 w-3 text-[#78b7ff]" />
                  Gerçek zamanlı analiz
                </span>
                <span className="flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.04] px-3 py-1.5 text-[10px] text-white/40">
                  <LockKeyhole className="h-3 w-3 text-emerald-300" />
                  Cihazında kalır
                </span>
              </div>
            </div>

            <Button
              size="lg"
              onClick={onStart}
              disabled={isLoading}
              className="h-14 w-full rounded-2xl bg-[linear-gradient(135deg,#8fd1ff_0%,#2d79ff_42%,#165dff_100%)] px-7 text-base font-semibold text-white shadow-[0_18px_50px_rgba(24,105,255,.38),inset_0_1px_0_rgba(255,255,255,.18)] transition duration-150 hover:brightness-110 active:scale-[0.98] sm:w-auto"
            >
              <MoonStar className="mr-1 h-4.5 w-4.5" />
              {isLoading ? "Hazırlanıyor..." : startLabel ?? "Uyku modunu başlat"}
            </Button>
          </div>
        </div>

        <RecordingGuidanceBanner
          mode="setup"
          className="rounded-2xl border-white/[0.07] bg-white/[0.025] text-xs"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Gece kaydını başlat</h1>
        <p className="text-muted-foreground">
          Ses analizi telefonunuzda yapılır. Hiçbir ham ses kaydı sunucuya gönderilmez.
        </p>
      </div>

      <RecordingGuidanceBanner mode="setup" />

      <div className="grid gap-4 sm:grid-cols-2">
        {tips.map((tip) => (
          <Card key={tip.title} className="glass border-white/[0.08] shadow-soft">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <tip.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">{tip.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>{tip.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center pt-2">
        <Button
          size="lg"
          onClick={onStart}
          disabled={isLoading}
          className="h-14 w-full max-w-sm rounded-2xl bg-[linear-gradient(135deg,#8fd1ff_0%,#2d79ff_45%,#165dff_100%)] text-lg text-white shadow-[0_18px_50px_rgba(24,105,255,.35)] transition duration-150 hover:brightness-110 active:scale-[0.98] sm:w-auto sm:px-12"
        >
          {isLoading ? "Hazırlanıyor..." : startLabel ?? "Uyku modunu başlat"}
        </Button>
      </div>
    </div>
  );
}
