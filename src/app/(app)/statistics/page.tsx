import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StatisticsClient } from "@/features/statistics/statistics-client";
import { fetchEventsForSessionsServer, fetchUserSessionsServer } from "@/lib/supabase/queries";

export default async function StatisticsPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  const sessions = await fetchUserSessionsServer(data.user.id);
  const events = await fetchEventsForSessionsServer(sessions.slice(0, 12).map((session) => session.id));

  return <StatisticsClient sessions={sessions} events={events} />;
}
