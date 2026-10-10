import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { TOWNS, METROS } from "@/lib/towns";
import { SERVICES } from "@/lib/services";

/**
 * Sitemap: home + 5 city hubs + 50 town pages + 10 service pillars.
 * Submit to Google Search Console ONLY after the custom domain is live
 * (never for the vercel.app staging URLs — those stay noindex).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const urls: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
  ];
  for (const metro of METROS) {
    urls.push({
      url: `${SITE_URL}/tx/${metro}/`,
      lastModified: now, changeFrequency: "weekly", priority: 0.8,
    });
  }
  for (const t of TOWNS) {
    urls.push({
      url: `${SITE_URL}/tx/${t.metroSlug}/${t.townSlug}/`,
      lastModified: now, changeFrequency: "monthly", priority: 0.9,
    });
  }
  for (const s of SERVICES) {
    urls.push({
      url: `${SITE_URL}/services/${s.slug}/`,
      lastModified: now, changeFrequency: "monthly", priority: 0.7,
    });
  }
  return urls;
}
