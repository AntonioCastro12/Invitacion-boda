import { Suspense } from "react";
import Link from "next/link";
import { requireChatGPTUser } from "../chatgpt-auth";
import { getAdminAccess } from "./admin-auth";
import AdminDashboard from "../../src/components/AdminDashboard";

export const dynamic = "force-dynamic";

async function ProtectedAdmin({ initialCheckin }: { initialCheckin: string }) {
  let access = await getAdminAccess();
  if (!access.user) {
    await requireChatGPTUser(`/admin${initialCheckin ? `?checkin=${encodeURIComponent(initialCheckin)}` : ""}`);
    access = await getAdminAccess();
  }

  if (!access.user || !access.isAllowed) {
    return (
      <main className="admin-denied">
        <ShieldIcon />
        <h1>Acceso restringido</h1>
        <p>Tu cuenta no está autorizada para administrar esta invitación.</p>
        <Link href="/">Volver a la invitación</Link>
      </main>
    );
  }

  return <AdminDashboard adminName={access.user.displayName} initialCheckin={initialCheckin} />;
}

function ShieldIcon() {
  return <span aria-hidden="true">D &amp; E</span>;
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ checkin?: string }> }) {
  const params = await searchParams;
  const checkin = typeof params.checkin === "string" ? params.checkin : "";
  return (
    <Suspense fallback={<main className="admin-loading">Preparando el panel…</main>}>
      <ProtectedAdmin initialCheckin={checkin} />
    </Suspense>
  );
}
