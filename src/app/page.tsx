import { getUser } from "@/lib/auth";
import { DashboardOverview } from "@/components/dashboard-overview";
import { PublicLanding } from "@/components/public-landing";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getUser();

  return user ? <DashboardOverview /> : <PublicLanding />;
}