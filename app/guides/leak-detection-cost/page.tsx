import Link from "next/link";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { breadcrumbListSchema, faqPageSchemaFromQAs } from "@/lib/schema";
import { TOWN_PRICES, type TownPrice } from "@/lib/town-prices";
import CtaBand from "@/components/CtaBand";

/**
 * Leak detection cost in Texas — cost hub page.
 *
 * Target queries: "leak detection cost Texas" / "how much does leak
 * detection cost".
 * SERP study (Nov 16, 2026, §B3): Angi owns the national number
 * (repair $630–$4,400, avg $2,280, updated Sep 22, 2026) and a cluster
 * of good 2026 guides covers the national ranges — but nobody publishes
 * per-town Texas prices. This page wins on the local angle: researched
 * per-metro detection / slab / camera ranges from our 100-town dataset,
 * with national repair ranges clearly labeled NATIONAL and kept separate
 * from the per-town detection prices.
 *
 * Price discipline: every Texas detection figure below is computed from
 * lib/town-prices.ts (generated from research-csvs/*-towns.csv). The
 * researched ranges are metro-typical — towns in the same metro share a
 * range because the underlying research is metro-level — and the table
 * says so. Two cells are handled with care: the Austin camera range
 * excludes the Lakeway/Leander $260–$1,700 rows (Angi Austin data for
 * broader sewer work, not a standalone camera inspection — same
 * exclusion as the sewer camera cost guide), and the McAllen camera cell
 * is a hydrostatic-test price, not a standalone camera price.
 *
 * FAQ answers are 50–80 words each (counted by hand at write time).
 * The visible FAQ block and the FAQPage schema are rendered from the
 * same FAQS constant, so they can never drift apart.
 *
 * Server page, all content static/SSR. No Supabase access.
 */

export const metadata: Metadata = {
  title: "Leak Detection Cost in Texas | Real Leak Detection".slice(0, 60),
  description:
    "Leak detection in Texas typically costs $125–$600. Per-metro detection, slab and camera prices, what changes the price, and how to tell if a quote is fair.".slice(
      0,
      155
    ),
  alternates: { canonical: `${SITE_URL}/guides/leak-detection-cost/` },
};

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "How much does leak detection cost in Texas?",
    a: "In most Texas metros, finding a leak typically costs $125–$600, based on our researched prices across 100 towns. Houston runs $125–$400 and Dallas–Fort Worth $250–$600, while McAllen is higher at $400–$800. Slab leak detection can run higher — up to $950 in El Paso — because it needs acoustic or thermal equipment under concrete. Detection is priced separately from repair, so always ask whether the quote covers finding the leak only.",
  },
  {
    q: "Why do prices vary by town?",
    a: "Towns in the same metro share a range because plumbers serve the whole metro, not one suburb — so Katy and Sugar Land sit in the same Houston band. Prices move between metros instead: labor rates, drive time, and how many leak-detection firms compete locally all play a part. Soil matters too — expansive clay and older cast-iron pipe make pinpointing harder in some areas. McAllen is the outlier, with detection at $400–$800 while most metros run $125–$600.",
  },
  {
    q: "Is detection separate from repair?",
    a: "Yes. Detection is the job of finding the leak — acoustic listening, pressure testing, or a camera — and repair is the job of fixing it, which is a separate price. Nationally, slab leak repair runs $630–$4,400 according to Angi, updated September 2026, while detection in Texas typically costs $125–$600. Some firms quote both together, so ask for the two prices as separate lines before you agree, and check whether a re-check after repair is included.",
  },
  {
    q: "What does a slab leak detection cost in Texas?",
    a: "Slab leak detection in Texas typically costs $150–$950, based on our researched prices across 10 metros. Most metros fall between $150 and $600 — Houston $150–$500, Dallas–Fort Worth $250–$600, and San Antonio $150–$600. El Paso is the highest at $280–$950, which reflects the published local range there. The price covers locating the leak under the slab, usually with acoustic listening or thermal imaging, and a written report of where it is.",
  },
  {
    q: "How much does a sewer camera inspection cost in Texas?",
    a: "A standard sewer camera inspection in Texas typically costs $100–$500, based on our researched prices across 10 metros. Amarillo is the lowest at $100–$250, Houston and Corpus Christi run $175–$350, and Dallas–Fort Worth runs $200–$500. McAllen has no published standalone camera price — the $575–$975 figure there is for a main-line hydrostatic test, a different job. Access decides the price: a cleanout entry is cheapest.",
  },
  {
    q: "What should a leak detection quote include?",
    a: "A quote should list the detection method, the area it covers, and whether a written report with the leak location is included. It should also state what happens if the first test does not find the leak — whether a second method is included or billed separately. Get the detection price and the repair price as separate lines, and ask whether the quote covers the visit or charges by the hour. If any of that is missing, ask first.",
  },
];

