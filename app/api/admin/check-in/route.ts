import { getAdminAccess } from "../../../admin/admin-auth";
import { createCheckIn, getCheckIn, getGuest } from "../../../../db/runtime";

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

    const guest = await getGuest(token);
    if (!guest) return Response.json({ error: "El código no pertenece a una invitación válida." }, { status: 404 });

    const checkIn = {
      scanned_by: access.user.email,
      checked_in_at: new Date().toISOString(),
    };
    const created = await createCheckIn(token, checkIn);

    if (!created) {
      const previous = await getCheckIn(token);
      return Response.json({
        error: "Este pase ya fue registrado.",
        duplicate: true,
        guest,
        checkedInAt: previous?.checked_in_at,
      }, { status: 409 });
    }

    return Response.json({ ok: true, guest, checkedInAt: checkIn.checked_in_at });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No fue posible validar el acceso." }, { status: 500 });
  }
}
