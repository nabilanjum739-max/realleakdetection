import Link from "next/link";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { breadcrumbListSchema, faqPageSchemaFromQAs } from "@/lib/schema";
import CtaBand from "@/components/CtaBand";

/**
 * Sewer camera inspection cost in Texas — guide page.
 *
 * Target query: "sewer camera inspection cost Texas".
 * SERP study (Nov 16, 2026, §B4): no Texas page ranked in the top
 * results — all national or other-state pages. The Texas edge here is
 * cost by access type, per-metro prices from our researched town CSVs
 * (100 towns, 10 metros), slab-home cleanout guidance, and the
 * pre-purchase angle for homebuyers.
 *
 * Price discipline: every Texas figure below comes from
 * research-csvs/*-towns.csv (price_sewer_camera). Anything from
 * national competitor pages is labeled NATIONAL. The McAllen metro has
 * no published standalone camera price — its cell is a hydrostatic
 * test price, so it is shown as such, not as a camera price.
 *
 * FAQ answers are 50–80 words each (counted by hand at write time).
 * The visible FAQ block and the FAQPage schema are rendered from the
 * same FAQS constant, so they can never drift apart.
 *
 * Server page, all content static/SSR. No Supabase access.
 */

export const metadata: Metadata = {
  title: "Sewer Camera Inspection Cost in Texas | Real Leak Detection".slice(0, 60),
  description:
    "Sewer camera inspection in Texas typically costs $150–$500. Prices by metro and access type, what the report must include, and when a scope is worth it.".slice(
      0,
      155
    ),
  alternates: { canonical: `${SITE_URL}/guides/sewer-camera-inspection-cost-texas/` },
};

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "How much does a sewer camera inspection cost in Texas?",
    a: "A standard camera inspection typically costs $150–$500 in Texas, based on our researched prices across 10 metros. Most common is $150–$300 in the Austin area and $175–$350 around Houston and Corpus Christi, while Dallas–Fort Worth runs $200–$500. The price moves with access: a cleanout entry is cheapest, a pulled toilet costs more, and installing a new cleanout is a separate job. Always confirm the price before booking.",
  },
  {
    q: "What if my Texas home has no cleanout?",
    a: "Then the camera usually enters through a pulled toilet, which costs more than a cleanout entry and adds the work of removing and resetting the toilet. Some homes can be scoped through a roof vent instead. If there is no usable access at all, a plumber may suggest installing a new exterior cleanout — nationally that runs $700–$2,000 or more, so it is a separate decision. Ask which access point the quote assumes before you agree.",
  },
  {
    q: "Should I get a sewer scope before buying a house in Texas?",
    a: "Yes, especially for a home built before about 1980 or one with big trees near the sewer line. A scope typically costs $150–$500, while a full sewer replacement is a $5,000–$20,000 job in national guides — so the inspection is cheap protection during the option period. Ask for the recorded video and a written report with defect locations, and share the findings with your agent before the option expires.",
  },
  {
    q: "Does a sewer camera inspection find slab leaks?",
    a: "Not usually. A sewer camera looks inside the drain and sewer line, which carries wastewater away from the house. A slab leak is a leak in a pressurized water supply line under the concrete slab, and it is found with acoustic listening, pressure testing, or thermal imaging — not a camera. The two problems share symptoms like damp floors, so the right first step is telling a local pro exactly what you see.",
  },
  {
    q: "What should a sewer camera inspection report include?",
    a: "At minimum, the recorded video file, the pipe material and diameter, and every defect located by distance from the entry point — cracks, breaks, bellies, root intrusion, and scale. The report should say what each defect means, what repair it needs, and whether the line needs a follow-up after repair. If you only get a verbal summary, ask for the video and the written findings before you pay.",
  },
  {
    q: "When is a sewer camera inspection not worth it?",
    a: "When only one fixture drains slowly, the problem is usually a local clog that a camera will not help with — try the fixture trap or a drain cleaning first. A camera also will not help a spinning water meter or a high water bill, because those point to a supply-side leak, not a sewer problem. If the line was scoped recently and nothing has changed, a repeat scope adds little unless new symptoms appear.",
  },
];

const PAGE_PATH = "/guides/sewer-camera-inspection-cost-texas/";

