import { demoEvent } from "../data/demoData";
import { getPackage, resolvePackage } from "../data/packageCatalog";

const STORAGE_KEY = "rcm-demo-platform-v1";
const CHANGE_EVENT = "rcm-demo-platform-change";
const DEMO_ADMIN_ACCOUNT = { id: "demo-admin", label: "Administrador RCM", email: "admin@rcminvitaciones.com", password: "admin2026", role: "super_admin" };
const DULCE_MANAGEMENT_FEATURES = {
  admin_panel: true,
  guest_database: true,
  form_rsvp: true,
  database_rsvp: true,
  confirmation_statuses: true,
  pass_count: true,
  confirmation_panel: true,
  personalized_passes: true,
  individual_qr: true,
  collaborative_album: true,
  statistics: true
};

const initialState = {
  packageKey: "elegante-900",
  featureOverrides: DULCE_MANAGEMENT_FEATURES,
  eventOverrides: {},
  projects: [
    { id: demoEvent.id, name: "Dulce & Eduardo", slug: "dulce-eduardo", eventType: "Boda", date: "2026-10-10", clientName: "Dulce y Eduardo", clientEmail: "demo@rcminvitaciones.com", clientPassword: "demostracion", packageKey: "elegante-900", featureOverrides: DULCE_MANAGEMENT_FEATURES, status: "published", designKey: "elegante-clasica", invitationUrl: "/evento/dulce-eduardo/A7X92" },
    { id: "22222222-2222-4222-8222-222222222222", name: "Valentina Isabella", slug: "valentina-isabella", eventType: "XV años", date: "2026-10-18", clientName: "Valentina y familia", clientEmail: "valentina@rcminvitaciones.com", clientPassword: "valentina2026", packageKey: "vip-5000", status: "published", designKey: "enlace-externo", invitationUrl: "https://prueba-invitacionxv.netlify.app/" }
  ],
  client: {
    nombre: "Dulce y Eduardo",
    email: "demo@rcminvitaciones.com",
    password: "demostracion"
  }
};

function readState() {
  if (typeof window === "undefined") return initialState;
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
    const savedProjects = Array.isArray(saved.projects) ? saved.projects : [];
    const projects = savedProjects.map((project) => {
      const example = initialState.projects.find((item) => item.id === project.id || item.slug === project.slug);
      return example ? { ...example, ...project } : project;
    });
    for (const example of initialState.projects) if (!projects.some((project) => project.id === example.id || project.slug === example.slug)) projects.push(example);
    const primary = projects.find((project) => project.id === demoEvent.id || project.slug === demoEvent.slug);
    if (primary) {
      primary.status = "published";
      primary.designKey = "elegante-clasica";
      primary.invitationUrl = "/evento/dulce-eduardo/A7X92";
      primary.featureOverrides = { ...DULCE_MANAGEMENT_FEATURES, ...(primary.featureOverrides || {}) };
    }
    return {
      ...initialState,
      ...saved,
      client: { ...initialState.client, ...(saved.client || {}) },
      featureOverrides: { ...DULCE_MANAGEMENT_FEATURES, ...(saved.featureOverrides || {}) },
      projects
    };
  } catch {
    return initialState;
  }
}

function writeState(nextState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: nextState }));
  return nextState;
}

export function getDemoPlatformState() {
  return readState();
}

export function getDemoLoginAccounts() {
  const { projects } = readState();
  const clientAccounts = projects
    .filter((project) => project.clientEmail?.trim() && project.clientPassword)
    .map((project) => ({
      id: project.id,
      label: `Cliente ${project.name}`,
      email: project.clientEmail.trim().toLowerCase(),
      password: project.clientPassword,
      role: "cliente"
    }));
  return [DEMO_ADMIN_ACCOUNT, ...clientAccounts];
}

export function getDemoRuntimeEvent() {
  const state = readState();
  const activeId = typeof window !== "undefined" ? window.sessionStorage.getItem("rcm-demo-active-project") : null;
  const project = state.projects.find((item) => item.id === activeId) || state.projects.find((item) => item.id === demoEvent.id);
  const isPrimary = project?.id === demoEvent.id;
  const entitlement = resolvePackage(isPrimary ? state.packageKey : project?.packageKey, isPrimary ? state.featureOverrides : project?.featureOverrides);
  return {
    ...demoEvent,
    ...(isPrimary ? state.eventOverrides : {}),
    id: project?.id || demoEvent.id,
    client_id: isPrimary ? demoEvent.client_id : `demo-client-${project.id}`,
    name: project?.name || demoEvent.name,
    slug: project?.slug || demoEvent.slug,
    event_type: project?.eventType || demoEvent.event_type,
    event_date: project?.date || demoEvent.event_date,
    invitation_url: project?.invitationUrl || "",
    template_key: project?.designKey || demoEvent.template_key,
    plan: entitlement.name,
    plan_key: entitlement.key,
    package_price: entitlement.price,
    gallery_limit: entitlement.galleryLimit,
    features: entitlement.features
  };
}

