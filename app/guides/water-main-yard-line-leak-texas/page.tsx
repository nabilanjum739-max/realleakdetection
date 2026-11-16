import Link from "next/link";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { breadcrumbListSchema, faqPageSchemaFromQAs } from "@/lib/schema";
import CtaBand from "@/components/CtaBand";

/**
 * Water main / yard line leak in Texas — guide page.
 *
 * Target query: "water main leak Texas / yard line leak Texas".
 * SERP study (Nov 16, 2026, §B13): no Texas page ranked in the top
 * results — all national or other-state pages. The Texas edge here is
 * the clay-masking angle (in expansive clay the water often never
 * surfaces, so the bill and the meter are the tell), the
 * meter-isolation test (§B8 diagnostic core), a per-utility ownership
 * table built ONLY from verified entries in lib/utility-rules.ts, and
 * researched per-metro detection prices from our town CSVs.
 *
 * Price discipline: repair $630–$4,400, avg $2,300 is NATIONAL
 * (This Old House via foundationrepairhq, Apr 2026; Angi avg $2,280,
 * Sep 2026 — report §B3) and is labeled NATIONAL everywhere it
 * appears. Detection prices are per-metro researched values from
 * research-csvs/*-towns.csv (price_leak_detection) — general
 * leak-detection visit prices; the CSVs carry no yard-line-specific
 * detection price, and the page says so. No Texas yard-line repair or
 * replacement price exists in our data, and none is invented.
 *
 * Ownership discipline: rows exist ONLY for utilities verified in
 * lib/utility-rules.ts. Anchor-city utilities (Houston, Dallas, SAWS,
 * Austin, Fort Worth) serve the anchor city only — none of our towns
 * in those metros is served by them — so they appear only as a note,
 * not as town rows. Every town not covered by a verified row is
 * "check your bill/utility".
 *
 * Soil facts come from the researched town CSVs (soil_type /
 * soil_leak_note): Katy gumbo clay, El Paso sandy loam over caliche,
 * Amarillo Pullman clay loam, Plano split (Austin Chalk west /
 * Blackland Prairie clay east).
 *
 * FAQ answers are 50–80 words each (counted by hand at write time).
 * The visible FAQ block and the FAQPage schema are rendered from the
 * same FAQS constant, so they can never drift apart.
 *
 * Server page, all content static/SSR. No Supabase access.
 */

export const metadata: Metadata = {
  title: "Water Main & Yard Line Leak in Texas | Real Leak Detection".slice(0, 60),
  description:
    "A yard line leak in Texas often never surfaces in clay soil — the meter is the tell. Signs, the meter-isolation test, who pays, and Texas detection costs.".slice(
      0,
      155
    ),
  alternates: { canonical: `${SITE_URL}/guides/water-main-yard-line-leak-texas/` },
};

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "How do I know if the leak is before or after the meter?",
    a: "Shut everything off in the house, then watch the meter: if it still moves, water is leaving somewhere. Close the shutoff valve where the line enters the house. If the meter stops, the leak is inside; if it keeps moving with the house isolated, the leak is in the yard line between the meter and the house. A leak before the meter — street main to meter — does not move your meter, so report it to your utility.",
  },
  {
    q: "Why doesn't water surface in clay soil?",
    a: "Expansive Texas clay is dense and slow to drain, so a leaking yard line often soaks sideways into the soil instead of pooling on the surface. In Houston's gumbo clay around Katy, and the Pullman clay loam around Amarillo, water spreads through cracks underground and may never show as a wet spot. That is why the bill and the meter — not the lawn — are the reliable signs, and why a clay-country yard leak can run for weeks unseen.",
  },
  {
    q: "Who pays for a yard line leak repair?",
    a: "In most Texas towns, you pay for repairs on your side of the meter — the line from the meter to the house is yours — while the utility covers the street main and the meter itself. The boundary varies by city and MUD, so check your water bill or your utility's service rules before you dig. Some utilities credit part of the excess water charge once the leak is repaired, but the repair bill itself is normally the homeowner's.",
  },
  {
    q: "How much does a yard line leak cost to find and fix in Texas?",
    a: "Finding the leak typically costs $150–$600 in Texas, based on our researched per-metro detection prices — Houston $150–$400, Dallas–Fort Worth $250–$600, El Paso $129–$500, and McAllen $400–$800. Repair is a separate cost: nationally, a slab or water-line repair runs $630–$4,400, averaging about $2,300, and a yard-line repair depends on depth, length, and pipe material. A short shallow dig is the cheapest fix; a long line under a driveway costs far more.",
  },
  {
    q: "Can a yard line leak raise my sewer bill for a whole year?",
    a: "Yes, in towns that set sewer charges from winter water use. If a yard leak falls in the December–February averaging months, the leaked gallons can inflate your winter average, and sewer charges for the next 12 months are based on that average — a winter leak can cost you all year. Some utilities correct the average once the leak is repaired and documented; others do not. File the repair proof quickly, and check your utility's rule in the table above.",
  },
  {
    q: "What if the wet spot is in the street, not my yard?",
    a: "Call your water utility first, not a plumber. Water bubbling from the street, a sunken patch of pavement, or a steady flow from a valve box usually means the city's main — or the service line on the utility's side of the meter — has broken. That is the utility's repair, and a fast leak can undermine the road before anyone notices. Note the location, keep clear of the water, and report it; do not dig in the street yourself.",
  },
];

