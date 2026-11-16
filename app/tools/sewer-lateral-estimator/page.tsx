import Link from "next/link";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { breadcrumbListSchema, faqPageSchemaFromQAs } from "@/lib/schema";
import SewerLateralEstimator from "@/components/SewerLateralEstimator";
import CtaBand from "@/components/CtaBand";

/**
 * Texas Sewer Lateral Replacement Estimator — tool page #9.
 * One tool, one query: "how much does sewer lateral replacement cost in Texas?"
 *
 * Server-rendered by design (tools-research §7 checklist): the tool is
 * interactive, but the methodology, a worked example with real arithmetic,
 * a no-JS fallback table, and the FAQ are all in the HTML — the page is
 * complete before any JavaScript runs.
 *
 * Prices come only from SEWER_LATERAL_METHODS / CAMERA_TIERS
 * (@/lib/sewer-lateral-prices). All four methods are Texas-verified
 * (DFW + Houston contractor-published prices). Only the cleanout camera
 * tier is Texas-verified; the other three camera tiers are national
 * ranges and are labelled so everywhere they appear. No per-city permit
 * fee is shown except Plano ($400–$1,600, verified); no Austin / San
 * Antonio / El Paso metro lateral price was found, so none is shown.
 *
 * FAQ answers are 50–80 words each (verified by hand at write time).
 * The visible FAQ block and the FAQPage schema are rendered from the same
 * FAQS constant, so they can never drift apart.
 */

export const metadata: Metadata = {
  title: "Texas Sewer Lateral Replacement Estimator".slice(0, 60),
  description:
    "Estimate Texas sewer lateral replacement cost by method, length and depth — 2026 planning ranges from DFW and Houston contractor prices.".slice(
      0,
      155
    ),
  alternates: { canonical: `${SITE_URL}/tools/sewer-lateral-estimator/` },
};

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "Pipe lining vs pipe bursting — which is better?",
    a: "Lining inserts a resin liner inside your existing pipe and cures it in place, so it works only when the old pipe still holds its shape. Bursting breaks the old pipe apart and pulls a brand-new pipe through, so it handles worse damage. Lining usually costs less per foot and leaves the smallest mess, while bursting gives you a full new pipe. A camera scope shows which one your line can take.",
  },
  {
    q: "Do I need a permit to replace a sewer lateral in Texas?",
    a: "Yes, in almost every case. Sewer lateral work is permitted plumbing work in every Texas jurisdiction, and a licensed plumber normally pulls the permit and books the inspection. In Dallas, a master plumber must pull the permit and a city inspector checks the work before it is covered. In Plano, permits add $400 to $1,600 to a project. For other cities, no permit fee was published, so ask your plumber what your city charges before work starts.",
  },
  {
    q: "How long does sewer lateral replacement take?",
    a: "Trenchless jobs are the quickest: both pipe lining and pipe bursting usually take one to two days, with two small access points instead of a full trench. Open-cut replacement takes longer because the crew digs along the whole line and then restores the surface above it. Every method also needs a city inspection before the trench or access pits are covered, so the inspection schedule can add a day. Ask your plumber for a written schedule.",
  },
  {
    q: "How do I know if I need a full replacement or just a spot repair?",
    a: "Only a camera scope can answer that. The camera shows how much of the line is damaged: one cracked or separated section with the rest of the pipe sound usually means a spot repair, published at $1,500 to $4,000 in Texas. Widespread cracks, root damage along the whole line, a collapse, or a sag that traps waste means the line needs replacing. Get the scope recording and a written report first, then compare the repair and replacement ranges.",
  },
  {
    q: "What does a sewer camera inspection cost in Texas?",
    a: "With an existing exterior cleanout, Texas plumbers publish $150 to $500, with most quotes clustering at $250 to $400, usually including the recording and a written report. Without a cleanout, the price depends on access: pulling a toilet runs $175 to $750, and installing a new cleanout runs $700 to $2,000 or more — but both of those are national ranges, not Texas prices. Some Texas plumbers include the camera with a cleaning or repair job.",
  },
  {
    q: "Who pays for a sewer lateral — me or the city?",
    a: "In most Texas communities the sewer lateral is the homeowner's responsibility: the pipe from your house to the city main is yours. Dallas spells this out in City Code Section 49-24 — the city maintains the wastewater service connection only from the main to the property line, and the sewer beyond that is the owner's. If the break is in the city main, call your city or utility first; that part is not yours to fix.",
  },
];

