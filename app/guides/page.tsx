import Link from "next/link";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { breadcrumbListSchema } from "@/lib/schema";
import CtaBand from "@/components/CtaBand";

/**
 * Guides hub — the index for all guide areas.
 *
 * Every description below is condensed from the guide's own page
 * (hero + metadata) — no claim is made that the guide page does
 * not state. The leak-adjustment entry links the leak-adjustment
 * index, not each city.
 *
 * This route previously 404'd, and the sewer-camera guide's
 * breadcrumb schema points here — this page fixes that.
 *
 * Server page, all content static/SSR. No Supabase access.
 */

export const metadata: Metadata = {
  title: "Leak Detection Guides — Texas".slice(0, 60),
  description:
    "Leak detection guides for Texas: what detection, slab, sewer camera, and yard-line work costs, what insurance covers, and leak adjustment rules by city.".slice(
      0,
      155
    ),
  alternates: { canonical: `${SITE_URL}/guides/` },
};

const GUIDES: Array<{ name: string; path: string; desc: string }> = [
  {
    name: "Leak Detection Cost in Texas",
    path: "/guides/leak-detection-cost/",
    desc: "Finding a leak in Texas typically costs $125–$600 in most metros. Per-metro detection, slab, and camera prices, what changes the price, and how to tell if a quote is fair.",
  },
  {
    name: "Sewer Camera Inspection Cost in Texas",
    path: "/guides/sewer-camera-inspection-cost-texas/",
    desc: "A standard sewer camera inspection in Texas typically costs $150–$500. Prices by metro and by access type, what the report must include, and when a scope is worth it.",
  },
  {
    name: "Water Main & Yard Line Leak in Texas",
    path: "/guides/water-main-yard-line-leak-texas/",
    desc: "A yard line leak often never surfaces in Texas clay soil — the meter is the tell. Signs, the meter-isolation test, who pays, and Texas detection costs.",
  },
  {
    name: "Does Insurance Cover Slab Leaks in Texas?",
    path: "/guides/does-insurance-cover-slab-leak-texas/",
    desc: "Usually, the damage is covered — the pipe is not. Sudden damage vs gradual leaks, HO-B vs HO-3, tear-out, mold, and deductible math.",
  },
  {
    name: "Leak Adjustments in Texas — Utility Rules by City",
    path: "/guides/leak-adjustment/",
    desc: "A leak adjustment is a credit from your water utility for the water a leak wasted — but every utility sets its own percentage, deadline, and limit. Five verified city guides (San Antonio, Austin, Fort Worth, El Paso, Amarillo), a MUD explainer, and official pages for Houston and Dallas.",
  },
];

const PAGE_PATH = "/guides/";

export default function GuidesHubPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbListSchema([
              { name: "Home", path: "/" },
              { name: "Guides", path: PAGE_PATH },
            ])
          ).replace(/</g, "\\u003c"),
        }}
      />

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
            <span className="text-white">Guides</span>
          </nav>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            Leak Detection Guides — Texas
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-blue-100">
            Straight answers to the questions Texas homeowners ask before
            they book anything: what detection costs in their metro, what a
            sewer camera should show, what insurance actually covers, and
            what their own utility will credit back after a leak. Prices
            are typical ranges from researched Texas sources — not quotes.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-14">
        <ul className="space-y-3">
          {GUIDES.map((g) => (
            <li key={g.path} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <Link href={g.path} className="font-bold text-blue-800 hover:underline">
                {g.name} →
              </Link>
              <p className="mt-1 text-sm text-slate-600">{g.desc}</p>
            </li>
          ))}
        </ul>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">Not sure where to start?</h2>
        <p className="mt-3 text-slate-600">
          If your bill jumped, start with the{" "}
          <Link href="/tools/water-bill-spike/" className="font-bold text-blue-800 hover:underline">
            Water Bill Spike Splitter
          </Link>{" "}
          — it tells you whether you are looking at a leak or a rate increase. If you already know the leak type, the{" "}
          <Link href="/tools/leak-cost-estimator/" className="font-bold text-blue-800 hover:underline">
            Leak Cost Estimator
          </Link>{" "}
          shows what detection should cost in your town. Every guide and tool on this site publishes its sources, and
          the{" "}
          <Link href="/tools/methodology/" className="font-bold text-blue-800 hover:underline">
            methodology page
          </Link>{" "}
          brings all twelve tool methods together in one place.
        </p>
        <p className="mt-6 text-xs text-slate-400">
          Disclaimer: prices in these guides are typical ranges from published and researched sources, not quotes. The
          exact price depends on access, line length, pipe condition, and metro. Only a local plumber who has seen your
          line can quote your job.
        </p>
      </section>

      <CtaBand
        title="Read the guide, still unsure?"
        subtitle="Describe your symptoms — a local pro can tell you honestly whether you need detection, a different test, or nothing at all."
      />
    </>
  );
}