const PAGE_PATH = "/guides/leak-detection-cost/";

/** Metro order used across the cost guides. */
const METRO_ORDER = [
  "Houston",
  "Dallas",
  "Fort Worth",
  "Austin",
  "San Antonio",
  "El Paso",
  "McAllen",
  "Corpus Christi",
  "Lubbock",
  "Amarillo",
];

interface MetroPriceRow {
  metro: string;
  leak: string;
  slab: string;
  camera: string;
  cameraNote?: string;
}

function range(rows: TownPrice[], low: (t: TownPrice) => number, high: (t: TownPrice) => number): string {
  const lo = Math.min(...rows.map(low));
  const hi = Math.max(...rows.map(high));
  return `$${lo}–$${hi}`;
}

/**
 * Per-metro price table, computed from TOWN_PRICES at build time so the
 * page can never drift from the researched data. Towns in a metro share
 * a range (metro-level research), so each cell is the min–max span of
 * that metro's 10 towns. Camera: rows above $1,000 are excluded — the
 * Lakeway/Leander $260–$1,700 rows are Angi Austin data for broader
 * sewer work, not a standalone camera inspection. McAllen has no
 * standalone camera price in the data (see cameraNote).
 */
function metroPriceRows(): MetroPriceRow[] {
  return METRO_ORDER.map((metro) => {
    const rows = TOWN_PRICES.filter((t) => t.metro === metro);
    const cameraRows = rows.filter((t) => t.cameraHigh <= 1000 && !t.cameraNote);
    return {
      metro,
      leak: range(rows, (t) => t.leakLow, (t) => t.leakHigh),
      slab: range(rows, (t) => t.slabLow, (t) => t.slabHigh),
      camera:
        cameraRows.length > 0
          ? range(cameraRows, (t) => t.cameraLow, (t) => t.cameraHigh)
          : "No standalone camera price",
      cameraNote: rows[0]?.cameraNote,
    };
  });
}

