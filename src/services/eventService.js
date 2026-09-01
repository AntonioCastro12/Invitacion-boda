import { demoEvent } from "../data/demoData";
import { getDemoPlatformState, getDemoRuntimeEvent, saveDemoPlatformState } from "./demoPlatformService";
import { getDemoGuestByCode } from "./guestService";
import { isDemoMode, requireSupabase } from "./supabase";

export async function getPublicInvitation(eventSlug, guestCode) {
  if (isDemoMode) {
    const guest = getDemoGuestByCode(guestCode);
    if (eventSlug !== demoEvent.slug || !guest) return null;
    return { event: getDemoRuntimeEvent(), guest };
  }

  const { data, error } = await requireSupabase().rpc("get_public_invitation", {
    p_event_slug: eventSlug,
    p_guest_code: guestCode.toUpperCase()
  });
  if (error) throw error;
  return data?.event && data?.guest ? data : null;
}

export async function getMyEvent() {
  if (isDemoMode) return getDemoRuntimeEvent();
  const client = requireSupabase();
  const { data, error } = await client
    .from("events")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const { data: entitlement, error: entitlementError } = await client
    .from("event_entitlements")
    .select("plan_key, feature_overrides, plan:plans(name, price, gallery_limit, features)")
    .eq("event_id", data.id)
    .maybeSingle();
  if (entitlementError) throw entitlementError;
  if (!entitlement?.plan) return data;
  return {
    ...data,
    plan: entitlement.plan.name,
    plan_key: entitlement.plan_key,
    package_price: entitlement.plan.price,
    gallery_limit: entitlement.plan.gallery_limit,
    features: { ...entitlement.plan.features, ...entitlement.feature_overrides }
  };
}

export async function updateEvent(eventId, updates) {
  if (isDemoMode) {
    const state = getDemoPlatformState();
    saveDemoPlatformState({ eventOverrides: { ...state.eventOverrides, ...updates } });
    return getDemoRuntimeEvent();
  }
  const { data, error } = await requireSupabase()
    .from("events")
    .update(updates)
    .eq("id", eventId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
