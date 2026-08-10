import { ensureWeddingSchema, getD1, getMediaBucket } from "../../../../db/runtime";
import { getAdminAccess } from "../../../admin/admin-auth";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await ensureWeddingSchema();
    const { id } = await context.params;
    const photo = await getD1().prepare("SELECT object_key, content_type FROM album_photos WHERE id = ? AND status = 'approved'")
      .bind(Number(id))
      .first<{ object_key: string; content_type: string }>();
    if (!photo) return new Response("Fotografía no encontrada", { status: 404 });

    const object = await getMediaBucket().get(photo.object_key);
    if (!object) return new Response("Fotografía no encontrada", { status: 404 });
    return new Response(object.body, {
      headers: {
        "content-type": photo.content_type,
        "cache-control": "public, max-age=86400",
        etag: object.httpEtag,
      },
    });
  } catch {
    return new Response("No fue posible abrir la fotografía", { status: 500 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const access = await getAdminAccess();
  if (!access.user) return Response.json({ error: "Inicia sesión para continuar." }, { status: 401 });
  if (!access.isAllowed) return Response.json({ error: "Tu cuenta no tiene acceso al panel." }, { status: 403 });

  try {
    await ensureWeddingSchema();
    const { id } = await context.params;
    const db = getD1();
    const photo = await db.prepare("SELECT object_key FROM album_photos WHERE id = ?")
      .bind(Number(id))
      .first<{ object_key: string }>();
    if (!photo) return Response.json({ error: "Fotografía no encontrada." }, { status: 404 });
    await getMediaBucket().delete(photo.object_key);
    await db.prepare("DELETE FROM album_photos WHERE id = ?").bind(Number(id)).run();
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No fue posible eliminar la fotografía." }, { status: 500 });
  }
}
