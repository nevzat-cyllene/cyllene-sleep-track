"use client";

import * as React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function UserMenu() {
  const [email, setEmail] = React.useState<string | null>(null);

  React.useEffect(() => {
    const supabase = createClient();
    void supabase.auth
      .getUser()
      .then(({ data }) => setEmail(data.user?.email ?? null))
      .catch(() => setEmail(null));
  }, []);

  const initials = email?.split("@")[0]?.slice(0, 2)?.toUpperCase() ?? "U";

  return (
    <Link
      href="/profile"
      prefetch
      aria-label="Profil ve ayarlar"
      className="group flex h-10 w-10 touch-manipulation items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.035] text-white transition duration-100 hover:bg-white/[0.07] active:scale-[0.96]"
    >
      <Avatar size="sm" className="transition duration-100 group-hover:scale-[1.03]">
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
    </Link>
  );
}
