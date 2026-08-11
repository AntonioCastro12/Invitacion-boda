import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("configura Vite y el fallback SPA de Netlify", async () => {
  const [pkg, netlify, index] = await Promise.all([read("package.json"), read("netlify.toml"), read("index.html")]);
  assert.match(pkg, /"dev": "vite"/);
  assert.match(pkg, /react-router-dom/);
  assert.match(netlify, /publish = "dist"/);
  assert.match(netlify, /to = "\/index\.html"/);
  assert.match(index, /src\/main\.jsx/);
});

test("protege datos por propietario y limita la invitación pública", async () => {
  const sql = await read("supabase/migrations/202608110001_initial_schema.sql");
  assert.match(sql, /enable row level security/g);
  assert.match(sql, /client_id = auth\.uid\(\)/);
  assert.match(sql, /owns_event\(event_id\)/);
  assert.match(sql, /get_public_invitation/);
  assert.match(sql, /revoke all on public\.profiles, public\.events, public\.guests from anon/);
});

test("incluye rutas, CRUD y personalización dinámica", async () => {
  const [app, invitation, guests, pass] = await Promise.all([
    read("src/App.jsx"), read("src/pages/InvitationPage.jsx"), read("src/pages/GuestsPage.jsx"), read("src/components/invitation/PersonalizedPass.jsx")
  ]);
  assert.match(app, /evento\/:eventoSlug\/:codigoInvitado/);
  assert.match(app, /path="invitados"/);
  assert.match(invitation, /useGuest\(eventoSlug, codigoInvitado\)/);
  assert.match(guests, /createGuest/);
  assert.match(guests, /deleteGuest/);
  assert.match(pass, /guest\.name/);
  assert.match(pass, /guest\.passes/);
});

test("selecciona una plantilla distinta por evento", async () => {
  const [renderer, migration, welcome] = await Promise.all([
    read("src/templates/InvitationTemplateRenderer.jsx"),
    read("supabase/migrations/202608110003_invitation_templates.sql"),
    read("src/components/invitation/WelcomeScreen.jsx")
  ]);
  assert.match(renderer, /event\.template_key/);
  assert.match(renderer, /elegante-clasica/);
  assert.match(migration, /add column if not exists template_key/);
  assert.match(welcome, /screen-envelope__seal/);
  assert.match(welcome, /event\.name/);
});

test("la plantilla clásica conserva todas las secciones de demostración", async () => {
  const template = await read("src/templates/ElegantClassicTemplate.jsx");
  for (const section of ["StoryGallery", "WeddingVideo", "Itinerary", "CalendarSection", "Location", "PersonalizedPass", "WhatsAppConfirmation", "DressCode", "GiftRegistry", "CollaborativeAlbum", "FinalMessage"]) {
    assert.match(template, new RegExp(section));
  }
  assert.match(template, /event\.template_config/);
});

test("nuestra historia funciona como carrusel táctil", async () => {
  const gallery = await read("src/components/invitation/StoryGallery.jsx");
  assert.match(gallery, /story-carousel/);
  assert.match(gallery, /drag=/);
  assert.match(gallery, /setInterval/);
  assert.match(gallery, /Fotografía anterior/);
  assert.match(gallery, /Fotografía siguiente/);
});

test("usa el WhatsApp configurado para las confirmaciones", async () => {
  const [demo, seed] = await Promise.all([read("src/data/demoData.js"), read("supabase/seed.sql")]);
  assert.match(demo, /whatsapp: "5214623105704"/);
  assert.match(seed, /'5214623105704'/);
});

test("el panel transforma invitados en tarjetas móviles", async () => {
  const [table, styles] = await Promise.all([
    read("src/admin/GuestTable.jsx"),
    read("src/styles/extensions.css")
  ]);
  assert.match(table, /data-label="Invitado"/);
  assert.match(table, /data-label="Acciones"/);
  assert.match(styles, /\.guest-table td::before/);
  assert.match(styles, /grid-template-columns: repeat\(5, 1fr\)/);
  assert.match(styles, /font-size: 16px/);
});
