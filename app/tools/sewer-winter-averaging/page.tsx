import Link from "next/link";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { breadcrumbListSchema, faqPageSchemaFromQAs } from "@/lib/schema";
import { UTILITY_RULES, type UtilityRule } from "@/lib/utility-rules";
import SewerWinterAveraging from "@/components/SewerWinterAveraging";
import CtaBand from "@/components/CtaBand";

/**
 * Sewer Winter-Averaging Impact Calculator — tool page #6.
 * One tool, one query: "how much extra sewer will a winter leak cost me?"
 *
 * Server-rendered by design (tools-research §7 checklist): the tool is
 * interactive, but the methodology, the verified Brushy Creek case, a
 * no-JS fallback table, and the FAQ are all in the HTML — the page is
 * complete before any JavaScript runs.
 *
 * All utility rules come from lib/utility-rules.ts (verified Nov 16,
 * 2026). Only utilities with verified winterAveraging data get specific
 * month windows here; everything else is "unverified for your utility".
 *
 * FAQ answers are 50–80 words each (verified by hand at write time).
 * The visible FAQ block and the FAQPage schema are rendered from the same
 * FAQS constant, so they can never drift apart.
 */

export const metadata: Metadata = {
  title: "Sewer Winter-Averaging Calculator — Texas".slice(0, 60),
  description:
    "A winter leak can raise your sewer bill for 12 months. Estimate the extra sewer cost for your Texas utility — and whether an adjustment fixes it. Free.".slice(
      0,
      155
    ),
  alternates: { canonical: `${SITE_URL}/tools/sewer-winter-averaging/` },
};

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "What is sewer winter averaging?",
    a: "Winter averaging is how many Texas utilities set your sewer charge for the next 12 months: they average the water you used during the winter months — usually December to February — and bill sewer on that average all year. Winter is used because outdoor watering is low, so winter water use is a fair stand-in for the water that goes down the drain. A leak in those months inflates the average, and your sewer bill, for a year.",
  },
  {
    q: "Which months count for winter averaging?",
    a: "It depends on your utility — there is no single window. Dallas averages December to March; Fort Worth, El Paso, Amarillo, Corpus Christi and Woodlands Water use December to February; Lubbock and Brushy Creek MUD use November to February. SAWS and Austin Water average three billing periods from mid-November to mid-March. Houston, McAllen and Harris County MUD 71 do not use winter averaging at all. Never assume another utility's months are yours.",
  },
  {
    q: "Can a leak adjustment fix my sewer average?",
    a: "Sometimes — it depends entirely on your utility. Brushy Creek MUD and Corpus Christi both let you ask for a wastewater-average correction with proof of repairs; Brushy Creek has a deadline of April 30 or May 31, depending on the year's order. Dallas, Fort Worth and El Paso adjustments cover water only, so the inflated sewer average stays. For SAWS, Austin, Amarillo, Lubbock and Woodlands Water, no official source says whether the average can be corrected — ask your utility.",
  },
  {
    q: "How do I find out which utility or MUD serves my home?",
    a: "Start with your water bill — the utility or district name is printed on it. If the bill is unclear, use the Association of Water Board Directors' Find My District search, the TCEQ Water District Map Viewer, or the Texas Water Development Board's service-boundary viewer. Your city or MUD operator can also confirm it by address. Do not guess from the nearest big city: most suburbs run their own systems or MUDs.",
  },
  {
    q: "My utility isn't listed — what do I do?",
    a: "This tool covers the 13 Texas utilities whose winter-averaging rules we verified on November 16, 2026 — the anchor-city utilities plus Brushy Creek MUD, Woodlands Water and Harris County MUD 71. If yours is not listed, your town has its own system or MUD, and its months and correction rules are not verified here. Check your bill, call your utility and ask which months set your sewer average, whether an adjustment can correct it, and the filing deadline.",
  },
  {
    q: "My leak was in summer — does it still cost me all year?",
    a: "No — a leak outside the averaging months does not inflate next year's sewer average, because only the winter months set it. You pay for the leak month: the extra water on that bill, plus sewer on that month's use where your utility bills sewer monthly. In Houston and McAllen, sewer is billed on monthly use, so every leak month costs sewer that month. Fix the leak, keep the repair invoice, and ask your utility whether a water-side adjustment applies.",
  },
];

