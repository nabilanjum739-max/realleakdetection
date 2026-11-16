import Link from "next/link";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { breadcrumbListSchema, faqPageSchemaFromQAs } from "@/lib/schema";
import HomeBuyerLeakRisk from "@/components/HomeBuyerLeakRisk";
import CtaBand from "@/components/CtaBand";

/**
 * Home-Buyer Leak Risk Report — tool page #4.
 * One tool, one query: "should I worry about leaks in the house I'm buying?"
 *
 * Server-rendered by design (tools-research §7 checklist): the tool is
 * interactive, but the methodology, a worked example, a no-JS fallback
 * table, and the FAQ are all in the HTML — the page is complete before
 * any JavaScript runs.
 *
 * Data honesty: town soil, era, pipe and inspection-price facts come
 * from the researched per-town CSVs (site/lib/buyer-risk-data.ts). The
 * pipe-era rule is the general Texas pattern from the Katy QA baseline
 * (pre-1980 galvanised/cast iron, 1980s–90s copper/PVC, 2000s+ PEX).
 * The credit range is built ONLY from the Angi national slab-repair
 * range ($630–$4,400, avg $2,280, Sep 22, 2026). Sewer-lateral
 * replacement is never given a number: it is priced by
 * method/length/depth after a scope. No Calgary CAD figure is used
 * anywhere — the Calgary tool is the pattern, not the data.
 *
 * FAQ answers are 50–80 words each (verified by hand at write time).
 * The visible FAQ block and the FAQPage schema are rendered from the same
 * FAQS constant, so they can never drift apart.
 */

export const metadata: Metadata = {
  title: "Home-Buyer Leak Risk Report — Texas Tool".slice(0, 60),
  description:
    "Buying a Texas home? Six facts give you slab and sewer risk bands, inspection costs, a credit planning range, and an option-period checklist.".slice(
      0,
      155
    ),
  alternates: { canonical: `${SITE_URL}/tools/home-buyer-leak-risk/` },
};

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "What is a sewer scope, and why do buyers order one before closing?",
    a: "A sewer scope is a camera pushed through the sewer line from the house to the street, recording cracks, separations, root intrusion, and bellies. It is the only way to see a buried line before you own it — a home inspection does not include it. Buyers order one during the option period because a failed lateral is an expensive repair, and the video plus a written report is the evidence a credit or repair ask is built on.",
  },
  {
    q: "How much does a sewer camera inspection cost in Texas?",
    a: "Published tiers run about $100–$350 for a basic scope through an existing cleanout, $250–$600 with a written report and dye test, and $700–$2,000+ if a new cleanout has to be installed first. The researched metro-typical range on this tool comes from the town you pick — for example, Houston-metro towns show $175–$350 and Dallas-metro towns $200–$500. Access type and line length decide the final price, so treat every figure as an estimate, not a quote.",
  },
  {
    q: "What is the option period, and why does the timing matter?",
    a: "The option period is the window after a buyer goes under contract — 7 to 10 days in Texas — when the buyer can walk away or renegotiate after inspections. It matters because a sewer scope and a slab check take days to schedule and complete, and any credit or repair ask has to land before the window closes. This tool counts down to your option end date so the inspections happen first, not after the deadline has passed.",
  },
  {
    q: "Can I ask the seller for a credit if the scope finds a problem?",
    a: "Yes — that is the use of an option-period finding, but the ask needs paper, not a guess. Get the scope video and a written report, plus a written repair quote, then ask your agent to put the request in writing before the option expires. This tool's planning range is only a starting point for that conversation: it comes from a national repair range, not from your house, and a seller can say no or offer a repair instead.",
  },
  {
    q: "How do soil and house age change the leak risk?",
    a: "Expansive clay soils swell when wet and shrink when dry, and that movement stresses slabs and the pipes buried under them — which is why most of our 100 towns score high on soil. Age matters because the pipe material follows the build year: pre-1980 homes usually have galvanised or cast-iron pipes, 1980s–90s homes copper and PVC, and 2000s+ homes PEX. Old pipes in moving clay are the combination this tool flags hardest.",
  },
  {
    q: "Is this report the same as a home inspection?",
    a: "No. This report is a screening estimate built from six facts you enter plus researched town data — it cannot see inside a pipe or under a slab. A home inspection is a licensed inspector walking the house, and a sewer scope is a camera inside the line. Use this report to decide which inspections to order during the option period, and treat its bands, costs, and credit range as planning estimates, never as findings about a specific house.",
  },
];

