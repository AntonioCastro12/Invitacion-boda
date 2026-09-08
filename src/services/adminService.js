import { requireSupabase } from "./supabase";

function normalizeUrl(value) {
  const clean = String(value || "").trim();
  if (!clean) return null;
  const url = new URL(clean);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error("La URL debe comenzar con http:// o https://.");
  return url.toString();
}

function normalizeSlug(value) {
  return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function getAdminPlatformState() {
  const client = requireSupabase();
  const [eventsResult, profilesResult, entitlementsResult] = await Promise.all([
    client.from("events").select("*").order("created_at", { ascending: true }),
    client.from("profiles").select("id,nombre,email,rol").eq("rol", "cliente"),
    client.from("event_entitlements").select("event_id,plan_key,feature_overrides")
  ]);
  const error = eventsResult.error || profilesResult.error || entitlementsResult.error;
  if (error) throw error;
  const profiles = new Map(profilesResult.data.map((profile) => [profile.id, profile]));
  const entitlements = new Map(entitlementsResult.data.map((item) => [item.event_id, item]));
  const projects = eventsResult.data.map((event) => {
    const owner = profiles.get(event.client_id) || {};
    const entitlement = entitlements.get(event.id) || {};
    return {
      id: event.id,
      name: event.name,
      slug: event.slug,
      eventType: event.event_type,
      date: event.event_date,
      clientId: event.client_id,
      clientName: owner.nombre || "Cliente sin perfil",
      clientEmail: owner.email || "",
      clientPassword: "",
      packageKey: entitlement.plan_key || "elegante-900",
      featureOverrides: entitlement.feature_overrides || {},
      status: event.invitation_url ? "published" : "design",
      designKey: event.template_key,
      invitationUrl: event.invitation_url || ""
    };
  });
  return { projects };
}

async function saveClientAccount({ clientName, clientEmail, clientPassword }) {
  const { data, error } = await requireSupabase().functions.invoke("admin-users", {
    body: { action: "upsert_client", name: clientName, email: clientEmail, password: clientPassword }
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data.user;
}

export async function createAdminProject(values) {
  const name = values.name.trim();
  const slug = normalizeSlug(values.slug);
  if (!name || !slug || !values.clientName.trim() || !values.clientEmail.trim()) throw new Error("Completa evento, slug, nombre y correo del cliente.");
  if (values.clientPassword.length < 6) throw new Error("La contraseña temporal debe tener al menos 6 caracteres.");
  const account = await saveClientAccount({ clientName: values.clientName.trim(), clientEmail: values.clientEmail.trim().toLowerCase(), clientPassword: values.clientPassword });
  const invitationUrl = normalizeUrl(values.invitationUrl);
  const selectedPlan = values.packageKey || "elegante-900";
  const client = requireSupabase();
  const { data: event, error } = await client.from("events").insert({
    client_id: account.id,
    name,
    slug,
    event_type: values.eventType,
    event_date: values.date,
    event_time: "17:00",
    plan: selectedPlan,
    whatsapp: "",
    invitation_url: invitationUrl,
    template_key: invitationUrl ? "enlace-externo" : "elegante-clasica"
  }).select().single();
  if (error) throw error;
  const { error: entitlementError } = await client.from("event_entitlements").insert({ event_id: event.id, plan_key: selectedPlan, feature_overrides: {} });
  if (entitlementError) throw entitlementError;
  return event;
}

export async function updateAdminProject(projectId, updates) {
  const client = requireSupabase();
  const eventUpdates = {};
  if (Object.hasOwn(updates, "invitationUrl")) {
    eventUpdates.invitation_url = normalizeUrl(updates.invitationUrl);
    eventUpdates.template_key = eventUpdates.invitation_url ? "enlace-externo" : "elegante-clasica";
  }
  if (updates.name) eventUpdates.name = updates.name.trim();
  if (updates.date) eventUpdates.event_date = updates.date;
  if (updates.eventType) eventUpdates.event_type = updates.eventType;
  if (Object.keys(eventUpdates).length) {
    const { error } = await client.from("events").update(eventUpdates).eq("id", projectId);
    if (error) throw error;
  }
  if (updates.packageKey || updates.featureOverrides) {
    const payload = { event_id: projectId };
    if (updates.packageKey) payload.plan_key = updates.packageKey;
    if (updates.featureOverrides) payload.feature_overrides = updates.featureOverrides;
    const { error } = await client.from("event_entitlements").upsert(payload, { onConflict: "event_id" });
    if (error) throw error;
  }
}

export async function updateAdminClient(values) {
  if (!values.clientName?.trim() || !values.clientEmail?.trim()) throw new Error("Completa el nombre y correo del cliente.");
  if (values.clientPassword && values.clientPassword.length < 6) throw new Error("La contraseña debe tener al menos 6 caracteres.");
  return saveClientAccount(values);
}