export default function LeakDetectionCostTexasPage() {
  const faqSchema = faqPageSchemaFromQAs(FAQS);
  const metroRows = metroPriceRows();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbListSchema([
              { name: "Home", path: "/" },
              { name: "Guides", path: "/guides/" },
              { name: "Leak Detection Cost in Texas", path: PAGE_PATH },
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
            <span className="text-blue-200">Guides</span>
            <span className="mx-2 text-blue-400">›</span>
            <span className="text-white">Leak Detection Cost in Texas</span>
          </nav>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            Leak Detection Cost in Texas
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-blue-100">
            Finding a leak in Texas typically costs{" "}
            <strong className="text-white">$125–$600</strong> in most metros
            — $125–$400 around Houston, $250–$600 across Dallas–Fort Worth,
            and $150–$500 in Austin. Slab leak detection runs higher, up to{" "}
            <strong className="text-white">$950 in El Paso</strong>, because
            it needs acoustic or thermal equipment under concrete. The one
            outlier is McAllen, at $400–$800 for detection.
          </p>
          <p className="mt-4 max-w-2xl text-base text-blue-200">
            The short version:{" "}
            <strong className="text-white">
              detection is the cheap part — repair is where the money goes.
            </strong>{" "}
            Nationally, a slab leak repair runs $630–$4,400 (Angi, updated
            September 2026). Paying a few hundred to find the leak exactly
            is what keeps the repair from becoming a guess — and a much
            bigger bill.
          </p>
          <p className="mt-4 max-w-2xl text-base text-blue-200">
            Typical ranges, not a quote — the tables below show researched
            Texas prices by metro, and the national repair ranges are
            labeled NATIONAL so the two are never mixed up.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-14">
        <h2 className="text-2xl font-extrabold text-blue-950">Leak detection prices by Texas metro</h2>
        <p className="mt-3 text-slate-600">
          Researched from our 100-town dataset (10 towns per metro). Towns
          in the same metro share a range — the research is metro-level
          (plumber-published prices, local guides, Angi local data), so the
          table shows the metro range and your town sits inside it. These
          are detection prices: finding the leak. Repair is a separate
          price, covered in the section below.
        </p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600">
                <th className="p-4 font-bold">Metro</th>
                <th className="p-4 font-bold">Leak detection</th>
                <th className="p-4 font-bold">Slab leak detection</th>
                <th className="p-4 font-bold">Sewer camera</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {metroRows.map((row) => (
                <tr key={row.metro}>
                  <td className="p-4 font-semibold">{row.metro}</td>
                  <td className="p-4 font-semibold">{row.leak}</td>
                  <td className="p-4 font-semibold">{row.slab}</td>
                  <td className="p-4 font-semibold">
                    {row.camera}
                    {row.cameraNote && (
                      <span className="mt-1 block text-xs font-normal text-slate-500">
                        {row.cameraNote}: $575–$975 for a main-line
                        hydrostatic test — a different test, not a camera
                        price.
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          Austin camera: $125–$500, with $150–$300 the most common band.
          The Lakeway/Leander $260–$1,700 rows in the source data cover
          broader sewer work, not a standalone camera inspection, so they
          are excluded from the range above. McAllen has no published
          standalone camera price — the $575–$975 figure is for a main-line
          hydrostatic test (All Valley Plumbing, November 2026), not a
          camera inspection.
        </p>
        <p className="mt-3 text-sm text-slate-500">
          For comparison, published local prices from other Texas firms:
          Lone Star Leak Locators in Richardson lists $150–$3,700 to locate
          a leak, with slab Geo Phone location at $250–$600 (dated November
          11, 2026); Benjamin Franklin Plumbing in Fort Worth lists
          $75–$500 for detection and $125–$400 for slab detection. The wide
          top ends cover longer, harder, or multi-method jobs.
        </p>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">What changes the price</h2>
        <p className="mt-3 text-slate-600">
          No two leak jobs cost the same, and the differences are not
          random. These are the drivers that move a quote up or down — ask
          which ones apply to your job before you agree to a price.
        </p>
        <ul className="mt-5 list-disc space-y-3 pl-6 text-slate-600">
          <li>
            <strong className="text-blue-950">Where the leak is.</strong>{" "}
            A yard-line leak found with a meter test and a listening device
            is a different job from a leak under a concrete slab, which
            needs acoustic listening, pressure testing, or thermal imaging
            to pinpoint through concrete.
          </li>
          <li>
            <strong className="text-blue-950">Access and flooring.</strong>{" "}
            Tile, hardwood, and carpet change how a leak is reached and
            how much has to be opened up to confirm it. A leak under a
            tiled bathroom floor costs more to pinpoint than one under a
            carpeted bedroom, and a home with no cleanout needs a pulled
            toilet or a roof vent for a camera.
          </li>
          <li>
            <strong className="text-blue-950">Slab vs yard vs wall.</strong>{" "}
            Slab leaks need the most equipment and the most time on site.
            Yard-line leaks need the line traced across the property.
            A leak inside a wall is usually the fastest to find — the
            signs point straight at it.
          </li>
          <li>
            <strong className="text-blue-950">Camera vs acoustic.</strong>{" "}
            A sewer camera looks inside the drain line; acoustic listening
            finds pressurized supply leaks. They are different tests with
            different prices, and ordering the wrong one wastes the money —
            a camera will not find a slab leak, and acoustic equipment will
            not show a cracked sewer pipe.
          </li>
          <li>
            <strong className="text-blue-950">How many tests it takes.</strong>{" "}
            Some leaks are found with one method. Others need a second
            test — a pressure test after an acoustic pass, or a camera
            after a dye test — and each added test adds to the bill. Ask
            whether a second method is included or billed separately.
          </li>
          <li>
            <strong className="text-blue-950">Line length and depth.</strong>{" "}
            A short, shallow yard line is a quicker trace than a long run
            to the street or a deep sewer line. Longer lines mean more
            time on site and, for camera work, more cable and more footage
            to review.
          </li>
          <li>
            <strong className="text-blue-950">Metro and drive time.</strong>{" "}
            Labor rates and travel differ between metros — Dallas–Fort
            Worth runs $250–$600 for detection while Houston runs
            $125–$400. A home far from the firm&apos;s base can also add
            a trip charge.
          </li>
        </ul>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">Detection vs repair: two different bills</h2>
        <p className="mt-3 text-slate-600">
          The most common pricing confusion in this niche is mixing up the
          cost of finding a leak with the cost of fixing it. They are
          separate jobs, often billed separately, and the numbers are far
          apart. Texas detection prices below are researched per metro;
          every repair figure is a published national range, labeled
          NATIONAL, because no Texas-specific repair price dataset exists
          in our research.
        </p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600">
                <th className="p-4 font-bold">Job</th>
                <th className="p-4 font-bold">Typical price</th>
                <th className="p-4 font-bold">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="p-4 font-semibold">Leak detection (Texas)</td>
                <td className="p-4 font-semibold">$125–$600 in most metros</td>
                <td className="p-4">Researched — 100 towns, 10 metros (this page&apos;s table). McAllen $400–$800.</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">Slab leak detection (Texas)</td>
                <td className="p-4 font-semibold">$150–$950</td>
                <td className="p-4">Researched — 100 towns, 10 metros. El Paso $280–$950 is the top end.</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">Sewer camera inspection (Texas)</td>
                <td className="p-4 font-semibold">$100–$500</td>
                <td className="p-4">Researched — 100 towns, 10 metros. See the sewer camera cost guide for the access-type breakdown.</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">Slab leak repair</td>
                <td className="p-4 font-semibold">$630–$4,400, average $2,280 (NATIONAL)</td>
                <td className="p-4">Angi, updated September 22, 2026. A separate national guide cites the same range with an average of $2,300.</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">Slab repair (narrower band)</td>
                <td className="p-4 font-semibold">$1,500–$4,000+ (NATIONAL)</td>
                <td className="p-4">Published national repair guides. The top end covers reroutes and larger jobs.</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">Full sewer line replacement</td>
                <td className="p-4 font-semibold">$5,000–$20,000 (NATIONAL)</td>
                <td className="p-4">Published national cost guides. This is the figure a $150–$500 camera inspection protects against.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          Read the table this way: detection is a few hundred dollars;
          repair is a few thousand. A detection visit that pinpoints the
          leak to within a foot is what keeps a repair small — a spot fix
          instead of opening up half a slab.
        </p>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">Repair methods, compared: spot vs reroute vs epoxy vs repipe</h2>
        <p className="mt-3 text-slate-600">
          Once detection finds the leak, the repair method is chosen from
          where the leak sits, what the pipe is made of, and how old the
          system is. The four methods below are the ones national cost
          guides list (Angi&apos;s method table covers spot, reroute,
          lining, and repipe). No method below carries its own price —
          repair prices are the national ranges in the table above, and
          which method fits is decided after detection, not before.
        </p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600">
                <th className="p-4 font-bold">Method</th>
                <th className="p-4 font-bold">What it means</th>
                <th className="p-4 font-bold">When it fits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="p-4 font-semibold">Spot repair</td>
                <td className="p-4">Open the slab or floor at the leak and fix that one section of pipe.</td>
                <td className="p-4">One leak, pipe otherwise sound, and the location is pinpointed. The smallest job — but it leaves the rest of the old pipe in place.</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">Reroute / re-pipe of one line</td>
                <td className="p-4">Abandon the leaking section under the slab and run a new line around it, usually through walls or attic.</td>
                <td className="p-4">When opening the slab is costly or the leak sits under finished flooring. Avoids breaking concrete but adds new pipe runs.</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">Epoxy lining</td>
                <td className="p-4">Coat the inside of the existing pipe with epoxy to seal leaks from within, without digging.</td>
                <td className="p-4">For lines with multiple small leaks or corrosion where the pipe structure is still intact. Not a fit for collapsed or badly broken pipe.</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">Full repipe</td>
                <td className="p-4">Replace the home&apos;s water supply lines — or a whole system — with new pipe.</td>
                <td className="p-4">When leaks keep coming back, or the pipe material has reached the end of its life. The biggest job, and the one that ends repeat slab leaks.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          A quote that names the method before detection has found the leak
          is a quote to question — the method follows the location, not the
          other way round.
        </p>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">Is that quote fair? A checklist</h2>
        <p className="mt-3 text-slate-600">
          Use the ranges on this page as the yardstick, then run the quote
          through this list. A fair quote survives all of it; a quote that
          fails two or more points deserves a second opinion.
        </p>
        <ul className="mt-5 list-disc space-y-3 pl-6 text-slate-600">
          <li>
            <strong className="text-blue-950">Detection and repair are separate lines.</strong>{" "}
            You should be able to see what finding the leak costs and what
            fixing it costs. One combined number hides both.
          </li>
          <li>
            <strong className="text-blue-950">The method is named.</strong>{" "}
            Acoustic, pressure test, thermal, camera — the quote should say
            which test is being run and what area it covers.
          </li>
          <li>
            <strong className="text-blue-950">A written report is included.</strong>{" "}
            The leak location in writing, with the video file for a camera
            job. A verbal &quot;it&apos;s somewhere over there&quot; is not
            a report.
          </li>
          <li>
            <strong className="text-blue-950">The &quot;not found&quot; case is priced.</strong>{" "}
            Ask what happens if the first test does not find the leak — is a
            second method included, or billed separately?
          </li>
          <li>
            <strong className="text-blue-950">The price fits the metro range.</strong>{" "}
            Compare against the table above. A quote far above the metro
            range needs a reason — long line, no access, second test — not
            just a bigger number.
          </li>
          <li>
            <strong className="text-blue-950">No pressure to decide on the spot.</strong>{" "}
            A leak is urgent, but a repair method is a decision you can
            take an evening over. A quote that expires before you leave the
            room is a red flag.
          </li>
          <li>
            <strong className="text-blue-950">The repair method follows the detection.</strong>{" "}
            If the quote names a reroute or a repipe before anyone has
            located the leak, the method was chosen before the facts were.
          </li>
          <li>
            <strong className="text-blue-950">Get a second quote for any repair over $1,000.</strong>{" "}
            Detection is cheap; repair is where the money goes. A second
            number on a multi-thousand-dollar repair is the cheapest
            insurance you will ever buy.
          </li>
        </ul>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-14">
          <h2 className="text-2xl font-extrabold text-blue-950">Leak detection cost — questions, answered</h2>
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
            <Link href="/tools/leak-cost-estimator/" className="font-bold text-blue-800 hover:underline">
              Leak Cost Estimator →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              Estimate leak detection and repair costs for your Texas town from researched per-town prices — pick your town, leak type, and access method.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/guides/sewer-camera-inspection-cost-texas/" className="font-bold text-blue-800 hover:underline">
              Sewer Camera Inspection Cost in Texas →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              The camera half of the story: cost by access type, per-metro camera prices, and what the report must include.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/services/slab-leak-detection/" className="font-bold text-blue-800 hover:underline">
              Slab leak detection →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              How slab leaks are found under concrete — acoustic listening, pressure testing, and thermal imaging — and what the visit covers.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/services/water-main-leak-detection/" className="font-bold text-blue-800 hover:underline">
              Water main leak detection →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              For breaks in the main supply line — how they are located before excavation, and who owns which side of the meter.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/services/sewer-line-leak-detection/" className="font-bold text-blue-800 hover:underline">
              Sewer line leak detection →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              For leaks and separations in the sewer line itself — how they are tracked down once a scope finds them.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/tools/water-bill-spike/" className="font-bold text-blue-800 hover:underline">
              Water Bill Spike Splitter →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              Before you book detection, check whether the spike is a leak at all — split a bill jump into leak vs rate increase first.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="font-bold text-blue-950">Local guides with real prices: </span>
            <Link href="/tx/houston/katy/" className="font-bold text-blue-800 hover:underline">Katy, TX</Link>
            {" · "}
            <Link href="/tx/dallas/plano/" className="font-bold text-blue-800 hover:underline">Plano, TX</Link>
            {" · "}
            <Link href="/tx/el-paso/el-paso/" className="font-bold text-blue-800 hover:underline">El Paso, TX</Link>
            <p className="mt-1 text-sm text-slate-600">
              Every town guide covers detection prices with verified local soil, housing-era, and pipe data.
            </p>
          </li>
        </ul>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">Methodology &amp; sources</h2>
        <p className="mt-3 text-slate-600">
          Texas detection prices on this page are computed from our
          researched town dataset: 100 towns across 10 metros, each with
          researched price ranges (research-csvs/*-towns.csv, surfaced
          through lib/town-prices.ts). The ranges are metro-typical —
          towns in the same metro share a range because the underlying
          research is metro-level (plumber-published prices, local guides,
          Angi local data) — so the table shows each metro&apos;s min–max
          span across its 10 towns, never a town-specific quote. Two values
          were handled with care: the McAllen camera cell is a
          hydrostatic-test price ($575–$975, All Valley Plumbing, November
          2026), not a standalone camera price, and is shown as such; the
          Lakeway/Leander $260–$1,700 camera rows are Angi Austin data for
          broader sewer work, not a standalone camera inspection, so they
          are excluded from the Austin camera range (same exclusion as the
          sewer camera cost guide).
        </p>
        <p className="mt-3 text-slate-600">
          National repair ranges come from the competitor pages studied in
          the Nov 16, 2026 SERP study (§B3) and are labeled NATIONAL on
          this page: Angi — slab leak repair $630–$4,400, average $2,280,
          updated September 22, 2026; foundationrepairhq.com — detection
          $150–$600, repair $630–$4,400 with an average of $2,300, citing
          This Old House (April 2026); lonestarleaklocators.com, Richardson
          — $150–$3,700 to locate, slab Geo Phone location $250–$600, dated
          November 11, 2026; benjaminfranklinplumbingfortworth.com —
          detection $75–$500, slab $125–$400; plumbinglocalservicepro.com —
          detection $150–$400, average about $280, with metro averages of
          $300–$375 including Houston. The $5,000–$20,000 sewer-replacement
          comparison is the figure national cost guides state against a
          camera inspection. The study found that no competitor publishes
          per-town Texas prices — the per-metro table above is the gap
          this page fills.
        </p>
        <p className="mt-3 text-slate-600">
          Prices were researched in November 2026 and will change —
          confirm the price with a local plumber before booking. Repair
          method descriptions (spot repair, reroute, epoxy lining, repipe)
          follow the method table in the national cost guides; no
          per-method prices are given because no sourced per-method Texas
          price exists in our data.
        </p>
        <p className="mt-6 text-xs text-slate-400">
          Disclaimer: prices on this page are typical ranges from published
          and researched sources, not a quote. The exact price depends on
          leak location, access, flooring, line length, and metro. Only a
          local plumber who has seen your home can quote your job.
        </p>
      </section>

      <CtaBand
        title="Know the price before you call?"
        subtitle="Check the Leak Cost Estimator for your town first — then compare any quote against the ranges on this page."
      />
    </>
  );
}
