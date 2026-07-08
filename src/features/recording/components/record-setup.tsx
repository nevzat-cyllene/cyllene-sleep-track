"use client";

import { BatteryCharging, Moon, Smartphone, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface RecordSetupProps {
  onStart: () => void;
  isLoading?: boolean;
}

const tips = [
  {
    icon: BatteryCharging,
    title: "Şarja takın",
    description: "Gece boyunca kesintisiz kayıt için telefonunuzu şarjda tutun.",
  },
  {
    icon: Smartphone,
    title: "Ekranı açık bırakın",
    description: "Ekran kilitlenirse mikrofon durur. Uyku modu ekranı açık kalır.",
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

export function RecordSetup({ onStart, isLoading }: RecordSetupProps) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Gece Kaydını Başlat</h1>
        <p className="mt-2 text-muted-foreground">
          Ses analizi tamamen cihazınızda yapılır. Hiçbir ses dosyası buluta yüklenmez.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {tips.map((tip) => (
          <Card key={tip.title} className="glass border-white/5">
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

      <div className="flex justify-center pt-4">
        <Button
          size="lg"
          onClick={onStart}
          disabled={isLoading}
          className="glow-purple h-14 rounded-2xl px-12 text-lg"
        >
          {isLoading ? "Hazırlanıyor..." : "Uyku Modunu Başlat"}
        </Button>
      </div>
    </div>
  );
}
