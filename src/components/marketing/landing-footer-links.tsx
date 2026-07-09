"use client";

import Link from "next/link";
import { useAuthUser } from "@/hooks/use-auth-user";

export function LandingFooterLinks() {
  const { user, ready } = useAuthUser();

  if (!ready) return null;

  if (user) {
    return (
      <>
        <Link className="hover:text-foreground" href="/sleep">
          Panel
        </Link>
        <span className="mx-2">·</span>
        <Link className="hover:text-foreground" href="/profile">
          Profil
        </Link>
      </>
    );
  }

  return (
    <>
      <Link className="hover:text-foreground" href="/login">
        Giriş
      </Link>
      <span className="mx-2">·</span>
      <Link className="hover:text-foreground" href="/signup">
        Ücretsiz Başla
      </Link>
    </>
  );
}
