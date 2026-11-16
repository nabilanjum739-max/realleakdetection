import Link from "next/link";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { breadcrumbListSchema, faqPageSchemaFromQAs } from "@/lib/schema";
import BillSpikeSplitter from "@/components/BillSpikeSplitter";
import CtaBand from "@/components/CtaBand";

/**
 * Water Bill Spike Splitter — tool page #1.
 * One tool, one query: "why is my water bill so high?"
 *
 * Server-rendered by design (tools-research §7 checklist): the tool is
 * interactive, but the methodology, a worked example with real arithmetic,
 * a no-JS fallback table, and the FAQ are all in the HTML — the page is
 * complete before any JavaScript runs.
 *
 * FAQ answers are 50–80 words each (verified by hand at write time).
 * The visible FAQ block and the FAQPage schema are rendered from the same
 * FAQS constant, so they can never drift apart.
 */

export const metadata: Metadata = {
  title: "Water Bill Spike Splitter — Find the Leak".slice(0, 60),
  description:
    "Your water bill jumped? Split the spike into leak vs rate increase, estimate extra gallons and cost, and find the likely leak type. Free tool, no signup.".slice(
      0,
      155
    ),
  alternates: { canonical: `${SITE_URL}/tools/water-bill-spike/` },
};

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "Is a sudden water bill spike always a leak?",
    a: "No — and that is why this tool splits the spike. A bill can jump because your utility raised rates, moved you into a higher tier, estimated a reading instead of reading the meter, or charged higher sewer fees. Extra people, guests, a filled pool, or new lawn watering can also push usage up. If the split shows most of the increase is usage, not rates, a leak becomes the most likely explanation — and the meter test confirms it.",
  },
  {
    q: "How much water does a running toilet waste?",
    a: "About 200 gallons a day, according to the EPA — roughly 6,000 gallons in a month, enough to double many household bills. The worst part is that most running toilets are silent: a worn flapper lets water seep from the tank into the bowl without any sound. Put a few drops of food coloring in the tank and wait 15 minutes — if the bowl water changes color without flushing, the flapper is leaking and needs replacing.",
  },
  {
    q: "What if my household grew — is the spike still a leak?",
    a: "Maybe not — and the per-person numbers tell you. Divide each bill's gallons by the people in the house and the days in the billing period: the EPA benchmark is about 82 gallons per person per day. If your per-person use stayed near that level while total gallons rose, the extra people explain the bill. If per-person use jumped too, a leak is still the likely cause — extra people don't change how much water each person uses.",
  },
  {
    q: "Does the city adjust my bill if it was a leak?",
    a: "Many water utilities offer a one-time leak adjustment — a credit for part of the excess usage — but the rules are set by your utility, not by us, and they vary. Most require proof of repair, a plumber's invoice, and a request within 30 to 90 days of the repair. Some allow one adjustment per year; some credit only part of the excess. Call your utility, ask for its leak-adjustment policy, and keep every bill and invoice as evidence.",
  },
  {
    q: "What should I do next after a bill spike?",
    a: "First, run the overnight meter test: turn off all water, note the meter reading, and check it again in the morning. If the reading moved, water is escaping and you have a leak. Note the date, keep both bills, and take a photo of the meter. Then call a leak-detection pro — non-invasive equipment can pinpoint the leak without digging — and ask for the findings in writing, because that report is what your utility or insurer asks for.",
  },
  {
    q: "My bill shows CCF, not gallons — what is that?",
    a: "CCF means 100 cubic feet of water, and one CCF equals 748 gallons — US water bills use it. To use this tool, multiply your CCF figure by 748 to get gallons: 10 CCF is 7,480 gallons, 15 CCF is 11,220 gallons. Your bill may also show the same usage in gallons somewhere on the page, often in smaller print near the meter reading. If the numbers still don't match, call your utility and ask which unit the bill uses.",
  },
];

const TOOL_PATH = "/tools/water-bill-spike/";

