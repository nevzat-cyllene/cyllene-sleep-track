"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CylleneTechMark } from "@/components/brand/cyllene-tech-mark";
import { InstallPWA } from "@/components/install-pwa";
import { getOnboardingAnswers } from "@/lib/onboarding-storage";
import { formatOnboardingSummary } from "@/lib/onboarding-summary";
import type { Profile } from "@/types";
import { LogOut, Moon, User } from "lucide-react";

interface ProfileClientProps {
  profile: Profile | null;
  email: string | null;
}

export function ProfileClient({ profile, email }: ProfileClientProps) {
  const router = useRouter();
  const [sleepProfile, setSleepProfile] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    const answers = getOnboardingAnswers();
    if (answers) setSleepProfile(formatOnboardingSummary(answers));
  }, []);

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="space-y-6 pb-[calc(8rem+env(safe-area-inset-bottom))] md:pb-4">
      <div>
        <h1 className="text-2xl font-semibold">Profil</h1>
        <p className="text-sm text-muted-foreground">Hesap ve uygulama ayarları</p>
      </div>

      <Card className="glass border-white/10 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5" />
            Hesap
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">E-posta</p>
            <p className="font-medium">{email ?? profile?.email ?? "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Plan</p>
            <p className="font-medium capitalize">{profile?.plan ?? "free"}</p>
          </div>
        </CardContent>
      </Card>

      {sleepProfile.length > 0 && (
        <Card className="glass border-white/10 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Moon className="h-5 w-5" />
              Uyku profiliniz
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sleepProfile.map((row) => (
              <div key={row.label} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{row.label}</span>
                <span className="font-medium">{row.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="glass border-white/10 shadow-soft md:hidden">
        <CardHeader>
          <CardTitle className="text-lg">Uygulama</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InstallPWA />
          <p className="text-sm text-muted-foreground">
            Gece kaydı için uygulamayı ana ekrana ekleyin ve şarjda tutun.
          </p>
        </CardContent>
      </Card>

      {/* Extra spacer keeps logout fully under the mobile nav until the user scrolls. */}
      <div className="h-[4.5rem] md:hidden" aria-hidden="true" />

      <Button variant="outline" className="w-full" onClick={() => void signOut()}>
        <LogOut className="mr-2 h-4 w-4" />
        Çıkış yap
      </Button>

      <CylleneTechMark className="pt-4" size="sm" />
    </div>
  );
}
