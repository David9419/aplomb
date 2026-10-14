import type { MetadataRoute } from "next";

import { site } from "@/content/site";

/** Autorise l'indexation de tout le site et indique le plan du site (adresse publique : /robots.txt). */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