export default function WaterBillSpikePage() {
  const faqSchema = faqPageSchemaFromQAs(FAQS);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbListSchema([
              { name: "Home", path: "/" },
              { name: "Water Bill Spike Splitter", path: TOOL_PATH },
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
            <span className="text-white">Water Bill Spike Splitter</span>
          </nav>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            Why is my water bill so high?
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-blue-100">
            A bill that suddenly jumps is the #1 warning sign of a hidden
            leak — but it can also be a rate increase. This free tool splits
            the spike into the leak part and the rate part, estimates what
            the extra water costs, and tells you the most likely leak type.
          </p>
        </div>
      </section>

      <BillSpikeSplitter />

      <section className="mx-auto max-w-4xl px-4 py-14">
        <h2 className="text-2xl font-extrabold text-blue-950">How the split is calculated</h2>
        <p className="mt-3 text-slate-600">
          Every number on this page comes from your own two bills — nothing
          is guessed, and no utility rate is invented. Here is the exact
          method, in plain words:
        </p>
        <ol className="mt-5 list-decimal space-y-3 pl-6 text-slate-600">
          <li>
            <strong className="text-blue-950">Extra gallons</strong> = current bill gallons − previous bill gallons.
          </li>
          <li>
            <strong className="text-blue-950">Extra gallons per day</strong> = extra gallons ÷ days in the billing period.
          </li>
          <li>
            <strong className="text-blue-950">Implied rate</strong> = bill dollars ÷ bill gallons, worked out separately for
            each bill. If you type in your own cost per 1,000 gallons, that rate is used instead.
          </li>
          <li>
            <strong className="text-blue-950">Usage-driven cost</strong> (the leak estimate) = extra gallons × the
            previous bill&apos;s implied rate.
          </li>
          <li>
            <strong className="text-blue-950">Rate-driven cost</strong> = total dollar increase − usage-driven cost
            (never below $0). If the two bills&apos; implied rates differ, the cost is shown as a range between them.
          </li>
          <li>
            <strong className="text-blue-950">Per-person use</strong> = gallons ÷ people ÷ days. The typical benchmark is
            about 82 gallons per person per day (EPA WaterSense).
          </li>
          <li>
            <strong className="text-blue-950">Likely leak type</strong> is a rough band by extra gallons per day: under 25
            is a small, steady loss (toilet flapper, dripping faucet); 25–200 is a medium loss (running toilet,
            supply-line leak); over 200 is a large loss (slab leak, broken yard/main line). A likelihood, not a
            diagnosis — only on-site detection can confirm a leak.
          </li>
        </ol>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">Worked example — a household of 4</h2>
        <p className="mt-3 text-slate-600">
          Example numbers, clearly labeled as an example — your own bills
          will give your own result:
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
              <tr><td className="p-4 font-semibold">Previous bill</td><td className="p-4">8,000 gal · $64</td><td className="p-4">Implied rate: $8.00 per 1,000 gal</td></tr>
              <tr><td className="p-4 font-semibold">Current bill</td><td className="p-4">14,000 gal · $112</td><td className="p-4">Implied rate: $8.00 per 1,000 gal</td></tr>
              <tr><td className="p-4 font-semibold">Extra water</td><td className="p-4">14,000 − 8,000 gal</td><td className="p-4">6,000 gal in a 30-day month</td></tr>
              <tr><td className="p-4 font-semibold">Extra per day</td><td className="p-4">6,000 ÷ 30 days</td><td className="p-4">200 gal/day</td></tr>
              <tr><td className="p-4 font-semibold">Extra cost</td><td className="p-4">6,000 × $8 ÷ 1,000</td><td className="p-4">$48 — all of it usage, $0 from rates</td></tr>
              <tr><td className="p-4 font-semibold">Per person</td><td className="p-4">8,000 ÷ 4 ÷ 30 → 14,000 ÷ 4 ÷ 30</td><td className="p-4">67 → 117 gal/person/day (typical ≈ 82)</td></tr>
              <tr><td className="p-4 font-semibold">Likely leak type</td><td className="p-4">200 gal/day band</td><td className="p-4">Medium loss — running toilet or supply-line leak (likelihood)</td></tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          A running toilet wastes about 200 gallons a day (EPA) — this
          household&apos;s numbers match that pattern, which is why the tool
          flags it. The overnight meter test would confirm it.
        </p>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">Quick reference — no calculator needed</h2>
        <p className="mt-3 text-slate-600">
          If you can&apos;t use the interactive tool, this table gives the same
          answers for three common spike sizes. Costs use the example rate of
          $8 per 1,000 gallons — your rate comes from your own bill.
        </p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600">
                <th className="p-4 font-bold">Extra gallons in a month</th>
                <th className="p-4 font-bold">Extra per day (30 days)</th>
                <th className="p-4 font-bold">Estimated extra cost</th>
                <th className="p-4 font-bold">Most likely cause (rough)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr><td className="p-4 font-semibold">300 gal</td><td className="p-4">10 gal/day</td><td className="p-4">about $2–$3</td><td className="p-4">Dripping faucet or flapper seep</td></tr>
              <tr><td className="p-4 font-semibold">3,000 gal</td><td className="p-4">100 gal/day</td><td className="p-4">about $24</td><td className="p-4">Running toilet or supply-line leak</td></tr>
              <tr><td className="p-4 font-semibold">9,000 gal</td><td className="p-4">300 gal/day</td><td className="p-4">about $72</td><td className="p-4">Slab leak or broken yard/main line</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-14">
          <h2 className="text-2xl font-extrabold text-blue-950">Water bill spike — questions, answered</h2>
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
              Turn off all water, note the meter, check it in the morning. If it moved, water is escaping.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/services/slab-leak-detection/" className="font-bold text-blue-800 hover:underline">
              Slab leak detection →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              For large losses: how acoustic and thermal equipment pinpoints a leak under concrete without digging.
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
          rate or a bill adjustment.
        </p>
      </section>

      <CtaBand
        title="Bill still high after the split?"
        subtitle="Describe your numbers — a local pro can tell you honestly whether you need detection or something else."
      />
    </>
  );
}
