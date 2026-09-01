import { isDemoMode, requireSupabase } from "./supabase";

const storageKey = (eventId) => `rcm-checkins-${eventId}`;
const readLocal = (eventId) => {
  try { return JSON.parse(window.localStorage.getItem(storageKey(eventId)) || "[]"); }
  catch { return []; }
};

export async function listCheckIns(eventId, guests = []) {
  if (isDemoMode) {
    const guestMap = new Map(guests.map((guest) => [guest.id, guest]));
    return readLocal(eventId).map((record) => ({ ...record, guest: guestMap.get(record.guest_id) })).filter((record) => record.guest);
  }
  const { data, error } = await requireSupabase().from("check_ins").select("*,guest:guests(id,name,passes,code,table_name)").eq("event_id", eventId).order("checked_in_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function registerCheckIn(event, guest, attendees) {
  const count = Number(attendees);
  if (!Number.isInteger(count) || count < 1 || count > guest.passes) throw new Error(`Puedes registrar entre 1 y ${guest.passes} personas.`);
  if (isDemoMode) {
    const records = readLocal(event.id);
    if (records.some((record) => record.guest_id === guest.id)) throw new Error("Este código ya fue utilizado. No se permite una entrada duplicada.");
    const created = { id: crypto.randomUUID(), event_id: event.id, guest_id: guest.id, attendees: count, checked_in_at: new Date().toISOString() };
    window.localStorage.setItem(storageKey(event.id), JSON.stringify([created, ...records]));
    return created;
  }
  const { data, error } = await requireSupabase().rpc("register_check_in", { p_event_id: event.id, p_guest_code: guest.code, p_attendees: count });
  if (error) throw error;
  return data;
}

export async function undoCheckIn(eventId, checkInId) {
  if (isDemoMode) {
    window.localStorage.setItem(storageKey(eventId), JSON.stringify(readLocal(eventId).filter((record) => record.id !== checkInId)));
    return;
  }
  const { error } = await requireSupabase().from("check_ins").delete().eq("id", checkInId);
  if (error) throw error;
}

export function extractGuestCode(value) {
  const clean = String(value || "").trim();
  if (!clean) return "";
  try { return new URL(clean).pathname.split("/").filter(Boolean).at(-1)?.toUpperCase() || ""; }
  catch { return clean.toUpperCase(); }
}

