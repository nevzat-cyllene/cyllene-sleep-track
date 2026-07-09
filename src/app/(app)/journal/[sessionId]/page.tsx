import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SessionDetailClient } from "@/features/session-detail/session-detail-client";

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  return <SessionDetailClient sessionId={sessionId} userId={data.user.id} />;
}
