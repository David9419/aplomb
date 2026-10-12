import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono, Newsreader } from "next/font/google";

import { contact, site } from "@/content/site";
import { PhoneIcon } from "@/components/icons";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.title,
  description: site.description,
  applicationName: site.name,
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: site.name,
    title: site.title,
    description: site.description,
    url: "/",
  },
};

export const viewport: Viewport = {
  themeColor: "#eceae4",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: site.name,
  description: site.description,
  telephone: "+33744981775",
  url: site.url,
  areaServed: ["Paris", "Hauts-de-Seine", "Val-de-Marne", "Essonne"],
  knowsAbout: [
    "Pathologie du bâtiment",
    "Suivi de chantier",
    "Conseil technique bâtiment",
    "Diagnostic fissures et humidité",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${archivo.variable} ${newsreader.variable} ${plexMono.variable}`}>
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <a className="call-float" href={contact.phoneHref} aria-label={`Appeler le ${contact.phoneDisplay}`}>
          <PhoneIcon /> Appeler
        </a>
      </body>
    </html>
  );
}
