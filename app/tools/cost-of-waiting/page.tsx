import Link from "next/link";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { breadcrumbListSchema, faqPageSchemaFromQAs } from "@/lib/schema";
import CostOfWaiting from "@/components/CostOfWaiting";
import CtaBand from "@/components/CtaBand";

/**
 * Cost of Waiting Calculator — tool page #3.
 * One tool, one query: "can I wait to fix this leak?"
 *
 * Server-rendered by design (tools-research §7 checklist): the tool is
 * interactive, but the methodology, a worked example with real
 * arithmetic, a no-JS fallback table, the escalation curve as a static
 * table, and the FAQ are all in the HTML — the page is complete before
 * any JavaScript runs.
 *
 * Stage costs: only the month-3 slab repair range is a published,
 * citable figure (Angi, Sep 2026). The month-6 mold/floors and year-1
 * foundation stages carry NO number — no verified published Texas range
 * exists for them — and the page says why rather than inventing one.
 *
 * FAQ answers are 50–80 words each (verified by hand at write time).
 * The visible FAQ block and the FAQPage schema are rendered from the same
 * FAQS constant, so they can never drift apart.
 */

export const metadata: Metadata = {
  title: "Cost of Waiting Calculator — Leak Costs".slice(0, 60),
  description:
    "A slow leak costs more every month. Enter your meter rate and water rate to see gallons and dollars wasted — and what waiting a year can add.".slice(
      0,
      155
    ),
  alternates: { canonical: `${SITE_URL}/tools/cost-of-waiting/` },
};

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "How much water does a small leak waste?",
    a: "A faucet dripping once a second wastes about 3,000 gallons a year, according to the EPA — roughly 8 gallons a day. A running toilet wastes about 200 gallons a day, or 6,000 gallons in a month. A slab leak can waste far more: published figures put it at 5,000 to 30,000 gallons a month. The waste runs 24 hours a day, so even a 'small' leak adds up to thousands of gallons before most homeowners notice it.",
  },
  {
    q: "Why does waiting make a leak more expensive?",
    a: "The water bill is only the first cost. Water leaking under a slab softens the soil, and Texas clay swells when wet and shrinks when dry, so the ground moves and the slab cracks. Months later, trapped moisture feeds mold and damages flooring. By a year, the repair can mean foundation work on top of the pipe repair. Catching the leak early means paying for detection and one repair — waiting can mean paying for several.",
  },
  {
    q: "How do I measure my leak rate with the meter test?",
    a: "Turn off every tap, appliance, and irrigation zone, then read your water meter and write the number down. Wait two hours without using any water, then read it again. If the reading moved, water is escaping. Divide the gallons used by two to get gallons per hour, and enter that number in this tool. The overnight version on our Katy guide works the same way — the meter cannot move with everything off unless water is leaving the system.",
  },
  {
    q: "What does slab leak repair cost if I wait?",
    a: "Published national ranges put slab leak repair at $630 to $4,400, averaging about $2,280 (Angi, updated September 2026). That is the repair alone — it does not include flooring, mold cleanup, or foundation work that a leak left running can add. Detection typically costs far less: our researched Katy range is $150 to $400. Every figure here is a published planning range, not a quote; only an on-site visit can price your leak.",
  },
  {
    q: "Does insurance cover damage from a leak I ignored?",
    a: "Usually not if the leak was gradual. Homeowners policies generally cover sudden, accidental water damage, but not damage from a leak that ran for weeks or months — that is treated as maintenance the owner should have caught. Many policies also cap mold coverage, commonly at $2,500 to $15,000. Keep your bills, meter readings, and the detection report: they are the evidence your insurer asks for, and they show when the leak was found.",
  },
  {
    q: "I have two warning signs — how fast should I act?",
    a: "Book detection this week. One sign alone can have another cause, but two or more — a warm spot on the floor, the sound of running water, a bill jump, a water heater cycling often, or flooring that is buckling — point to a leak that is already doing damage. The meter test takes one night and confirms it either way. Waiting another month adds another month of wasted water and moves the leak one stage further along the curve.",
  },
];

