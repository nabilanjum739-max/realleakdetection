import Link from "next/link";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { breadcrumbListSchema, faqPageSchemaFromQAs } from "@/lib/schema";
import LeakCostEstimator from "@/components/LeakCostEstimator";
import CtaBand from "@/components/CtaBand";

/**
 * Per-Town Leak Repair Cost Estimator — tool page #3.
 * One tool, one query: "how much does leak detection cost in [town]?"
 *
 * Server-rendered by design (tools-research §7 checklist): the tool is
 * interactive, but the methodology, a worked example with real
 * arithmetic, a no-JS fallback table, and the FAQ are all in the HTML —
 * the page is complete before any JavaScript runs.
 *
 * Data split, stated on the page: detection prices are the town's own
 * researched range (site/lib/town-prices.ts, generated from the research
 * CSVs); repair prices are NATIONAL ranges only, labelled as such.
 *
 * FAQ answers are 50–80 words each (verified by hand at write time).
 * The visible FAQ block and the FAQPage schema are rendered from the same
 * FAQS constant, so they can never drift apart.
 */

export const metadata: Metadata = {
  title: "Leak Detection Cost Texas — Per-Town Estimator".slice(0, 60),
  description:
    "How much does leak detection cost in your Texas town? Estimate slab, sewer, gas and pool leak costs from researched per-town prices. Free tool, no signup.".slice(
      0,
      155
    ),
  alternates: { canonical: `${SITE_URL}/tools/leak-cost-estimator/` },
};

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "How much does leak detection cost in Texas?",
    a: "It depends on the town and the leak type. Our researched ranges run from $125 to $600 for general detection across the ten metros — for example, Katy is $150–$400, Plano is $250–$600, and El Paso is $129–$500. Slab detection is usually in the same range, while sewer camera inspections run $100–$730 depending on the metro. Use the estimator above for your town: it shows the range for your leak type, and it is an estimate, not a quote.",
  },
  {
    q: "What is the difference between detection cost and repair cost?",
    a: "Detection is finding the leak; repair is fixing it, and they are separate jobs with separate prices. Detection uses acoustic, thermal, or camera equipment to pinpoint the leak without digging, and it costs a few hundred dollars in most Texas metros. Repair means breaking concrete, tunnelling, rerouting pipe, or digging a yard line, and it usually costs far more. A fair quote lists detection and repair on separate lines, so you can compare each part.",
  },
  {
    q: "Why do leak detection prices vary so much between towns?",
    a: "Because the local market sets the price: labour rates, how many detection companies work the area, and how far a technician travels. Denser metros with more competition, like Houston, often show lower ranges, while smaller or more spread-out metros can be higher. The ranges on this page are metro-typical, so towns in the same metro share the same range — the research behind them is metro-level, from plumber-published prices and local guides, not a quote for one address.",
  },
  {
    q: "Is a spot repair, tunnel, or reroute cheapest for a slab leak?",
    a: "There is no single cheapest method — it depends on the leak's location, the flooring above it, and how many lines are failing. A spot repair breaks the slab at one point and is often the lowest repair cost, but it means floor restoration. Tunnelling leaves the floor intact but adds labour hours. A reroute avoids concrete work entirely but needs more pipe and wall patching. Only on-site detection can say which method your leak actually needs.",
  },
  {
    q: "How do I know if a plumber's quote is fair?",
    a: "First, check that the quote splits detection and repair onto separate lines, then compare the detection line with the researched range for your town on this page. Second, make sure the quote names the method and the leak's location in writing, so a second pro can price the same job. Third, ask whether floor or yard restoration, permits, and inspection are included. Finally, get a second quote for the same method — different methods are not comparable prices.",
  },
  {
    q: "Does homeowners insurance cover leak detection or repair?",
    a: "It depends on your policy and on whether the leak was sudden or gradual. Most Texas homeowners policies cover sudden, accidental water damage — the damage the leak caused — but not the pipe repair itself, and not gradual leaks that went unnoticed for months. Detection is usually paid by the homeowner unless the policy says otherwise. Keep the detection report, photos, and invoices: your insurer asks for them, and a written report is the evidence that matters.",
  },
];

const TOOL_PATH = "/tools/leak-cost-estimator/";

// No-JS fallback: researched detection ranges for five example towns.
// Numbers are copied from site/lib/town-prices.ts (generated from the
// research CSVs) — Katy, Plano, El Paso, Round Rock, Amarillo.
const FALLBACK_ROWS = [
  { town: "Katy", metro: "Houston", leak: "$150–$400", slab: "$150–$400", camera: "$175–$350" },
  { town: "Plano", metro: "Dallas", leak: "$250–$600", slab: "$250–$600", camera: "$200–$500" },
  { town: "El Paso", metro: "El Paso", leak: "$129–$500", slab: "$280–$950", camera: "$170–$730" },
  { town: "Round Rock", metro: "Austin", leak: "$150–$400", slab: "$150–$600", camera: "$150–$300" },
  { town: "Amarillo", metro: "Amarillo", leak: "$150–$400", slab: "$150–$400", camera: "$100–$250" },
];

