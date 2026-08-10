import { ensureWeddingSchema, getD1, getMediaBucket } from "../../../db/runtime";

type GuestRow = { id: number };

export async function GET() {
  try {
    await ensureWeddingSchema();
    const result = await getD1().prepare(`SELECT p.id, p.filename, p.created_at, g.name uploader
      FROM album_photos p
      JOIN guests g ON g.id = p.guest_id
      WHERE p.status = 'approved'
      ORDER BY p.created_at DESC, p.id DESC
      LIMIT 24`).all<{ id: number; filename: string; created_at: string; uploader: string }>();
    return Response.json({ photos: (result.results ?? []).map((photo) => ({ ...photo, url: `/api/album/${photo.id}` })) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No fue posible cargar el álbum." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const token = String(form.get("token") ?? "").trim();
    const file = form.get("photo");
    if (!(file instanceof File) || !file.type.startsWith("image/")) {
      return Response.json({ error: "Selecciona una fotografía válida." }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return Response.json({ error: "La fotografía debe pesar menos de 10 MB." }, { status: 400 });
    }

    await ensureWeddingSchema();
    const db = getD1();
    const guest = await db.prepare("SELECT id FROM guests WHERE token = ?").bind(token).first<GuestRow>();
    if (!guest) return Response.json({ error: "Necesitas una invitación válida para subir fotografías." }, { status: 403 });

    const extension = file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "").slice(0, 5) || "jpg";
    const objectKey = `album/${guest.id}/${crypto.randomUUID()}.${extension}`;
    const bucket = getMediaBucket();
    await bucket.put(objectKey, file.stream(), { httpMetadata: { contentType: file.type } });

    try {
      const photo = await db.prepare(`INSERT INTO album_photos
        (guest_id, object_key, filename, content_type)
        VALUES (?, ?, ?, ?)
        RETURNING id, filename, created_at`)
        .bind(guest.id, objectKey, file.name.slice(0, 150), file.type)
        .first<{ id: number; filename: string; created_at: string }>();
      return Response.json({ photo: photo ? { ...photo, url: `/api/album/${photo.id}` } : null }, { status: 201 });
    } catch (error) {
      await bucket.delete(objectKey);
      throw error;
    }
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No fue posible subir la fotografía." }, { status: 500 });
  }
}
