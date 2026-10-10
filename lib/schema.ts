import type { TownRow } from "./supabase";
import { BRAND, SITE_URL } from "./site";

/**
 * JSON-LD schema builders — all five types from TEMPLATE.md §15.
 * LocalBusiness uses areaServed (town + ZIPs), never a fake street address.
 * All strings are escaped for safe JSON-LD embedding (see usage with
 * .replace(/</g, '\\u003c') per Next.js json-ld guide).
 */

function zips(row: TownRow): string[] {
  return (row.zip_codes || "")
    .split(";")
    .map((z) => z.trim())
    .filter(Boolean);
}

export function localBusinessSchema(row: TownRow) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: `${BRAND} — Leak Detection in ${row.town}, TX`,
    url: `${SITE_URL}/tx/${row.metro_slug}/${row.town_slug}/`,
    areaServed: [
      { "@type": "City", name: `${row.town}, TX` },
      ...zips(row).map((z) => ({ "@type": "PostalCode", postalCode: z })),
    ],
    telephone: process.env.NEXT_PUBLIC_PHONE_DISPLAY || undefined,
  };
}

export function faqPageSchema(row: TownRow) {
  // Scaffold: generic data-driven questions. The generated page_html
  // carries the full 12–15 town-specific Q&As (TEMPLATE.md §14); a
  // future enhancement extracts them into this schema automatically.
  const town = row.town;
  const price = (row.price_leak_detection || "").trim();
  const qa: Array<[string, string]> = [
    [
      `How much does leak detection cost in ${town}, TX?`,
      `Detection typically ${price || "runs $150–$500"} in the ${row.parent_metro} area. ` +
        `The exact price depends on access and line length — any site quoting a town-exact ` +
        `price before seeing the job is guessing.`,
    ],
    [
      `How do you find a hidden water leak in ${town}?`,
      `With non-invasive electronic detection: acoustic listening, thermal imaging, ` +
        `pressure testing and tracer gas. No guesswork cutting into your slab.`,
    ],
    [
      `Does homeowners insurance cover leak detection in ${town}?`,
      `Often, for sudden events — not gradual wear. A written detection report with ` +
        `photos supports your claim, but coverage varies: ask your adjuster.`,
    ],
    [
      `How fast can someone detect a leak in ${town}?`,
      `Same-day detection is usually available. Smell gas? Leave the building, ` +
        `call 911, then your gas utility — before calling anyone else.`,
    ],
  ];
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: qa.map(([q, a]) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}

export function howToSchema(row: TownRow) {
  const town = row.town;
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How leak detection works in ${town}, TX`,
    step: [
      { "@type": "HowToStep", name: "Call or book", text: `Tell us the symptom; we'll tell you if it's a today-problem or a this-week problem in ${town}.` },
      { "@type": "HowToStep", name: "We confirm your setup by address", text: `Water utility and town vs MUD vs unincorporated status confirmed before we quote.` },
      { "@type": "HowToStep", name: "Non-invasive detection", text: `Acoustic, pressure, camera or tracer-gas detection. You get a written findings report with photos.` },
      { "@type": "HowToStep", name: "You decide the fix", text: `Detection-only. The report doubles as documentation for insurance claims.` },
    ],
  };
}

export function breadcrumbSchema(row: TownRow) {
  const base = SITE_URL;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${base}/` },
      { "@type": "ListItem", position: 2, name: "Texas", item: `${base}/tx/` },
      { "@type": "ListItem", position: 3, name: row.parent_metro, item: `${base}/tx/${row.metro_slug}/` },
      { "@type": "ListItem", position: 4, name: `${row.town} Leak Detection`, item: `${base}/tx/${row.metro_slug}/${row.town_slug}/` },
    ],
  };
}

export function speakableSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    speakable: { "@type": "SpeakableSpecification", cssSelector: ["article h1", "article h2", ".faq"] },
  };
}

/** All five schema objects for a town page, in TEMPLATE.md §15 order. */
export function townSchemas(row: TownRow) {
  return [
    localBusinessSchema(row),
    faqPageSchema(row),
    howToSchema(row),
    breadcrumbSchema(row),
    speakableSchema(),
  ];
}