const TOOL_PATH = "/tools/cost-of-waiting/";

export default function CostOfWaitingPage() {
  const faqSchema = faqPageSchemaFromQAs(FAQS);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbListSchema([
              { name: "Home", path: "/" },
              { name: "Cost of Waiting Calculator", path: TOOL_PATH },
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
            <span className="text-white">Cost of Waiting Calculator</span>
          </nav>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            Can I wait to fix this leak?
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-blue-100">
            A slow leak costs more every month — first on the water bill,
            then in the soil under your slab, then in mold, floors, and
            foundation. This free tool shows what your leak wastes every
            day, week, month, and year, and what each month of waiting adds.
          </p>
        </div>
      </section>

      <CostOfWaiting />

      <section className="mx-auto max-w-4xl px-4 py-14">
        <h2 className="text-2xl font-extrabold text-blue-950">How the cost is calculated</h2>
        <p className="mt-3 text-slate-600">
          Every number on this page comes from the figures you enter — your
          leak rate and your water rate — plus the published benchmarks
          below. Nothing is guessed, and no utility rate is invented:
        </p>
        <ol className="mt-5 list-decimal space-y-3 pl-6 text-slate-600">
          <li>
            <strong className="text-blue-950">Leak rate</strong> — gallons per hour, from your 2-hour meter
            test (gallons used ÷ 2), or converted from drips per minute: one drip a second wastes about 3,000
            gallons a year (EPA), so 1 drip per minute ≈ 0.0057 gallons per hour.
          </li>
          <li>
            <strong className="text-blue-950">Gallons wasted</strong> = leak rate × 24 hours (per day), × 7
            (per week), × 30 (per month), × 365 (per year).
          </li>
          <li>
            <strong className="text-blue-950">Dollars wasted</strong> = gallons wasted × your rate per gallon
            (your cost per 1,000 gallons ÷ 1,000). Your rate comes from your own bill — total ÷ gallons × 1,000.
          </li>
          <li>
            <strong className="text-blue-950">Already wasted</strong> = gallons per day × 7 × the weeks you
            enter, at the same rate. A rough number of weeks is fine — it only places you on the curve.
          </li>
          <li>
            <strong className="text-blue-950">Your stage on the curve</strong> — under 5 weeks is month 1
            (bill only); 5–12 weeks is month 3 (soil shift and cracks); 13–26 weeks is month 6 (mold and
            floors); 27 weeks or more is year 1 (foundation).
          </li>
          <li>
            <strong className="text-blue-950">Context</strong> — the typical American uses about 82 gallons
            per person per day at home (EPA WaterSense), so the tool shows your daily loss in people&apos;s
            worth of water.
          </li>
        </ol>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">Worked example — a 5-gallon-an-hour leak</h2>
        <p className="mt-3 text-slate-600">
          Example numbers, clearly labeled as an example — your own meter
          rate and water rate will give your own result:
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
              <tr><td className="p-4 font-semibold">Leak rate</td><td className="p-4">Meter test: 10 gallons in 2 hours</td><td className="p-4">5 gal/hr</td></tr>
              <tr><td className="p-4 font-semibold">Per day</td><td className="p-4">5 × 24 hours</td><td className="p-4">120 gal/day · $0.96</td></tr>
              <tr><td className="p-4 font-semibold">Per week</td><td className="p-4">120 × 7 days</td><td className="p-4">840 gal/week · $6.72</td></tr>
              <tr><td className="p-4 font-semibold">Per month</td><td className="p-4">120 × 30 days</td><td className="p-4">3,600 gal/month · $28.80</td></tr>
              <tr><td className="p-4 font-semibold">Per year</td><td className="p-4">120 × 365 days</td><td className="p-4">43,800 gal/year · $350.40</td></tr>
              <tr><td className="p-4 font-semibold">Already wasted (8 weeks)</td><td className="p-4">120 × 56 days</td><td className="p-4">6,720 gal · $53.76</td></tr>
              <tr><td className="p-4 font-semibold">Stage</td><td className="p-4">8 weeks on the curve</td><td className="p-4">Month 3 — soil shift and cracks</td></tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          Costs use the example rate of $8 per 1,000 gallons — your rate
          comes from your own bill. At 5 gallons an hour this leak sits
          inside the published slab-leak range of 5,000–30,000 gallons a
          month (Restoflo): 3,600 gallons a month is a slow slab leak, and
          it still wastes $350 a year before any repair cost.
        </p>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">The escalation curve — what waiting adds</h2>
        <p className="mt-3 text-slate-600">
          The bill is only the first stage. Each stage adds a new kind of
          damage — and a new cost. This table is the same curve the tool
          shows, so it works with no JavaScript at all:
        </p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600">
                <th className="p-4 font-bold">Stage</th>
                <th className="p-4 font-bold">What happens</th>
                <th className="p-4 font-bold">Cost (planning range)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="p-4 font-semibold">Month 1 — bill only</td>
                <td className="p-4">The only cost is the wasted water. Nothing is damaged yet — the cheapest moment to act.</td>
                <td className="p-4">Only the wasted water (the tool&apos;s monthly figure)</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">Month 3 — soil shift and cracks</td>
                <td className="p-4">Leaking water softens the soil; Texas clay swells when wet and shrinks when dry, so the ground moves and the slab and walls start to crack.</td>
                <td className="p-4">$630–$4,400, average $2,280 — slab leak repair, published national range (Angi, updated Sep 22, 2026)</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">Month 6 — mold and floors</td>
                <td className="p-4">Trapped moisture feeds mold behind walls and under floors; flooring warps or buckles. The repair is no longer one pipe — it is the pipe plus the rooms around it.</td>
                <td className="p-4">No number shown — costs rise sharply. No verified published range exists for mold remediation or flooring replacement in Texas, so no figure is shown rather than an invented one.</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">Year 1 — foundation</td>
                <td className="p-4">Months of soil movement stress the foundation itself. What started as a leak can end as foundation work on top of the pipe repair, the mold cleanup, and the floors.</td>
                <td className="p-4">No number shown — costs rise sharply. Foundation repair varies too widely by method and extent for a single published range to be honest, so no figure is shown rather than an invented one.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          The sign order in the tool — warm spot, then running-water sound,
          then bill jump, then heater cycling, then flooring changes —
          follows the early-to-late timeline other guides publish. Two or
          more signs together mean detection this week, not next month.
        </p>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">Quick reference — no calculator needed</h2>
        <p className="mt-3 text-slate-600">
          If you can&apos;t use the interactive tool, this table gives the same
          answers for three common leak sizes. Costs use the example rate of
          $8 per 1,000 gallons — your rate comes from your own bill.
        </p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600">
                <th className="p-4 font-bold">Leak size</th>
                <th className="p-4 font-bold">Per day</th>
                <th className="p-4 font-bold">Per week</th>
                <th className="p-4 font-bold">Per month</th>
                <th className="p-4 font-bold">Per year</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="p-4 font-semibold">Slow drip — 1 drip/sec (0.35 gal/hr)</td>
                <td className="p-4">8.4 gal · $0.07</td>
                <td className="p-4">59 gal · $0.47</td>
                <td className="p-4">252 gal · $2.02</td>
                <td className="p-4">3,066 gal · $24.53</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">Running toilet — 200 gal/day (8.3 gal/hr)</td>
                <td className="p-4">200 gal · $1.60</td>
                <td className="p-4">1,400 gal · $11.20</td>
                <td className="p-4">6,000 gal · $48.00</td>
                <td className="p-4">73,000 gal · $584.00</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">Slab leak — 14 gal/hr (~10,000 gal/month)</td>
                <td className="p-4">336 gal · $2.69</td>
                <td className="p-4">2,352 gal · $18.82</td>
                <td className="p-4">10,080 gal · $80.64</td>
                <td className="p-4">122,640 gal · $981.12</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          The drip and toilet figures come from the EPA (1 drip a second ≈
          3,000 gallons a year; a running toilet ≈ 200 gallons a day). The
          slab-leak row sits inside the published 5,000–30,000 gallons a
          month range (Restoflo). A household leak wastes about 9,300–10,000
          gallons a year on average (EPA) — most of it from leaks nobody
          notices for months.
        </p>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">Sources for every figure on this page</h2>
        <ul className="mt-5 list-disc space-y-2 pl-6 text-slate-600">
          <li>Typical use ≈ 82 gallons per person per day; household leaks waste ~9,300–10,000 gallons a year; a running toilet wastes ~200 gallons a day; a 1-drip-per-second faucet wastes ~3,000 gallons a year — EPA WaterSense, via the Nov 15 tools research.</li>
          <li>Slab leaks waste 5,000–30,000 gallons a month — Restoflo, via the Nov 16 SERP/SWOT/tools report.</li>
          <li>Slab leak repair $630–$4,400, average $2,280 — Angi, updated Sep 22, 2026 (national range, via the Nov 16 report).</li>
          <li>Leak detection typically $150–$400 — our researched Katy, TX range, labeled typical for the metro area, not a quote.</li>
          <li>Mold coverage commonly capped at $2,500–$15,000 — homeowners (HO-3) policy mold sub-limits, via LegalClarity. That is a coverage cap, not a remediation cost.</li>
          <li>Sign timeline (warm spot → sound → bill → heater cycling → flooring) — early-to-late signal ordering published by slab-leak guides, via the Nov 16 report.</li>
          <li>No published, citable Texas range was found for mold remediation or foundation repair costs — so this page shows no number for those two stages instead of inventing one.</li>
        </ul>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-14">
          <h2 className="text-2xl font-extrabold text-blue-950">Cost of waiting — questions, answered</h2>
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
            <Link href="/tx/houston/katy/#meter-test" className="font-bold text-blue-800 hover:underline">
              Run the overnight meter test →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              Turn off all water, note the meter, check it in the morning. If it moved, water is escaping — then use your gallons-per-hour figure in this tool.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/tools/water-bill-spike/" className="font-bold text-blue-800 hover:underline">
              Water Bill Spike Splitter →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              If the leak showed up as a bill jump first: split the spike into the leak part and the rate part, and find the likely leak type.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/services/slab-leak-detection/" className="font-bold text-blue-800 hover:underline">
              Slab leak detection →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              How acoustic and thermal equipment pinpoints a leak under concrete without digging — and what the detection visit covers.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/tools/leak-cost-estimator/" className="font-bold text-blue-800 hover:underline">
              Per-Town Leak Repair Cost Estimator →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              What the detection visit should cost in your town — researched per-town prices, so you can tell whether waiting is still cheaper than finding it.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/tools/freeze-risk-tonight/" className="font-bold text-blue-800 hover:underline">
              Freeze-Burst Risk Tonight →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              A freeze can turn a small leak into a burst pipe overnight — check tonight&apos;s risk for your town before bed.
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
          Disclaimer: this tool gives estimates from the numbers you enter. It is a screening aid, not a diagnosis
          and never a quote. Only on-site leak detection can confirm a leak, and only your utility can confirm your
          rate or a bill adjustment. Repair ranges are published national figures, shown as planning ranges.
        </p>
      </section>

      <CtaBand
        title="Waiting is the most expensive option."
        subtitle="Describe your leak rate and your signs — a local pro can tell you honestly whether you need detection this week or something else."
      />
    </>
  );
}
