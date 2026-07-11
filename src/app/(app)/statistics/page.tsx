import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StatisticsClient } from "@/features/statistics/statistics-client";

export default async function StatisticsPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  return <StatisticsClient userId={data.user.id} />;
}
