import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Great_Vibes, Montserrat } from "next/font/google";
import "../src/styles/global.css";
import { weddingData } from "../src/data/weddingData";

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

export const metadata: Metadata = {
  metadataBase: new URL("https://invitacion-boda-prueba.netlify.app"),
  title: `${weddingData.couple.bride} & ${weddingData.couple.groom} | Nuestra boda`,
  description: "Acompáñanos a celebrar nuestra boda el 10 de octubre de 2026.",
  openGraph: {
    title: `${weddingData.couple.bride} & ${weddingData.couple.groom} — ${weddingData.dateDisplay}`,
    description: "El mejor capítulo de nuestra historia está por comenzar.",
    type: "website",
    images: [{ url: "/og.png", width: 1728, height: 909, alt: `${weddingData.couple.bride} y ${weddingData.couple.groom}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${weddingData.couple.bride} & ${weddingData.couple.groom} | Nuestra boda`,
    description: "Acompáñanos a celebrar nuestra boda el 10 de octubre de 2026.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${serif.variable} ${script.variable} ${sans.variable}`}>
        {children}
      </body>
    </html>
  );
}
