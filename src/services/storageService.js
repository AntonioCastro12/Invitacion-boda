import { requireSupabase } from "./supabase";

export async function uploadEventAsset(eventId, file) {
  const extension = file.name.split(".").pop();
  const path = `${eventId}/${crypto.randomUUID()}.${extension}`;
  const { data, error } = await requireSupabase().storage.from("event-assets").upload(path, file);
  if (error) throw error;
  return data;
}
