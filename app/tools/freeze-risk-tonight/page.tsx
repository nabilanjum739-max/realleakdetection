import Link from "next/link";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { breadcrumbListSchema, faqPageSchemaFromQAs } from "@/lib/schema";
import FreezeRiskTonight from "@/components/FreezeRiskTonight";
import CtaBand from "@/components/CtaBand";
import GuideVideo from "@/components/GuideVideo";

/**
 * Freeze-Burst Risk Tonight — tool page #2.
 * One tool, one query: "will my pipes freeze tonight?"
 *
 * Server-rendered by design (tools-research §7 checklist): the tool is
 * interactive, but the methodology, a worked example with real archive
 * numbers, a no-JS fallback table, and the FAQ are all in the HTML —
 * the page is complete before any JavaScript runs.
 *
 * FAQ answers are 50–80 words each (verified by hand at write time).
 * The visible FAQ block and the FAQPage schema are rendered from the same
 * FAQS constant, so they can never drift apart.
 */

export const metadata: Metadata = {
  title: "Will My Pipes Freeze Tonight? Free Tool".slice(0, 60),
  description:
    "Tonight's pipe freeze-burst risk for any Texas town — forecast low, hours below freezing, and what to do before bed. Free tool, no signup.".slice(
      0,
      155
    ),
  alternates: { canonical: `${SITE_URL}/tools/freeze-risk-tonight/` },
};

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "At what temperature do pipes freeze?",
    a: "Water freezes at 32°F, but a pipe needs sustained cold to freeze — a brief dip to 31°F rarely bursts an indoor pipe. The risk grows the longer it stays below freezing and the colder it gets. The University of Illinois Building Research Council puts the alert threshold at 20°F: at or below that, exposed pipes can freeze and burst within hours. Pipes in attics, garages, exterior walls, and crawl spaces freeze first because they sit in unheated air.",
  },
  {
    q: "Will my pipes burst tonight, or just freeze?",
    a: "Freezing and bursting are different: water expands as it freezes, and the pressure it builds can split a pipe — but many frozen pipes thaw without bursting. This tool estimates freeze risk, not a burst prediction: a High band means the conditions that burst pipes are present, not that your pipes will burst. Insulation, pipe location, and whether water is moving all change the outcome, which is why the band is guidance, never a guarantee.",
  },
  {
    q: "Should I let my faucets drip tonight?",
    a: "Yes, when the risk is Watch or High: let cold-water taps on exterior walls drip. Moving water is much harder to freeze than still water, and an open tap gives expanding ice somewhere to go, which relieves pressure inside the pipe. A slow drip costs a few gallons; a burst pipe can waste thousands of gallons and flood a home. Open cabinet doors under sinks on exterior walls so warm room air reaches the pipes, and disconnect garden hoses.",
  },
  {
    q: "What pipes freeze first in Texas homes?",
    a: "Exposed outdoor pipes first: hose bibs, irrigation and sprinkler lines, pool equipment, and any pipe in an unheated attic, garage, or crawl space. Texas homes are more exposed than northern ones because pipes often run through attics and exterior walls with little insulation — builders never expected week-long freezes. Winter Storm Uri in February 2021 burst pipes across the state for exactly that reason; about 511,000 insurance claims were filed statewide.",
  },
  {
    q: "How accurate is tonight's forecast?",
    a: "The forecast comes from Open-Meteo's weather models, refreshed by our nightly run and fetched live when the stored forecast is stale. Forecasts are good at the direction — cold or not — and usually within a few degrees on the low, but a forecast is not a measurement. If the tool says Watch and your thermometer reads colder, trust your thermometer: drip the faucets and insulate the exposed lines. The risk band is guidance for tonight, not a guarantee.",
  },
  {
    q: "What should I do if a pipe already burst?",
    a: "Shut off your water valve — where the line enters the house — then open a faucet to drain the pressure. Call your water utility if the break is before the meter; call a pro if it is inside. Take photos, keep receipts, and note the date: your insurer and the utility's leak-adjustment policy both ask for them. Never thaw a pipe with a torch or open flame — use a hair dryer, or towels soaked in hot water.",
  },
];

const TOOL_PATH = "/tools/freeze-risk-tonight/";

