import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Great_Vibes, Montserrat } from "next/font/google";
import { headers } from "next/headers";
import "../src/styles/global.css";

const serif = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const script = Great_Vibes({
  variable: "--font-script",
  subsets: ["latin"],
  weight: "400",
});

const sans = Montserrat({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f8f4eb",
};

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const metadataBase = new URL(`${protocol}://${host}`);
  const title = "Dulce & Eduardo | Nuestra boda";
  const description = "Acompáñanos a celebrar nuestra boda el 10 de octubre de 2026.";

  return {
    metadataBase,
    title,
    description,
    openGraph: {
      title: "Dulce & Eduardo — 10 · 10 · 2026",
      description: "El mejor capítulo de nuestra historia está por comenzar.",
      type: "website",
      images: [{ url: "/og.png", width: 1728, height: 909, alt: "Dulce y Eduardo — 10 de octubre de 2026" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og.png"],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${serif.variable} ${script.variable} ${sans.variable}`}>
        {children}
      </body>
    </html>
  );
}
