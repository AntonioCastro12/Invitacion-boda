import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("builds a complete static Netlify site", async () => {
  const [packageText, netlify, config, indexHtml, adminHtml] = await Promise.all([
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../netlify.toml", import.meta.url), "utf8"),
    readFile(new URL("../next.config.ts", import.meta.url), "utf8"),
    readFile(new URL("../out/index.html", import.meta.url), "utf8"),
    readFile(new URL("../out/admin/index.html", import.meta.url), "utf8"),
  ]);
  const packageJson = JSON.parse(packageText);

  assert.equal(packageJson.scripts.dev, "next dev");
  assert.equal(packageJson.scripts.build, "next build");
  assert.ok(packageJson.dependencies.next);
  assert.equal(packageJson.dependencies["@netlify/blobs"], undefined);
  assert.equal(packageJson.devDependencies["@netlify/plugin-nextjs"], undefined);
  assert.match(netlify, /publish = "out"/);
  assert.doesNotMatch(netlify, /plugins|functions|redirects/);
  assert.match(config, /output: "export"/);
  assert.match(indexHtml, /<html[^>]*lang="es"/i);
  assert.match(indexHtml, /Nuestra boda/i);
  assert.match(adminHtml, /Panel de invitados/i);
  await access(new URL("../out/og.png", import.meta.url));
});

test("keeps the envelope, mobile content and hydration-safe countdown", async () => {
  const [app, welcome, countdown, data] = await Promise.all([
    readFile(new URL("../src/App.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/WelcomeScreen.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/Countdown.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/data/weddingData.js", import.meta.url), "utf8"),
  ]);

  assert.match(app, /<WelcomeScreen/);
  assert.match(app, /inert=\{!opened\}/);
  assert.match(app, /URLSearchParams/);
  assert.match(welcome, /const LAST_STAGE = 3/);
  assert.match(welcome, /screen-envelope--closed/);
  assert.match(welcome, /screen-envelope--open/);
  assert.match(welcome, /screen-envelope__seal/);
  assert.match(countdown, /useState\(null\)/);
  assert.doesNotMatch(countdown, /useState\(\(\) => getTimeLeft/);
  assert.match(data, /bride: "[^"]+"/);
  assert.match(data, /groom: "[^"]+"/);
});

test("keeps all VIP capabilities as animated interactive demonstrations", async () => {
  const [app, pass, rsvp, album, admin, reveal, video] = await Promise.all([
    readFile(new URL("../src/App.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/InvitationPass.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/RSVP.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/CollaborativeAlbum.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/AdminDashboard.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/SectionReveal.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/WeddingVideo.jsx", import.meta.url), "utf8"),
  ]);

  assert.match(app, /<AddToCalendar/);
  assert.match(app, /<CollaborativeAlbum/);
  assert.match(pass, /QRCodeSVG/);
  assert.match(rsvp, /localStorage\.setItem/);
  assert.match(album, /URL\.createObjectURL/);
  assert.match(admin, /Control de acceso/);
  assert.match(admin, /Nueva invitación/);
  assert.match(admin, /wedding-demo-guests/);
  assert.match(app, /<SectionReveal direction="left">/);
  assert.match(app, /<SectionReveal direction="right">/);
  assert.match(app, /<SectionReveal direction="zoom">/);
  assert.match(reveal, /useReducedMotion/);
  assert.match(reveal, /whileInView/);
  assert.match(app, /invitation-locked/);
  assert.match(video, /IntersectionObserver/);
  assert.match(video, /autoPlay=\{!reduceMotion\}/);
  assert.match(video, /muted/);
  assert.match(video, /element\.pause\(\)/);
  for (const source of [app, rsvp, album, admin]) assert.doesNotMatch(source, /fetch\("\/api/);
});
