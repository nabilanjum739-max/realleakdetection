import Link from "next/link";
import type { Metadata } from "next";
import { SITE_URL, PHONE_DISPLAY, PHONE_TEL } from "@/lib/site";
import { breadcrumbListSchema, faqPageSchemaFromQAs } from "@/lib/schema";
import PlumberPriceEstimator from "@/components/PlumberPriceEstimator";

/**
 * Plumber Job-Price Estimator — B2B tool page #10 (serp-swot-tools §A2).
 * One tool, one query: "what should I charge for this leak job?"
 *
 * Built for plumbers, NOT homeowners — the hero, the tool, and the FAQs
 * all say so. This tool brings plumbers, not homeowner callers, and the
 * page says that honestly. It is a free planning tool, not a homeowner
 * quote tool, and it never claims homeowner lead generation.
 *
 * Server-rendered by design (tools-research §7 checklist): the tool is
 * interactive, but the methodology, the worked fallback table, and the
 * FAQ are all in the HTML — the page is complete before any JavaScript
 * runs.
 *
 * FAQ answers are 50–80 words each (verified by hand at write time).
 * The visible FAQ block and the FAQPage schema are rendered from the same
 * FAQS constant, so they can never drift apart.
 *
 * No CtaBand here on purpose: its built-in line ("talk to a local leak
 * detection pro") is homeowner copy. The contact band at the bottom of
 * this page is written for plumbers instead, using the same blue-panel /
 * amber-button styling and the placeholder phone constant.
 */

export const metadata: Metadata = {
  title: "Plumber Job-Price Estimator for Leak Jobs".slice(0, 60),
  description:
    "Price leak jobs from researched Texas town rates: flat-rate sell price, labor/material split at your own rates, and a margin check. Free, no signup.".slice(
      0,
      155
    ),
  alternates: { canonical: `${SITE_URL}/tools/plumber-price-estimator/` },
};

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "Should I price leak jobs flat-rate or time-and-material?",
    a: "Flat-rate wins for detection in most cases: the customer knows the price before you start, and you keep the upside when the job goes faster than expected. Time-and-material is fairer when the job is open-ended — a tunnel repair, for example, where you cannot see the full scope until you open the slab. Use this tool to set the flat rate from the local going rate, then check it against your own labor and materials.",
  },
  {
    q: "What margin should I aim for on a leak-detection job?",
    a: "There is no published industry standard for leak-detection margins, so treat any number as a planning guide. This tool flags 25% or more of the sell price as healthy, 10 to 25% as thin, and under 10% as priced too low — our rule of thumb. A healthy margin has to cover callbacks, jobs that run long, drive time, and the detection visits that find nothing billable. If your margin is thin, raise the sell price or cut the hours.",
  },
  {
    q: "What is included in the detection price range?",
    a: "The range covers detection only: finding the leak with acoustic, thermal, pressure, or camera equipment and telling the customer where it is. It does not include the repair, opening the slab, tunneling, rerouting pipe, restoring flooring, permits, or any follow-up visit. Those are priced on your own hours and materials, which is why the tool asks for them separately. Repair totals beyond detection are national figures on this page, not local prices.",
  },
  {
    q: "Why does the same leak job cost more in one town than another?",
    a: "The researched ranges differ by metro: general detection runs $125–$400 around Houston and $250–$600 around Dallas–Fort Worth, while McAllen runs $400–$800. Local labor markets, drive distances, soil, and housing stock all push the going rate up or down, and some metros simply have more leak work than techs. The tool shows the range for the town you pick, so you price against what that town actually pays instead of a statewide average.",
  },
  {
    q: "Can I use this estimator to quote a homeowner?",
    a: "No — and the page says so plainly. This is a planning tool for plumbers, not a homeowner quote tool. The detection range is a researched local range, not a price for a specific home, and the margin math runs on the rates you type in. A real quote needs an on-site visit: access, flooring, and pipe material all change the job. Use the output to set your own price, then quote the homeowner your own number.",
  },
  {
    q: "What costs does this tool leave out?",
    a: "Several: permits, drive time, disposal, restoration of flooring and drywall, callbacks, and the detection visits that find no leak. It also leaves out the repair itself — repair totals beyond detection are shown only as national ranges, $630–$4,400 with an average of $2,300, and slab repair $1,500–$4,000 or more. Add those costs to your own hours and materials before you set a final price, because a margin that ignores them is not a real margin.",
  },
];

