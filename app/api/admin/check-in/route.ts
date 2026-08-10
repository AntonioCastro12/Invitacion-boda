import { getAdminAccess } from "../../../admin/admin-auth";
import { ensureWeddingSchema, getD1 } from "../../../../db/runtime";

type GuestRow = { id: number; token: string; name: string; max_passes: number };

function extractToken(value: string) {
  const trimmed = value.trim();
  try {
    const url = new URL(trimmed);
    return url.searchParams.get("checkin") ?? url.pathname.split("/").filter(Boolean).at(-1) ?? "";
  } catch {
    return trimmed;
  }
}

export async function POST(request: Request) {
  const access = await getAdminAccess();
  if (!access.user) return Response.json({ error: "Inicia sesión para continuar." }, { status: 401 });
  if (!access.isAllowed) return Response.json({ error: "Tu cuenta no tiene acceso al panel." }, { status: 403 });

  try {
    const payload = await request.json() as { token?: string };
    const token = extractToken(payload.token ?? "");
    if (!token) return Response.json({ error: "Escanea o escribe un código válido." }, { status: 400 });

    await ensureWeddingSchema();
    const db = getD1();
    const guest = await db.prepare("SELECT id, token, name, max_passes FROM guests WHERE token = ?")
      .bind(token)
      .first<GuestRow>();
    if (!guest) return Response.json({ error: "El código no pertenece a una invitación válida." }, { status: 404 });

    const previous = await db.prepare("SELECT checked_in_at FROM check_ins WHERE guest_id = ?")
      .bind(guest.id)
      .first<{ checked_in_at: string }>();
    if (previous) {
      return Response.json({ error: "Este pase ya fue registrado.", duplicate: true, guest, checkedInAt: previous.checked_in_at }, { status: 409 });
    }

    await db.prepare("INSERT INTO check_ins (guest_id, scanned_by) VALUES (?, ?)")
      .bind(guest.id, access.user.email)
      .run();
    return Response.json({ ok: true, guest, checkedInAt: new Date().toISOString() });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No fue posible validar el acceso." }, { status: 500 });
  }
}
