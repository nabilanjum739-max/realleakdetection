import Link from "next/link";
import type { Metadata } from "next";
import { existsSync } from "fs";
import { join } from "path";
import { TOWNS } from "@/lib/towns";
import { SERVICES } from "@/lib/services";
import { getTown, getSiblings } from "@/lib/supabase";
import { BRAND, PHONE_DISPLAY, PHONE_TEL, SITE_URL, buildAlt, buildMetaDescription, buildTitle } from "@/lib/site";
import { townSchemas } from "@/lib/schema";

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

  return (
    <>
      <nav className="text-sm text-slate-400" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-sky-300">Home</Link> ›{" "}
        <Link href={`/tx/${metro}/`} className="hover:text-sky-300">{metroLabel}</Link> › {name}
      </nav>

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
          <article
            className="prose prose-invert mt-6 max-w-none"
            dangerouslySetInnerHTML={{ __html: row!.page_html as string }}
          />
          {visuals.map((v) => (
            <figure key={v.file} className="my-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/visuals/${town}/${v.file}`}
                alt={buildAlt(v.kind, name)}
                loading="lazy"
                className="w-full rounded-xl border border-slate-700"
              />
              <figcaption className="mt-2 text-sm text-slate-400">{buildAlt(v.kind, name)}</figcaption>
            </figure>
          ))}
        </>
      ) : (
        <div className="mt-8 rounded-xl border border-dashed border-slate-600 bg-slate-900 p-8 text-center">
          <h1 className="text-3xl font-extrabold">Leak Detection in {name}, TX</h1>
          <p className="mx-auto mt-4 max-w-xl text-slate-300">
            This town guide is being researched right now — soil data, housing
            stock, local pricing and all 10 leak-detection services, written
            from verified sources. Check back soon.
          </p>
          <a
            href={`tel:${PHONE_TEL}`}
            className="mt-6 inline-block rounded-lg bg-sky-600 px-8 py-3 text-lg font-bold text-white"
          >
            📞 Call {PHONE_DISPLAY}
          </a>
          <p className="mt-6 text-sm text-slate-500">
            Status: {row?.page_status ?? "not in database yet"} · {BRAND}
          </p>
        </div>
      )}

      <aside className="mt-12 border-t border-slate-800 pt-6">
        <h2 className="text-xl font-bold">Nearby towns in {metroLabel}</h2>
        <p className="mt-2 text-slate-300">
          {siblings.length ? (
            siblings.map((s, i) => (
              <span key={s.town_slug}>
                <Link href={`/tx/${metro}/${s.town_slug}/`} className="text-sky-300 hover:underline">
                  {s.town}
                </Link>
                {i < siblings.length - 1 ? " · " : ""}
              </span>
            ))
          ) : (
            <span className="text-slate-500">More {metroLabel}-area towns coming soon.</span>
          )}
        </p>
        <h2 className="mt-6 text-xl font-bold">Leak detection services</h2>
        <p className="mt-2 text-slate-300">
          {SERVICES.map((s, i) => (
            <span key={s.slug}>
              <Link href={`/services/${s.slug}/`} className="text-sky-300 hover:underline">
                {s.name}
              </Link>
              {i < SERVICES.length - 1 ? " · " : ""}
            </span>
          ))}
        </p>
      </aside>
    </>
  );
}
