import { getWeddingAlbumStore, getWeddingDatabase } from "../../../../db/runtime";
import { getAdminAccess } from "../../../admin/admin-auth";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    if (!/^\d+$/.test(id)) return new Response("Fotografía no encontrada", { status: 404 });

    const { sql } = getWeddingDatabase();
    const photos = await sql<{ object_key: string; content_type: string }>`
      SELECT object_key, content_type FROM album_photos
      WHERE id = ${id} AND status = 'approved'
      LIMIT 1`;
    const photo = photos[0];
    if (!photo) return new Response("Fotografía no encontrada", { status: 404 });

    const object = await getWeddingAlbumStore().getWithMetadata(photo.object_key, { type: "stream" });
    if (!object) return new Response("Fotografía no encontrada", { status: 404 });
    return new Response(object.data, {
      headers: {
        "content-type": photo.content_type,
        "cache-control": "public, max-age=86400",
        ...(object.etag ? { etag: object.etag } : {}),
      },
    });
  } catch {
    return new Response("No fue posible abrir la fotografía", { status: 500 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const access = await getAdminAccess();
  if (!access.user) return Response.json({ error: "Inicia sesión para continuar." }, { status: 401 });

  try {
    const { id } = await context.params;
    if (!/^\d+$/.test(id)) return Response.json({ error: "Fotografía no encontrada." }, { status: 404 });

    const { sql } = getWeddingDatabase();
    const photos = await sql<{ object_key: string }>`
      SELECT object_key FROM album_photos WHERE id = ${id} LIMIT 1`;
    const photo = photos[0];
    if (!photo) return Response.json({ error: "Fotografía no encontrada." }, { status: 404 });
    await getWeddingAlbumStore().delete(photo.object_key);
    await sql`DELETE FROM album_photos WHERE id = ${id}`;
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No fue posible eliminar la fotografía." }, { status: 500 });
  }
}