const TOOL_PATH = "/tools/sewer-lateral-estimator/";

export default function SewerLateralEstimatorPage() {
  const faqSchema = faqPageSchemaFromQAs(FAQS);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbListSchema([
              { name: "Home", path: "/" },
              { name: "Sewer Lateral Replacement Estimator", path: TOOL_PATH },
            ])
          ).replace(/</g, "\\u003c"),
        }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c"),
          }}
        />
      )}

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
            <span className="text-white">Sewer Lateral Replacement Estimator</span>
          </nav>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            How much does sewer lateral replacement cost in Texas?
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-blue-100">
            A sewer lateral replacement is a $4,000–$18,000 decision in
            Texas — and the method, the length, and what sits above the
            line change the number by thousands. This free tool estimates
            your job from Texas-published contractor prices, not national
            averages. Start with a camera scope first: a scope tells you
            whether you need a repair at all.
          </p>
        </div>
      </section>

      <SewerLateralEstimator />

      <section className="mx-auto max-w-4xl px-4 py-14">
        <h2 className="text-2xl font-extrabold text-blue-950">How the estimate is calculated</h2>
        <p className="mt-3 text-slate-600">
          Every price on this page comes from Texas contractor-published
          sources, checked November 16, 2026. Nothing is guessed, and no
          national average is relabelled as a Texas price. Here is the
          exact method, in plain words:
        </p>
        <ol className="mt-5 list-decimal space-y-3 pl-6 text-slate-600">
          <li>
            <strong className="text-blue-950">Per-foot methods</strong> (open-cut, lining, bursting): planning
            range = published per-foot range × your lateral length. Spot repair is priced per job, not per foot:
            $1,500–$4,000.
          </li>
          <li>
            <strong className="text-blue-950">Permit add-on</strong>: only Plano has a published permit fee
            ($400–$1,600), so it is added only when you enter Plano. Every other Texas city gets the note
            &ldquo;permit required — fee varies by city&rdquo; and no fee is added.
          </li>
          <li>
            <strong className="text-blue-950">Depth and surface</strong> move you inside the published range —
            no dollar amount is added for them, because no published Texas figure prices them separately. A deep
            line under a driveway sits toward the high end; a shallow line under lawn sits toward the low end.
            The tool says which, and the methodology below says it is a rule of thumb, not a price.
          </li>
          <li>
            <strong className="text-blue-950">Typical totals</strong> are shown next to the per-foot math as a
            cross-check. Per-foot math alone can understate a short job: fixed costs (access, permit,
            mobilization) mean a short lateral rarely lands at the per-foot low end.
          </li>
          <li>
            <strong className="text-blue-950">Camera cost</strong> is shown separately, because it is a
            different job: $150–$500 through an existing cleanout (Texas-verified, cluster $250–$400). The
            toilet-pull ($175–$750) and new-cleanout ($700–$2,000+) tiers are national ranges, labelled so.
          </li>
        </ol>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">Methodology — every price and its source</h2>
        <p className="mt-3 text-slate-600">
          All four methods have Texas-published prices, from DFW and
          Houston sources. No San Antonio, Austin, El Paso, McAllen, Corpus
          Christi, Lubbock, or Amarillo metro-specific lateral price was
          found — the figures below are the DFW/Houston Texas evidence
          base, and they are not relabelled as prices for other metros.
        </p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600">
                <th className="p-4 font-bold">Method</th>
                <th className="p-4 font-bold">Per foot (Texas)</th>
                <th className="p-4 font-bold">Typical total (Texas)</th>
                <th className="p-4 font-bold">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="p-4 font-semibold">Open-cut / trench replacement</td>
                <td className="p-4">$50–$250</td>
                <td className="p-4">$4,000–$15,000 (complex jobs to $30,000+)</td>
                <td className="p-4">Angi Dallas (updated May 3, 2026); Allen Sewer Line; Texas Plumbing Directory (2026); NuFlow DFW — $150–$450/ft for complex/deep jobs</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">Pipe lining (CIPP)</td>
                <td className="p-4">$80–$250</td>
                <td className="p-4">$5,000–$15,000 (starts at $3,500+)</td>
                <td className="p-4">NuFlow DFW; Texas Plumbing Directory; Allen Sewer Line ($90–$250); Plano Sewer Line ($70–$150 at the low end)</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">Pipe bursting</td>
                <td className="p-4">$60–$250</td>
                <td className="p-4">$6,000–$18,000</td>
                <td className="p-4">Allen Sewer Line; Plano Sewer Line; Angi Dallas; Texas Plumbing Directory; NuFlow DFW ($150–$250)</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">Spot repair (single section)</td>
                <td className="p-4">Per job, not per foot</td>
                <td className="p-4">$1,500–$4,000 per job</td>
                <td className="p-4">Texas Plumbing Directory; Sewer Repair Houston guide</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          Typical DFW residential lateral: 30–40 ft (Plano Sewer Line).
          Lining and bursting usually take 1–2 days with two small access
          points; lining needs a host pipe that still holds shape and has
          a ~50-year design life (ASTM F1216). SewerLineLab (surveyed
          August 2026, 260 quotes) puts the Texas aggregate at
          $3,800–$13,500. Permits: sewer lateral work is permitted plumbing
          work in every Texas jurisdiction and must be done under a licensed
          plumber (CPC Trenchless); Dallas requires a plumbing permit pulled
          by a Texas-licensed master plumber, with a city inspection before
          the work is covered (Mr. Rooter Dallas; Dallas City Code §49-24).
        </p>
        <p className="mt-3 text-sm text-slate-500">
          Camera tiers: cleanout $150–$500 is Texas-verified (S.W.A.T.
          Plumbing, Aledo/Fort Worth, $250–$400 flat including report and
          video; Dodd&apos;s Plumbing, Houston, $200–$400; James Armstrong
          Plumbing, Richardson, $150–$400; Sewer Repair Houston guide,
          $250–$500). The home-inspection add-on ($100–$250), toilet-pull
          ($175–$750), and new-cleanout ($700–$2,000+) tiers are national
          ranges from NuFlow DFW&apos;s sewer-scope cost page — no
          Texas-specific price was found for them.
        </p>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">Worked example — 35 ft, open-cut, lawn, Plano</h2>
        <p className="mt-3 text-slate-600">
          Example numbers, clearly labeled as an example — your own inputs
          will give your own result:
        </p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600">
                <th className="p-4 font-bold">Step</th>
                <th className="p-4 font-bold">Calculation</th>
                <th className="p-4 font-bold">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr><td className="p-4 font-semibold">Pipe work</td><td className="p-4">$50–$250/ft × 35 ft</td><td className="p-4">$1,750–$8,750</td></tr>
              <tr><td className="p-4 font-semibold">Plano permit</td><td className="p-4">Published Plano fee</td><td className="p-4">+$400–$1,600</td></tr>
              <tr><td className="p-4 font-semibold">Planning range</td><td className="p-4">$1,750–$8,750 + $400–$1,600</td><td className="p-4">$2,150–$10,350 (estimate, not a quote)</td></tr>
              <tr><td className="p-4 font-semibold">Cross-check</td><td className="p-4">Published Texas totals, open-cut</td><td className="p-4">$4,000–$15,000 — the low end of the per-foot math is optimistic for a real job</td></tr>
              <tr><td className="p-4 font-semibold">Camera first</td><td className="p-4">Existing cleanout, Texas-verified</td><td className="p-4">$150–$500 (cluster $250–$400)</td></tr>
            </tbody>
          </table>
        </div>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">Quick reference — no calculator needed</h2>
        <p className="mt-3 text-slate-600">
          If you can&apos;t use the interactive tool, this table gives the
          same answers for a 50-foot lateral — the example length, not your
          length. Permit and access costs are not included; a camera scope
          is extra. All figures are 2026 planning ranges, estimates, not
          quotes.
        </p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600">
                <th className="p-4 font-bold">Method (50 ft example)</th>
                <th className="p-4 font-bold">Per-foot math</th>
                <th className="p-4 font-bold">Typical Texas total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr><td className="p-4 font-semibold">Open-cut / trench replacement</td><td className="p-4">$50–$250/ft × 50 ft = $2,500–$12,500</td><td className="p-4">$4,000–$15,000</td></tr>
              <tr><td className="p-4 font-semibold">Pipe lining (CIPP)</td><td className="p-4">$80–$250/ft × 50 ft = $4,000–$12,500</td><td className="p-4">$5,000–$15,000</td></tr>
              <tr><td className="p-4 font-semibold">Pipe bursting</td><td className="p-4">$60–$250/ft × 50 ft = $3,000–$12,500</td><td className="p-4">$6,000–$18,000</td></tr>
              <tr><td className="p-4 font-semibold">Spot repair (single section)</td><td className="p-4">Per job, not per foot</td><td className="p-4">$1,500–$4,000 per job</td></tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          Why the per-foot math and the typical total disagree: a
          replacement has fixed costs — access, permit, mobilization,
          inspection — that the per-foot rate does not cover. For a
          30–40 ft lateral, the typical total is the more realistic
          planning number; the per-foot math is most useful for comparing
          methods at the same length.
        </p>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-14">
          <h2 className="text-2xl font-extrabold text-blue-950">Sewer lateral replacement — questions, answered</h2>
          <div className="faq mt-6 space-y-6">
            {FAQS.map((f) => (
              <div key={f.q}>
                <h3 className="text-lg font-extrabold text-blue-950">{f.q}</h3>
                <p className="mt-2 text-slate-600">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-14">
        <h2 className="text-2xl font-extrabold text-blue-950">What to do next</h2>
        <ul className="mt-5 space-y-3">
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/guides/sewer-camera-inspection-cost-texas/" className="font-bold text-blue-800 hover:underline">
              Sewer camera inspection cost in Texas →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              What a scope costs by access type — $150–$500 through a cleanout (Texas-verified) — and what to
              ask for in the report.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/services/sewer-line-leak-detection/" className="font-bold text-blue-800 hover:underline">
              Sewer line leak detection →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              How sewer line leaks are tracked down before any digging starts.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/tools/leak-cost-estimator/" className="font-bold text-blue-800 hover:underline">
              Leak Cost Estimator →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              Estimate what a leak is costing you — the other side of the repair decision.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/tools/home-buyer-leak-risk/" className="font-bold text-blue-800 hover:underline">
              Home-Buyer Leak Risk tool →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              Buying a home? Check the slab and sewer risk — including the camera cost — before your option
              period ends.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="font-bold text-blue-950">Local guides with real data: </span>
            <Link href="/tx/houston/katy/" className="font-bold text-blue-800 hover:underline">Katy, TX</Link>
            {" · "}
            <Link href="/tx/dallas/plano/" className="font-bold text-blue-800 hover:underline">Plano, TX</Link>
            <p className="mt-1 text-sm text-slate-600">
              Every town guide covers slab, sewer, gas and pool leaks with verified local soil, housing and pricing data.
            </p>
          </li>
        </ul>
        <p className="mt-6 text-xs text-slate-400">
          Disclaimer: this tool gives 2026 planning ranges from published Texas contractor prices. It is an
          estimate, not a quote, and never a diagnosis. Only a camera scope and an on-site look can price your
          house, and only your city can confirm its permit fee. Sewer work is not septic work — this tool covers
          sewer laterals only.
        </p>
      </section>

      <CtaBand
        title="Get a camera scope first"
        subtitle="A scope tells you whether you need a repair at all — and which method your line can take. Describe what you know, and a local pro can tell you honestly what needs a scope."
      />
    </>
  );
}
