import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileClient } from "@/features/profile/profile-client";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) redirect("/login");
  if (!data.user) redirect("/login");

  let profile = null;

  try {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .maybeSingle();
    profile = profileData;
  } catch {
    profile = null;
  }

  return <ProfileClient profile={profile} email={data.user.email ?? null} />;
}
