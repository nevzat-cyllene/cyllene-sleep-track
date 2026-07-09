import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LocalSessionDetailClient } from "@/features/session-detail/local-session-detail-client";

export default async function LocalSessionDetailPage({
  params,
}: {
  params: Promise<{ localSessionId: string }>;
}) {
  const { localSessionId } = await params;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  return (
    <LocalSessionDetailClient
      localSessionId={localSessionId}
      userId={data.user?.id}
    />
  );
}
