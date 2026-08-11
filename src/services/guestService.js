import { demoGuests } from "../data/demoData";
import { generateGuestCode } from "../utils/generateGuestCode";
import { isDemoMode, requireSupabase } from "./supabase";

let demoGuestStore = [...demoGuests];

export function getDemoGuestByCode(code) {
  return demoGuestStore.find((guest) => guest.code === String(code).toUpperCase());
}

export async function listGuests(eventId) {
  if (isDemoMode) return demoGuestStore.filter((guest) => guest.event_id === eventId);
  const { data, error } = await requireSupabase()
    .from("guests")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

async function uniqueCode(_eventId) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = generateGuestCode();
    if (isDemoMode && !getDemoGuestByCode(code)) return code;
    if (!isDemoMode) {
      const { data, error } = await requireSupabase().from("guests").select("id").eq("code", code).maybeSingle();
      if (error) throw error;
      if (!data) return code;
    }
  }
  throw new Error("No fue posible generar un código único. Intenta nuevamente.");
}

export async function createGuest(eventId, values) {
  if (isDemoMode) {
    const guest = { ...values, event_id: eventId, code: await uniqueCode(eventId) };
    const created = { ...guest, id: crypto.randomUUID(), created_at: new Date().toISOString() };
    demoGuestStore = [created, ...demoGuestStore];
    return created;
  }
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const guest = { ...values, event_id: eventId, code: await uniqueCode(eventId) };
    const { data, error } = await requireSupabase().from("guests").insert(guest).select().single();
    if (!error) return data;
    if (error.code !== "23505") throw error;
  }
  throw new Error("No fue posible reservar un código único. Intenta nuevamente.");
}

export async function updateGuest(guestId, values) {
  if (isDemoMode) {
    demoGuestStore = demoGuestStore.map((guest) => guest.id === guestId ? { ...guest, ...values } : guest);
    return demoGuestStore.find((guest) => guest.id === guestId);
  }
  const { data, error } = await requireSupabase().from("guests").update(values).eq("id", guestId).select().single();
  if (error) throw error;
  return data;
}

export async function deleteGuest(guestId) {
  if (isDemoMode) {
    demoGuestStore = demoGuestStore.filter((guest) => guest.id !== guestId);
    return;
  }
  const { error } = await requireSupabase().from("guests").delete().eq("id", guestId);
  if (error) throw error;
}
