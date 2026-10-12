import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";

import { site } from "@/content/site";
import { Loader } from "@/components/site/Loader";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { ScrollProgress } from "@/components/site/Motion";
import { CallFloat } from "@/components/site/CallFloat";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"], display: "swap" });

const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
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
  themeColor: "#f3efe8",
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
    <html lang="fr" className={`${geist.variable} ${geistMono.variable} ${instrument.variable}`}>
      <body>
        <Loader />
        <SmoothScroll />
        <ScrollProgress />
        {children}
        <CallFloat />
        <div className="grain" aria-hidden />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
