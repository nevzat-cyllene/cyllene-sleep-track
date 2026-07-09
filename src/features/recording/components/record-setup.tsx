"use client";

import { BatteryCharging, Moon, Smartphone, Volume2 } from "lucide-react";
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
    title: "Bu ekran açık kalsın",
    description:
      "Kayda başladığınızda saat ve sayaç ekranı açık kalır. Telefonu kilitlemeyin; ekran uyanık tutulur.",
  },
  {
    icon: Volume2,
    title: "Yakına yerleştirin",
    description: "Telefonu yatağınıza 30-50 cm mesafede, mikrofon yukarı bakacak şekilde koyun.",
  },
  {
    icon: Moon,
    title: "Sessiz ortam",
    description: "Fan veya klima gürültüsü analizi etkileyebilir; mümkünse kapatın.",
  },
];

export function RecordSetup({ onStart, isLoading, startLabel, compact }: RecordSetupProps) {
  return (
    <div className={compact ? "space-y-4" : "mx-auto max-w-2xl space-y-6"}>
      {!compact && (
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Gece Kaydını Başlat</h1>
          <p className="mt-2 text-muted-foreground">
            Ses analizi telefonunuzda yapılır. Hiçbir ses kaydı sunucuya gönderilmez.
          </p>
        </div>
      )}

      <RecordingGuidanceBanner mode="setup" />

      {!compact && (
        <div className="grid gap-4 sm:grid-cols-2">
          {tips.map((tip) => (
            <Card key={tip.title} className="glass border-white/10 shadow-soft">
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
      )}

      <div className="flex justify-center pt-2">
        <Button
          size="lg"
          onClick={onStart}
          disabled={isLoading}
          className="glow-purple h-14 w-full max-w-sm rounded-2xl text-lg shadow-soft sm:w-auto sm:px-12"
        >
          {isLoading ? "Hazırlanıyor..." : startLabel ?? "Uyku Modunu Başlat"}
        </Button>
      </div>
    </div>
  );
}
