import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { JournalClient } from "@/features/journal/journal-client";

export default async function JournalPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  return <JournalClient userId={data.user.id} />;
}
