import { getAdminAccess } from "../../../admin/admin-auth";
import { ensureWeddingSchema, getD1 } from "../../../../db/runtime";

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 42);
}

export async function POST(request: Request) {
  const access = await getAdminAccess();
  if (!access.user) return Response.json({ error: "Inicia sesión para continuar." }, { status: 401 });
  if (!access.isAllowed) return Response.json({ error: "Tu cuenta no tiene acceso al panel." }, { status: 403 });

  try {
    const payload = await request.json() as { name?: string; passes?: number };
    const name = payload.name?.trim().slice(0, 100) ?? "";
    const passes = Math.min(Math.max(Number(payload.passes) || 1, 1), 20);
    if (!name) return Response.json({ error: "Escribe el nombre del invitado o familia." }, { status: 400 });

    await ensureWeddingSchema();
    const token = `${slugify(name) || "invitado"}-${crypto.randomUUID().slice(0, 8)}`;
    const result = await getD1().prepare("INSERT INTO guests (token, name, max_passes) VALUES (?, ?, ?) RETURNING id, token, name, max_passes")
      .bind(token, name, passes)
      .first<{ id: number; token: string; name: string; max_passes: number }>();

    return Response.json({ guest: result }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No fue posible crear la invitación." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const access = await getAdminAccess();
  if (!access.user) return Response.json({ error: "Inicia sesión para continuar." }, { status: 401 });
  if (!access.isAllowed) return Response.json({ error: "Tu cuenta no tiene acceso al panel." }, { status: 403 });

  try {
    const payload = await request.json() as { token?: string };
    const token = payload.token?.trim() ?? "";
    if (!token || token === "familia-castro-cuevas") {
      return Response.json({ error: "Esta invitación de demostración no se puede eliminar." }, { status: 400 });
    }
    await ensureWeddingSchema();
    await getD1().prepare("DELETE FROM guests WHERE token = ?").bind(token).run();
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No fue posible eliminar la invitación." }, { status: 500 });
  }
}
