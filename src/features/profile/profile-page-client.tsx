"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthUser } from "@/hooks/use-auth-user";
import { ProfileClient } from "@/features/profile/profile-client";

export function ProfilePageClient() {
  const router = useRouter();
  const { user, ready } = useAuthUser();

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace("/login?redirect=/profile");
  }, [ready, user, router]);

  if (!ready) {
    return (
      <div className="space-y-6 pb-4" aria-busy="true">
        <div className="flex items-center gap-4">
          <div className="size-16 animate-pulse rounded-full bg-white/[0.06]" />
          <div className="space-y-2">
            <div className="h-7 w-36 animate-pulse rounded-lg bg-white/[0.06]" />
            <div className="h-4 w-48 animate-pulse rounded-lg bg-white/[0.04]" />
          </div>
        </div>
        <div className="h-40 animate-pulse rounded-2xl bg-white/[0.04]" />
      </div>
    );
  }

  if (!user) return null;

  return <ProfileClient userId={user.id} email={user.email ?? null} />;
}
