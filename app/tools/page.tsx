import Link from "next/link";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { breadcrumbListSchema } from "@/lib/schema";
import CtaBand from "@/components/CtaBand";
import GuideVideo from "@/components/GuideVideo";

/**
 * Tools hub — the index for all 12 free tools.
 *
 * Every description below is condensed from the tool's own page
 * (hero + metadata) — no feature is claimed that the tool page
 * does not state. Homeowner tools first, then the one pro tool,
 * labeled B2B.
 *
 * Server page, all content static/SSR. No Supabase access.
 */

export const metadata: Metadata = {
  title: "Free Leak Detection Tools | Texas".slice(0, 60),
  description:
    "12 free leak detection tools for Texas homeowners — bill spikes, freeze risk, leak costs, insurance, and more. No signup; every result is an estimate.".slice(
      0,
      155
    ),
  alternates: { canonical: `${SITE_URL}/tools/` },
};

const HOMEOWNER_TOOLS: Array<{ name: string; path: string; desc: string }> = [
  {
    name: "Water Bill Spike Splitter",
    path: "/tools/water-bill-spike/",
    desc: "Splits a bill jump into the leak part and the rate part, estimates what the extra water costs, and names the most likely leak type.",
  },
  {
    name: "Freeze-Burst Risk Tonight",
    path: "/tools/freeze-risk-tonight/",
    desc: "Tonight's pipe freeze-burst risk for your Texas town — the forecast low, how many hours it stays below freezing, and what to do before bed.",
  },
  {
    name: "Freeze-Burst Damage Estimator",
    path: "/tools/freeze-damage-estimator/",
    desc: "Estimates gallons released and damage dollars by room after a burst pipe, and what insurance typically covers — starting from tonight's freeze risk.",
  },
  {
    name: "Leak Cost Estimator",
    path: "/tools/leak-cost-estimator/",
    desc: "Estimates leak detection and repair costs for your Texas town from researched per-town prices, and tells you whether a quote is fair.",
  },
  {
    name: "Home-Buyer Leak Risk Report",
    path: "/tools/home-buyer-leak-risk/",
    desc: "Six facts about a house give you a slab risk band, a sewer risk band, what the inspections should cost in that town, and an option-period checklist.",
  },
  {
    name: "Insurance Claim Pack",
    path: "/tools/insurance-claim-pack/",
    desc: "Shows the coverage likelihood for each cost bucket under Texas HO-B / HO-3 rules, does the deductible math, and drafts your claim letter.",
  },
  {
    name: "Leak Adjustment Checker",
    path: "/tools/leak-adjustment-checker/",
    desc: "Finds your utility's published leak-adjustment rule, judges your eligibility against it, estimates the credit, and drafts your application pack.",
  },
  {
    name: "Sewer Winter-Averaging Calculator",
    path: "/tools/sewer-winter-averaging/",
    desc: "Shows the 12-month sewer-bill tail a winter leak causes, and whether your utility can correct the inflated average.",
  },
  {
    name: "Who Pays? Finder",
    path: "/tools/who-pays/",
    desc: "Tells you who is responsible for a leak — city, MUD, homeowner, or HOA — who to call first, and whether to call 811 before any digging.",
  },
  {
    name: "Cost of Waiting Calculator",
    path: "/tools/cost-of-waiting/",
    desc: "Shows what your leak wastes every day, week, month, and year, and what each month of waiting adds — from the bill to the foundation.",
  },
  {
    name: "Sewer Lateral Replacement Estimator",
    path: "/tools/sewer-lateral-estimator/",
    desc: "Estimates sewer lateral replacement cost in Texas by method, length, and depth, from Texas-published contractor prices.",
  },
];

const PRO_TOOLS: Array<{ name: string; path: string; desc: string }> = [
  {
    name: "Plumber Job-Price Estimator",
    path: "/tools/plumber-price-estimator/",
    desc: "Prices leak jobs from researched Texas town rates: flat-rate sell price, labor and material split at your own rates, and a margin check.",
  },
];

const PAGE_PATH = "/tools/";

function ToolCard({ tool }: { tool: { name: string; path: string; desc: string } }) {
  return (
    <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <Link href={tool.path} className="font-bold text-blue-800 hover:underline">
        {tool.name} →
      </Link>
      <p className="mt-1 text-sm text-slate-600">{tool.desc}</p>
    </li>
  );
}

export default function ToolsHubPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbListSchema([
              { name: "Home", path: "/" },
              { name: "Tools", path: PAGE_PATH },
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
            <span className="text-white">Tools</span>
          </nav>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            Free Leak Detection Tools
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-blue-100">
            Twelve free tools that answer the questions a Texas homeowner
            actually asks — why the bill jumped, whether the pipes freeze
            tonight, what a leak costs, who pays for it, and what the
            insurer or the utility will cover. No signup, no account: every
            tool runs on the numbers you type in. Every result is an
            estimate for planning, never a quote and never a diagnosis.
          </p>
        </div>
      </section>

      {/* Video demo — renders nothing until a real videoId is registered
          in lib/videos.ts for this page. */}
      <GuideVideo pageKey="/tools/" />

      <section className="mx-auto max-w-4xl px-4 py-14">
        <h2 className="text-2xl font-extrabold text-blue-950">For homeowners</h2>
        <ul className="mt-5 space-y-3">
          {HOMEOWNER_TOOLS.map((t) => (
            <ToolCard key={t.path} tool={t} />
          ))}
        </ul>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">For plumbers (B2B)</h2>
        <p className="mt-3 text-slate-600">
          One tool is built for leak-detection pros, not homeowners. It is
          free to use, with no signup.
        </p>
        <ul className="mt-5 space-y-3">
          {PRO_TOOLS.map((t) => (
            <ToolCard key={t.path} tool={t} />
          ))}
        </ul>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">How the numbers are calculated</h2>
        <p className="mt-3 text-slate-600">
          Every tool publishes its own method on its own page — the inputs,
          the formula, the thresholds, and the sources. The{" "}
          <Link href="/tools/methodology/" className="font-bold text-blue-800 hover:underline">
            methodology page
          </Link>{" "}
          brings all twelve together in one place, so you can check any
          number before you rely on it.
        </p>
        <p className="mt-6 text-xs text-slate-400">
          Disclaimer: these tools give estimates from the numbers you enter.
          They are screening aids, not diagnoses and never quotes. Only
          on-site leak detection can confirm a leak, and only your utility
          or insurer can confirm your rate, a bill adjustment, or coverage.
        </p>
      </section>

      <CtaBand
        title="Not sure which tool you need?"
        subtitle="Describe what you see — the bill, the damp spot, the sound — and a local pro can tell you honestly which check comes first."
      />
    </>
  );
}
