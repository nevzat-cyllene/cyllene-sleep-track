"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole, Mail, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignupForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    router.push("/sleep");
    router.refresh();
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-8">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-[#78b7ff]">
          Cyllene hesabı
        </p>
        <h1 className="text-4xl font-medium tracking-[-0.05em]">
          Uykunu netleştir.
        </h1>
        <p className="mt-3 text-sm leading-6 text-white/48">
          Ücretsiz hesabını oluştur; cihaz içi analiz ve sabah raporuna bu gece başla.
        </p>
      </div>

      {success ? (
        <div className="rounded-2xl border border-emerald-300/14 bg-emerald-300/[0.055] p-6 text-center shadow-[inset_0_1px_0_rgba(255,255,255,.06)]">
          <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300 shadow-[0_0_30px_rgba(52,211,153,.18)]">
            <ArrowRight className="h-4 w-4" />
          </div>
          <p className="font-medium">Hesabın oluşturuldu.</p>
          <p className="mt-1 text-sm text-white/45">Uyku alanına yönlendiriliyorsun...</p>
        </div>
      ) : (
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs text-white/60">
              Ad soyad
            </Label>
            <div className="relative">
              <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8fc0ff]/48" />
              <Input
                id="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Adın"
                autoComplete="name"
                className="h-12 rounded-xl border-[#8dbdff]/12 bg-[#06142f]/55 pl-11 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.045)] placeholder:text-white/20 focus-visible:border-[#6da9ff]/55 focus-visible:ring-[#1769ff]/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs text-white/60">
              E-posta adresi
            </Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8fc0ff]/48" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                required
                autoComplete="email"
                className="h-12 rounded-xl border-[#8dbdff]/12 bg-[#06142f]/55 pl-11 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.045)] placeholder:text-white/20 focus-visible:border-[#6da9ff]/55 focus-visible:ring-[#1769ff]/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs text-white/60">
              Şifre
            </Label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8fc0ff]/48" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
                autoComplete="new-password"
                className="h-12 rounded-xl border-[#8dbdff]/12 bg-[#06142f]/55 pl-11 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.045)] focus-visible:border-[#6da9ff]/55 focus-visible:ring-[#1769ff]/20"
              />
            </div>
            <p className="text-[11px] text-white/32">En az 6 karakter kullan.</p>
          </div>

          {error && (
            <p className="rounded-xl border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="h-12 w-full rounded-xl bg-[linear-gradient(135deg,#1769ff,#54c8ff)] text-white shadow-[0_18px_48px_rgba(23,105,255,.34),inset_0_1px_0_rgba(255,255,255,.22)] transition hover:brightness-110"
            disabled={loading}
          >
            {loading ? "Hesap oluşturuluyor..." : "Ücretsiz hesap oluştur"}
            {!loading && <ArrowRight className="ml-1 h-4 w-4" />}
          </Button>
        </form>
      )}

      <p className="mt-8 text-center text-sm text-white/42">
        Zaten hesabın var mı?{" "}
        <Link href="/login" className="font-medium text-[#9bd5ff] transition hover:text-white">
          Giriş yap
        </Link>
      </p>
    </div>
  );
}
