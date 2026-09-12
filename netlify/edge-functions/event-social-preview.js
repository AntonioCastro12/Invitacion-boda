const eventPreviews = {
  "dulce-eduardo": {
    title: "Eduardo & Dulce | Invitación de boda",
    description: "Tenemos algo especial que contarte. Acompáñanos el 28 de noviembre de 2026.",
    image: "/og-eduardo-dulce-v2.jpg",
    imageWidth: "1200",
    imageHeight: "628",
    imageAlt: "Invitación de boda de Eduardo y Dulce, 28 de noviembre de 2026",
  },
};

function escapeAttribute(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export default async function eventSocialPreview(request, context) {
  const url = new URL(request.url);
  const [, route, slug] = url.pathname.split("/");
  const preview = route === "evento" ? eventPreviews[slug] : null;
  if (!preview) return context.next();

  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  const title = escapeAttribute(preview.title);
  const description = escapeAttribute(preview.description);
  const imageAlt = escapeAttribute(preview.imageAlt);
  const imageUrl = new URL(preview.image, url.origin).href;
  const metadata = `
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="es_MX" />
    <meta property="og:site_name" content="RCM Invitaciones" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${escapeAttribute(url.href)}" />
    <meta property="og:image" content="${escapeAttribute(imageUrl)}" />
    <meta property="og:image:secure_url" content="${escapeAttribute(imageUrl)}" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="${preview.imageWidth}" />
    <meta property="og:image:height" content="${preview.imageHeight}" />
    <meta property="og:image:alt" content="${imageAlt}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${escapeAttribute(imageUrl)}" />`;

  const html = (await response.text())
    .replace("<title>RCM Invitaciones</title>", `<title>${title}</title>`)
    .replace(
      /<meta name="description" content="[^"]*" \/>/,
      `<meta name="description" content="${description}" />`,
    )
    .replace("</head>", `${metadata}\n  </head>`);

  return new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

export const config = {
  path: "/evento/*",
};