export function saveDemoPlatformState(updates) {
  const current = readState();
  const next = {
    ...current,
    ...updates,
    client: { ...current.client, ...(updates.client || {}) },
    eventOverrides: { ...current.eventOverrides, ...(updates.eventOverrides || {}) },
    featureOverrides: updates.featureOverrides ?? current.featureOverrides
  };
  return writeState(next);
}

export function setDemoPackage(packageKey) {
  getPackage(packageKey);
  return saveDemoPlatformState({ packageKey, featureOverrides: {} });
}

export function updateDemoProject(projectId, updates) {
  const state = readState();
  const current = state.projects.find((project) => project.id === projectId);
  if (!current) throw new Error("No encontramos el proyecto seleccionado.");
  const project = { ...current, ...updates };
  const next = { ...state, projects: state.projects.map((item) => item.id === projectId ? project : item) };
  if (projectId === demoEvent.id) {
    if (updates.packageKey) next.packageKey = updates.packageKey;
    if (updates.featureOverrides) next.featureOverrides = updates.featureOverrides;
    next.client = { ...state.client, nombre: project.clientName, email: project.clientEmail, password: project.clientPassword };
  }
  return writeState(next);
}

export function resetDemoPlatform() {
  return writeState(initialState);
}

export function createDemoProject(values) {
  const state = readState();
  const slug = values.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (!values.name.trim() || !slug || !values.clientName.trim() || !values.clientEmail.trim()) throw new Error("Completa evento, slug, nombre y correo del cliente.");
  if (values.clientPassword.length < 6) throw new Error("La contraseña temporal debe tener al menos 6 caracteres.");
  if (state.projects.some((project) => project.slug === slug)) throw new Error("Ya existe un evento con ese slug.");
  const invitationUrl = normalizeInvitationUrl(values.invitationUrl);
  const project = { id: crypto.randomUUID(), name: values.name.trim(), slug, eventType: values.eventType, date: values.date, clientName: values.clientName.trim(), clientEmail: values.clientEmail.trim().toLowerCase(), clientPassword: values.clientPassword, packageKey: values.packageKey, status: invitationUrl ? "published" : "design", designKey: invitationUrl ? "enlace-externo" : null, invitationUrl };
  return writeState({ ...state, projects: [...state.projects, project] });
}

function normalizeInvitationUrl(value) {
  const clean = String(value || "").trim();
  if (!clean) return "";
  try {
    const url = new URL(clean);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
    return url.toString();
  } catch { throw new Error("Escribe una URL pública válida que comience con http:// o https://."); }
}

export function subscribeDemoPlatform(listener) {
  const handler = (event) => listener(event.detail || readState());
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function authenticateDemoAccount(email, password) {
  const normalized = email.trim().toLowerCase();
  if (normalized === DEMO_ADMIN_ACCOUNT.email && password === DEMO_ADMIN_ACCOUNT.password) {
    return { id: DEMO_ADMIN_ACCOUNT.id, nombre: "RCM Code Dev", email: normalized, rol: DEMO_ADMIN_ACCOUNT.role };
  }
  const { client, projects } = readState();
  const assigned = projects.find((project) => project.clientEmail?.trim().toLowerCase() === normalized && project.clientPassword === password);
  if (assigned) {
    window.sessionStorage.setItem("rcm-demo-active-project", assigned.id);
    return { id: assigned.id === demoEvent.id ? demoEvent.client_id : `demo-client-${assigned.id}`, eventId: assigned.id, nombre: assigned.clientName, email: assigned.clientEmail, rol: "cliente" };
  }
  if (normalized === client.email.trim().toLowerCase() && password === client.password) {
    window.sessionStorage.setItem("rcm-demo-active-project", demoEvent.id);
    return { id: demoEvent.client_id, nombre: client.nombre, email: client.email, rol: "cliente" };
  }
  throw new Error("El correo o la contraseña de demostración no son correctos.");
}

export function clearDemoActiveProject() {
  if (typeof window !== "undefined") window.sessionStorage.removeItem("rcm-demo-active-project");
}
