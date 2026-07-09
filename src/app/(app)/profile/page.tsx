import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileClient } from "@/features/profile/profile-client";
import { getUserAvatarUrl, getUserDisplayName } from "@/lib/user-display";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  return (
    <ProfileClient
      profile={profile}
      email={data.user.email ?? null}
      displayName={getUserDisplayName(data.user)}
      avatarUrl={getUserAvatarUrl(data.user)}
      authProvider={data.user.app_metadata?.provider as string | undefined}
    />
  );
}
