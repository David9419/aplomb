import type { MetadataRoute } from "next";

import { site } from "@/content/site";

/** Plan du site pour Google (adresse publique : /sitemap.xml). */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: site.url, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${site.url}/experience`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${site.url}/tarifs`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${site.url}/mentions-legales`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${site.url}/confidentialite`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
}
