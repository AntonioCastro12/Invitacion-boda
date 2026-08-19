import { isSupabaseConfigured, requireSupabase } from "./supabase";
import { deleteLocalPhoto, listLocalPhotos, saveLocalPhotos } from "./localAlbumService";

export const sampleAlbumPhotos = [
  { id: "sample-1", url: "/images/pareja-4.jpg", author: "Familia Castro", createdAt: "2026-10-10T21:15:00-06:00", sample: true },
  { id: "sample-2", url: "/images/pareja-5.jpg", author: "Amigos de los novios", createdAt: "2026-10-10T20:48:00-06:00", sample: true },
  { id: "sample-3", url: "/images/pareja-2.jpg", author: "Familia Hernández", createdAt: "2026-10-10T19:32:00-06:00", sample: true },
  { id: "sample-4", url: "/images/pareja-1.jpg", author: "Dulce & Eduardo", createdAt: "2026-10-10T18:10:00-06:00", sample: true }
];

function publicPhotoUrl(path) {
  return requireSupabase().storage.from("event-albums").getPublicUrl(path).data.publicUrl;
}

export async function listAlbumPhotos(event, guest) {
  if (!isSupabaseConfigured) {
    const albumKey = `${event.id}:${event.slug}`;
    const local = await listLocalPhotos(albumKey);
    return {
      shared: false,
      photos: [...local.map((photo) => ({ ...photo, author: photo.author, createdAt: photo.createdAt, local: true })), ...sampleAlbumPhotos]
    };
  }

  const { data, error } = await requireSupabase().rpc("get_public_album", {
    p_event_slug: event.slug,
    p_guest_code: guest.code
  });
  if (error) throw error;
  const uploaded = (Array.isArray(data) ? data : []).map((photo) => ({
    id: photo.id,
    url: publicPhotoUrl(photo.storage_path),
    author: photo.uploader_name,
    createdAt: photo.created_at,
    shared: true
  }));
  return { shared: true, photos: [...uploaded, ...sampleAlbumPhotos] };
}

export async function uploadAlbumPhotos(event, guest, files) {
  const images = Array.from(files);
  if (!isSupabaseConfigured) {
    await saveLocalPhotos(`${event.id}:${event.slug}`, images, guest.name);
    return;
  }

  const client = requireSupabase();
  for (const file of images) {
    if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) throw new Error("Cada archivo debe ser una imagen de máximo 10 MB.");
    const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `${event.id}/${guest.id}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await client.storage.from("event-albums").upload(path, file, { cacheControl: "3600", contentType: file.type, upsert: false });
    if (uploadError) throw uploadError;
    const { error: metadataError } = await client.rpc("submit_album_photo", {
      p_event_slug: event.slug,
      p_guest_code: guest.code,
      p_storage_path: path,
      p_original_name: file.name,
      p_mime_type: file.type,
      p_size_bytes: file.size
    });
    if (metadataError) throw metadataError;
  }
}

export async function removeAlbumPhoto(photo) {
  if (!photo.local) throw new Error("Las fotografías compartidas serán moderadas desde el panel de los novios.");
  await deleteLocalPhoto(photo.id);
}

export { isSupabaseConfigured as isSharedAlbumEnabled };
