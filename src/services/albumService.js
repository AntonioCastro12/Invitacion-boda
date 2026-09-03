import { isSupabaseConfigured, requireSupabase } from "./supabase";
import {
  deleteLocalPhoto,
  listLocalPhotos,
  saveLocalPhotos,
} from "./localAlbumService";

export const sampleAlbumPhotos = [
  {
    id: "sample-1",
    url: "/images/dulce-eduardo-historia-01.jpg",
    author: "Familia Castro",
    createdAt: "2026-11-28T21:15:00-06:00",
    sample: true,
  },
  {
    id: "sample-2",
    url: "/images/dulce-eduardo-historia-02.jpg",
    author: "Amigos de los novios",
    createdAt: "2026-11-28T20:48:00-06:00",
    sample: true,
  },
  {
    id: "sample-3",
    url: "/images/dulce-eduardo-historia-03.jpg",
    author: "Familia Hernández",
    createdAt: "2026-11-28T19:32:00-06:00",
    sample: true,
  },
  {
    id: "sample-4",
    url: "/images/dulce-eduardo-historia-05.jpg",
    author: "Eduardo y Dulce",
    createdAt: "2026-11-28T18:10:00-06:00",
    sample: true,
  },
];

const samplesFor = (event) =>
  event.slug === "dulce-eduardo" ? sampleAlbumPhotos : [];

export async function listAlbumPhotos(event, guest, page = 0) {
  if (!isSupabaseConfigured) {
    const albumKey = `${event.id}:${event.slug}`;
    const local = await listLocalPhotos(albumKey);
    return {
      shared: false,
      photos: [
        ...local.map((photo) => ({
          ...photo,
          author: photo.author,
          createdAt: photo.createdAt,
          local: true,
        })),
        ...samplesFor(event),
      ],
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
      shared: true,
    }),
  );
  return {
    shared: true,
    hasMore: Boolean(data?.hasMore),
    photos: [...uploaded, ...(page === 0 ? samplesFor(event) : [])],
  };
}

export async function listOwnerAlbumPhotos(event) {
  if (!isSupabaseConfigured) return listAlbumPhotos(event, { code: "A7X92" });
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
  const images = Array.from(files);
  if (!isSupabaseConfigured) {
    await saveLocalPhotos(`${event.id}:${event.slug}`, images, guest.name);
    return;
  }

  const client = requireSupabase();
  for (const file of images) {
    if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024)
      throw new Error("Cada archivo debe ser una imagen de máximo 10 MB.");
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
      "Las fotografías compartidas serán moderadas desde el panel de los novios.",
    );
  await deleteLocalPhoto(photo.id);
}

export { isSupabaseConfigured as isSharedAlbumEnabled };