const PAGE_PATH = "/guides/water-main-yard-line-leak-texas/";

export default function WaterMainYardLineLeakTexasPage() {
  const faqSchema = faqPageSchemaFromQAs(FAQS);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbListSchema([
              { name: "Home", path: "/" },
              { name: "Guides", path: "/guides/" },
              { name: "Water Main & Yard Line Leak in Texas", path: PAGE_PATH },
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
            <span className="text-white">Water Main &amp; Yard Line Leak in Texas</span>
          </nav>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            Water Main &amp; Yard Line Leak in Texas
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-blue-100">
            A yard line leak is a break in the buried water line that runs
            from your meter to your house — your side of the meter, carrying
            pressurized water underground. In much of Texas the water never
            reaches the surface: expansive clay soaks it up sideways, so
            there is no puddle, no wet spot, nothing to see. The tell is
            the bill and the meter. If your water bill jumped and the meter
            moves with everything shut off, the leak is real even if the
            lawn looks dry.
          </p>
          <p className="mt-4 max-w-2xl text-base text-blue-200">
            Typical ranges, not a quote — the exact price depends on line
            length, depth, pipe material, and metro. The sections below
            cover the signs, the meter test you can do yourself, who owns
            which side of the meter, and the Texas numbers.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-14">
        <h2 className="text-2xl font-extrabold text-blue-950">Signs of a yard line leak</h2>
        <p className="mt-3 text-slate-600">
          A yard line carries water under pressure, so unlike a sewer leak
          it always moves the meter and always raises the bill. The visible
          signs are subtler than most people expect — especially in clay
          soil, where the first sign is often the bill, not the lawn.
        </p>
        <ul className="mt-5 list-disc space-y-3 pl-6 text-slate-600">
          <li>
            <strong className="text-blue-950">A soggy strip or green stripe along the line path.</strong>{" "}
            A line of grass that is greener, taller, or softer than the
            rest of the lawn, running roughly from the meter box toward the
            house. In sandy soil this shows fast; in clay it may never
            show at all.
          </li>
          <li>
            <strong className="text-blue-950">A water bill that jumped with no change in use.</strong>{" "}
            The most reliable sign in Texas. A yard leak runs 24 hours a
            day, so even a small break adds thousands of gallons to a
            billing period. Compare the bill against the same months last
            year before assuming the rate went up.
          </li>
          <li>
            <strong className="text-blue-950">Whole-house pressure drop.</strong>{" "}
            Every tap runs weaker than it used to, at the same time. A
            single weak fixture is a local problem; the whole house losing
            pressure points to the supply line feeding it.
          </li>
          <li>
            <strong className="text-blue-950">The sound of running water when everything is off.</strong>{" "}
            A faint hiss or rush near the meter box or where the line
            enters the house, with no tap, toilet, or appliance running.
          </li>
          <li>
            <strong className="text-blue-950">A meter box full of water, or a soft, sinking patch in the yard.</strong>{" "}
            Water collecting in the meter box, or ground that gives under
            your foot along the line path, means water is escaping
            underground nearby — even if the surface above looks dry.
          </li>
          <li>
            <strong className="text-blue-950">No warm spot, no damp floor.</strong>{" "}
            Those are slab-leak signs. A yard line runs outside the slab,
            so the floor stays dry while the bill climbs. If the meter
            moves but the house is dry, think yard line first.
          </li>
        </ul>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">The meter-isolation test — do this first</h2>
        <p className="mt-3 text-slate-600">
          This is the diagnostic core for any suspected yard line leak,
          and it costs nothing. It answers one question: is water leaving
          the system, and is it leaving before or after it enters the
          house? The same two-hour meter test is the backbone of the EPA
          WaterSense guidance that the best symptom guides in the Nov 16
          SERP study all use.
        </p>
        <ol className="mt-5 list-decimal space-y-3 pl-6 text-slate-600">
          <li>
            <strong className="text-blue-950">Shut off everything that uses water.</strong>{" "}
            All taps, toilets, washing machine, dishwasher, ice maker, and
            the irrigation controller. Make sure the water softener is not
            mid-regeneration and no one flushes during the test.
          </li>
          <li>
            <strong className="text-blue-950">Find the meter and read it.</strong>{" "}
            The meter is usually in a box near the curb or street. Lift
            the lid, note the reading, and watch the small low-flow dial
            or triangle — on most meters it spins with even a tiny flow.
          </li>
          <li>
            <strong className="text-blue-950">Wait without using any water.</strong>{" "}
            Thirty minutes is enough for a large leak; two hours is the
            standard test for a small one. If the dial moved or the
            reading changed, water is leaving the system somewhere.
          </li>
          <li>
            <strong className="text-blue-950">Close the shutoff valve where the line enters the house.</strong>{" "}
            This isolates the house from the yard line. Watch the meter
            again for 15–30 minutes.
          </li>
          <li>
            <strong className="text-blue-950">Read the result.</strong>{" "}
            If the meter stops with the house shut off, the leak is inside
            the house — a toilet, a pipe in a wall, or a fixture. If the
            meter keeps moving with the house isolated, the leak is in the
            yard line between the meter and the house. If the meter never
            moved at all, the bill spike is not a leak in your line — check
            toilets, irrigation, and estimated reads first.
          </li>
        </ol>
        <p className="mt-5 text-slate-600">
          Write down both readings and the times — a detection visit and a
          leak-adjustment claim both go faster with meter evidence in
          hand. If you want the math behind the spike first, the{" "}
          <Link href="/tools/water-bill-spike/" className="font-bold text-blue-800 hover:underline">
            Water Bill Spike Splitter
          </Link>{" "}
          separates a leak-driven spike from a rate increase, and the
          MeterTest on the{" "}
          <Link href="/tx/houston/katy/" className="font-bold text-blue-800 hover:underline">
            Katy town guide
          </Link>{" "}
          turns two meter readings into gallons lost per day.
        </p>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">Why Texas clay hides yard leaks</h2>
        <p className="mt-3 text-slate-600">
          On a national leak guide, the first sign is always a wet spot in
          the yard. In Texas that advice fails, because the soil decides
          whether leaking water ever reaches the surface — and Texas soil
          is mostly clay that holds water instead of letting it through.
          The facts below come from our researched town data (soil_type and
          soil_leak_note, 100 towns).
        </p>
        <ul className="mt-5 list-disc space-y-3 pl-6 text-slate-600">
          <li>
            <strong className="text-blue-950">Houston — gumbo clay (Katy).</strong>{" "}
            Expansive Houston-area gumbo clays swell when wet and shrink
            in drought, shifting buried water lines and breaking joints.
            Poorly drained clay also holds moisture against pipe walls,
            speeding corrosion of metal pipe. A leak here soaks sideways
            into the clay and may never pool on the surface.
          </li>
          <li>
            <strong className="text-blue-950">Amarillo — Pullman clay loam.</strong>{" "}
            Pullman and Olton clay loams (up to 48% clay; Pullman linear
            extensibility 7.8%) swell when wet and shrink in drought,
            shifting slabs and snapping buried line joints, while a dense
            caliche layer about a foot down resists drainage, so water
            pools against pipes instead of draining away.
          </li>
          <li>
            <strong className="text-blue-950">Dallas–Fort Worth — Blackland Prairie clay (Plano east).</strong>{" "}
            Plano is a split city: Austin Chalk limestone in the west,
            Blackland Prairie expansive clay in the east. In east Plano
            the clay swells when wet and shrinks hard in drought, stressing
            buried pipes; in the west the limestone does not swell but
            erodes beneath foundations over decades.
          </li>
          <li>
            <strong className="text-blue-950">El Paso — sandy loam over caliche (the exception).</strong>{" "}
            El Paso&apos;s sandy soils drain fast and caliche is rigid, so
            leaks rarely show as surface wet spots either — they run hidden
            for weeks, wasting thousands of gallons. The difference is the
            mechanism: in El Paso the water drains away downward instead of
            being held sideways by clay, and the caliche rock makes
            excavation harder and costlier.
          </li>
        </ul>
        <p className="mt-5 text-slate-600">
          The practical point is the same statewide: do not wait for a wet
          spot. In clay country the bill and the meter are the detection
          system. A yard leak that runs unseen for a month is also the leak
          most likely to inflate a winter sewer average — see the cost and
          ownership sections below.
        </p>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">Who owns which side of the meter</h2>
        <p className="mt-3 text-slate-600">
          The general rule in Texas is simple: the utility owns the street
          main and the service line up to the meter; the homeowner owns the
          line from the meter to the house. The repair bill follows the
          same boundary. But the exact boundary, and whether the utility
          will credit any of the wasted water, varies by city and MUD — so
          the table below uses ONLY rules verified in our utility research
          (checked Nov 16, 2026). If your town is not listed, your utility
          is not verified in our data: check your water bill or call your
          utility before you dig.
        </p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600">
                <th className="p-4 font-bold">Utility / area</th>
                <th className="p-4 font-bold">Who pays for the yard line</th>
                <th className="p-4 font-bold">Leak adjustment (verified rule)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="p-4 font-semibold">General rule (all Texas towns)</td>
                <td className="p-4">Homeowner: meter to house. Utility: street main and meter.</td>
                <td className="p-4">Varies by utility — see the verified rows below. Confirm your own utility&apos;s rule before assuming a credit exists.</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">El Paso Water — El Paso</td>
                <td className="p-4">Homeowner pays for the yard line (meter to house).</td>
                <td className="p-4">50% of excess usage; file within 60 days; one adjustment per rolling 24 months. Hidden leaks only; water portion only.</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">City of Amarillo Water — Amarillo</td>
                <td className="p-4">Homeowner pays for the yard line (meter to house).</td>
                <td className="p-4">Applies when use exceeds the 12-month average by 50,000+ gallons; one adjustment every two years. Credit % and deadline not published.</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">City of Corpus Christi Water — Corpus Christi</td>
                <td className="p-4">Homeowner pays for the yard line (meter to house).</td>
                <td className="p-4">No published water-side adjustment policy found. A hidden leak in the Dec–Feb averaging period can get the wastewater average corrected with proof of repairs.</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">City of Lubbock Water Utilities — Lubbock</td>
                <td className="p-4">Homeowner pays for the yard line (meter to house).</td>
                <td className="p-4">No published leak-adjustment policy found. Ask the city whether case-by-case credits are reviewed (806-775-2509).</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">McAllen Public Utility — McAllen</td>
                <td className="p-4">Homeowner pays for the yard line (meter to house).</td>
                <td className="p-4">No published leak-adjustment policy found. No winter averaging — sewer is billed on monthly water volume, so no 12-month sewer tail.</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">Harris County MUD 71 — Cypress</td>
                <td className="p-4">Homeowner pays for the yard line (meter to house).</td>
                <td className="p-4">50% of excess usage; file within 90 days; max 2 credits per 12 months. Requires a sworn application and Eye On Water registration.</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">Brushy Creek MUD — Round Rock area</td>
                <td className="p-4">Homeowner pays for the yard line (meter to house).</td>
                <td className="p-4">No water-side credit found. The wastewater average CAN be corrected with proof of repairs — file before the spring deadline (Apr 30 / May 31 by year). Verify coverage by address.</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">Woodlands Water — The Woodlands</td>
                <td className="p-4">Homeowner pays for the yard line (meter to house).</td>
                <td className="p-4">A one-time leak adjustment can be granted, but no formula, deadline, or eligibility list is published — call 281-367-1271.</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">Your town not listed above — check your bill/utility</td>
                <td className="p-4">Assume the general rule (homeowner: meter to house) until your utility confirms otherwise.</td>
                <td className="p-4">Not verified in our data. Check your bill or call your utility — do not assume a credit exists or a deadline applies.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          Two scope notes. First, the big-city utilities — City of Houston
          Water, Dallas Water Utilities, SAWS, Austin Water, and City of
          Fort Worth Water — serve their anchor city only; none of our 10
          towns in those metros is served by them, so they do not appear as
          town rows above. Suburbs in those metros use their own city
          systems or MUDs. Second, MUD coverage is neighbourhood-level:
          Harris County MUD 71 covers parts of Cypress, and Brushy Creek
          MUD covers the Brushy Creek community around Round Rock — verify
          by address, not by town name. Rules were checked Nov 16, 2026
          and change; re-check the official source before filing.
        </p>
        <p className="mt-3 text-slate-600">
          One more boundary to know before anyone digs: call 811 before
          any excavation, even in your own yard. The yard line shares the
          ground with gas, electric, and telecom lines, and the locate is
          the step that keeps a water repair from becoming a second
          emergency.
        </p>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">Repair and replacement costs</h2>
        <p className="mt-3 text-slate-600">
          Finding the leak and fixing it are two separate bills. Detection
          is the smaller one; repair depends on how deep the line is, how
          long the failed section runs, what the pipe is made of, and what
          sits above it — lawn is cheap to restore, a driveway is not.
        </p>
        <h3 className="mt-6 text-lg font-extrabold text-blue-950">Detection — researched Texas prices by metro</h3>
        <p className="mt-3 text-slate-600">
          These are researched per-metro prices for a leak-detection visit
          from our 100-town dataset (price_leak_detection). They are
          general detection-visit prices — our CSVs carry no yard-line-
          specific detection price — so a yard-line locate sits inside
          these bands rather than at a separate published figure.
        </p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600">
                <th className="p-4 font-bold">Metro</th>
                <th className="p-4 font-bold">Typical detection visit</th>
                <th className="p-4 font-bold">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr><td className="p-4 font-semibold">Houston</td><td className="p-4 font-semibold">$150–$400</td><td className="p-4">Acoustic/thermal detection; some firms quote up to $600.</td></tr>
              <tr><td className="p-4 font-semibold">Dallas</td><td className="p-4 font-semibold">$250–$600</td><td className="p-4">Dallas-metro level; some advertised from ~$299–$339.</td></tr>
              <tr><td className="p-4 font-semibold">Fort Worth</td><td className="p-4 font-semibold">$250–$600</td><td className="p-4">DFW metro; acoustic testing ~$200–$500.</td></tr>
              <tr><td className="p-4 font-semibold">Austin</td><td className="p-4 font-semibold">$150–$500</td><td className="p-4">Typical residential; aggregator average ~$300–$329.</td></tr>
              <tr><td className="p-4 font-semibold">San Antonio</td><td className="p-4 font-semibold">$150–$400</td><td className="p-4">San Antonio-metro published 2026.</td></tr>
              <tr><td className="p-4 font-semibold">El Paso</td><td className="p-4 font-semibold">$129–$500</td><td className="p-4">One local firm advertises leak location from $129; estimates run $180–$640.</td></tr>
              <tr><td className="p-4 font-semibold">McAllen</td><td className="p-4 font-semibold">$400–$800</td><td className="p-4">All Valley Plumbing, McAllen, published Nov 10, 2026; standard $460–$920. Highest metro in our data.</td></tr>
              <tr><td className="p-4 font-semibold">Corpus Christi</td><td className="p-4 font-semibold">$180–$400</td><td className="p-4">Corpus Christi-metro typical.</td></tr>
              <tr><td className="p-4 font-semibold">Lubbock</td><td className="p-4 font-semibold">$200–$400</td><td className="p-4">Local 2024 invoices show ~$222–$225 for slab-leak checks.</td></tr>
              <tr><td className="p-4 font-semibold">Amarillo</td><td className="p-4 font-semibold">$150–$400</td><td className="p-4">West Texas firms quote $200–$400 for electronic/thermal detection.</td></tr>
            </tbody>
          </table>
        </div>

        <h3 className="mt-8 text-lg font-extrabold text-blue-950">Repair and replacement — national range only</h3>
        <p className="mt-3 text-slate-600">
          Nationally, a water-line or slab repair runs{" "}
          <strong className="text-blue-950">$630–$4,400, averaging about $2,300</strong>{" "}
          (NATIONAL — This Old House via foundationrepairhq, Apr 2026;
          Angi&apos;s average is $2,280, updated Sep 2026). That range
          covers the repair itself, not the detection visit, and it is a
          national figure: no Texas-specific yard-line repair or
          replacement price exists in our researched data, so none is
          stated here. What moves a yard-line repair inside — or beyond —
          that range is the digging: a short, shallow section under lawn
          sits at the low end, while a long run under a driveway, patio,
          or mature tree roots, or a full line replacement in caliche
          ground, costs substantially more. Get the repair quoted only
          after the leak is located and marked, so the quote is for one
          dig in one place, not exploratory trenching.
        </p>
        <p className="mt-3 text-slate-600">
          The{" "}
          <Link href="/tools/leak-cost-estimator/" className="font-bold text-blue-800 hover:underline">
            Leak Cost Estimator
          </Link>{" "}
          builds a range from your town and leak type using the same
          researched per-town prices, and the{" "}
          <Link href="/tools/cost-of-waiting/" className="font-bold text-blue-800 hover:underline">
            Cost of Waiting Calculator
          </Link>{" "}
          shows what a running yard leak costs per day, week, and month
          while the decision waits.
        </p>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">City main break or your yard line — how to tell</h2>
        <p className="mt-3 text-slate-600">
          “Water main leak” pulls two different problems into one search,
          and they belong to different people. A municipal main break is
          NOT our target here — it is the utility&apos;s job, and this
          page does not cover main-break repair. The distinction matters
          because calling the wrong party first wastes the hours when a
          main break is undermining a road.
        </p>
        <ul className="mt-5 list-disc space-y-3 pl-6 text-slate-600">
          <li>
            <strong className="text-blue-950">It is probably the city&apos;s main when:</strong>{" "}
            water is bubbling from the street or a valve box, a patch of
            pavement is sinking, the flow is in the road rather than your
            yard, or several neighbours lose pressure or see discoloured
            water at the same time. Call your water utility first — the
            number is on your bill — and report the location.
          </li>
          <li>
            <strong className="text-blue-950">It is probably your yard line when:</strong>{" "}
            the street is dry, only your bill and your pressure changed,
            the meter moves with the house shut off, and the soggy or
            green strip runs from your meter box toward your house. That
            is a homeowner-side leak: the meter test above confirms it,
            and a detection visit locates it.
          </li>
          <li>
            <strong className="text-blue-950">If the meter does not move:</strong>{" "}
            the problem is before the meter — the service line from the
            street main to your meter — or it is not a leak at all. A leak
            before the meter does not raise your bill, because the water
            never passes through it. Report street-side water to the
            utility either way.
          </li>
        </ul>
        <p className="mt-5 text-slate-600">
          This page covers water lines only. If you smell gas anywhere
          near a line, leave the house and call 911 first — do not
          investigate a gas leak yourself, and do not attempt gas repairs.
        </p>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-14">
          <h2 className="text-2xl font-extrabold text-blue-950">Water main &amp; yard line leak — questions, answered</h2>
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
            <Link href="/services/water-main-leak-detection/" className="font-bold text-blue-800 hover:underline">
              Water main leak detection →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              How a main supply-line break is located before excavation — pressure testing plus acoustic pinpointing.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/services/underground-yard-line-leak-detection/" className="font-bold text-blue-800 hover:underline">
              Underground / yard line leak detection →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              Finding leaks in the buried yard line between the meter and the house, then mapping the repair.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/tx/houston/katy/" className="font-bold text-blue-800 hover:underline">
              Katy, TX — leak detection guide with MeterTest →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              Run the MeterTest with two meter readings to turn a suspected yard leak into gallons lost per day — on the town page where the tool lives.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/tools/water-bill-spike/" className="font-bold text-blue-800 hover:underline">
              Water Bill Spike Splitter →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              Split a bill spike into leak vs rate increase first — a usage-driven spike points to a supply leak like a yard line, not a billing change.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/tools/leak-cost-estimator/" className="font-bold text-blue-800 hover:underline">
              Leak Cost Estimator →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              Estimate detection and repair costs for your Texas town from researched per-town prices — including yard-line work.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/tools/insurance-claim-pack/" className="font-bold text-blue-800 hover:underline">
              Insurance Claim Pack Generator →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              A yard leak that caused damage needs documentation — coverage likelihood per bucket, deductible math, and a claim letter draft.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/tools/who-pays/" className="font-bold text-blue-800 hover:underline">
              Who Pays? Responsibility Finder →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              Not sure the yard leak is yours at all? Find out who is responsible — city, MUD, homeowner, or HOA — and who to call first.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/tools/leak-adjustment-checker/" className="font-bold text-blue-800 hover:underline">
              Leak-Adjustment Eligibility Checker →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              If the yard leak spiked your bill, check whether your utility will credit the leak month — and generate the application pack.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/services/slab-leak-detection/" className="font-bold text-blue-800 hover:underline">
              Slab leak detection →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              If the meter moves but the house shows warm spots, damp floors, or running-water sounds, the leak may be under the slab instead of in the yard.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/guides/sewer-camera-inspection-cost-texas/" className="font-bold text-blue-800 hover:underline">
              Sewer camera inspection cost in Texas →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              The sibling Texas cost guide — for when the symptoms point to the sewer side instead of the supply side.
            </p>
          </li>
        </ul>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">Methodology &amp; sources</h2>
        <p className="mt-3 text-slate-600">
          The gap this page fills comes from the Nov 16, 2026 SERP study
          (§B13): no Texas page ranked in the top results for water main /
          yard line leak — the ranking pages were national or other-state
          guides with a consistent diagnostic core (soggy strip / green
          stripe along the line path, whole-house pressure drop, meter test
          + shutoff isolation) but no Texas soil angle, no per-town
          utility ownership rules, no pricing, and no tool. The symptom
          cluster study (§B8) confirms the meter test + shutoff isolation
          as the diagnostic core, with the EPA WaterSense two-hour test as
          the shared backbone. The repair range comes from §B3:
          foundationrepairhq.com ($630–$4,400, avg $2,300, citing This Old
          House, Apr 2026) and Angi ($630–$4,400, avg $2,280, updated Sep
          22, 2026) — national figures, labeled NATIONAL on this page.
        </p>
        <p className="mt-3 text-slate-600">
          Texas detection prices come from our researched town dataset:
          100 towns across 10 metros, each with a researched{" "}
          <code className="rounded bg-slate-100 px-1 text-sm">price_leak_detection</code>{" "}
          value (research-csvs/*-towns.csv). Most metros publish one
          metro-typical range rather than a different price per town, so
          the table shows the metro range. Soil facts come from the same
          CSVs (soil_type / soil_leak_note): Katy&apos;s expansive gumbo
          clay, Amarillo&apos;s Pullman clay loam (up to 48% clay, Pullman
          linear extensibility 7.8%), Plano&apos;s split (Austin Chalk
          west / Blackland Prairie clay east), and El Paso&apos;s sandy
          loam over caliche.
        </p>
        <p className="mt-3 text-slate-600">
          Ownership and leak-adjustment rules come ONLY from verified
          entries in site/lib/utility-rules.ts, generated from the
          utility-adjustment-rules research of Nov 16, 2026 and checked
          against official sources on that date. Anchor-city utilities
          (Houston, Dallas, SAWS, Austin, Fort Worth) are recorded there
          as serving the anchor city only. The &quot;Who Pays?&quot;
          responsibility-finder and leak-adjustment tools do not exist on
          this site yet, so this page links the water-main and yard-line
          service pages instead — no link on this page points to a tool
          that does not exist. Prices and rules were researched in
          November 2026 and will change — confirm the price with a local
          plumber and the rule with your utility before acting.
        </p>
        <p className="mt-6 text-xs text-slate-400">
          Disclaimer: prices on this page are typical ranges from published
          and researched sources, not a quote. The exact price depends on
          line length, depth, access, pipe material, and metro. Only a
          local plumber who has seen your line can quote your job. If you
          smell gas, leave and call 911 first.
        </p>
      </section>

      <CtaBand
        title="Meter moving with everything off?"
        subtitle="Do the meter-isolation test above first — it tells you in one step whether the leak is in your yard line or inside the house, before you pay for any detection visit."
      />
    </>
  );
}
