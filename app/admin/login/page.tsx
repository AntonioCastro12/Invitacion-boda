import AdminLogin from "../../../src/components/AdminLogin";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ returnTo?: string }> }) {
  const params = await searchParams;
  const requested = typeof params.returnTo === "string" ? params.returnTo : "/admin";
  const returnTo = requested.startsWith("/admin") && !requested.startsWith("//") ? requested : "/admin";
  return <AdminLogin returnTo={returnTo} />;
}
