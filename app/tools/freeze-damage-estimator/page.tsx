import Link from "next/link";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { breadcrumbListSchema, faqPageSchemaFromQAs } from "@/lib/schema";
import FreezeDamageEstimator from "@/components/FreezeDamageEstimator";
import CtaBand from "@/components/CtaBand";

/**
 * Freeze-Burst Damage Estimator — tool page #3, companion to
 * Freeze-Burst Risk Tonight (Tool 2). One tool, one query: "a pipe
 * burst in the freeze — how much water, how much damage, and what
 * does insurance typically cover?"
 *
 * Server-rendered by design (tools-research §7 checklist): the tool is
 * interactive, but the methodology, a worked example with the real Uri
 * numbers for Katy, a no-JS fallback table, and the FAQ are all in the
 * HTML — the page is complete before any JavaScript runs.
 *
 * Damage $/sq ft: IICRC S500 sets the water categories, not prices.
 * The mitigation bands on this page come from published trade cost
 * guides that price by S500 category (RestoreAdvisor, 2026) — Cat 1
 * $3–$4, Cat 2 $4–$6.50, Cat 3 $7–$7.50 per sq ft; rebuild $20–$37.
 * No rate on this page is invented, and every rate is editable in
 * the tool. No Bureau of Labor Statistics figure is used.
 *
 * FAQ answers are 50–80 words each (verified by word count at write
 * time). The visible FAQ block and the FAQPage schema are rendered
 * from the same FAQS constant, so they can never drift apart.
 */

export const metadata: Metadata = {
  title: "Freeze-Burst Damage Estimator — Texas".slice(0, 60),
  description:
    "A pipe burst in the freeze? Estimate gallons released, damage dollars by room, and what insurance typically covers. Free tool, no signup.".slice(
      0,
      155
    ),
  alternates: { canonical: `${SITE_URL}/tools/freeze-damage-estimator/` },
};

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "How much water does a burst pipe release?",
    a: "It depends on the pipe size, the pressure, and how long it runs before someone shuts the water off. This tool uses a planning assumption of 6 gallons per minute for a burst 1/2-inch line at typical household pressure — clearly labeled as an assumption, not a measured rate. At that rate, 8 hours undetected releases about 2,880 gallons. Change the flow rate and the hours in the tool to match your situation; the formula is shown with every result.",
  },
  {
    q: "Does homeowners insurance cover a burst pipe in Texas?",
    a: "Often the water damage is covered but the pipe itself is not — that is the typical HO-3 and Texas HO-B pattern. Sudden, accidental bursts are usually covered; gradual leaks and seepage over weeks usually are not. Tear-out — opening a wall or floor to reach the pipe — is often covered. The Texas Department of Insurance notes a policy might not pay if you did not protect pipes from freezing, so keep proof you dripped taps and insulated lines.",
  },
  {
    q: "What does freeze damage cost per square foot?",
    a: "Two parts, priced separately. Mitigation — extraction and drying — runs about $3–$4 per square foot for Category 1 clean water from a burst supply line, $4–$6.50 for Category 2 gray water, and $7–$7.50 for Category 3 black water, from published trade cost guides that price by IICRC S500 category. Rebuild and repair run about $20–$37 per square foot on top. This tool multiplies your affected area by those bands and shows the formula, so you can check every dollar.",
  },
  {
    q: "What should I do the minute I find a burst pipe?",
    a: "Shut off the main water valve first — where the line enters the house — then open a faucet to drain the pressure. That one step stops the gallons from climbing while you think. Next, take photos of the water and the damage, and keep every receipt. Then call your insurer and a pro. Never thaw a frozen pipe with a torch or open flame; use a hair dryer or towels soaked in hot water.",
  },
  {
    q: "Which pipes burst first in a Texas freeze?",
    a: "The ones sitting in unheated air: outdoor tankless units and hose bibs first, then pipes in attics and garages, then pipes in exterior walls and crawl spaces. Texas homes are more exposed than northern ones because builders ran pipes through attics and exterior walls with little insulation, never expecting week-long freezes. A power outage makes it worse — with no heat, the whole house cools toward the outside temperature, so this tool raises the band when power is out.",
  },
  {
    q: "How is this different from the Freeze-Burst Risk Tonight tool?",
    a: "The Freeze-Burst Risk Tonight tool answers whether your pipes might freeze tonight — the forecast low, the hours below freezing, and the risk band. This tool is its companion: it takes that risk and turns it into consequences — how many gallons a burst would release, what the damage would cost by room and flooring, and what insurance typically covers. Check the risk tool first, then run this one to see what is at stake if a pipe goes.",
  },
];

