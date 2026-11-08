import type { TownRow } from "./supabase";
import { BRAND, PHONE_DISPLAY, SITE_URL } from "./site";

/**
 * JSON-LD schema builders.
 *
 * Pre-launch plan: no LocalBusiness — the site is a guide that connects
 * readers with local pros, not the operator itself, so the stack is
 * Organization (sitewide, via app/layout.tsx) + Service with areaServed
 * per town. areaServed uses a City entity plus plain-text ZIP strings
 * (PostalCode is not a valid areaServed entity type).
 *
 * FAQPage is EXTRACTED from the article's own .faq block so the schema
 * always matches the visible Q&As (TEMPLATE.md §14) — never templated.
 * All strings are escaped for safe JSON-LD embedding at the call site
 * (.replace(/</g, '\\u003c') per the Next.js json-ld guide).
 */

function zips(row: TownRow): string[] {
  return (row.zip_codes || "")
    .split(";")
    .map((z) => z.trim())
    .filter(Boolean);
}

/** Sitewide publisher entity — rendered in app/layout.tsx and referenced
 *  as the Service provider (@id) on town pages. */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: BRAND,
    url: `${SITE_URL}/`,
    telephone: PHONE_DISPLAY,
    areaServed: { "@type": "State", name: "Texas" },
  };
}

export function serviceSchema(row: TownRow) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `Leak Detection in ${row.town}, TX`,
    serviceType: "Leak detection",
    url: `${SITE_URL}/tx/${row.metro_slug}/${row.town_slug}/`,
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: [
      { "@type": "City", name: `${row.town}, TX` },
      ...zips(row),
    ],
  };
}

function stripHtml(s: string): string {
  return s
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;/gi, "'")
    .replace(/&amp;/gi, "&")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Parse the article's FAQ block: <div class="faq"><h3>Q</h3><p>A</p>…</div>
 * Mirrors the extraction validate.py's SectionParser performs, so the
 * schema and the gate read the same Q&As.
 */
export function extractFaqs(html: string | null): Array<{ q: string; a: string }> {
  if (!html) return [];
  const open = html.match(/<div[^>]*class="[^"]*\bfaq\b[^"]*"[^>]*>/i);
  if (!open || open.index === undefined) return [];
  const start = open.index + open[0].length;
  // Walk div nesting to find where the .faq block ends.
  let depth = 1;
  let end = html.length;
  const tagRe = /<\/?div\b[^>]*>/gi;
  tagRe.lastIndex = start;
  let m: RegExpExecArray | null;
  while ((m = tagRe.exec(html))) {
    if (m[0].startsWith("</")) depth -= 1;
    else if (!m[0].endsWith("/>")) depth += 1;
    if (depth === 0) {
      end = m.index;
      break;
    }
  }
  const block = html.slice(start, end);
  const qas: Array<{ q: string; a: string }> = [];
  const pairRe = /<h3[^>]*>([\s\S]*?)<\/h3>\s*<p[^>]*>([\s\S]*?)<\/p>/gi;
  let p: RegExpExecArray | null;
  while ((p = pairRe.exec(block))) {
    const q = stripHtml(p[1]);
    const a = stripHtml(p[2]);
    if (q && a) qas.push({ q, a });
  }
  return qas;
}

export function faqPageSchema(row: TownRow): object | null {
  // Only for published rows — drafts render a placeholder, not the
  // article, so FAQ schema there would describe invisible content.
  if (row.page_status !== "published") return null;
  const qas = extractFaqs(row.page_html);
  if (!qas.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: qas.map(({ q, a }) => ({
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
      { "@type": "HowToStep", name: "Describe the symptoms", text: `Note what you are seeing — a bill spike, a warm spot, a spinning meter — so a local pro can judge whether it is a today-problem or a this-week problem in ${town}.` },
      { "@type": "HowToStep", name: "Confirm the setup by address", text: `Water utility and city vs MUD vs unincorporated status are confirmed by address before anyone quotes — it decides who is responsible for which line.` },
      { "@type": "HowToStep", name: "Non-invasive detection", text: `Acoustic listening, pressure testing, thermal imaging or a sewer camera pinpoints the leak without exploratory digging.` },
      { "@type": "HowToStep", name: "Get the findings in writing", text: `Ask for a written findings report with photos. It is your record for the repair decision, and the documentation an insurer asks for on a claim.` },
    ],
  };
}

/** Generic BreadcrumbList — only routes that exist may be listed. */
export function breadcrumbListSchema(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path}`,
    })),
  };
}

export function breadcrumbSchema(row: TownRow) {
  // Home › Metro › Town — matches the visible breadcrumb. There is no
  // /tx/ route, so no "Texas" node (it 404'd).
  return breadcrumbListSchema([
    { name: "Home", path: "/" },
    { name: row.parent_metro, path: `/tx/${row.metro_slug}/` },
    { name: `${row.town} Leak Detection`, path: `/tx/${row.metro_slug}/${row.town_slug}/` },
  ]);
}

export function speakableSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1", "article h2", ".faq"] },
  };
}

/** The town-page schema stack, in render order. FAQPage is omitted
 *  (null) until the article is published and its FAQs extract cleanly. */
export function townSchemas(row: TownRow): object[] {
  const all: Array<object | null> = [
    organizationSchema(),
    serviceSchema(row),
    faqPageSchema(row),
    howToSchema(row),
    breadcrumbSchema(row),
    speakableSchema(),
  ];
  return all.filter((s): s is object => s !== null);
}
