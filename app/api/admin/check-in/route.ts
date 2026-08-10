import { getAdminAccess } from "../../../admin/admin-auth";
import { getWeddingDatabase } from "../../../../db/runtime";

type GuestRow = { id: string; token: string; name: string; max_passes: number };

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

  try {
    const payload = await request.json() as { token?: string };
    const token = extractToken(payload.token ?? "");
    if (!token) return Response.json({ error: "Escanea o escribe un código válido." }, { status: 400 });

    const { sql } = getWeddingDatabase();
    const guestRows = await sql<GuestRow>`
      SELECT id, token, name, max_passes FROM guests WHERE token = ${token} LIMIT 1`;
    const guest = guestRows[0];
    if (!guest) return Response.json({ error: "El código no pertenece a una invitación válida." }, { status: 404 });

    const inserted = await sql<{ checked_in_at: string }>`
      INSERT INTO check_ins (guest_id, scanned_by)
      VALUES (${guest.id}, ${access.user.email})
      ON CONFLICT (guest_id) DO NOTHING
      RETURNING checked_in_at`;

    if (inserted.length === 0) {
      const previous = await sql<{ checked_in_at: string }>`
        SELECT checked_in_at FROM check_ins WHERE guest_id = ${guest.id} LIMIT 1`;
      return Response.json({
        error: "Este pase ya fue registrado.",
        duplicate: true,
        guest,
        checkedInAt: previous[0]?.checked_in_at,
      }, { status: 409 });
    }

    return Response.json({ ok: true, guest, checkedInAt: inserted[0].checked_in_at });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No fue posible validar el acceso." }, { status: 500 });
  }
}
