import { redirect } from "next/navigation";
import { getAdminAccess } from "./admin-auth";
import AdminDashboard from "../../src/components/AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ checkin?: string }> }) {
  const params = await searchParams;
  const checkin = typeof params.checkin === "string" ? params.checkin : "";
  const returnTo = `/admin${checkin ? `?checkin=${encodeURIComponent(checkin)}` : ""}`;
  const access = await getAdminAccess();

  if (!access.user) {
    redirect(`/admin/login?returnTo=${encodeURIComponent(returnTo)}`);
  }

  return <AdminDashboard adminName={access.user.displayName} initialCheckin={checkin} />;
}
