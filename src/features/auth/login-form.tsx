"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const authError = new URLSearchParams(window.location.search).get("error");
    if (!authError) return;
    setError("Google ile giriş tamamlanamadı. Tekrar deneyin.");
    // #region agent log
    const payload = {
      sessionId: "d5fe36",
      runId: "pre-fix",
      hypothesisId: "G2",
      location: "login-form.tsx:auth-callback-error",
      message: "landed on login with auth error",
      data: { error: authError, href: window.location.href },
      timestamp: Date.now(),
    };
    fetch("http://127.0.0.1:7668/ingest/6ebf33a3-e317-467b-8188-4ae3fc7f8fb1", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "d5fe36" },
      body: JSON.stringify(payload),
    }).catch(() => {});
    fetch("/api/debug-ingest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {});
    // #endregion
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/sleep");
    router.refresh();
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback`;
    // #region agent log
    const gPayload = {
      sessionId: "d5fe36",
      runId: "pre-fix",
      hypothesisId: "G1",
      location: "login-form.tsx:handleGoogleLogin",
      message: "google oauth start",
      data: { redirectTo, origin: window.location.origin },
      timestamp: Date.now(),
    };
    fetch("http://127.0.0.1:7668/ingest/6ebf33a3-e317-467b-8188-4ae3fc7f8fb1", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "d5fe36" },
      body: JSON.stringify(gPayload),
    }).catch(() => {});
    fetch("/api/debug-ingest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(gPayload),
    }).catch(() => {});
    // #endregion
    const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });
    // #region agent log
    const gResult = {
      sessionId: "d5fe36",
      runId: "pre-fix",
      hypothesisId: "G1",
      location: "login-form.tsx:handleGoogleLogin:result",
      message: "google oauth result",
      data: {
        hasUrl: Boolean(data?.url),
        error: oauthError?.message ?? null,
        status: (oauthError as { status?: number } | null)?.status ?? null,
      },
      timestamp: Date.now(),
    };
    fetch("http://127.0.0.1:7668/ingest/6ebf33a3-e317-467b-8188-4ae3fc7f8fb1", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "d5fe36" },
      body: JSON.stringify(gResult),
    }).catch(() => {});
    fetch("/api/debug-ingest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(gResult),
    }).catch(() => {});
    // #endregion
    if (oauthError) {
      setError(oauthError.message);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-8">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-[#78b7ff]">
          Hesabına dön
        </p>
        <h1 className="text-4xl font-medium tracking-[-0.05em]">Tekrar hoş geldin.</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Gece geçmişin ve sabah raporların seni bekliyor.
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs text-white/60">
            E-posta adresi
          </Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@email.com"
              required
              autoComplete="email"
              className="h-12 rounded-xl border-white/[0.08] bg-white/[0.035] pl-11 placeholder:text-white/18 focus-visible:border-[#6da9ff]/45"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs text-white/60">
              Şifre
            </Label>
          </div>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="h-12 rounded-xl border-white/[0.08] bg-white/[0.035] pl-11 focus-visible:border-[#6da9ff]/45"
            />
          </div>
        </div>

        {error && (
          <p className="rounded-xl border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        <Button
          type="submit"
          className="glow-purple h-12 w-full rounded-xl bg-[#1769ff] hover:bg-[#2c78ff]"
          disabled={loading}
        >
          {loading ? "Giriş yapılıyor..." : "Giriş yap"}
          {!loading && <ArrowRight className="ml-1 h-4 w-4" />}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-white/[0.07]" />
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/25">veya</span>
        <span className="h-px flex-1 bg-white/[0.07]" />
      </div>

      <Button
        variant="outline"
        className="h-12 w-full rounded-xl border-white/[0.08] bg-white/[0.025] hover:bg-white/[0.06]"
        onClick={handleGoogleLogin}
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-bold text-[#15203a]">
          G
        </span>
        Google ile devam et
      </Button>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Henüz hesabın yok mu?{" "}
        <Link href="/signup" className="font-medium text-[#83b7ff] transition hover:text-white">
          Ücretsiz hesap oluştur
        </Link>
      </p>
    </div>
  );
}
