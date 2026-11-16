import Link from "next/link";
import type { Metadata } from "next";
import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";
import { TOWNS } from "@/lib/towns";
import { SERVICES } from "@/lib/services";
import { getTown, getSiblings } from "@/lib/supabase";
import { BRAND, PHONE_DISPLAY, PHONE_TEL, SITE_URL, buildAlt, buildMetaDescription, buildTitle } from "@/lib/site";
import { townSchemas, videoObjectSchema } from "@/lib/schema";
import { COMMONS_PHOTOS, STREET_VIEW } from "@/lib/town-photos";
import { TOWN_VIDEOS } from "@/lib/town-videos";
import CtaBand from "@/components/CtaBand";
import TownDataSnapshot from "@/components/TownDataSnapshot";
import TownVisuals from "@/components/TownVisuals";
import LeakChecker from "@/components/LeakChecker";
import MeterTest from "@/components/MeterTest";
import VideoFacade from "@/components/VideoFacade";

import { cacheLife } from "next/cache";

type Params = { metro: string; town: string };

/** Static town list so the build works before Supabase rows exist. */
export function generateStaticParams(): Params[] {
  return TOWNS.map((t) => ({ metro: t.metroSlug, town: t.townSlug }));
}

function townRef(metro: string, town: string) {
  return TOWNS.find((t) => t.metroSlug === metro && t.townSlug === town);
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { metro, town } = await params;
  const ref = townRef(metro, town);
  const row = await getTown(metro, town);
  const name = row?.town ?? ref?.town ?? town;
  const title = buildTitle(name);
  const description = row
    ? buildMetaDescription(row)
    : `Leak detection in ${name}, TX — slab, sewer, gas & pool leak guide. Verified local data, published pricing.`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/tx/${metro}/${town}/` },
    openGraph: { title, description, url: `${SITE_URL}/tx/${metro}/${town}/`, type: "article" },
  };
}

type VisualKind = "why" | "calendar" | "pricing";

interface VisualFile {
  kind: VisualKind;
  file: string;
  width: number;
  height: number;
}

/** Article markers the generation prompt emits; each maps to one SVG. */
const VISUAL_MARKERS: Array<{ marker: string; kind: VisualKind }> = [
  { marker: "<!-- visual:soil -->", kind: "why" },
  { marker: "<!-- visual:seasonal -->", kind: "calendar" },
  { marker: "<!-- visual:pricing -->", kind: "pricing" },
];

/** Figcaptions are distinct from the img alt text (never an alt duplicate)
 *  and say the figure is a data illustration, not a photograph. */
function visualCaption(kind: VisualKind, town: string): string {
  const map = {
    why: `Figure: the three local factors behind most ${town} leaks — soil, water and housing era. Data illustration based on our research.`,
    calendar: `Figure: when ${town} leaks happen through the year — freeze, clay movement, drought and pre-winter prep. Data illustration based on our research.`,
    pricing: `Figure: typical leak detection prices in the ${town} area — metro ranges, honestly labeled, not a quote. Data illustration based on our research.`,
  } as const;
  return map[kind];
}

function svgDims(filePath: string): { width: number; height: number } {
  try {
    const src = readFileSync(filePath, "utf8");
    const w = src.match(/<svg[^>]*\swidth="(\d+)"/)?.[1];
    const h = src.match(/<svg[^>]*\sheight="(\d+)"/)?.[1];
    if (w && h) return { width: Number(w), height: Number(h) };
    const vb = src.match(/viewBox="0 0 (\d+) (\d+)"/);
    if (vb) return { width: Number(vb[1]), height: Number(vb[2]) };
  } catch {
    // Fall through to the default — a missing/unreadable SVG renders
    // nothing anyway (visualPaths filters on existsSync).
  }
  return { width: 1200, height: 630 };
}

function visualPaths(townSlug: string): VisualFile[] {
  const base = join(process.cwd(), "public", "visuals", townSlug);
  const files: Array<{ kind: VisualKind; file: string }> = [
    { kind: "why", file: `leak-detection-${townSlug}-tx-why-pipes-fail.svg` },
    { kind: "calendar", file: `leak-detection-${townSlug}-tx-seasonal-calendar.svg` },
    { kind: "pricing", file: `leak-detection-${townSlug}-tx-pricing.svg` },
  ];
  return files
    .filter((f) => existsSync(join(base, f.file)))
    .map((f) => ({ ...f, ...svgDims(join(base, f.file)) }));
}

/** Figure HTML for one SVG, spliced into the article at its marker.
 *  Width/height come from the SVG file itself (prevents CLS). */
function visualFigure(v: VisualFile, townSlug: string, town: string): string {
  return (
    `<figure class="my-10">` +
    `<img src="/visuals/${townSlug}/${v.file}" alt="${buildAlt(v.kind, town)}" ` +
    `width="${v.width}" height="${v.height}" loading="lazy" ` +
    `class="w-full rounded-2xl border border-slate-200 shadow-sm" />` +
    `<figcaption class="mt-3 text-center text-sm text-slate-500">${visualCaption(v.kind, town)}</figcaption>` +
    `</figure>`
  );
}

/**
 * Stock hero pool: shared generic plumbing-work photos in
 * public/images/hero-*, vetted once and rotated across towns. Picked
 * deterministically by town-slug hash so a town keeps the same hero.
 * The pool is empty until the images are vetted and added — then this
 * returns a file; until then the hero renders with no photo.
 * Alt/caption describe only the work, never the town (the photo is not
 * of that town).
 */
function heroImage(townSlug: string): string | null {
  const dir = join(process.cwd(), "public", "images");
  let files: string[] = [];
  try {
    files = readdirSync(dir)
      .filter((f) => /^hero-.*\.(jpg|jpeg|png|webp|avif)$/i.test(f))
      .sort();
  } catch {
    return null;
  }
  if (!files.length) return null;
  const hash = [...townSlug].reduce((a, c) => a + c.charCodeAt(0), 0);
  return files[hash % files.length];
}

function short(s: string | null, n = 30): string | null {
  if (!s) return null;
  const t = s.trim();
  return t.length > n ? t.slice(0, n - 1).trimEnd() + "…" : t;
}

/**
 * The hero owns the page's single H1. Stored articles were generated
 * with their own <h1> — demote any article H1 to H2 at render so the
 * page always has exactly one H1 (new generations omit it entirely).
 */
function demoteArticleH1(html: string): string {
  return html
    .replace(/<h1(\s[^>]*)?>/gi, "<h2$1>")
    .replace(/<\/h1\s*>/gi, "</h2>");
}

function PhoneIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  );
}

/**
 * Town page — the money page. Renders the generated article
 * (all 16 TEMPLATE.md sections) from the Supabase row, plus the
 * JSON-LD stack (Organization, Service, FAQPage, HowTo, BreadcrumbList,
 * Speakable) and data-driven visuals.
 */
export default async function TownPage({ params }: { params: Promise<Params> }) {
  "use cache";
  cacheLife({ revalidate: 3600 }); // published rows refresh hourly (ISR-style)
  const { metro, town } = await params;
  const ref = townRef(metro, town);
  const row = await getTown(metro, town);
  const name = row?.town ?? ref?.town ?? town;
  const metroLabel = row?.parent_metro ?? ref?.metro ?? metro;
  const published = row?.page_status === "published" && row.page_html;
  const siblings = await getSiblings(metro, town);
  const visuals = visualPaths(town);
  const hero = heroImage(town);
  const streetView = STREET_VIEW[town] ?? null;
  const commons = COMMONS_PHOTOS[town] ?? null;
  const townVideoId = TOWN_VIDEOS[town] ?? null;

  // Article processing: demote any stored <h1>, interleave the SVGs at
  // their markers (a missing marker or file renders nothing for that
  // slot), then split on the meter-test marker so MeterTest renders
  // below the N2 symptom table. If the marker is absent, MeterTest
  // renders after the article — never dropped, never duplicated.
  const METER_MARKER = "<!-- meter-test -->";
  let articleHtml = published ? demoteArticleH1(row!.page_html as string) : "";
  for (const { marker, kind } of VISUAL_MARKERS) {
    const v = visuals.find((x) => x.kind === kind);
    articleHtml = articleHtml.replace(marker, v ? visualFigure(v, town, name) : "");
  }
  const meterIdx = articleHtml.indexOf(METER_MARKER);
  const articleBefore = meterIdx >= 0 ? articleHtml.slice(0, meterIdx) : articleHtml;
  const articleAfter = meterIdx >= 0 ? articleHtml.slice(meterIdx + METER_MARKER.length) : "";

  const schemas = row
    ? [
        ...townSchemas(row),
        ...(townVideoId
          ? [
              videoObjectSchema({
                videoId: townVideoId,
                title: `Leak detection in ${name}, TX`,
                description: `Real footage from a leak detection visit in ${name}, TX.`,
              }),
            ]
          : []),
      ]
    : [];

  const chips: string[] = [];
  const soil = short(row?.soil_type ?? null, 34);
  if (soil) chips.push(soil);
  const homes = short(row?.housing_era ?? null, 34);
  if (homes) chips.push(homes);
  const lowMatch = (row?.price_leak_detection || "").match(/\$([\d,]+)/);
  if (lowMatch) chips.push(`Detection from $${lowMatch[1]}`);
  const hoods = (row?.neighborhoods || "").split(";").map((h) => h.trim()).filter(Boolean);

  return (
    <>
      {/* HERO — stock photo slot sits above the H1; renders nothing
          until vetted hero-* images exist in public/images/. */}
      <section className="relative overflow-hidden bg-blue-950">
        {hero && (
          <figure className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/images/${hero}`}
              alt="Plumber using electronic leak detection equipment"
              className="h-64 w-full object-cover md:h-80"
            />
            <figcaption className="absolute bottom-2 right-4 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">
              Electronic leak detection (illustrative photo)
            </figcaption>
          </figure>
        )}
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 25%, #38bdf8 0, transparent 35%), radial-gradient(circle at 85% 70%, #f59e0b 0, transparent 30%)",
          }}
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-14 md:py-20">
          <nav className="text-sm font-medium text-blue-200" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white hover:underline">Home</Link>
            <span className="mx-2 text-blue-400">›</span>
            <Link href={`/tx/${metro}/`} className="hover:text-white hover:underline">{metroLabel}</Link>
            <span className="mx-2 text-blue-400">›</span>
            <span className="text-white">{name}</span>
          </nav>
          <h1 className="mt-5 max-w-3xl text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            Leak Detection in {name}, TX
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-blue-100">
            Slab, sewer, gas & pool leak detection — researched for {name}'s
            soil, homes and climate{hoods.length ? `, serving ${hoods.slice(0, 2).join(", ")} and nearby` : ""}.
            Real local data, published pricing.
          </p>
          {chips.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2.5" aria-label="Key local facts">
              {chips.map((c) => (
                <li
                  key={c}
                  className="rounded-full border border-blue-400/40 bg-white/10 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur"
                >
                  {c}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <a
              href={`tel:${PHONE_TEL}`}
              className="inline-flex items-center justify-center gap-3 rounded-full bg-amber-500 px-8 py-4 text-lg font-extrabold text-blue-950 shadow-xl transition hover:bg-amber-400"
            >
              <PhoneIcon />
              Call {PHONE_DISPLAY}
            </a>
            <a
              href="#guide"
              className="inline-flex items-center justify-center rounded-full border-2 border-blue-300 px-8 py-4 text-lg font-bold text-white transition hover:border-white hover:bg-white/10"
            >
              Read the {name} Guide
            </a>
          </div>
        </div>
      </section>

      {/* INTERACTIVE LEAK CHECK — lead-gen screening tool, above the fold.
          MeterTest moved below the N2 symptom table inside the guide. */}
      <LeakChecker town={name} />

      {/* HYPER-LOCAL RESEARCH — visible even before the Grok article exists */}
      {row && <TownDataSnapshot row={row} />}

      {/* API FIGURES — graphical, rendered only when enrichment has run */}
      {row && <TownVisuals row={row} />}

      {/* GUIDE */}
      <section id="guide" className="scroll-mt-20 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-14">
          {row && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(schemas).replace(/</g, "\\u003c"),
              }}
            />
          )}

          {published ? (
            <>
              <div
                className="article-body"
                dangerouslySetInnerHTML={{ __html: articleBefore }}
              />
              {/* OVERNIGHT METER TEST — below the N2 symptom table (or
                  after the article when the marker is absent). */}
              <MeterTest town={name} />
              {articleAfter && (
                <div
                  className="article-body"
                  dangerouslySetInnerHTML={{ __html: articleAfter }}
                />
              )}
              {/* LOCAL LANDMARK — Wikimedia Commons photo, only where the
                  audit found a verified one for this town. */}
              {commons && (
                <figure className="my-10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={commons.url}
                    alt={commons.title}
                    loading="lazy"
                    className="w-full rounded-2xl border border-slate-200 shadow-sm"
                  />
                  <figcaption className="mt-3 text-center text-sm text-slate-500">
                    {commons.title} — Photo: {commons.author}, Wikimedia
                    Commons, {commons.licence}.{" "}
                    <a
                      href={commons.sourceUrl}
                      className="font-semibold text-blue-800 hover:underline"
                    >
                      Source
                    </a>
                  </figcaption>
                </figure>
              )}
              {/* TOWN VIDEO — renders nothing until a real videoId exists
                  for this town in lib/town-videos.ts. */}
              {townVideoId && (
                <div className="my-10">
                  <VideoFacade
                    videoId={townVideoId}
                    title={`Leak detection in ${name}, TX`}
                  />
                </div>
              )}
            </>
          ) : (
            <>
              <div className="rounded-3xl border-2 border-dashed border-blue-200 bg-blue-50 p-10 text-center">
                <h2 className="text-3xl font-extrabold text-blue-950">The {name} guide is being researched</h2>
                <p className="mx-auto mt-4 max-w-xl text-slate-600">
                  Soil data, housing stock, local pricing and all 10 leak
                  detection services — written from verified sources, not
                  templates. Check back soon.
                </p>
                <a
                  href={`tel:${PHONE_TEL}`}
                  className="mt-8 inline-flex items-center gap-3 rounded-full bg-amber-500 px-8 py-4 text-lg font-extrabold text-blue-950 shadow transition hover:bg-amber-400"
                >
                  <PhoneIcon />
                  Call {PHONE_DISPLAY}
                </a>
                <p className="mt-6 text-sm text-slate-500">
                  Status: {row?.page_status ?? "not in database yet"} · {BRAND}
                </p>
              </div>
              <MeterTest town={name} />
            </>
          )}
        </div>
      </section>

      {/* LOCAL STREET VIEW — live Google embed of a real street in the
          town's first researched neighbourhood, below the fold and
          lazy-loaded. No entry in lib/town-photos.ts → no slot. This is
          an embed, not our photo, and it is labelled as such. */}
      {streetView && (
        <section className="bg-white" aria-label={`Street view of ${streetView.neighborhood}, ${name}`}>
          <div className="mx-auto max-w-4xl px-4 py-10">
            <h2 className="text-2xl font-extrabold text-blue-950">
              Street view: {streetView.neighborhood}, {name}
            </h2>
            <p className="mt-2 text-slate-600">
              A real street in {streetView.neighborhood} — live Street View
              from Google, not a photo of ours.
            </p>
            <iframe
              title={`Street view: ${streetView.neighborhood}, ${name}, TX`}
              src={`https://www.google.com/maps?q=${encodeURIComponent(`${streetView.neighborhood}, ${name}, TX`)}&output=embed`}
              className="mt-4 h-80 w-full rounded-2xl border border-slate-200"
              loading="lazy"
            />
            <p className="mt-2 text-xs text-slate-400">
              Street view: {streetView.neighborhood}, {name} — Google
            </p>
          </div>
        </section>
      )}

      {/* NEARBY + SERVICES */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <h2 className="text-2xl font-extrabold text-blue-950">Nearby towns in {metroLabel}</h2>
              <div className="mt-5 flex flex-wrap gap-2.5">
                {siblings.length ? (
                  siblings.map((s) => (
                    <Link
                      key={s.town_slug}
                      href={`/tx/${metro}/${s.town_slug}/`}
                      className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-600 hover:text-blue-800"
                    >
                      {s.town}
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">More {metroLabel}-area towns coming soon.</p>
                )}
              </div>
              <Link href={`/tx/${metro}/`} className="mt-4 inline-block text-sm font-bold text-blue-800 hover:underline">
                View all {metroLabel} towns →
              </Link>
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-blue-950">Leak detection services</h2>
              <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                {SERVICES.map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={`/services/${s.slug}/`}
                      className="block rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-600 hover:text-blue-800"
                    >
                      {s.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <CtaBand
        title={`Leak in ${name}? Get it pinpointed.`}
        subtitle={`${name} leaks are pinpointed non-invasively — no destructive digging to "see what's wrong." Published pricing, so you can compare local pros before you call.`}
      />
    </>
  );
}