const TOOL_PATH = "/tools/home-buyer-leak-risk/";

export default function HomeBuyerLeakRiskPage() {
  const faqSchema = faqPageSchemaFromQAs(FAQS);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbListSchema([
              { name: "Home", path: "/" },
              { name: "Home-Buyer Leak Risk Report", path: TOOL_PATH },
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
            <span className="text-white">Home-Buyer Leak Risk Report</span>
          </nav>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            Buying a Texas home? Check its leak risk first.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-blue-100">
            Six facts about the house — town, year built, pipe material,
            big trees, sewer scope done, leak history — and you get a slab
            risk band, a sewer risk band, what the inspections should cost
            in that town, and what to ask for before your option period
            runs out. Free tool, no signup.
          </p>
        </div>
      </section>

      <HomeBuyerLeakRisk />

      <section className="mx-auto max-w-4xl px-4 py-14">
        <h2 className="text-2xl font-extrabold text-blue-950">How the risk bands are calculated</h2>
        <p className="mt-3 text-slate-600">
          The tool scores the same six facts every time, with the points
          shown next to each factor in your result. Nothing is hidden, and
          nothing is invented: town soil, housing era, pipe materials, and
          inspection prices come from our researched per-town data for all
          100 towns. The bands are estimates — a screening aid, not an
          inspection, and never a guarantee.
        </p>

        <h3 className="mt-8 text-xl font-extrabold text-blue-950">Slab leak risk — 0–2 Low, 3–4 Watch, 5+ High</h3>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600">
                <th className="p-4 font-bold">Factor</th>
                <th className="p-4 font-bold">Points</th>
                <th className="p-4 font-bold">Why</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr><td className="p-4 font-semibold">Expansive clay soil in the town</td><td className="p-4">+2</td><td className="p-4">Clay swells when wet and shrinks when dry; the movement stresses the slab and the pipes under it.</td></tr>
              <tr><td className="p-4 font-semibold">Mixed / sandy-loam-over-clay soil</td><td className="p-4">+1</td><td className="p-4">Some movement, less than full expansive clay.</td></tr>
              <tr><td className="p-4 font-semibold">Sandy soil (little shrink-swell)</td><td className="p-4">0</td><td className="p-4">Barely moves. Only 1 of our 100 towns scores this way (Port Aransas, barrier-island sand).</td></tr>
              <tr><td className="p-4 font-semibold">Built before 1980</td><td className="p-4">+2</td><td className="p-4">Oldest pipes under the oldest slabs; most movement cycles already lived through.</td></tr>
              <tr><td className="p-4 font-semibold">Built 1980–1999</td><td className="p-4">+1</td><td className="p-4">Newer pipes, but decades of soil movement behind them.</td></tr>
              <tr><td className="p-4 font-semibold">Built 2000 or later</td><td className="p-4">0</td><td className="p-4">Newest pipes, fewest movement cycles.</td></tr>
              <tr><td className="p-4 font-semibold">Cast iron or galvanised pipes</td><td className="p-4">+2</td><td className="p-4">Corrode and scale with age; the pre-1980 pipe materials.</td></tr>
              <tr><td className="p-4 font-semibold">Copper pipes</td><td className="p-4">+1</td><td className="p-4">Lasts longer than iron, but still ages — and hard water scales it.</td></tr>
              <tr><td className="p-4 font-semibold">PVC or PEX pipes</td><td className="p-4">0</td><td className="p-4">The newest materials in the pattern.</td></tr>
              <tr><td className="p-4 font-semibold">Prior leak history: yes</td><td className="p-4">+2</td><td className="p-4">A past leak can mean the same weakness is still there.</td></tr>
              <tr><td className="p-4 font-semibold">Prior leak history: don&apos;t know</td><td className="p-4">+1</td><td className="p-4">Unknown counts against the house, not for it — ask the seller.</td></tr>
            </tbody>
          </table>
        </div>

        <h3 className="mt-8 text-xl font-extrabold text-blue-950">Sewer line risk — 0–1 Low, 2–3 Watch, 4+ High</h3>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600">
                <th className="p-4 font-bold">Factor</th>
                <th className="p-4 font-bold">Points</th>
                <th className="p-4 font-bold">Why</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr><td className="p-4 font-semibold">Built before 1980</td><td className="p-4">+2</td><td className="p-4">Oldest sewer lines are usually cast iron, jointed every few feet.</td></tr>
              <tr><td className="p-4 font-semibold">Built 1980–1999</td><td className="p-4">+1</td><td className="p-4">Newer line, but decades of root and soil pressure behind it.</td></tr>
              <tr><td className="p-4 font-semibold">Big trees near the sewer line</td><td className="p-4">+2</td><td className="p-4">Roots seek out old joints and cracks — the top sewer-line failure mode.</td></tr>
              <tr><td className="p-4 font-semibold">Prior leak history: yes</td><td className="p-4">+1</td><td className="p-4">Ask whether any of it was the sewer line.</td></tr>
              <tr><td className="p-4 font-semibold">Sewer scope already done</td><td className="p-4">−2</td><td className="p-4">The line has been seen from the inside — get the video and the written report before closing.</td></tr>
            </tbody>
          </table>
        </div>

        <h3 className="mt-8 text-xl font-extrabold text-blue-950">The pipe-era rule — and its limits</h3>
        <p className="mt-3 text-slate-600">
          If you answer &ldquo;don&apos;t know&rdquo; for pipe material, the tool infers it from the build
          year using the general Texas pattern from our Katy research baseline: pre-1980 homes
          usually have galvanised steel or cast-iron pipes, 1980s–90s homes copper supply with
          PVC drains, and 2000s+ homes PEX supply with PVC drains. That is a general pattern,
          never a fact about one house — the result always labels it &ldquo;inferred&rdquo;, and a
          seller disclosure or an inspection beats the inference every time.
        </p>

        <h3 className="mt-8 text-xl font-extrabold text-blue-950">Where the costs come from</h3>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-slate-600">
          <li>
            <strong className="text-blue-950">Sewer camera and slab detection prices</strong> are the
            researched metro-typical ranges for the town you pick, from our per-town research
            (soil, era, pipes, and prices researched town by town). They are estimates, not quotes.
          </li>
          <li>
            <strong className="text-blue-950">Camera cost by access type</strong> — basic $100–$350,
            with a written report and dye test $250–$600, a brand-new cleanout $700–$2,000+ —
            comes from published plumber price pages. Access type is the honest cost driver: a
            house with an accessible cleanout costs less to scope than one that needs a new one.
          </li>
          <li>
            <strong className="text-blue-950">Negotiation-credit planning range</strong> is built only
            from the Angi national slab-repair range ($630–$4,400, average $2,280, updated
            September 22, 2026). The worst of your two bands sets it: Watch takes the lower half
            ($630–$2,280), High the upper half ($2,280–$4,400), Low $0. It is a planning range
            for a conversation with your agent — not a price, and not a demand.
          </li>
          <li>
            <strong className="text-blue-950">Sewer-lateral replacement is never given a number here.</strong>{" "}
            It is priced by method (open cut, lining, bursting, spot repair), length, and depth —
            and only after a scope shows what is actually wrong. Get a scope first; no
            replacement number belongs in a credit ask before the video exists.
          </li>
          <li>
            <strong className="text-blue-950">One gap, stated plainly:</strong> no Rio Grande Valley
            firm publishes a standalone sewer-camera price, so McAllen-metro towns show a
            hydrostatic-testing figure ($575–$975) instead. The tool flags that in the result —
            get a written camera quote before you book there.
          </li>
        </ul>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">Worked example — Katy, built 1975</h2>
        <p className="mt-3 text-slate-600">
          A 1975 house in Katy with cast-iron pipes, big trees near the sewer line, no scope done,
          and unknown leak history. Every point follows the tables above:
        </p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600">
                <th className="p-4 font-bold">Band</th>
                <th className="p-4 font-bold">Points</th>
                <th className="p-4 font-bold">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr><td className="p-4 font-semibold">Slab</td><td className="p-4">Expansive gumbo clay +2, pre-1980 +2, cast iron +2, history unknown +1</td><td className="p-4">7 points — High</td></tr>
              <tr><td className="p-4 font-semibold">Sewer</td><td className="p-4">Pre-1980 +2, big trees +2, no scope +0</td><td className="p-4">4 points — High</td></tr>
              <tr><td className="p-4 font-semibold">Inspection costs (Katy)</td><td className="p-4">Camera $175–$350; slab detection $150–$400 (Houston-metro typical)</td><td className="p-4">Budget roughly $325–$750 for both</td></tr>
              <tr><td className="p-4 font-semibold">Credit planning range</td><td className="p-4">Worst band High → upper half of the Angi range</td><td className="p-4">$2,280–$4,400</td></tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          The credit range is a planning figure for the agent conversation, not a demand — it only
          becomes an ask once the scope video and a written report exist.
        </p>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">Quick reference — no calculator needed</h2>
        <p className="mt-3 text-slate-600">
          If you can&apos;t use the interactive tool, this table gives the same answers for three
          example buyer profiles. Costs are the researched metro-typical ranges for each town;
          the credit range follows the formula above.
        </p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600">
                <th className="p-4 font-bold">Example buyer profile</th>
                <th className="p-4 font-bold">Slab band</th>
                <th className="p-4 font-bold">Sewer band</th>
                <th className="p-4 font-bold">Inspection costs (estimate)</th>
                <th className="p-4 font-bold">Credit planning range</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="p-4 font-semibold">Katy, built 1975, cast iron, big trees, no scope, history unknown</td>
                <td className="p-4 font-semibold text-red-700">High (7 pts)</td>
                <td className="p-4 font-semibold text-red-700">High (4 pts)</td>
                <td className="p-4">Camera $175–$350 · slab $150–$400</td>
                <td className="p-4">$2,280–$4,400</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">Plano, built 1995, copper, no trees, no scope, no history</td>
                <td className="p-4 font-semibold text-amber-700">Watch (4 pts)</td>
                <td className="p-4 font-semibold text-green-800">Low (1 pt)</td>
                <td className="p-4">Camera $200–$500 · slab $250–$600</td>
                <td className="p-4">$630–$2,280</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">The Woodlands, built 2015, PEX, no trees, scope done, no history</td>
                <td className="p-4 font-semibold text-green-800">Low (1 pt)</td>
                <td className="p-4 font-semibold text-green-800">Low (0 pts)</td>
                <td className="p-4">Camera $150–$500 · slab $150–$500</td>
                <td className="p-4">$0 — inspect, don&apos;t credit</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-14">
          <h2 className="text-2xl font-extrabold text-blue-950">Home-buyer leak risk — questions, answered</h2>
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
            <Link href="/services/sewer-camera-inspection/" className="font-bold text-blue-800 hover:underline">
              Sewer camera inspection →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              What a camera scope shows, what the video should include, and why the written report matters for a credit ask.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/guides/sewer-camera-inspection-cost-texas/" className="font-bold text-blue-800 hover:underline">
              Sewer camera inspection cost in Texas →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              What a scope should cost in your town, by access type — so the inspection line in your option-period budget is a real number.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/services/slab-leak-detection/" className="font-bold text-blue-800 hover:underline">
              Slab leak detection →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              How acoustic and thermal equipment pinpoints a leak under concrete without digging — the check to order alongside the scope.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/services/sewer-line-leak-detection/" className="font-bold text-blue-800 hover:underline">
              Sewer line leak detection →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              How sewer line leaks and separations are found when shifting soil and root intrusion are the cause.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/tools/water-bill-spike/" className="font-bold text-blue-800 hover:underline">
              Water Bill Spike Splitter →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              Already own the house and the bill jumped? Split the spike into the leak part and the rate part.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/tools/freeze-risk-tonight/" className="font-bold text-blue-800 hover:underline">
              Freeze-Burst Risk Tonight →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              Tonight&apos;s pipe freeze risk for your town — the check that matters most in the first winter after you move in.
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
          Disclaimer: this tool gives estimates from the facts you enter and researched town data. It is
          a screening aid, not a home inspection, not legal or financial advice, and never a quote.
          Only on-site inspection can confirm a leak, and only a written inspection finding supports
          a credit or repair request. The pattern follows the Calgary home-buyer sewer-risk check;
          all prices and soil data on this page are Texas research, not Canadian figures.
        </p>
      </section>

      <CtaBand
        title="Buying soon? Scope it before your option expires."
        subtitle="Book a sewer scope + slab check before your option period runs out — the video and written report are what a credit ask is built on."
      />
    </>
  );
}
