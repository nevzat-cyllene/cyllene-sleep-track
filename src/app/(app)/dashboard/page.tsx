import { redirect } from "next/navigation";

export default async function DashboardRedirect({
  searchParams,
}: {
  searchParams: Promise<{ session?: string }>;
}) {
  const params = await searchParams;
  if (params.session) {
    redirect(`/journal/${params.session}`);
  }
  redirect("/journal");
}
