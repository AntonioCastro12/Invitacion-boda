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
  assert.match(app, /lazy\(\(\) => import/);
  assert.match(app, /Suspense/);
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

test("aplica un sistema visual elegante con vectores y movimiento accesible", async () => {
  const [template, ornaments, reveal, styles] = await Promise.all([
    read("src/templates/ElegantClassicTemplate.jsx"),
    read("src/components/invitation/ElegantOrnaments.jsx"),
    read("src/components/invitation/SectionReveal.jsx"),
    read("src/styles/ui-polish.css")
  ]);
  assert.match(template, /ElegantOrnaments/);
  assert.match(ornaments, /useReducedMotion/);
  assert.match(reveal, /filter: "blur\(7px\)"/);
  assert.match(styles, /\.button::before/);
  assert.match(styles, /\.invitation-section > \.section-icon/);
  assert.match(styles, /prefers-reduced-motion/);
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

test("personaliza la boda de Eduardo y Dulce con la información corregida", async () => {
  const [demo, platform, welcome, itinerary, gifts, template, theme] = await Promise.all([
    read("src/data/demoData.js"),
    read("src/services/demoPlatformService.js"),
    read("src/components/invitation/WelcomeScreen.jsx"),
    read("src/components/invitation/Itinerary.jsx"),
    read("src/components/invitation/GiftRegistry.jsx"),
    read("src/templates/ElegantClassicTemplate.jsx"),
    read("src/styles/dulce-eduardo-theme.css")
  ]);
  assert.match(demo, /name: "Eduardo y Dulce"/);
  assert.match(demo, /event_date: "2026-11-28"/);
  assert.match(platform, /date: "2026-11-28"/);
  assert.match(welcome, /<i>y<\/i>/);
  assert.match(itinerary, /iconFor\(item\.title\)/);
  assert.match(demo, /code: "60033184"/);
  assert.match(demo, /mesaderegalos\.liverpool\.com\.mx\/milistaderegalos\/60033184/);
  assert.match(demo, /amazon\.com\.mx\/wedding\/guest-view\/1BDWDEA7A44XE/);
  assert.match(gifts, /Copiar número/);
  assert.match(gifts, /Ver número del evento/);
  assert.match(gifts, /hasBankDetails/);
  assert.match(template, /!features\.whatsapp_rsvp/);
  assert.match(theme, /dulce-eduardo-historia-01\.jpg/);
  assert.match(demo, /templo-hospitalito-sin-persona-optimized\.jpg/);
  assert.match(demo, /casa-de-adobe-optimized\.jpg/);
  assert.match(demo, /eduardo-dulce-montaje\.mp4/);
  assert.match(demo, /video_poster/);
  assert.match(demo, /album_cover: "\/images\/dulce-eduardo-album-destacada\.jpg"/);
  assert.match(theme, /templo-hospitalito/);
  assert.match(theme, /aspect-ratio: 854 \/ 1280/);
  assert.match(theme, /object-fit: contain/);
});

test("une el pase personalizado con la confirmación por WhatsApp", async () => {
  const [template, combined, confirmation, pass, styles] = await Promise.all([
    read("src/templates/ElegantClassicTemplate.jsx"),
    read("src/components/invitation/PersonalizedPassConfirmation.jsx"),
    read("src/components/invitation/WhatsAppConfirmation.jsx"),
    read("src/components/invitation/PersonalizedPass.jsx"),
    read("src/styles/ui-polish.css")
  ]);
  assert.match(template, /PersonalizedPassConfirmation/);
  assert.match(template, /features\.personalized_passes && features\.whatsapp_rsvp/);
  assert.match(combined, /Tu pase y confirmación/);
  assert.match(combined, /compact/);
  assert.match(confirmation, /rsvp-section--embedded/);
  assert.match(pass, /guest\.table_name/);
  assert.match(pass, /Número de mesa/);
  assert.match(styles, /\.pass-confirmation-card/);
  assert.match(styles, /\.classic-pass__table/);
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

test("ofrece un álbum independiente mediante botón y QR con respaldo local", async () => {
  const [app, albumAccess, albumPage, service] = await Promise.all([
    read("src/App.jsx"),
    read("src/components/invitation/CollaborativeAlbum.jsx"),
    read("src/pages/AlbumPage.jsx"),
    read("src/services/localAlbumService.js")
  ]);
  assert.match(app, /album\/:eventoSlug\/:codigoInvitado/);
  assert.match(albumAccess, /QRCodeSVG/);
  assert.match(albumAccess, /Abrir álbum digital/);
  assert.match(albumPage, /accept="image\/jpeg,image\/png,image\/webp,image\/gif"/);
  assert.match(albumPage, /removeAlbumPhoto/);
  assert.match(service, /indexedDB/);
  assert.match(service, /maxPhotos: null/);
});

test("comparte el álbum mediante Supabase y muestra las cuatro fotos recientes", async () => {
  const [service, preview, page, migration] = await Promise.all([
    read("src/services/albumService.js"),
    read("src/components/invitation/CollaborativeAlbum.jsx"),
    read("src/pages/AlbumPage.jsx"),
    read("supabase/migrations/202608190001_shared_event_album.sql")
  ]);
  assert.match(service, /album-access/);
  assert.match(service, /submit_album_photo/);
  assert.match(service, /event-albums/);
  assert.match(service, /dulce-eduardo-album-destacada\.jpg/);
  assert.match(service, /author: "Eduardo y Dulce"/);
  assert.match(preview, /photos\.slice\(0, 4\)/);
  assert.match(page, /album-social-feed/);
  assert.match(migration, /enable row level security/);
  assert.match(migration, /revoke all on public\.album_photos from anon/);
  assert.match(migration, /create index album_photos_event_created_idx/);
});

test("activa servicios por paquete sin permitir que el cliente elija diseño", async () => {
  const [catalog, admin, template, settings, migration] = await Promise.all([
    read("src/data/packageCatalog.js"),
    read("src/pages/AdminPage.jsx"),
    read("src/templates/ElegantClassicTemplate.jsx"),
    read("src/pages/EventSettingsPage.jsx"),
    read("supabase/migrations/202608200001_event_package_entitlements.sql")
  ]);
  for (const price of [250, 500, 900, 1500, 2500, 5000]) assert.match(catalog, new RegExp(`price: ${price}`));
  assert.match(admin, /updateDemoProject/);
  assert.match(admin, /featureOverrides/);
  assert.match(template, /features\.music/);
  assert.match(template, /features\.collaborative_album/);
  assert.doesNotMatch(settings, /availableTemplates/);
  assert.match(migration, /event_entitlements/);
  assert.match(migration, /entitlements_update_admin/);
  assert.match(migration, /feature_overrides/);
});

test("ofrece una cola segura para enviar invitaciones por WhatsApp", async () => {
  const [guestsPage, bulkModal] = await Promise.all([
    read("src/pages/GuestsPage.jsx"),
    read("src/admin/BulkWhatsAppModal.jsx")
  ]);
  assert.match(guestsPage, /Enviar a todos/);
  assert.match(guestsPage, /BulkWhatsAppModal/);
  assert.match(bulkModal, /invitationMessage/);
  assert.match(bulkModal, /createWhatsAppUrl/);
  assert.match(bulkModal, /WhatsApp requiere confirmar cada envío/);
  assert.match(bulkModal, /withoutPhone/);
});

test("sincroniza el catálogo comercial con el PDF de paquetes", async () => {
  const [catalog, admin, template, migration] = await Promise.all([
    read("src/data/packageCatalog.js"),
    read("src/pages/AdminPage.jsx"),
    read("src/templates/ElegantClassicTemplate.jsx"),
    read("supabase/migrations/202608200005_package_catalog_pdf.sql")
  ]);
  for (const name of ["Esencial", "Clásica", "Elegante", "Premium", "Premium Plus", "VIP"]) assert.match(catalog, new RegExp(`name: "${name}"`));
  assert.match(catalog, /Invitación digital de una sola página/);
  assert.match(catalog, /Prevención de QR duplicados/);
  assert.match(catalog, /packageComparison/);
  assert.match(catalog, /Confirmación de asistencia/);
  assert.doesNotMatch(catalog, /label: "RSVP"/);
  assert.match(admin, /Comparativa rápida/);
  assert.match(admin, /¿Qué significa confirmación de asistencia\?/);
  assert.match(admin, /recommendedFor/);
  assert.match(template, /features\.embedded_video/);
  assert.match(template, /features\.add_calendar/);
  assert.match(migration, /name = 'Clásica'/);
});

test("aísla confirmaciones y convierte el álbum en privado", async () => {
  const [rsvpService, confirmations, albumService, migration, edgeFunction] = await Promise.all([
    read("src/services/rsvpService.js"),
    read("src/pages/ConfirmationsPage.jsx"),
    read("src/services/albumService.js"),
    read("supabase/migrations/202608200002_private_album_and_rsvp.sql"),
    read("supabase/functions/album-access/index.ts")
  ]);
  assert.match(rsvpService, /submit_rsvp/);
  assert.match(confirmations, /Confirmados/);
  assert.match(migration, /create table public\.rsvps/);
  assert.match(migration, /update storage\.buckets set public = false/);
  assert.match(migration, /rsvps_owner_select/);
  assert.match(albumService, /uploadToSignedUrl/);
  assert.match(edgeFunction, /createSignedUrls/);
  assert.match(edgeFunction, /event\.id/);
});

test("registra accesos VIP sin duplicados y aislados por evento", async () => {
  const [app, page, service, migration] = await Promise.all([
    read("src/App.jsx"),
    read("src/pages/CheckInPage.jsx"),
    read("src/services/checkInService.js"),
    read("supabase/migrations/202608200003_check_ins.sql")
  ]);
  assert.match(app, /path="acceso"/);
  assert.match(page, /BarcodeDetector/);
  assert.match(service, /register_check_in/);
  assert.match(service, /entrada duplicada/);
  assert.match(migration, /unique \(event_id, guest_id\)/);
  assert.match(migration, /check_ins_owner_select/);
  assert.match(migration, /owns_event\(p_event_id\)/);
  assert.match(migration, /revoke all on public\.check_ins from anon/);
});

test("presenta estadísticas y exporta un reporte operativo seguro", async () => {
  const [app, page] = await Promise.all([read("src/App.jsx"), read("src/pages/StatisticsPage.jsx")]);
  assert.match(app, /path="estadisticas"/);
  assert.match(page, /Exportar CSV/);
  assert.match(page, /URL\.createObjectURL/);
  assert.match(page, /Pases asignados/);
  assert.match(page, /Movimientos recientes/);
  assert.match(page, /\^\[=\+\\-@\]/);
});

test("asigna invitaciones externas a clientes sin copiar su diseño", async () => {
  const [admin, dashboard, platform, login, migration] = await Promise.all([
    read("src/pages/AdminPage.jsx"),
    read("src/pages/DashboardPage.jsx"),
    read("src/services/demoPlatformService.js"),
    read("src/pages/LoginPage.jsx"),
    read("supabase/migrations/202608200004_external_invitation_url.sql")
  ]);
  assert.match(admin, /invitationUrl/);
  assert.match(admin, /URL pública de la invitación/);
  assert.match(admin, /Administrar/);
  assert.match(admin, /Paquete de \{selectedProject\.name\}/);
  assert.match(dashboard, /event\.invitation_url/);
  assert.match(platform, /prueba-invitacionxv\.netlify\.app/);
  assert.match(platform, /rcm-demo-active-project/);
  assert.match(platform, /updateDemoProject/);
  assert.match(login, /getDemoLoginAccounts/);
  assert.match(platform, /Cliente \$\{project\.name\}/);
  assert.match(migration, /add column if not exists invitation_url/);
  assert.match(migration, /\^https\?\:\/\//);
});

test("respeta el modo demo explícito y muestra los accesos vigentes", async () => {
  const [supabaseService, auth, login, platform] = await Promise.all([
    read("src/services/supabase.js"),
    read("src/hooks/useAuth.jsx"),
    read("src/pages/LoginPage.jsx"),
    read("src/services/demoPlatformService.js")
  ]);
  assert.match(supabaseService, /demoModeSetting === "true"/);
  assert.match(supabaseService, /demoModeSetting !== "false" && !isSupabaseConfigured/);
  assert.match(auth, /Para usar las cuentas de muestra, activa VITE_DEMO_MODE=true/);
  assert.match(login, /demoAccounts\.map/);
  assert.match(platform, /return example \? \{ \.\.\.example, \.\.\.project \} : project/);
  assert.match(platform, /client: \{ \.\.\.initialState\.client, \.\.\.\(saved\.client \|\| \{\}\) \}/);
  assert.match(platform, /project\.clientEmail\?\.trim\(\)\.toLowerCase\(\)/);
});

test("aplica la paleta de boda únicamente a Dulce y Eduardo", async () => {
  const [template, theme, album, demoData, seed] = await Promise.all([
    read("src/templates/ElegantClassicTemplate.jsx"),
    read("src/styles/dulce-eduardo-theme.css"),
    read("src/components/invitation/CollaborativeAlbum.jsx"),
    read("src/data/demoData.js"),
    read("supabase/seed.sql")
  ]);
  assert.match(template, /event\.slug === "dulce-eduardo" \? "theme-dulce-eduardo" : ""/);
  for (const color of ["#3a381e", "#847400", "#f6a300", "#e44f00", "#661400"]) assert.match(theme, new RegExp(color));
  assert.match(theme, /\.theme-dulce-eduardo \.welcome/);
  assert.match(theme, /\.theme-dulce-eduardo \.invitation-footer/);
  assert.match(theme, /dulce-eduardo-historia-01\.jpg/);
  assert.match(theme, /dulce-eduardo-sobre\.jpg/);
  assert.match(theme, /background-position|center bottom\/100% auto/);
  for (const detail of ["Templo Hospitalito", "Salón Casa de Adobe", "Entrada de los novios", "Vals de los novios", "Fin de la fiesta"]) {
    assert.match(demoData, new RegExp(detail));
    assert.match(seed, new RegExp(detail));
  }
  for (let index = 1; index <= 5; index += 1) {
    const photo = `dulce-eduardo-historia-0${index}\\.jpg`;
    assert.match(demoData, new RegExp(photo));
    assert.match(seed, new RegExp(photo));
  }
  assert.match(album, /event\.slug === "dulce-eduardo"/);
  assert.match(seed, /"admin_panel":true/);
  assert.match(seed, /insert into public\.event_entitlements/);
});