const TOOL_PATH = "/tools/sewer-winter-averaging/";

// SAWS and Austin Water average over 3 billing periods (mid-Nov–mid-Mar),
// not calendar months — flag it in the methodology table.
const BILLING_PERIOD_UTILITIES = new Set([
  "San Antonio Water System (SAWS)",
  "Austin Water",
]);

function correctionLabel(rule: UtilityRule): string {
  const wa = rule.winterAveraging;
  if (!wa) return "Not verified";
  if (!wa.used) return "No winter averaging";
  if (wa.leakMonthEffect.startsWith("YES")) return "Corrected by a wastewater adjustment";
  if (wa.leakMonthEffect.startsWith("NOT corrected")) return "Not corrected — adjustment is water-only";
  return "Unverified whether the adjustment corrects it";
}

export default function SewerWinterAveragingPage() {
  const faqSchema = faqPageSchemaFromQAs(FAQS);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbListSchema([
              { name: "Home", path: "/" },
              { name: "Sewer Winter-Averaging Calculator", path: TOOL_PATH },
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
            <span className="text-white">Sewer Winter-Averaging Calculator</span>
          </nav>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            A leak in December costs you all year
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-blue-100">
            Many Texas utilities set your sewer charge from the water you
            used in the winter months — and bill on that average for the
            next 12 months. A leak in the averaging window does not just
            cost you one big bill: it raises every sewer bill for a year.
            This free tool shows the 12-month tail, and whether your
            utility can correct it.
          </p>
        </div>
      </section>

      <SewerWinterAveraging />

      <section className="mx-auto max-w-4xl px-4 py-14">
        <h2 className="text-2xl font-extrabold text-blue-950">How the 12-month tail is calculated</h2>
        <p className="mt-3 text-slate-600">
          Every number comes from your own bills and your utility&apos;s
          verified rule — nothing is guessed, and no utility rate is
          invented. Here is the exact method, in plain words:
        </p>
        <ol className="mt-5 list-decimal space-y-3 pl-6 text-slate-600">
          <li>
            <strong className="text-blue-950">Inflated average</strong> = (normal month&apos;s gallons × (averaging
            months − 1) + leak month&apos;s gallons) ÷ averaging months. The leak month is one of the
            averaging months, so it pulls the whole average up.
          </li>
          <li>
            <strong className="text-blue-950">Extra sewer per month</strong> = (inflated average − normal
            average) × your sewer rate per 1,000 gallons.
          </li>
          <li>
            <strong className="text-blue-950">12-month tail</strong> = extra sewer per month × 12. That is the
            formula: inflated average × 12 − normal average × 12, priced at your sewer rate.
          </li>
          <li>
            <strong className="text-blue-950">Corrected bill</strong> = normal average × your sewer rate — but
            only when your utility&apos;s rule verifies that the average can be corrected. Where the
            adjustment is water-only, or the correction is unverified, the tool says so plainly
            instead of showing a corrected bill that may not exist.
          </li>
          <li>
            <strong className="text-blue-950">A leak outside the averaging months</strong> does not inflate
            the average at all — the tail is $0, and only the leak month&apos;s own bill is affected.
          </li>
        </ol>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">Winter-averaging rules, by utility</h2>
        <p className="mt-3 text-slate-600">
          Verified November 16, 2026, from official city, utility, MUD
          and ordinance sources. These rules cover 13 Texas utilities —
          the anchor-city utilities plus Brushy Creek MUD, Woodlands Water
          and Harris County MUD 71. <strong className="text-blue-950">Anchor city ≠ your town:</strong> the
          anchor-city rules apply to the anchor city itself. Most suburbs
          around Houston, Dallas, San Antonio, Austin and Fort Worth run
          their own city systems or MUDs — if your utility is not in this
          table, its months are not verified here.
        </p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600">
                <th className="p-4 font-bold">Utility</th>
                <th className="p-4 font-bold">Averaging months</th>
                <th className="p-4 font-bold">If your leak falls in those months</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {UTILITY_RULES.map((rule) => (
                <tr key={rule.utility}>
                  <td className="p-4 font-semibold">{rule.utility}</td>
                  <td className="p-4">
                    {rule.winterAveraging && rule.winterAveraging.used
                      ? `${rule.winterAveraging.months.join(", ")}${BILLING_PERIOD_UTILITIES.has(rule.utility) ? " (3 billing periods, mid-Nov–mid-Mar)" : ""}`
                      : "— (none)"}
                  </td>
                  <td className="p-4">{correctionLabel(rule)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          Sources: official utility pages, rate orders and ordinances —
          City of Houston, Dallas Water Utilities, SAWS, Austin Water,
          Fort Worth, El Paso Water, Amarillo, Corpus Christi Code
          Sec. 55-100, Lubbock Code, Brushy Creek MUD rate orders and
          board agenda, Woodlands Water, Harris County MUD 71 resolution.
          Rules change: every rule above was checked November 16, 2026,
          and the tool links each utility&apos;s official source in its
          result. El Paso sewer is 90% of the winter average above a 5 CCF
          allowance, and Dallas sewer is the average or the current
          month&apos;s use, whichever is less — the tool notes both where
          they apply.
        </p>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">Worked example — the Brushy Creek case (verified)</h2>
        <p className="mt-3 text-slate-600">
          This is real, not a hypothetical. At the Brushy Creek MUD board
          meeting on August 14, 2025, a homeowner at{" "}
          <strong className="text-blue-950">3106 Monument Drive</strong> asked for a sewer-averaging
          correction after a leak that started in May 2024 and was fixed
          on July 7, 2025. The board agenda records the numbers exactly:
          the sewer average was <strong className="text-blue-950">$423.40</strong> a month, and would
          fall to <strong className="text-blue-950">$40.04</strong> a month if the request was
          approved. The request arrived after the April 30 deadline, so it
          went to the board for consideration.
        </p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600">
                <th className="p-4 font-bold">Case (same Aug 14, 2025 agenda)</th>
                <th className="p-4 font-bold">Sewer average, inflated</th>
                <th className="p-4 font-bold">Sewer average, corrected</th>
                <th className="p-4 font-bold">Extra per month</th>
                <th className="p-4 font-bold">12-month tail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr><td className="p-4 font-semibold">3106 Monument Dr</td><td className="p-4">$423.40</td><td className="p-4">$40.04</td><td className="p-4">$383.36</td><td className="p-4">$4,600.32</td></tr>
              <tr><td className="p-4 font-semibold">16533 Avaranche Way</td><td className="p-4">$62.40</td><td className="p-4">$32.64</td><td className="p-4">$29.76</td><td className="p-4">$357.12</td></tr>
              <tr><td className="p-4 font-semibold">16802 Pocono Dr</td><td className="p-4">$41.60</td><td className="p-4">$12.80</td><td className="p-4">$28.80</td><td className="p-4">$345.60</td></tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          Source: Brushy Creek MUD board agenda, August 14, 2025
          (“Discussion and possible action concerning Sewer Averaging
          Request”). Brushy Creek MUD averages November–February at
          $3.20 per 1,000 gallons, and no adjustments are approved after
          April 30 under the 2025 order (May 31 under the 2026 order).
          The 12-month tails above are simple arithmetic on the
          agenda&apos;s own figures: monthly difference × 12.
        </p>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">Quick reference — no calculator needed</h2>
        <p className="mt-3 text-slate-600">
          If you can&apos;t use the interactive tool, this table gives the
          same answers for three cases. The first is the verified Brushy
          Creek case above; the other two are examples with clearly
          labeled example numbers — your own bills will give your own
          result.
        </p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600">
                <th className="p-4 font-bold">Case</th>
                <th className="p-4 font-bold">What happened</th>
                <th className="p-4 font-bold">Extra sewer / month</th>
                <th className="p-4 font-bold">12-month tail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="p-4 font-semibold">Brushy Creek MUD — verified case</td>
                <td className="p-4">Sewer average $423.40 with the leak in the averaging months, $40.04 corrected</td>
                <td className="p-4">$383.36</td>
                <td className="p-4">$4,600.32</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">Dallas — example</td>
                <td className="p-4">Normal 8,000 gal/mo; December leak month 30,000 gal; Dec–Mar average (4 months) → inflated average 13,500 gal; sewer $8 per 1,000 gal. Not corrected — Dallas adjustment is water-only.</td>
                <td className="p-4">$44.00</td>
                <td className="p-4">$528.00</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">Fort Worth — example</td>
                <td className="p-4">Normal 6,000 gal/mo; January leak month 20,000 gal; Dec–Feb average (3 months) → inflated average 10,667 gal; sewer $6 per 1,000 gal. Not corrected — Fort Worth adjustment is water-only.</td>
                <td className="p-4">$28.00</td>
                <td className="p-4">$336.00</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          Dallas math: (8,000 × 3 + 30,000) ÷ 4 = 13,500 gal average;
          (13,500 − 8,000) × $8 ÷ 1,000 = $44 a month. Fort Worth math:
          (6,000 × 2 + 20,000) ÷ 3 = 10,667 gal average; (10,667 −
          6,000) × $6 ÷ 1,000 = $28 a month. In both examples the tail
          stays, because neither city&apos;s leak adjustment corrects the
          sewer average.
        </p>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-14">
          <h2 className="text-2xl font-extrabold text-blue-950">Winter averaging — questions, answered</h2>
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
            <Link href="/tools/leak-adjustment-checker/" className="font-bold text-blue-800 hover:underline">
              Leak-Adjustment Eligibility Checker →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              The companion tool: check whether your utility will credit the leak month — and generate the application pack to file it.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/tools/water-bill-spike/" className="font-bold text-blue-800 hover:underline">
              Water Bill Spike Splitter →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              Split the leak month&apos;s bill into the leak part and the rate part — the one-month view to go with this 12-month view.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/tools/insurance-claim-pack/" className="font-bold text-blue-800 hover:underline">
              Insurance Claim Pack →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              If the leak also damaged your home: coverage likelihood by bucket, deductible math, and a claim letter draft.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/tools/freeze-risk-tonight/" className="font-bold text-blue-800 hover:underline">
              Freeze-Burst Risk Tonight →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              Winter leaks often start with a freeze. Check tonight&apos;s pipe freeze-burst risk for your Texas town before bed.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/tx/houston/katy/#meter-test" className="font-bold text-blue-800 hover:underline">
              Run the overnight meter test →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              Turn off all water, note the meter, check it in the morning. If it moved, water is escaping.
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
          Disclaimer: this tool gives estimates from the numbers you enter and your utility&apos;s verified rule.
          It is a screening aid, not a diagnosis and never a quote. Only your utility or MUD can confirm your
          sewer average, your rate, or whether an adjustment applies — and only on-site leak detection can
          confirm a leak. Rules were checked November 16, 2026 and can change.
        </p>
      </section>

      <CtaBand
        title="A winter leak is still running?"
        subtitle="Describe your numbers — a local pro can tell you honestly whether you need detection, and the report supports your adjustment filing."
      />
    </>
  );
}
