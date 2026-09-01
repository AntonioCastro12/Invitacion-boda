import { isDemoMode, requireSupabase } from "./supabase";

const localKey = (eventId, guestId) => `rcm-rsvp-${eventId}-${guestId}`;

export async function submitRsvp(event, guest, values) {
  const record = {
    event_id: event.id,
    guest_id: guest.id,
    status: values.attending === "yes" ? "confirmed" : "declined",
    attendees: values.attending === "yes" ? Number(values.attendees) : 0,
    message: values.message?.trim() || "",
    updated_at: new Date().toISOString()
  };
  if (isDemoMode) {
    window.localStorage.setItem(localKey(event.id, guest.id), JSON.stringify(record));
    window.dispatchEvent(new CustomEvent("rcm-rsvp-change"));
    return record;
  }
  const { data, error } = await requireSupabase().rpc("submit_rsvp", {
    p_event_slug: event.slug,
    p_guest_code: guest.code,
    p_status: record.status,
    p_attendees: record.attendees,
    p_message: record.message
  });
  if (error) throw error;
  return data;
}

export async function listRsvps(eventId, guests = []) {
  if (isDemoMode) return guests.map((guest) => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(localKey(eventId, guest.id)) || "null");
      return { guest, status: saved?.status || "pending", attendees: saved?.attendees ?? null, message: saved?.message || "", updated_at: saved?.updated_at || null };
    } catch {
      return { guest, status: "pending", attendees: null, message: "", updated_at: null };
    }
  });
  const { data, error } = await requireSupabase().from("rsvps").select("*, guest:guests(id,name,passes,phone)").eq("event_id", eventId).order("updated_at", { ascending: false });
  if (error) throw error;
  const byGuest = new Map(data.map((item) => [item.guest_id, item]));
  return guests.map((guest) => ({ guest, status: byGuest.get(guest.id)?.status || "pending", attendees: byGuest.get(guest.id)?.attendees ?? null, message: byGuest.get(guest.id)?.message || "", updated_at: byGuest.get(guest.id)?.updated_at || null }));
}