export default function FreezeRiskTonightPage() {
  const faqSchema = faqPageSchemaFromQAs(FAQS);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbListSchema([
              { name: "Home", path: "/" },
              { name: "Freeze-Burst Risk Tonight", path: TOOL_PATH },
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
            <span className="text-white">Freeze-Burst Risk Tonight</span>
          </nav>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            Will my pipes freeze tonight?
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-blue-100">
            Tonight&apos;s pipe freeze-burst risk for your Texas town — the
            forecast low, how many hours it stays below freezing, and what
            to do before bed. Free tool, no signup, no invented numbers:
            every figure comes from tonight&apos;s forecast.
          </p>
        </div>
      </section>

      <FreezeRiskTonight />

      {/* Video demo — renders nothing until a real videoId is registered
          in lib/videos.ts for this page. */}
      <GuideVideo pageKey="/tools/freeze-risk-tonight/" />

      <section className="mx-auto max-w-4xl px-4 py-14">
        <h2 className="text-2xl font-extrabold text-blue-950">How the risk band is calculated</h2>
        <p className="mt-3 text-slate-600">
          &ldquo;Tonight&rdquo; means 6pm today to 9am tomorrow, Central time
          (America/Chicago) — the hours when pipes actually freeze. The
          forecast is the Open-Meteo forecast at your town&apos;s own
          coordinates, refreshed by our nightly run and fetched live when
          the stored forecast is stale. Nothing is guessed:
        </p>
        <ol className="mt-5 list-decimal space-y-3 pl-6 text-slate-600">
          <li>
            <strong className="text-blue-950">Tonight&apos;s low</strong> = the coldest hourly temperature in
            the 6pm–9am window.
          </li>
          <li>
            <strong className="text-blue-950">Hours below freezing</strong> = how many of the 16 hourly
            readings in that window are below 32°F.
          </li>
          <li>
            <strong className="text-blue-950">Hard-freeze hours</strong> = how many readings are at or
            below 20°F.
          </li>
          <li>
            <strong className="text-blue-950">The band</strong> follows the table below — the same rule in
            the tool and in the nightly script, so the two can never
            disagree.
          </li>
        </ol>

        <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200">
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
                <td className="p-4">Water in pipes stays liquid. No freeze precautions needed tonight.</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-amber-700">Watch</td>
                <td className="p-4">Below 32°F, but above 28°F, and fewer than 4 hours below freezing</td>
                <td className="p-4">A brief freeze. Exposed pipes, hose bibs, and irrigation lines can freeze; indoor pipes are usually fine.</td>
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
          below 20°F, exposed pipes can freeze and burst within hours. The
          same 20°F alert threshold is used by Homeowner Basics and
          Bellevue Plumber Pro. The band is guidance, not a guarantee —
          pipe location, insulation, wind, and whether water is moving all
          change the outcome, and a forecast is not a measurement.
        </p>
        <p className="mt-3 text-slate-600">
          <strong className="text-blue-950">How fresh is the forecast?</strong> A workflow refreshes
          tonight&apos;s forecast for all 100 towns every night in freeze
          season (November–March, 02:00 UTC) and weekly in summer. The
          tool shows whether its number came from that nightly file or a
          live fetch, and the date of the night it covers. If the nightly
          run ever fails, the tool hides the stored forecast and fetches
          live — it never shows yesterday&apos;s risk as tonight&apos;s.
        </p>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">Worked example — Katy, the night Winter Storm Uri hit</h2>
        <p className="mt-3 text-slate-600">
          Real numbers from the Open-Meteo archive (ERA5 reanalysis),
          hourly temperature at Katy, TX (29.7858, −95.8244), for the night
          of February 14, 2021:
        </p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600">
                <th className="p-4 font-bold">Measure</th>
                <th className="p-4 font-bold">That night in Katy</th>
                <th className="p-4 font-bold">Band</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr><td className="p-4 font-semibold">Tonight&apos;s low</td><td className="p-4">14.4°F</td><td className="p-4" rowSpan={3}>High — hard freeze</td></tr>
              <tr><td className="p-4 font-semibold">Hours below 32°F</td><td className="p-4">16 of 16 readings</td></tr>
              <tr><td className="p-4 font-semibold">Hours at or below 20°F</td><td className="p-4">7 hours</td></tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          Every single hour of that night stayed below freezing, and the
          low reached 14.4°F — the kind of night that bursts pipes across
          a whole state. About 511,000 Winter Storm Uri insurance claims
          were filed in Texas (Texas Department of Insurance). That is why
          this tool exists: a High band on a night like that is the moment
          to drip the faucets and insulate the exposed lines.
        </p>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">Typical freeze season — no forecast needed</h2>
        <p className="mt-3 text-slate-600">
          If you can&apos;t use the interactive tool, this table shows how
          often each metro typically freezes in a winter month. It is
          seasonal background, not tonight&apos;s forecast: an average night
          count, not a prediction.
        </p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600">
                <th className="p-4 font-bold">Metro (center)</th>
                <th className="p-4 font-bold">December</th>
                <th className="p-4 font-bold">January</th>
                <th className="p-4 font-bold">February</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr><td className="p-4 font-semibold">Houston</td><td className="p-4">1.0 nights</td><td className="p-4">3.4 nights</td><td className="p-4">3.0 nights</td></tr>
              <tr><td className="p-4 font-semibold">Dallas</td><td className="p-4">2.4 nights</td><td className="p-4">10.0 nights</td><td className="p-4">8.0 nights</td></tr>
              <tr><td className="p-4 font-semibold">San Antonio</td><td className="p-4">1.6 nights</td><td className="p-4">3.8 nights</td><td className="p-4">3.2 nights</td></tr>
              <tr><td className="p-4 font-semibold">Austin</td><td className="p-4">1.4 nights</td><td className="p-4">4.8 nights</td><td className="p-4">4.8 nights</td></tr>
              <tr><td className="p-4 font-semibold">Fort Worth</td><td className="p-4">2.2 nights</td><td className="p-4">9.2 nights</td><td className="p-4">7.8 nights</td></tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          Average nights per month with a low below 32°F, winters 2020–21
          through 2024–25, from the Open-Meteo archive (ERA5 reanalysis,
          daily minimum temperature at each metro center). Averages hide
          the range: in the coldest of those five winters, Dallas had 17
          January freeze nights; in the mildest, 4. North Texas freezes
          about three times as often as the Gulf Coast — check tonight&apos;s
          tool, not the average, before bed.
        </p>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-14">
          <h2 className="text-2xl font-extrabold text-blue-950">Pipe freeze tonight — questions, answered</h2>
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
          Disclaimer: this tool gives guidance from tonight&apos;s forecast. It is a screening aid, not a burst
          prediction and never a quote. Only on-site inspection can confirm a frozen or burst pipe, and only your
          utility can confirm your rate or a bill adjustment.
        </p>
      </section>

      <CtaBand
        title="Pipe already burst after a freeze?"
        subtitle="Shut off the main valve first — then describe what happened, and a local pro can tell you honestly what needs detection."
      />
    </>
  );
}
