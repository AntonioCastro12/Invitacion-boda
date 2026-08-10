import {
  getGuest,
  getWeddingAlbumStore,
  listAlbumPhotos,
  saveAlbumPhoto,
  type WeddingAlbumPhoto,
} from "../../../db/runtime";

export async function GET() {
  try {
    const records = await listAlbumPhotos();
    const photos = records
      .filter((photo) => photo.status === "approved")
      .sort((left, right) => right.created_at.localeCompare(left.created_at))
      .slice(0, 24)
      .map((photo) => ({
        id: photo.id,
        filename: photo.filename,
        created_at: photo.created_at,
        uploader: photo.uploader,
        url: `/api/album/${photo.id}`,
      }));
    return Response.json({ photos });
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

    const guest = await getGuest(token);
    if (!guest) return Response.json({ error: "Necesitas una invitación válida para subir fotografías." }, { status: 403 });

    const id = crypto.randomUUID();
    const extension = file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "").slice(0, 5) || "jpg";
    const objectKey = `album-files/${token}/${id}.${extension}`;
    const store = getWeddingAlbumStore();
    await store.set(objectKey, await file.arrayBuffer(), {
      metadata: { contentType: file.type, filename: file.name.slice(0, 150) },
    });

    const photo: WeddingAlbumPhoto = {
      id,
      guest_token: token,
      uploader: guest.name,
      object_key: objectKey,
      filename: file.name.slice(0, 150),
      content_type: file.type,
      status: "approved",
      created_at: new Date().toISOString(),
    };

    try {
      await saveAlbumPhoto(photo);
      return Response.json({
        photo: {
          id: photo.id,
          filename: photo.filename,
          created_at: photo.created_at,
          uploader: photo.uploader,
          url: `/api/album/${photo.id}`,
        },
      }, { status: 201 });
    } catch (error) {
      await store.delete(objectKey);
      throw error;
    }
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No fue posible subir la fotografía." }, { status: 500 });
  }
}
