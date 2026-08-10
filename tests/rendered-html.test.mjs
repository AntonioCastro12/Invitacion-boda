import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("renders the wedding invitation with its final metadata", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html[^>]*lang="es"/i);
  assert.match(html, /<meta[^>]*name="viewport"[^>]*width=device-width/i);
  assert.match(html, /<title>Dulce &amp; Eduardo \| Nuestra boda<\/title>/i);
  assert.match(html, /Acompáñanos a celebrar nuestra boda el 10 de octubre de 2026\./i);
  assert.match(html, /\/og\.png/i);
  assert.doesNotMatch(html, /codex-preview|Starter Project|Your site is taking shape/i);
});

test("keeps the interactive envelope and invitation content connected", async () => {
  const [app, welcome, countdown, data, packageJson] = await Promise.all([
    readFile(new URL("../src/App.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/WelcomeScreen.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/Countdown.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/data/weddingData.js", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(app, /<WelcomeScreen/);
  assert.match(app, /inert=\{!opened\}/);
  assert.match(welcome, /const LAST_STAGE = 3/);
  assert.match(welcome, /screen-envelope--closed/);
  assert.match(welcome, /screen-envelope--open/);
  assert.match(welcome, /screen-envelope__seal/);
  assert.match(welcome, /Abrir invitación/);
  assert.match(welcome, /aria-label=\{labels\[stage\]\}/);
  assert.match(countdown, /useState\(null\)/);
  assert.match(countdown, /const updateTime = \(\) => setTime\(getTimeLeft\(date\)\)/);
  assert.doesNotMatch(countdown, /useState\(\(\) => getTimeLeft/);
  assert.match(data, /bride: "Dulce"/);
  assert.match(data, /groom: "Eduardo"/);
  assert.match(data, /dateDisplay: "10 · 10 · 2026"/);
  assert.match(packageJson, /"dev": "cross-env WRANGLER_LOG_PATH=/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});

test("includes the VIP invitation, access and management modules", async () => {
  const [app, pass, rsvp, album, admin, schema, migration, hosting] = await Promise.all([
    readFile(new URL("../src/App.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/InvitationPass.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/RSVP.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/CollaborativeAlbum.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/AdminDashboard.jsx", import.meta.url), "utf8"),
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0000_nifty_tenebrous.sql", import.meta.url), "utf8"),
    readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8"),
  ]);

  assert.match(app, /<AddToCalendar/);
  assert.match(app, /<CollaborativeAlbum/);
  assert.match(pass, /QRCodeSVG/);
  assert.match(pass, /Código individual de acceso/);
  assert.match(rsvp, /fetch\("\/api\/rsvp"/);
  assert.match(album, /fetch\("\/api\/album"/);
  assert.match(admin, /Control de acceso/);
  assert.match(admin, /Nueva invitación/);
  assert.match(schema, /export const guests/);
  assert.match(schema, /export const checkIns/);
  assert.match(schema, /export const albumPhotos/);
  assert.match(migration, /CREATE TABLE `guests`/);
  assert.deepEqual(JSON.parse(hosting), {
    project_id: "appgprj_6a79f7c312b88191a28f77ba030f48b8",
    d1: "DB",
    r2: "MEDIA",
  });
});