const TOOL_PATH = "/tools/plumber-price-estimator/";

export default function PlumberPriceEstimatorPage() {
  const faqSchema = faqPageSchemaFromQAs(FAQS);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbListSchema([
              { name: "Home", path: "/" },
              { name: "Plumber Job-Price Estimator", path: TOOL_PATH },
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
            <span className="text-white">Plumber Job-Price Estimator</span>
          </nav>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            Price the leak job before you quote it
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-blue-100">
            Built for leak-detection pros — not homeowners. Pick the job
            and the town, see what that town pays for detection, enter
            your own rates, and check your margin before the price leaves
            your mouth. Free to use, no signup.
          </p>
          <p className="mt-4 max-w-2xl text-base text-blue-200">
            Honest trade-off, stated up front: this tool brings plumbers,
            not homeowner callers. It is a planning tool for your pricebook,
            not a homeowner quote tool, and it never pretends otherwise.
          </p>
        </div>
      </section>

      <PlumberPriceEstimator />

      <section className="mx-auto max-w-4xl px-4 py-14">
        <h2 className="text-2xl font-extrabold text-blue-950">How the price is calculated</h2>
        <p className="mt-3 text-slate-600">
          Every researched number on this page comes from our town research
          files — nothing is guessed, and no labor rate is invented. Here
          is the exact method, in plain words:
        </p>
        <ol className="mt-5 list-decimal space-y-3 pl-6 text-slate-600">
          <li>
            <strong className="text-blue-950">Local detection range</strong> = the researched
            price_leak_detection, price_slab_detection, or
            price_sewer_camera range for the town you pick (100 Texas
            towns, researched 2026). The ranges are metro-typical — a few
            towns differ within a metro, so the range is stored per town.
            Detection only; never a repair price, never a quote.
          </li>
          <li>
            <strong className="text-blue-950">Your flat-rate sell price</strong> starts at the
            middle of that range. Move it up or down to your own price —
            the tool never sets a price for you.
          </li>
          <li>
            <strong className="text-blue-950">Labor cost</strong> = hours on site × your hourly rate
            × crew size. All three are numbers you enter. We publish no
            labor rate of our own, so the tool never guesses one for you.
          </li>
          <li>
            <strong className="text-blue-950">Materials cost</strong> = materials at your cost +
            your markup %. The markup amount is shown separately, so you
            can see what the markup itself earns.
          </li>
          <li>
            <strong className="text-blue-950">Total job cost</strong> = labor + marked-up
            materials. <strong className="text-blue-950">Margin</strong> = sell price − total job
            cost, shown in dollars and as a percentage of the sell price —
            at your price and at the low, middle, and high end of the
            local range.
          </li>
          <li>
            <strong className="text-blue-950">Access method and flooring</strong> do not change the
            detection price — detection is priced by the local going rate.
            They change the repair that follows, so they are recorded on
            the job and priced on your own hours and materials. Flooring
            matters most after a slab repair: plan restoration separately
            from detection.
          </li>
          <li>
            <strong className="text-blue-950">Margin bands</strong> (healthy 25%+, thin 10–25%,
            below 10% priced too low) are our own planning rule of thumb,
            not published industry data. No industry standard for
            leak-detection margins was found.
          </li>
          <li>
            <strong className="text-blue-950">Repairs beyond detection</strong> use national
            ranges only, labeled NATIONAL: $630–$4,400, average $2,300
            (Angi, updated September 22, 2026), and slab repair
            $1,500–$4,000+. No town-level repair price was researched, so
            none is shown.
          </li>
        </ol>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">Where the numbers come from</h2>
        <p className="mt-3 text-slate-600">
          The pricebook behind this tool holds researched detection-only
          ranges for all 100 towns in 10 Texas metros. Across those towns,
          general leak detection runs $125–$800, slab-leak detection
          $150–$950, and sewer camera inspection $100–$975 — the spread
          itself is the point: a statewide average would fit nobody. Two
          cells carry a caveat, recorded in the pricebook file:
        </p>
        <ul className="mt-5 list-disc space-y-3 pl-6 text-slate-600">
          <li>
            <strong className="text-blue-950">Leander and Lakeway, sewer camera:</strong> the
            research cell leads with Angi&apos;s broad Austin sewer-cost
            range ($260–$1,700). The camera-only figure in the same cell
            is $100–$600, so that is what the tool uses — and it shows the
            note wherever the range appears.
          </li>
          <li>
            <strong className="text-blue-950">McAllen metro, sewer:</strong> the $575–$975
            figure is main sewer line hydrostatic testing, and no Rio
            Grande Valley firm publishes a standalone camera price. The
            tool shows that note with the range instead of passing it off
            as a camera price.
          </li>
        </ul>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">Free now — and what it sits beside</h2>
        <p className="mt-3 text-slate-600">
          This estimator is free to use, no signup. The long-term plan is
          a paid standalone leak-only pricebook at $19–$39 per tech per
          month — a plan, not a price charged today. That is deliberately
          cheaper than a general pricebook add-on, because it covers leaks
          only. For comparison, here is what the full field-service suites
          charge — their published prices from our November 2026 research,
          not prices we charge:
        </p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600">
                <th className="p-4 font-bold">Product</th>
                <th className="p-4 font-bold">What it is</th>
                <th className="p-4 font-bold">Published price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr><td className="p-4 font-semibold">This estimator</td><td className="p-4">Leak-only job pricer (this page)</td><td className="p-4">Free today; planned $19–$39/tech/mo</td></tr>
              <tr><td className="p-4 font-semibold">Jobber</td><td className="p-4">Full field-service suite</td><td className="p-4">$29–$49/mo</td></tr>
              <tr><td className="p-4 font-semibold">Housecall Pro</td><td className="p-4">Full field-service suite</td><td className="p-4">$79/mo</td></tr>
              <tr><td className="p-4 font-semibold">Profit Rhino</td><td className="p-4">Pricebook add-on to a suite</td><td className="p-4">$149–$199/mo</td></tr>
              <tr><td className="p-4 font-semibold">The New Flat Rate</td><td className="p-4">Pricebook system</td><td className="p-4">$99/tech/mo</td></tr>
              <tr><td className="p-4 font-semibold">ServiceTitan</td><td className="p-4">Full field-service suite</td><td className="p-4">~$200–$500/user/mo</td></tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          The suites above do everything — scheduling, invoicing, dispatch.
          This tool does one thing: price a leak job. That narrow scope is
          the whole reason a standalone leak pricebook can cost less than a
          general pricebook add-on.
        </p>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">Worked examples — no calculator needed</h2>
        <p className="mt-3 text-slate-600">
          If you can&apos;t use the interactive tool, this table gives the
          same answers for three real jobs. Every sell-price range below is
          the researched range for that town; the labor, materials, and
          markup figures are the example plumber&apos;s own inputs, stated
          in the table so you can swap in yours.
        </p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600">
                <th className="p-4 font-bold">Example job</th>
                <th className="p-4 font-bold">Local going rate</th>
                <th className="p-4 font-bold">Your cost (labor + materials)</th>
                <th className="p-4 font-bold">Sell at midpoint → margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="p-4 font-semibold">Katy — slab leak, spot repair, tile. 1 tech, $85/hr, 2 hrs, $40 materials, 20% markup</td>
                <td className="p-4">$150–$400</td>
                <td className="p-4">$170 labor + $48 materials = $218</td>
                <td className="p-4">$275 → $57 margin (21%)</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">Plano — general leak, yard dig, no flooring. 1 tech, $90/hr, 2 hrs, $60 materials, 25% markup</td>
                <td className="p-4">$250–$600</td>
                <td className="p-4">$180 labor + $75 materials = $255</td>
                <td className="p-4">$425 → $170 margin (40%)</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">El Paso — sewer camera, camera only. 1 tech, $75/hr, 2 hrs, $25 materials, 20% markup</td>
                <td className="p-4">$170–$730</td>
                <td className="p-4">$150 labor + $30 materials = $180</td>
                <td className="p-4">$450 → $270 margin (60%)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          Worked arithmetic for the Katy row: labor 2 × $85 × 1 = $170;
          materials $40 + 20% markup ($8) = $48; total cost $218; midpoint
          sell price ($150 + $400) ÷ 2 = $275; margin $275 − $218 = $57,
          which is 21% of the sell price — inside the thin band, so this
          job wants a sell price above the midpoint or fewer hours.
        </p>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-14">
          <h2 className="text-2xl font-extrabold text-blue-950">Plumber job pricing — questions, answered</h2>
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
            <Link href="/services/slab-leak-detection/" className="font-bold text-blue-800 hover:underline">
              Slab leak detection →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              What detection covers: how acoustic and thermal equipment pinpoints a leak under concrete without digging — the service behind the slab range above.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/services/sewer-camera-inspection/" className="font-bold text-blue-800 hover:underline">
              Sewer camera inspection →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              What a camera inspection covers — and why its price range differs from detection: the scope, the video, and the written diagnosis.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/tools/leak-cost-estimator/" className="font-bold text-blue-800 hover:underline">
              Per-Town Leak Repair Cost Estimator →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              The homeowner-facing version of this pricebook — researched per-town detection prices your customers can check against your quote.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/tools/water-bill-spike/" className="font-bold text-blue-800 hover:underline">
              Water Bill Spike Splitter →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              Our homeowner-facing tool: it splits a bill spike into the leak part and the rate part. Useful when a customer asks you why their bill jumped.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/tools/freeze-risk-tonight/" className="font-bold text-blue-800 hover:underline">
              Freeze-Burst Risk Tonight →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              Tonight&apos;s pipe freeze-burst risk per town — worth checking before a cold snap, when burst calls spike.
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
          Disclaimer: this tool gives planning estimates from researched local detection ranges and the rates you
          enter. It is a planning aid for plumbers, not a quote and not a homeowner price. Only an on-site visit
          can set a real job price, and only your own books can set your margin.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14" aria-label="Contact for plumbers">
        <div className="relative overflow-hidden rounded-3xl bg-blue-900 px-6 py-12 text-center md:px-12 md:py-16">
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, #f59e0b 0, transparent 35%), radial-gradient(circle at 85% 80%, #38bdf8 0, transparent 40%)",
            }}
            aria-hidden="true"
          />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight text-white md:text-4xl">
              Use it free, no signup
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-blue-100">
              The estimator stays free while the pricebook is built. Plumbers
              interested in leads can contact us — and plumbers who want a
              say in what the paid pricebook covers should do the same.
            </p>
            <a
              href={`tel:${PHONE_TEL}`}
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-amber-500 px-8 py-4 text-lg font-extrabold text-blue-950 shadow-lg transition hover:bg-amber-400"
            >
              Call {PHONE_DISPLAY}
            </a>
            <p className="mt-4 text-sm text-blue-200">For plumbers — not a homeowner booking line.</p>
          </div>
        </div>
      </section>
    </>
  );
}
