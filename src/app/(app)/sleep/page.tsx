import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SleepPageClient } from "@/features/recording/sleep-page-client";

export default async function SleepPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  return <SleepPageClient />;
}
