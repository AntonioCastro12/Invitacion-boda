import { demoEvent } from "../data/demoData";
import { getDemoGuestByCode } from "./guestService";
import { isDemoMode, requireSupabase } from "./supabase";

export async function getPublicInvitation(eventSlug, guestCode) {
  if (isDemoMode) {
    const guest = getDemoGuestByCode(guestCode);
    if (eventSlug !== demoEvent.slug || !guest) return null;
    return { event: demoEvent, guest };
  }

  const { data, error } = await requireSupabase().rpc("get_public_invitation", {
    p_event_slug: eventSlug,
    p_guest_code: guestCode.toUpperCase()
  });
  if (error) throw error;
  return data?.event && data?.guest ? data : null;
}

export async function getMyEvent() {
  if (isDemoMode) return demoEvent;
  const { data, error } = await requireSupabase()
    .from("events")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateEvent(eventId, updates) {
  if (isDemoMode) return { ...demoEvent, ...updates };
  const { data, error } = await requireSupabase()
    .from("events")
    .update(updates)
    .eq("id", eventId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
