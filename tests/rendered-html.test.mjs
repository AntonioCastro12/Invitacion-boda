import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("keeps the final metadata and responsive invitation", async () => {
  const [layout, app, welcome, countdown, data] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/App.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/WelcomeScreen.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/Countdown.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/data/weddingData.js", import.meta.url), "utf8"),
  ]);

  assert.match(layout, /<html lang="es">/);
  assert.match(layout, /width: "device-width"/);
  assert.match(layout, /Dulce & Eduardo \| Nuestra boda/);
  assert.match(layout, /\/og\.png/);
  assert.match(app, /<WelcomeScreen/);
  assert.match(app, /inert=\{!opened\}/);
  assert.match(welcome, /const LAST_STAGE = 3/);
  assert.match(welcome, /screen-envelope--closed/);
  assert.match(welcome, /screen-envelope--open/);
  assert.match(welcome, /screen-envelope__seal/);
  assert.match(countdown, /useState\(null\)/);
  assert.doesNotMatch(countdown, /useState\(\(\) => getTimeLeft/);
  assert.match(data, /bride: "Dulce"/);
  assert.match(data, /groom: "Eduardo"/);
  assert.match(data, /dateDisplay: "10 · 10 · 2026"/);
});

test("is configured as a native Next.js application for Netlify", async () => {
  const [packageText, netlify, runtime, adminSession] = await Promise.all([
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../netlify.toml", import.meta.url), "utf8"),
    readFile(new URL("../db/runtime.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/admin/admin-session.ts", import.meta.url), "utf8"),
  ]);
  const packageJson = JSON.parse(packageText);

  assert.equal(packageJson.scripts.dev, "next dev");
  assert.equal(packageJson.scripts.build, "next build");
  assert.ok(packageJson.dependencies.next);
  assert.ok(packageJson.dependencies["@netlify/blobs"]);
  assert.equal(packageJson.dependencies["@netlify/database"], undefined);
  assert.equal(packageJson.devDependencies.vinext, undefined);
  assert.equal(packageJson.devDependencies.wrangler, undefined);
  assert.match(netlify, /command = "npm run build"/);
  assert.match(netlify, /publish = "\.next"/);
  assert.match(runtime, /@netlify\/blobs/);
  assert.match(runtime, /wedding-data/);
  assert.match(runtime, /consistency: "strong"/);
  assert.doesNotMatch(runtime, /cloudflare:workers|D1Database|R2Bucket/);
  assert.match(adminSession, /ADMIN_SESSION_SECRET/);
  assert.match(adminSession, /httpOnly: true/);
});

test("keeps all VIP management modules connected", async () => {
  const [app, pass, rsvp, album, admin, invitationRoute] = await Promise.all([
    readFile(new URL("../src/App.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/InvitationPass.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/RSVP.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/CollaborativeAlbum.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/AdminDashboard.jsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/invitations/[token]/route.ts", import.meta.url), "utf8"),
  ]);

  assert.match(app, /<AddToCalendar/);
  assert.match(app, /<CollaborativeAlbum/);
  assert.match(pass, /QRCodeSVG/);
  assert.match(rsvp, /fetch\("\/api\/rsvp"/);
  assert.match(album, /fetch\("\/api\/album"/);
  assert.match(admin, /Control de acceso/);
  assert.match(admin, /Nueva invitación/);
  assert.match(invitationRoute, /getGuest/);
});