export default function LeakCostEstimatorPage() {
  const faqSchema = faqPageSchemaFromQAs(FAQS);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbListSchema([
              { name: "Home", path: "/" },
              { name: "Leak Cost Estimator", path: TOOL_PATH },
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
            <span className="text-white">Leak Cost Estimator</span>
          </nav>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            How much does leak detection cost in your town?
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-blue-100">
            Every cost guide quotes a national average. This estimator uses
            your town&apos;s researched price range instead — pick the town,
            the leak type, and the access method, and see the detection
            price, the repair range, and whether a quote is fair. Free tool,
            no signup. Every result is an estimate, not a quote.
          </p>
        </div>
      </section>

      <LeakCostEstimator />

      <section className="mx-auto max-w-4xl px-4 py-14">
        <h2 className="text-2xl font-extrabold text-blue-950">How the estimate is calculated</h2>
        <p className="mt-3 text-slate-600">
          Two kinds of numbers go into this tool, and they are kept strictly
          apart. The detection price is local; the repair price is national.
          Nothing else is used:
        </p>
        <ol className="mt-5 list-decimal space-y-3 pl-6 text-slate-600">
          <li>
            <strong className="text-blue-950">Detection — your town&apos;s researched range.</strong>{" "}
            Each town&apos;s range comes from the research CSVs
            (price_leak_detection, price_slab_detection, price_sewer_camera),
            built from plumber-published prices, local guides, and Angi local
            data. Slab leaks use the slab range, sewer leaks use the camera
            range, and yard-line, gas, and pool leaks use the general
            detection range. One honest limit: the research is metro-typical,
            so towns in the same metro share the same range — it is a
            researched metro range shown per town, never a quote for one
            address.
          </li>
          <li>
            <strong className="text-blue-950">Repair — national range, labelled national.</strong>{" "}
            Slab and yard-line repair uses Angi&apos;s national slab-leak
            repair range, $630–$4,400, average $2,300 (updated Sep 22, 2026;
            also cited by This Old House, April 2026). Full sewer-line
            replacement uses the national guide range of $5,000–$20,000. No
            local repair price is invented anywhere on this page.
          </li>
          <li>
            <strong className="text-blue-950">Planning range — detection + repair.</strong>{" "}
            Where both numbers exist (slab, yard line, full sewer
            replacement), the planning range is the detection range plus the
            repair range, low to low and high to high. Where no repair range
            is in our sources (gas, pool, sewer spot repair and lining), the
            tool shows detection only and says so.
          </li>
          <li>
            <strong className="text-blue-950">Access and flooring change the drivers, not the numbers.</strong>{" "}
            A spot repair, a tunnel, and a reroute are different jobs with
            different labour and restoration costs, and flooring changes what
            restoration costs after a slab is opened. The tool explains those
            drivers in words — it never invents a price multiplier for them.
          </li>
          <li>
            <strong className="text-blue-950">Gas and pool — a stated gap.</strong>{" "}
            No gas-specific or pool-specific detection price is in our
            researched data, so the tool shows the town&apos;s general
            detection range for those types and labels the gap in the result.
            If you smell gas, leave the building and call 911 first.
          </li>
        </ol>
        <p className="mt-5 text-slate-600">
          <strong className="text-blue-950">How this compares with the best Texas cost page we found:</strong>{" "}
          Lone Star Leak Locators of Richardson publishes $150–$3,700 for leak
          location and $250–$600 for slab location with their Geo Phone
          (dated Nov 11, 2026) — the strongest single-town Texas pricing we
          found, and the model this tool is built to beat by covering 100
          towns instead of one. National sewer-camera guides agree on roughly
          $150–$400; most of our town camera ranges sit inside or near that
          band, with El Paso ($170–$730) and McAllen (hydrostatic test,
          $575–$975 — not a standalone camera price) as the exceptions.
        </p>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">Worked example — a slab leak in Katy</h2>
        <p className="mt-3 text-slate-600">
          Example numbers, clearly labeled as an example — your own town and
          leak type will give your own result:
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
              <tr><td className="p-4 font-semibold">Detection (Katy, researched)</td><td className="p-4">Slab detection range for Katy</td><td className="p-4">$150–$400</td></tr>
              <tr><td className="p-4 font-semibold">Repair (national range)</td><td className="p-4">Angi national slab repair range</td><td className="p-4">$630–$4,400 (avg $2,300)</td></tr>
              <tr><td className="p-4 font-semibold">Planning range</td><td className="p-4">$150 + $630 → $400 + $4,400</td><td className="p-4">$780–$4,800</td></tr>
              <tr><td className="p-4 font-semibold">What moves it</td><td className="p-4">Spot repair vs tunnel vs reroute; tile vs carpet above the slab</td><td className="p-4">Method and flooring, not the town</td></tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          The range is wide because the repair method is wide: a single spot
          repair at the low end of the national range costs far less than a
          reroute at the high end. That is why the tool asks for the method —
          and why only on-site detection can narrow it to a real quote.
        </p>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">Quick reference — no calculator needed</h2>
        <p className="mt-3 text-slate-600">
          If you can&apos;t use the interactive tool, this table gives the
          researched detection ranges for five example towns. These are
          estimates from the research CSVs, not quotes — the full 100-town
          list is in the tool above.
        </p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600">
                <th className="p-4 font-bold">Town</th>
                <th className="p-4 font-bold">General detection</th>
                <th className="p-4 font-bold">Slab detection</th>
                <th className="p-4 font-bold">Sewer camera</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {FALLBACK_ROWS.map((r) => (
                <tr key={r.town}>
                  <td className="p-4 font-semibold">{r.town}, TX ({r.metro})</td>
                  <td className="p-4">{r.leak}</td>
                  <td className="p-4">{r.slab}</td>
                  <td className="p-4">{r.camera}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">What this estimate is NOT</h2>
        <ul className="mt-5 list-disc space-y-3 pl-6 text-slate-600">
          <li>
            <strong className="text-blue-950">Not a quote.</strong> No price on
            this page is a price for your house. A quote needs the leak&apos;s
            location, the method, and the access — only on-site detection
            provides those.
          </li>
          <li>
            <strong className="text-blue-950">Not a diagnosis.</strong> The
            tool estimates cost for a leak type you pick; it does not tell you
            whether you have a leak, or which type it is. If you are not sure,
            run the{" "}
            <Link href="/tx/houston/katy/#meter-test" className="font-bold text-blue-800 hover:underline">
              overnight meter test
            </Link>{" "}
            first — if the meter moves with everything off, water is escaping.
          </li>
          <li>
            <strong className="text-blue-950">Not a local repair price.</strong>{" "}
            Repair ranges are national (Angi, $630–$4,400 for slab repair). No
            town on this page has a researched local repair price, and none is
            implied.
          </li>
          <li>
            <strong className="text-blue-950">Not insurance or legal advice.</strong>{" "}
            Coverage depends on your policy and on whether the leak was sudden
            or gradual. Ask your insurer — and keep the detection report,
            photos, and invoices, because they are the evidence it asks for.
          </li>
          <li>
            <strong className="text-blue-950">Not a safety verdict.</strong>{" "}
            For gas, this tool estimates cost only. If you smell gas, leave
            the building and call 911 first.
          </li>
        </ul>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-14">
          <h2 className="text-2xl font-extrabold text-blue-950">Leak cost — questions, answered</h2>
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
              Turn off all water, note the meter, check it in the morning. If it moved, water is escaping — and you have a leak to price.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/services/slab-leak-detection/" className="font-bold text-blue-800 hover:underline">
              Slab leak detection →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              How acoustic and thermal equipment pinpoints a leak under concrete without digging — and what spot repair, tunnelling, and rerouting each involve.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/services/water-main-leak-detection/" className="font-bold text-blue-800 hover:underline">
              Water main leak detection →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              For a broken yard or main line: pressure testing plus acoustic pinpointing before any excavation.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/services/sewer-line-leak-detection/" className="font-bold text-blue-800 hover:underline">
              Sewer line leak detection →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              For sewer leaks: camera inspection with a recorded video and a written diagnosis, before any repair is priced.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/services/sewer-camera-inspection/" className="font-bold text-blue-800 hover:underline">
              Sewer camera inspection →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              What a camera inspection costs by access type, and what the video should show you before you approve a repair.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/tools/water-bill-spike/" className="font-bold text-blue-800 hover:underline">
              Water Bill Spike Splitter →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              If a high bill is what started this: split the spike into the leak part and the rate part, and estimate what the extra water costs.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="font-bold text-blue-950">Local guides with real data: </span>
            <Link href="/tx/houston/katy/" className="font-bold text-blue-800 hover:underline">Katy, TX</Link>
            {" · "}
            <Link href="/tx/dallas/plano/" className="font-bold text-blue-800 hover:underline">Plano, TX</Link>
            {" · "}
            <Link href="/tx/el-paso/el-paso/" className="font-bold text-blue-800 hover:underline">El Paso, TX</Link>
            <p className="mt-1 text-sm text-slate-600">
              Every town guide covers slab, sewer, gas and pool leaks with verified local soil, housing and pricing data.
            </p>
          </li>
        </ul>
        <p className="mt-6 text-xs text-slate-400">
          Disclaimer: this tool gives estimates from researched ranges. It is a screening aid, not a diagnosis
          and never a quote. Detection prices are researched metro-typical ranges shown per town; repair prices
          are national ranges. Only on-site leak detection can confirm a leak, its location, and its repair
          method — and only your insurer can confirm coverage.
        </p>
      </section>

      <CtaBand
        title="Got a quote and want a second opinion?"
        subtitle="Get a detection visit to confirm the method first — the estimate above assumes a method, and only on-site detection can confirm which one your leak needs."
      />
    </>
  );
}
