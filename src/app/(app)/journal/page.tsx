import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { JournalClient } from "@/features/journal/journal-client";
import { fetchUserSessionsServer } from "@/lib/supabase/queries";

export default async function JournalPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  const sessions = await fetchUserSessionsServer(data.user.id);

  return <JournalClient sessions={sessions} userId={data.user.id} />;
}
