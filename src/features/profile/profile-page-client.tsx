"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuthUser } from "@/hooks/use-auth-user";
import { getUserAvatarUrl, getUserDisplayName } from "@/lib/user-display";
import { ProfileClient } from "@/features/profile/profile-client";
import type { Profile } from "@/types";

export function ProfilePageClient() {
  const router = useRouter();
  const { user, ready } = useAuthUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;

    if (!user) {
      router.replace("/login?redirect=/profile");
      return;
    }

    const load = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (!error) setProfile(data);
      setLoading(false);
    };

    void load();
  }, [ready, user, router]);

  if (!ready || loading) {
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

  return (
    <ProfileClient
      profile={profile}
      email={user.email ?? null}
      displayName={getUserDisplayName(user)}
      avatarUrl={getUserAvatarUrl(user)}
      authProvider={user.app_metadata?.provider as string | undefined}
    />
  );
}
