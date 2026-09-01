import { createClient } from "npm:@supabase/supabase-js@2.112.3";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (request.method !== "POST") return json({ error: "Método no permitido" }, 405);
  try {
    const body = await request.json();
    const eventSlug = String(body.eventSlug || "").trim().toLowerCase();
    const guestCode = String(body.guestCode || "").trim().toUpperCase();
    if (!eventSlug || !guestCode) return json({ error: "Invitación no válida" }, 400);
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
    const { data: event } = await admin.from("events").select("id").eq("slug", eventSlug).maybeSingle();
    if (!event) return json({ error: "Invitación no válida" }, 404);
    const { data: entitlement } = await admin.from("event_entitlements").select("feature_overrides,plan:plans(features)").eq("event_id", event.id).maybeSingle();
    const features = { ...(entitlement?.plan?.features || {}), ...(entitlement?.feature_overrides || {}) };
    if (!features.collaborative_album) return json({ error: "Álbum no incluido en este evento" }, 403);
    const { data: guest } = await admin.from("guests").select("id,name").eq("event_id", event.id).eq("code", guestCode).maybeSingle();
    if (!guest) return json({ error: "Invitación no válida" }, 404);

    if (body.action === "upload-url") {
      const size = Number(body.size);
      const mimeType = String(body.mimeType || "");
      if (!allowedTypes.has(mimeType) || !Number.isFinite(size) || size < 1 || size > 10 * 1024 * 1024) return json({ error: "Archivo no permitido" }, 400);
      const extension = String(body.fileName || "foto.jpg").split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const path = `${event.id}/${guest.id}/${crypto.randomUUID()}.${extension}`;
      const { data, error } = await admin.storage.from("event-albums").createSignedUploadUrl(path);
      if (error) throw error;
      return json({ path, token: data.token });
    }

    const page = Math.max(0, Math.floor(Number(body.page) || 0));
    const pageSize = 40;
    const start = page * pageSize;
    const { data: photoRows, error } = await admin.from("album_photos").select("id,uploader_name,storage_path,created_at").eq("event_id", event.id).eq("status", "visible").order("created_at", { ascending: false }).range(start, start + pageSize);
    if (error) throw error;
    const hasMore = (photoRows?.length || 0) > pageSize;
    const photos = (photoRows || []).slice(0, pageSize);
    if (!photos?.length) return json({ photos: [] });
    const { data: signed, error: signedError } = await admin.storage.from("event-albums").createSignedUrls(photos.map((photo) => photo.storage_path), 600);
    if (signedError) throw signedError;
    return json({ hasMore, photos: photos.map((photo, index) => ({ ...photo, signed_url: signed[index]?.signedUrl })) });
  } catch {
    return json({ error: "No fue posible acceder al álbum privado" }, 500);
  }
});
