import { isSupabaseConfigured, requireSupabase } from "./supabase";
import {
  deleteLocalPhoto,
  listLocalPhotos,
  saveLocalPhotos,
} from "./localAlbumService";

const ALLOWED_MEDIA_TYPES = new Set([
  "image/jpeg", "image/png", "image/webp", "image/gif",
  "video/mp4", "video/webm", "video/quicktime",
]);
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 25 * 1024 * 1024;

export function isVideoMedia(media) {
  const mimeType = media?.mimeType || media?.mime_type || media?.type || "";
  return mimeType.startsWith("video/") || /\.(mp4|webm|mov)(?:$|\?)/i.test(media?.url || "");
}

export async function listAlbumPhotos(event, guest, page = 0) {
  if (!isSupabaseConfigured) {
    const albumKey = `${event.id}:${event.slug}`;
    const local = await listLocalPhotos(albumKey);
    return {
      shared: false,
      photos: local.map((photo) => ({
        ...photo,
        author: photo.author,
        createdAt: photo.createdAt,
        local: true,
      })),
    };
  }

  const { data, error } = await requireSupabase().functions.invoke(
    "album-access",
    { body: { eventSlug: event.slug, guestCode: guest.code, page } },
  );
  if (error) throw error;
  const uploaded = (Array.isArray(data?.photos) ? data.photos : []).map(
    (photo) => ({
      id: photo.id,
      url: photo.signed_url,
      author: photo.uploader_name,
      createdAt: photo.created_at,
      mimeType: photo.mime_type,
      shared: true,
    }),
  );
  return {
    shared: true,
    hasMore: Boolean(data?.hasMore),
    photos: uploaded,
  };
}

export async function listOwnerAlbumPhotos(event) {
  if (!isSupabaseConfigured) return listAlbumPhotos(event, { code: "" });
  const client = requireSupabase();
  const { data, error } = await client
    .from("album_photos")
    .select("*")
    .eq("event_id", event.id)
    .eq("status", "visible")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  if (!data.length) return { shared: true, photos: [] };
  const { data: signed, error: signedError } = await client.storage
    .from("event-albums")
    .createSignedUrls(
      data.map((photo) => photo.storage_path),
      600,
    );
  if (signedError) throw signedError;
  return {
    shared: true,
    photos: data.map((photo, index) => ({
      ...photo,
      author: photo.uploader_name,
      createdAt: photo.created_at,
      url: signed[index]?.signedUrl,
      shared: true,
    })),
  };
}

export async function hideOwnerAlbumPhoto(photo) {
  if (photo.local) return deleteLocalPhoto(photo.id);
  const { error } = await requireSupabase()
    .from("album_photos")
    .update({ status: "hidden" })
    .eq("id", photo.id);
  if (error) throw error;
}

export async function uploadAlbumPhotos(event, guest, files) {
  const media = Array.from(files);
  if (!isSupabaseConfigured) {
    await saveLocalPhotos(`${event.id}:${event.slug}`, media, guest.name);
    return;
  }

  const client = requireSupabase();
  for (const file of media) {
    const maxSize = file.type.startsWith("video/") ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (!ALLOWED_MEDIA_TYPES.has(file.type) || file.size > maxSize)
      throw new Error("Cada foto puede pesar hasta 10 MB y cada video hasta 25 MB.");
    const { data: authorization, error: authorizationError } =
      await client.functions.invoke("album-access", {
        body: {
          action: "upload-url",
          eventSlug: event.slug,
          guestCode: guest.code,
          fileName: file.name,
          mimeType: file.type,
          size: file.size,
        },
      });
    if (authorizationError) throw authorizationError;
    const { error: uploadError } = await client.storage
      .from("event-albums")
      .uploadToSignedUrl(authorization.path, authorization.token, file, {
        cacheControl: "3600",
        contentType: file.type,
      });
    if (uploadError) throw uploadError;
    const { error: metadataError } = await client.rpc("submit_album_photo", {
      p_event_slug: event.slug,
      p_guest_code: guest.code,
      p_storage_path: authorization.path,
      p_original_name: file.name,
      p_mime_type: file.type,
      p_size_bytes: file.size,
    });
    if (metadataError) throw metadataError;
  }
}

export async function removeAlbumPhoto(photo) {
  if (!photo.local)
    throw new Error(
      "Los recuerdos compartidos serán moderados desde el panel de los anfitriones.",
    );
  await deleteLocalPhoto(photo.id);
}

export { isSupabaseConfigured as isSharedAlbumEnabled };
