import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileClient } from "@/features/profile/profile-client";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) redirect("/login");
  if (!data.user) redirect("/login");

  return <ProfileClient userId={data.user.id} email={data.user.email ?? null} />;
}
