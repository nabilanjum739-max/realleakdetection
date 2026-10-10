/**
 * Site-wide config. Staging-first sequencing:
 * - Build & QA on the Vercel default subdomain with NO_INDEX on
 *   (default), so Google never indexes the vercel.app URLs.
 * - After pilot QA passes: attach the custom domain in Vercel, set
 *   NEXT_PUBLIC_SITE_URL to the domain, set NEXT_PUBLIC_NO_INDEX=false,
 *   redeploy. THEN submit the sitemap to Search Console.
 */

export const BRAND = process.env.NEXT_PUBLIC_BRAND_NAME || "Leak Detection";
// TODO(owner): replace with the real call-tracking number before launch.
export const PHONE_DISPLAY = process.env.NEXT_PUBLIC_PHONE_DISPLAY || "(800) 555-0100";
export const PHONE_TEL = process.env.NEXT_PUBLIC_PHONE_TEL || "+18005550100";

/** Safe default: noindex unless explicitly turned off for the live domain. */
export const NO_INDEX = process.env.NEXT_PUBLIC_NO_INDEX !== "false";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

/** TEMPLATE.md §1 — title ≤60 chars, keyword + town. Suffix dropped for long town names. */
export function buildTitle(town: string): string {
  const base = `Leak Detection in ${town}, TX`;
  const full = `${base} | Slab, Sewer & Gas`;
  return full.length <= 60 ? full : base;
}

export interface MetaRow {
  town: string;
  neighborhoods?: string | null;
  price_leak_detection?: string | null;
}

/** TEMPLATE.md §1 — meta ≤155 chars, leads with price + CTA + neighborhoods. */
export function buildMetaDescription(row: MetaRow): string {
  const hoods = (row.neighborhoods || "")
    .split(";")
    .map((h) => h.trim())
    .filter(Boolean)
    .slice(0, 2);
  const lowMatch = (row.price_leak_detection || "").match(/\$([\d,]+)/);
  const low = lowMatch ? ` from $${lowMatch[1]}` : "";
  const parts = [
    `Leak detection in ${row.town}, TX${low}.`,
    "Slab, sewer, gas & pool leak experts",
  ];
  if (hoods.length) parts.push(`serving ${hoods.join(", ")} & more.`);
  parts.push("Call for same-day detection.");
  const meta = parts.join(" ");
  return meta.length <= 155 ? meta : meta.slice(0, 152) + "...";
}

/** Alt text pattern for generated visuals: keyword + town + what it shows. */
export function buildAlt(kind: "why" | "calendar" | "pricing", town: string): string {
  const map = {
    why: `Why ${town} pipes fail: soil, housing and climate factors for leak detection in ${town}, TX`,
    calendar: `Seasonal leak calendar for ${town}, Texas — when slab, sewer and pipe leaks happen`,
    pricing: `Typical leak detection prices in the ${town} area, honestly labeled metro ranges`,
  } as const;
  return map[kind].slice(0, 125);
}