export default function SewerCameraCostTexasPage() {
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
              { name: "Sewer Camera Inspection Cost in Texas", path: PAGE_PATH },
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
            <span className="text-white">Sewer Camera Inspection Cost in Texas</span>
          </nav>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            Sewer Camera Inspection Cost in Texas
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-blue-100">
            A standard sewer camera inspection in Texas typically costs{" "}
            <strong className="text-white">$150–$500</strong>. Most jobs land
            at the lower end — $150–$300 is the most common band in published
            Austin-area prices, and $175–$350 around Houston and Corpus
            Christi. What moves the price is not the camera, it is the
            access: a home with a usable cleanout is the cheapest job, a
            home with no cleanout costs more, and installing a new cleanout
            is a separate job altogether.
          </p>
          <p className="mt-4 max-w-2xl text-base text-blue-200">
            Typical ranges, not a quote — the exact price depends on line
            length, access, and metro. The tables below show the researched
            Texas numbers by metro and by access type.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-14">
        <h2 className="text-2xl font-extrabold text-blue-950">Cost by access type — the honest price driver</h2>
        <p className="mt-3 text-slate-600">
          Every cost guide that does this well ties the price to how the
          camera gets into the line. The tiers below follow that structure.
          Texas rows come from our researched town data; rows marked
          NATIONAL have no Texas-specific price in our data, so they use
          the published national ranges.
        </p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600">
                <th className="p-4 font-bold">Access type</th>
                <th className="p-4 font-bold">Typical price</th>
                <th className="p-4 font-bold">What it covers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="p-4 font-semibold">Camera through an existing cleanout</td>
                <td className="p-4 font-semibold">$100–$350</td>
                <td className="p-4">
                  Basic camera inspection. Texas: Amarillo $100–$250;
                  Houston and Corpus Christi $175–$350. Cheapest access —
                  no fixture removal, no new opening.
                </td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">Camera + written report, video file &amp; surface locate</td>
                <td className="p-4 font-semibold">$285–$425</td>
                <td className="p-4">
                  Texas: San Antonio metro, published price for camera +
                  locate with recorded video and report (Armor Pro
                  Services). Nationally this tier runs $250–$600.
                </td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">Camera through a pulled toilet (no usable cleanout)</td>
                <td className="p-4 font-semibold">$150–$500 (NATIONAL)</td>
                <td className="p-4">
                  No Texas-specific toilet-pull price in our data. National
                  consensus: $125–$500 (Callmar), $150–$400 (Servant
                  Plumbing Atlanta), $150–$500 (Plumbers 911 Chicago).
                  Adds removing and resetting the toilet.
                </td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">Installing a new cleanout</td>
                <td className="p-4 font-semibold">$700–$2,000+ (NATIONAL)</td>
                <td className="p-4">
                  No Texas figure in our data. National tier from PSV
                  Plumbing: a new cleanout is excavation and pipe work, a
                  separate job from the inspection itself.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          Before you agree to a price, ask which access point the quote
          assumes. A quote that assumes a cleanout and a job that needs a
          toilet pull are two different prices.
        </p>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">Sewer camera prices by Texas metro</h2>
        <p className="mt-3 text-slate-600">
          Researched from our 100-town dataset (10 towns per metro). Most
          metros publish one metro-typical range rather than a different
          price per town, so the table shows the metro range — your town
          sits inside it unless noted.
        </p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600">
                <th className="p-4 font-bold">Metro</th>
                <th className="p-4 font-bold">Typical camera price</th>
                <th className="p-4 font-bold">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr><td className="p-4 font-semibold">Houston</td><td className="p-4 font-semibold">$150–$500</td><td className="p-4">Base $150–$300; longer lines $250–$500. Katy, Sugar Land &amp; Pearland $175–$350.</td></tr>
              <tr><td className="p-4 font-semibold">Dallas</td><td className="p-4 font-semibold">$200–$500</td><td className="p-4">Dallas-metro level. Angi cites $230–$330 for lines of 50 ft or less in Dallas.</td></tr>
              <tr><td className="p-4 font-semibold">Fort Worth</td><td className="p-4 font-semibold">$200–$500</td><td className="p-4">DFW metro typical.</td></tr>
              <tr><td className="p-4 font-semibold">Austin</td><td className="p-4 font-semibold">$150–$300 most common; standard $100–$600</td><td className="p-4">Promotional offers from $79 exist; the $150–$300 band is the most common published price.</td></tr>
              <tr><td className="p-4 font-semibold">San Antonio</td><td className="p-4 font-semibold">$285–$425</td><td className="p-4">Camera + locate with recorded video and report (Armor Pro Services, published).</td></tr>
              <tr><td className="p-4 font-semibold">El Paso</td><td className="p-4 font-semibold">$170–$730</td><td className="p-4">Metro typical; published local jobs run $105–$503. The wide top end covers longer or harder lines.</td></tr>
              <tr><td className="p-4 font-semibold">McAllen</td><td className="p-4 font-semibold">No published camera price</td><td className="p-4">No Rio Grande Valley firm publishes a standalone camera price. Main-line hydrostatic testing runs $575–$975 (All Valley Plumbing, Nov 2026) — a different test, not a camera price.</td></tr>
              <tr><td className="p-4 font-semibold">Corpus Christi</td><td className="p-4 font-semibold">$175–$350</td><td className="p-4">Corpus Christi-metro typical.</td></tr>
              <tr><td className="p-4 font-semibold">Lubbock</td><td className="p-4 font-semibold">$150–$500</td><td className="p-4">Lubbock-metro typical.</td></tr>
              <tr><td className="p-4 font-semibold">Amarillo</td><td className="p-4 font-semibold">$100–$250</td><td className="p-4">Lowest metro in our data. One Amarillo firm lists $149 standalone; a sewer scope added to a home inspection is +$100.</td></tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          Statewide, a standard residential camera inspection in Texas
          typically runs $150–$500, and $100–$600 covers the full standard
          span in published Texas prices. Figures above $600 in some
          national datasets cover bundled jobs or broader sewer work, not
          a standalone camera inspection.
        </p>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">Texas slab homes: why access is the whole story</h2>
        <p className="mt-3 text-slate-600">
          Most Texas homes built since the 1970s sit on a concrete slab —
          there is no basement to walk and no crawl space to look into.
          The sewer line runs under that slab to the street, so the only
          question that decides the price is how the camera gets in.
        </p>
        <ul className="mt-5 list-disc space-y-3 pl-6 text-slate-600">
          <li>
            <strong className="text-blue-950">Find your cleanout first.</strong> On
            many newer Texas homes it is a capped pipe near the foundation
            wall or in the yard. On older homes there may be no exterior
            cleanout at all — and that single fact is what turns a $150 job
            into a toilet-pull job or a new-cleanout job. Check before you
            book, and tell the plumber what you found.
          </li>
          <li>
            <strong className="text-blue-950">Cast-iron era homes need a scope most.</strong>{" "}
            Homes built before about 1980 commonly have cast-iron drains —
            our Katy research lists pre-1980 galvanized steel and cast
            iron, with copper and PVC from the 1980s onward. Cast iron
            corrodes and scales over decades, so a scope on a 1960s–70s
            home often finds channeling, scale buildup, or bellies where
            waste collects.
          </li>
          <li>
            <strong className="text-blue-950">Expansive clay moves the line.</strong>{" "}
            Houston-area gumbo clay and the Blackland Prairie clays around
            Dallas–Fort Worth swell when wet and shrink in drought. That
            movement shifts buried sewer lines, opens joints, and creates
            sags — the defects a camera is meant to find, and the reason a
            line that passed five years ago may not pass today.
          </li>
          <li>
            <strong className="text-blue-950">Tree roots follow the joints.</strong>{" "}
            Big trees near the sewer path send roots into joints and cracks,
            especially in older clay or cast-iron lines. A scope shows
            exactly where the roots are, in feet from the entry point, so a
            repair can target one spot instead of the whole line.
          </li>
        </ul>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">Buying a house in Texas? Scope it during the option period</h2>
        <p className="mt-3 text-slate-600">
          A sewer scope is the cheapest protection in a Texas home purchase.
          The inspection typically costs $150–$500; a full sewer
          replacement is a $5,000–$20,000 job in national guides. The
          option period is the window to find out — once it expires, the
          line is yours. For homes built before about 1980, homes with big
          trees over the sewer path, and homes with any history of backups,
          a scope is worth ordering before the option clock runs out. Ask
          for the recorded video and the written report, and share the
          findings with your agent while you can still negotiate. The{" "}
          <Link href="/tools/home-buyer-leak-risk/" className="font-bold text-blue-800 hover:underline">
            Home-Buyer Leak Risk Report
          </Link>{" "}
          scores slab and sewer risk for a specific home before you order
          the scope.
        </p>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">What a camera inspection includes — and what the report should contain</h2>
        <p className="mt-3 text-slate-600">
          A camera inspection pushes a small camera on a cable through the
          line, from the entry point to the city main or septic tank. The
          operator watches the live feed, notes defects, and — on a proper
          job — records the video and marks defect locations at the surface.
          Before you book, confirm the job includes all of this:
        </p>
        <ul className="mt-5 list-disc space-y-3 pl-6 text-slate-600">
          <li>
            <strong className="text-blue-950">The full run, on video.</strong>{" "}
            From the entry point to the main or tank, with distance markers
            so every defect is located in feet from where the camera went
            in. Keep the video file — it is your record.
          </li>
          <li>
            <strong className="text-blue-950">Pipe material and diameter.</strong>{" "}
            Cast iron, clay, PVC, or Orangeburg, and the line size. The
            material decides how urgent a defect is and what repair fits.
          </li>
          <li>
            <strong className="text-blue-950">Every defect, named and located.</strong>{" "}
            Cracks, breaks, separations, bellies (sags), root intrusion,
            scale, and offsets — each with its distance from entry and what
            it means.
          </li>
          <li>
            <strong className="text-blue-950">A surface locate.</strong>{" "}
            The operator marks where each defect sits in the yard or under
            the slab, so a repair crew digs in one place, not three.
          </li>
          <li>
            <strong className="text-blue-950">Written findings, not just a verbal summary.</strong>{" "}
            What was found, what repair each defect needs, and whether the
            line needs a follow-up scope after repair. The written report
            is also the document an insurer or a buyer asks for.
          </li>
        </ul>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">When a camera is needed — and when it is not</h2>
        <p className="mt-3 text-slate-600">
          A camera looks inside the drain and sewer line. It answers one
          question: what is the condition of the pipe that carries
          wastewater away from the house? It does not answer every leak
          question, and ordering the wrong test wastes the money.
        </p>
        <h3 className="mt-6 text-lg font-extrabold text-blue-950">Get a camera when:</h3>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-slate-600">
          <li>Drains back up more than once, or several fixtures drain slowly at the same time.</li>
          <li>You hear gurgling from drains or smell sewage inside or near the house.</li>
          <li>You are buying an older home, or a home with big trees over the sewer path.</li>
          <li>A plumber has quoted a sewer repair and you want to see the defect before agreeing.</li>
          <li>Wet spots, sinkholes, or unusually green strips appear in the yard over the sewer path.</li>
        </ul>
        <h3 className="mt-6 text-lg font-extrabold text-blue-950">A camera is the wrong test when:</h3>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-slate-600">
          <li>
            <strong className="text-blue-950">Only one fixture drains slowly.</strong>{" "}
            That is usually a local clog in that fixture&apos;s trap or
            branch — a camera will not help, and a drain cleaning comes
            first.
          </li>
          <li>
            <strong className="text-blue-950">Your water meter is spinning or the bill jumped.</strong>{" "}
            A sewer leak cannot move the meter: the sewer carries water
            away, it does not bring it in. A moving meter points to a
            supply-side leak — a slab leak, a yard line, or a running
            fixture — and needs a different test.
          </li>
          <li>
            <strong className="text-blue-950">There is a warm spot on the floor or the sound of running water.</strong>{" "}
            Those are signs of a pressurized supply leak under the slab, not
            a sewer problem. That is a{" "}
            <Link href="/services/slab-leak-detection/" className="font-bold text-blue-800 hover:underline">
              slab leak detection
            </Link>{" "}
            job — acoustic listening and pressure testing, not a camera.
          </li>
        </ul>
        <p className="mt-5 text-slate-600">
          In short: sewer symptoms get a camera; supply-side symptoms get
          slab or yard-line detection. If you are not sure which side your
          symptoms sit on, describe them to a local pro before booking
          either test.
        </p>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-14">
          <h2 className="text-2xl font-extrabold text-blue-950">Sewer camera cost — questions, answered</h2>
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
              Sewer camera inspection &amp; diagnosis →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              How a camera inspection works, what equipment is used, and what the video and written diagnosis cover.
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
            <Link href="/services/slab-leak-detection/" className="font-bold text-blue-800 hover:underline">
              Slab leak detection →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              For supply-side leaks under the slab — warm spots, running-water sounds, and a spinning meter need this test, not a camera.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/tools/leak-cost-estimator/" className="font-bold text-blue-800 hover:underline">
              Leak Cost Estimator →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              Estimate leak detection and repair costs for your Texas town from researched per-town prices — including sewer camera work.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/tools/home-buyer-leak-risk/" className="font-bold text-blue-800 hover:underline">
              Home-Buyer Leak Risk Report →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              Buying a Texas home? Get slab and sewer risk bands, expected inspection costs, and an option-period checklist for that home.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/tools/water-bill-spike/" className="font-bold text-blue-800 hover:underline">
              Water Bill Spike Splitter →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              Not sure which side your leak is on? Split a bill spike into leak vs rate increase first — a usage-driven spike points to a supply leak, not a sewer problem.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="font-bold text-blue-950">Local guides with real data: </span>
            <Link href="/tx/houston/katy/" className="font-bold text-blue-800 hover:underline">Katy, TX</Link>
            {" · "}
            <Link href="/tx/dallas/plano/" className="font-bold text-blue-800 hover:underline">Plano, TX</Link>
            {" · "}
            <Link href="/tx/austin/round-rock/" className="font-bold text-blue-800 hover:underline">Round Rock, TX</Link>
            <p className="mt-1 text-sm text-slate-600">
              Every town guide covers sewer camera prices with verified local soil, housing-era, and pipe data.
            </p>
          </li>
        </ul>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">Methodology &amp; sources</h2>
        <p className="mt-3 text-slate-600">
          Texas prices on this page come from our researched town dataset:
          100 towns across 10 metros, each with a researched{" "}
          <code className="rounded bg-slate-100 px-1 text-sm">price_sewer_camera</code>{" "}
          value (research-csvs/*-towns.csv). Most metros publish one
          metro-typical range rather than a different price per town, so
          metro tables show that range. Two values were handled with care:
          the McAllen cell is a hydrostatic-test price, not a camera price,
          and is shown as such; an Austin figure of $260–$1,700 from
          Angi&apos;s Austin sewer cost data covers broader sewer work, not
          a standalone camera inspection, so it is excluded from the camera
          range. Katy&apos;s $175–$350 camera range is also confirmed in
          the Nov 8 Katy QA ground-truth row.
        </p>
        <p className="mt-3 text-slate-600">
          National ranges come from the competitor pages studied in the
          Nov 16, 2026 SERP study (§B4): callmarsnow.com (San Diego,
          $125–$500, cleanout-access detail), servantplumbingatl.com
          ($150–$400), psvplumbinginc.com ($100–$600, with the tier table:
          basic $100–$350, with report/dye $250–$600, new cleanout
          $700–$2,000+; cites a HomeAdvisor average of $996 bundled),
          procraftlocal.com ($150–$450, table by access type),
          plumbers911chicago.com ($150–$500, dated Oct 6, 2026), and
          njpipedr.com (national report, average $280). The study found no
          Texas page in the top results for this query. The $5,000–$20,000
          sewer-replacement comparison is the figure national cost guides
          state against a $250 scope.
        </p>
        <p className="mt-3 text-slate-600">
          Soil and housing-era facts: Katy&apos;s expansive gumbo clay and
          pre-1980 cast-iron / galvanized pipe era come from our researched
          town data; the Blackland Prairie clay and 1950s–70s cast-iron
          drains around Richardson are also documented in the Nov 16
          competitor study. Prices were researched in November 2026 and
          will change — confirm the price with a local plumber before
          booking.
        </p>
        <p className="mt-6 text-xs text-slate-400">
          Disclaimer: prices on this page are typical ranges from published
          and researched sources, not a quote. The exact price depends on
          line length, access, pipe condition, and metro. Only a local
          plumber who has seen your line can quote your job.
        </p>
      </section>

      <CtaBand
        title="Need a sewer scope?"
        subtitle="Describe your symptoms — a local pro can tell you honestly whether you need a camera, a different test, or nothing at all."
      />
    </>
  );
}
