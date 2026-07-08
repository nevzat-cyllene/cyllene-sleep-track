import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "@/features/dashboard/dashboard-client";

interface DashboardPageProps {
  searchParams: Promise<{ session?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: sessions } = await supabase
    .from("sleep_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("started_at", { ascending: false })
    .limit(30);

  const params = await searchParams;

  return (
    <DashboardClient
      initialSessions={sessions ?? []}
      userId={user.id}
      selectedSessionId={params.session}
    />
  );
}
