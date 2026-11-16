import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { TOWNS, METROS } from "@/lib/towns";
import { SERVICES } from "@/lib/services";
import { ADJUSTMENT_CITIES } from "@/lib/adjustment-pages";

/**
 * Sitemap: home + 10 city hubs + 100 town pages + 10 service pillars
 * + 12 tools (+ hub + methodology) + guides (index + 4 guides
 * + leak-adjustment index + all adjustment cities + MUD explainer).
 * Adjustment cities are derived from ADJUSTMENT_CITIES (single source
 * of truth) so new city pages appear here automatically.
 * Submit to Google Search Console ONLY after the custom domain is live
 * (never for the vercel.app staging URLs — those stay noindex).
 */
const TOOLS = [
  "water-bill-spike",
  "freeze-risk-tonight",
  "freeze-damage-estimator",
  "leak-cost-estimator",
  "home-buyer-leak-risk",
  "insurance-claim-pack",
  "leak-adjustment-checker",
  "sewer-winter-averaging",
  "who-pays",
  "cost-of-waiting",
  "sewer-lateral-estimator",
  "plumber-price-estimator",
];

const GUIDES = [
  "",
  "sewer-camera-inspection-cost-texas",
  "leak-detection-cost",
  "water-main-yard-line-leak-texas",
  "does-insurance-cover-slab-leak-texas",
  "leak-adjustment",
  ...ADJUSTMENT_CITIES.map((c) => `leak-adjustment/${c.slug}`),
  "leak-adjustment/mud",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const urls: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/tools/`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/tools/methodology/`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];
  for (const tool of TOOLS) {
    urls.push({
      url: `${SITE_URL}/tools/${tool}/`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }
  for (const guide of GUIDES) {
    urls.push({
      url: `${SITE_URL}/guides/${guide ? `${guide}/` : ""}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }
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