const TOOL_PATH = "/tools/freeze-damage-estimator/";

export default function FreezeDamageEstimatorPage() {
  const faqSchema = faqPageSchemaFromQAs(FAQS);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbListSchema([
              { name: "Home", path: "/" },
              { name: "Freeze-Burst Damage Estimator", path: TOOL_PATH },
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
            <Link href="/tools/freeze-risk-tonight/" className="hover:text-white hover:underline">Freeze-Burst Risk Tonight</Link>
            <span className="mx-2 text-blue-400">›</span>
            <span className="text-white">Freeze-Burst Damage Estimator</span>
          </nav>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            What does a burst pipe cost in a Texas freeze?
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-blue-100">
            A burst pipe is two questions: how much water, and how much
            damage. This free tool starts from{" "}
            <Link href="/tools/freeze-risk-tonight/" className="font-bold text-white hover:underline">
              tonight&apos;s freeze risk
            </Link>{" "}
            and estimates both — gallons released, damage dollars by room
            and flooring, and what insurance typically covers. Every number
            is an estimate, never a quote.
          </p>
        </div>
      </section>

      <FreezeDamageEstimator />

      <section className="mx-auto max-w-4xl px-4 py-14">
        <h2 className="text-2xl font-extrabold text-blue-950">How the estimate is calculated</h2>
        <p className="mt-3 text-slate-600">
          Every threshold, coefficient, and source on this page is
          published here — nothing is hidden inside the tool. The burst
          band reuses the Freeze-Burst Risk Tonight rule exactly; the
          damage math is shown as a formula with every result.
        </p>

        <h3 className="mt-8 text-xl font-extrabold text-blue-950">1. Burst likelihood — the same bands as the risk tool</h3>
        <p className="mt-3 text-slate-600">
          &ldquo;Tonight&rdquo; means 6pm today to 9am tomorrow, Central time
          (America/Chicago). The forecast is the Open-Meteo forecast at
          your town&apos;s own coordinates, refreshed by our nightly run and
          fetched live when the stored forecast is stale — or typed in by
          hand, which works with no forecast at all.
        </p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600">
                <th className="p-4 font-bold">Band</th>
                <th className="p-4 font-bold">Tonight&apos;s forecast</th>
                <th className="p-4 font-bold">What it means</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="p-4 font-semibold text-green-800">Low</td>
                <td className="p-4">No hours below 32°F</td>
                <td className="p-4">Water in pipes stays liquid. A burst is unlikely; the damage estimate is $0.</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-amber-700">Watch</td>
                <td className="p-4">Below 32°F, but above 28°F, and fewer than 4 hours below freezing</td>
                <td className="p-4">A brief freeze. Indoor pipes in heated space are usually fine; exposed pipes can freeze.</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-red-700">High</td>
                <td className="p-4">28°F or below, or 4+ hours below 32°F</td>
                <td className="p-4">A sustained freeze. Uninsulated pipes in unheated spaces can freeze and burst — act before bed.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-slate-600">
          Inside the High band, a low at or below <strong className="text-blue-950">20°F</strong> is flagged
          as a <strong className="text-blue-950">hard freeze</strong>. That threshold comes from the
          University of Illinois Building Research Council (1996): at or
          below 20°F, exposed pipes can freeze and burst within hours.
        </p>
        <p className="mt-3 text-slate-600">
          <strong className="text-blue-950">Two adjustments — our rule, not a published model.</strong>{" "}
          Power out raises the band one step, because a house with no heat
          cools toward the outside temperature. Pipes in an unheated space
          (attic, garage, outdoor tankless) raise a Watch night to High,
          because they sit in outside air. Exterior-wall and crawl-space
          pipes get no adjustment — they are the baseline the band already
          assumes. The adjustments never apply when there are zero freeze
          hours, and the band is capped at High. The tool tells you
          whenever an adjustment raised your band.
        </p>

        <h3 className="mt-8 text-xl font-extrabold text-blue-950">2. Gallons released — one formula, one stated assumption</h3>
        <p className="mt-3 text-slate-600">
          <strong className="text-blue-950">Gallons = flow rate (gallons per minute) × 60 × hours undetected.</strong>{" "}
          The default flow rate is <strong className="text-blue-950">6 gallons per minute</strong> — a
          planning assumption for a burst 1/2-inch line at typical household
          pressure, clearly labeled as an assumption, not a measured rate. A
          real burst line&apos;s flow depends on pressure, pipe size, and how
          far the break is from the main, so the tool lets you change it.
          Hours undetected is how long the burst runs before someone finds
          it and shuts the valve — 8 hours is one night asleep.
        </p>

        <h3 className="mt-8 text-xl font-extrabold text-blue-950">3. Damage dollars — published bands, your area</h3>
        <p className="mt-3 text-slate-600">
          <strong className="text-blue-950">Damage $ = affected area (sq ft) × (mitigation rate + rebuild rate).</strong>{" "}
          The water category comes from the IICRC S500 standard, which
          classifies water by contamination: Category 1 clean water (a
          burst supply line), Category 2 gray water, Category 3 black
          water. S500 is a standard of care, not a price book — so the
          per-square-foot bands come from published trade cost guides that
          price by S500 category (RestoreAdvisor, 2026):
        </p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600">
                <th className="p-4 font-bold">Water category (IICRC S500)</th>
                <th className="p-4 font-bold">Mitigation $ / sq ft (extraction + drying)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr><td className="p-4 font-semibold">Category 1 — clean water</td><td className="p-4">$3–$4</td></tr>
              <tr><td className="p-4 font-semibold">Category 2 — gray water</td><td className="p-4">$4–$6.50</td></tr>
              <tr><td className="p-4 font-semibold">Category 3 — black water</td><td className="p-4">$7–$7.50</td></tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-slate-600">
          Rebuild and repair — new drywall, flooring, and finishes — run
          about <strong className="text-blue-950">$20–$37 per square foot</strong> in the same published
          guide. The tool uses the $28 midpoint as an editable default;
          enter 0 to see mitigation only. No Bureau of Labor Statistics
          figure is used here: the published bands above already include
          extraction, drying, and labor. Room and flooring do not change
          the dollars — they change what a crew removes first, which the
          tool notes in plain words. Affected area is measured by you
          (the wet floor area); we publish no &ldquo;typical&rdquo; size.
        </p>

        <h3 className="mt-8 text-xl font-extrabold text-blue-950">4. Insurance split — the typical HO-3 / HO-B pattern</h3>
        <p className="mt-3 text-slate-600">
          The split follows the pattern in the best national guides (ISO
          HO-3 form, as summarized by LegalClarity): the burst pipe itself
          is usually <em>not</em> covered — pipe repair is maintenance,
          and you pay it. Tear-out and access (opening a wall or floor to
          reach the pipe) is often covered. Water damage from a sudden,
          accidental burst is often covered. Gradual leaks and seepage
          over 14 days are usually excluded. Texas policies use the
          HO-B form, and the Texas Department of Insurance notes a policy
          might not pay if you did not protect pipes from freezing. The
          tool shows &ldquo;damage minus your deductible&rdquo; as the
          estimated insurer share — labeled a typical pattern, never a
          coverage promise. Confirm with your insurer; this is not
          insurance advice.
        </p>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">Worked example — Katy, the night Winter Storm Uri hit</h2>
        <p className="mt-3 text-slate-600">
          Real forecast numbers from the Open-Meteo archive (ERA5
          reanalysis), hourly temperature at Katy, TX (29.7858, −95.8244),
          for the night of February 14, 2021. The damage inputs are
          labeled examples — your home will give your own numbers:
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
              <tr><td className="p-4 font-semibold">Tonight&apos;s low</td><td className="p-4">Coldest of 16 hourly readings</td><td className="p-4">14.4°F — hard freeze</td></tr>
              <tr><td className="p-4 font-semibold">Hours below 32°F</td><td className="p-4">Count of readings below 32°F</td><td className="p-4">16 of 16 — High band</td></tr>
              <tr><td className="p-4 font-semibold">Hours at or below 20°F</td><td className="p-4">Count of readings at or below 20°F</td><td className="p-4">7 hours</td></tr>
              <tr><td className="p-4 font-semibold">Adjustments</td><td className="p-4">Attic pipes + power out in Uri</td><td className="p-4">Stays High (capped)</td></tr>
              <tr><td className="p-4 font-semibold">Gallons released</td><td className="p-4">6 gpm × 60 × 8 hrs undetected (example)</td><td className="p-4">2,880 gallons</td></tr>
              <tr><td className="p-4 font-semibold">Mitigation</td><td className="p-4">200 sq ft × $3–$4 (Cat 1, example area)</td><td className="p-4">$600–$800</td></tr>
              <tr><td className="p-4 font-semibold">Rebuild</td><td className="p-4">200 sq ft × $28 (example area)</td><td className="p-4">$5,600</td></tr>
              <tr><td className="p-4 font-semibold">Total damage (estimate)</td><td className="p-4">$600–$800 + $5,600</td><td className="p-4">$6,200–$6,400</td></tr>
              <tr><td className="p-4 font-semibold">Insurer share (if covered)</td><td className="p-4">$6,200–$6,400 − $1,000 deductible (example)</td><td className="p-4">$5,200–$5,400</td></tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          Every hour of that night stayed below freezing, and the low
          reached 14.4°F. About 511,000 Winter Storm Uri insurance claims
          were filed in Texas (Texas Department of Insurance). A night like
          that is exactly when the shut-off triage matters: the valve,
          the drips, and the photos, before bed.
        </p>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">Quick reference — no calculator needed</h2>
        <p className="mt-3 text-slate-600">
          If you can&apos;t use the interactive tool, this table gives the
          same answers for three nights. Damage uses the worked-example
          assumptions: 6 gpm flow, Category 1 clean water, $28/sq ft
          rebuild, $1,000 deductible — change any of them in the tool.
        </p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600">
                <th className="p-4 font-bold">Night</th>
                <th className="p-4 font-bold">Band</th>
                <th className="p-4 font-bold">Gallons (if it bursts)</th>
                <th className="p-4 font-bold">Damage $ (estimate)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="p-4 font-semibold">Mild night — low 30°F, 2 hrs below 32°F, power on, exterior-wall pipes</td>
                <td className="p-4">Watch</td>
                <td className="p-4">Burst unlikely — no damage estimate</td>
                <td className="p-4">—</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">Cold night — low 24°F, 6 hrs below 32°F, power on, garage pipes, 4 hrs undetected, 150 sq ft</td>
                <td className="p-4">High</td>
                <td className="p-4">1,440 gallons</td>
                <td className="p-4">$4,650–$4,800</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">Uri night, Katy — low 14.4°F, 16 hrs below 32°F, 7 hrs ≤20°F, power out, attic pipes, 8 hrs undetected, 200 sq ft</td>
                <td className="p-4">High — hard freeze</td>
                <td className="p-4">2,880 gallons</td>
                <td className="p-4">$6,200–$6,400</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-14">
          <h2 className="text-2xl font-extrabold text-blue-950">Freeze-burst damage — questions, answered</h2>
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
            <Link href="/tools/freeze-risk-tonight/" className="font-bold text-blue-800 hover:underline">
              Check tonight&apos;s freeze risk first →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              The companion tool: tonight&apos;s forecast low, hours below freezing, and the risk band for your town.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/tx/houston/katy/#meter-test" className="font-bold text-blue-800 hover:underline">
              Run the overnight meter test →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              Turn off all water, note the meter, check it in the morning. If it moved after a freeze, a pipe may have split.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/services/water-main-leak-detection/" className="font-bold text-blue-800 hover:underline">
              Water main leak detection →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              For a broken yard or main line after a freeze: pressure testing plus acoustic pinpointing before any excavation.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/services/slab-leak-detection/" className="font-bold text-blue-800 hover:underline">
              Slab leak detection →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              Freeze-thaw cycles shift slabs and stress buried lines. How acoustic and thermal equipment pinpoints a leak under concrete without digging.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/tools/water-bill-spike/" className="font-bold text-blue-800 hover:underline">
              Water Bill Spike Splitter →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              If the freeze shows up on next month&apos;s bill instead: split the spike into the leak part and the rate part.
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
          Disclaimer: this tool gives estimates from the forecast and the numbers you enter. It is a screening aid,
          not a burst prediction, not a quote, and not insurance advice. Only on-site inspection can confirm a burst
          pipe or the real damage, and only your insurer can confirm what your policy covers.
        </p>
      </section>

      <CtaBand
        title="Pipe already burst after a freeze?"
        subtitle="Shut off the main valve first — then describe what happened, and a local pro can tell you honestly what needs detection."
      />
    </>
  );
}
