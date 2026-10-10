import Link from "next/link";
import type { Metadata } from "next";
import { existsSync } from "fs";
import { join } from "path";
import { TOWNS } from "@/lib/towns";
import { SERVICES } from "@/lib/services";
import { getTown, getSiblings } from "@/lib/supabase";
import { BRAND, PHONE_DISPLAY, PHONE_TEL, SITE_URL, buildAlt, buildMetaDescription, buildTitle } from "@/lib/site";
import { townSchemas } from "@/lib/schema";
import CtaBand from "@/components/CtaBand";
import TownDataSnapshot from "@/components/TownDataSnapshot";

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

function visualPaths(townSlug: string) {
  const base = join(process.cwd(), "public", "visuals", townSlug);
  const files = [
    { kind: "why" as const, file: `leak-detection-${townSlug}-tx-why-pipes-fail.svg` },
    { kind: "calendar" as const, file: `leak-detection-${townSlug}-tx-seasonal-calendar.svg` },
    { kind: "pricing" as const, file: `leak-detection-${townSlug}-tx-pricing.svg` },
  ];
  return files.filter((f) => existsSync(join(base, f.file)));
}

function short(s: string | null, n = 30): string | null {
  if (!s) return null;
  const t = s.trim();
  return t.length > n ? t.slice(0, n - 1).trimEnd() + "…" : t;
}

function PhoneIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  );
}

/**
 * Town page — the money page. Renders the Grok-generated article
 * (all 16 TEMPLATE.md sections) from the Supabase row, plus the
 * 5-schema JSON-LD stack and data-driven visuals.
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
      {/* HERO */}
      <section className="relative overflow-hidden bg-blue-950">
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

      {/* HYPER-LOCAL RESEARCH — visible even before the Grok article exists */}
      {row && <TownDataSnapshot row={row} />}

      {/* GUIDE */}
      <section id="guide" className="scroll-mt-20 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-14">
          {row && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(townSchemas(row)).replace(/</g, "\\u003c"),
              }}
            />
          )}

          {published ? (
            <>
              <div
                className="article-body"
                dangerouslySetInnerHTML={{ __html: row!.page_html as string }}
              />
              {visuals.map((v) => (
                <figure key={v.file} className="my-10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/visuals/${town}/${v.file}`}
                    alt={buildAlt(v.kind, name)}
                    loading="lazy"
                    className="w-full rounded-2xl border border-slate-200 shadow-sm"
                  />
                  <figcaption className="mt-3 text-center text-sm text-slate-500">
                    {buildAlt(v.kind, name)}
                  </figcaption>
                </figure>
              ))}
            </>
          ) : (
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
          )}
        </div>
      </section>

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
        title={`Leak in ${name}? Get it pinpointed today.`}
        subtitle={`Most ${name} leaks are found in a single visit — no destructive digging to "see what's wrong." Call now.`}
      />
    </>
  );
}
