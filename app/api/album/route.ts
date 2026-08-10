import { getWeddingAlbumStore, getWeddingDatabase } from "../../../db/runtime";

type GuestRow = { id: string };

export async function GET() {
  try {
    const { sql } = getWeddingDatabase();
    const photos = await sql<{ id: string; filename: string; created_at: string; uploader: string }>`
      SELECT p.id, p.filename, p.created_at, g.name AS uploader
      FROM album_photos p
      JOIN guests g ON g.id = p.guest_id
      WHERE p.status = 'approved'
      ORDER BY p.created_at DESC, p.id DESC
      LIMIT 24`;
    return Response.json({ photos: photos.map((photo) => ({ ...photo, url: `/api/album/${photo.id}` })) });
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

    const { sql } = getWeddingDatabase();
    const guestRows = await sql<GuestRow>`SELECT id FROM guests WHERE token = ${token} LIMIT 1`;
    const guest = guestRows[0];
    if (!guest) return Response.json({ error: "Necesitas una invitación válida para subir fotografías." }, { status: 403 });

    const extension = file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "").slice(0, 5) || "jpg";
    const objectKey = `album/${guest.id}/${crypto.randomUUID()}.${extension}`;
    const store = getWeddingAlbumStore();
    await store.set(objectKey, await file.arrayBuffer(), {
      metadata: { contentType: file.type, filename: file.name.slice(0, 150) },
    });

    try {
      const photos = await sql<{ id: string; filename: string; created_at: string }>`
        INSERT INTO album_photos (guest_id, object_key, filename, content_type)
        VALUES (${guest.id}, ${objectKey}, ${file.name.slice(0, 150)}, ${file.type})
        RETURNING id, filename, created_at`;
      const photo = photos[0];
      return Response.json({ photo: photo ? { ...photo, url: `/api/album/${photo.id}` } : null }, { status: 201 });
    } catch (error) {
      await store.delete(objectKey);
      throw error;
    }
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No fue posible subir la fotografía." }, { status: 500 });
  }
}
