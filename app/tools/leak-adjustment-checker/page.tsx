import Link from "next/link";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { breadcrumbListSchema, faqPageSchemaFromQAs } from "@/lib/schema";
import { UTILITY_RULES } from "@/lib/utility-rules";
import LeakAdjustmentChecker from "@/components/LeakAdjustmentChecker";
import CtaBand from "@/components/CtaBand";

/**
 * MUD / Utility Leak-Adjustment Eligibility Checker + Application Pack —
 * tool page #3 (SERP/SWOT §A2 tool #1).
 * One tool, one query: "can I get money back for my leak, and how?"
 *
 * Server-rendered by design (tools-research §7 checklist): the tool is
 * interactive, but the methodology, the full verified rule table, a worked
 * example with real arithmetic, and the FAQ are all in the HTML — the page
 * is complete before any JavaScript runs.
 *
 * Honesty rule, stated on the page and enforced in the component: the
 * researched rules cover the ANCHOR CITY's utility only. None of our 10
 * towns in the Houston, Dallas, San Antonio, Austin, or Fort Worth metros
 * is served by the anchor-city utility, so the tool never shows an
 * anchor-city rule as a town's rule. McAllen, Corpus Christi (water-side),
 * and Lubbock have no published leak-adjustment policy — the tool says so
 * plainly. Fort Worth's rule rests on a March 2021 form copy and must be
 * re-verified on a live city page.
 *
 * FAQ answers are 50–80 words each (verified by hand at write time).
 * The visible FAQ block and the FAQPage schema are rendered from the same
 * FAQS constant, so they can never drift apart.
 */

export const metadata: Metadata = {
  title: "Leak Adjustment Checker — Texas Utility Rules".slice(0, 60),
  description:
    "Will your utility credit your leak bill? Check your town's real rule, get a verdict, an estimated credit, and a ready application pack.".slice(
      0,
      155
    ),
  alternates: { canonical: `${SITE_URL}/tools/leak-adjustment-checker/` },
};

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "What is an excusable defect?",
    a: "It is the phrase Houston and Harris County MUD 71 use for a leak that qualifies for a credit: a rupture or leak caused by weather, settlement, corrosion, wear, or accident — a hidden failure. Visible leaks do not count: a dripping faucet, a worn hose, or a fixture out of repair is excluded. If your leak was underground, behind a wall, or under the slab, it is the kind of defect these rules mean.",
  },
  {
    q: "How long do I have to file for a leak adjustment?",
    a: "It depends entirely on your utility, and the deadlines are short: Houston allows six months from the repair date, Dallas and Austin allow 90 days, Fort Worth and El Paso allow 60 days, and MUD 71 allows three months. SAWS and Amarillo publish no deadline at all, which is not the same as having no deadline — file promptly and confirm it when you call. The tool counts the days from your repair date.",
  },
  {
    q: "What if my MUD has no policy?",
    a: "No published rule exists, and this tool will not invent one. McAllen, Lubbock, and Corpus Christi (water-side) have no leak-adjustment policy, and some MUDs decide case by case at a board meeting. Call the utility or MUD operator on your bill and ask whether a credit is reviewed, what the deadline is, and what proof is needed — then write the answer down with the date. Keep your plumber's invoice; it is the document every case-by-case decision rests on.",
  },
  {
    q: "What proof does my utility need for a leak adjustment?",
    a: "Utilities ask for the same evidence: the repair date, the type of repair, and the cost, backed by a plumber's invoice or receipt. Houston also accepts a receipt for parts or a statement; SAWS accepts receipts or a description of the repair. MUD 71 goes further — a sworn application plus proof that you registered your meter on Eye On Water. The plumber's invoice is what makes the claim work, so get it before the plumber leaves.",
  },
  {
    q: "How much money will I get back from a leak adjustment?",
    a: "It depends on your utility's formula — some publish none. Houston credits 100% of the water charge on usage above average if repaired within 30 days, 75% within 60, and 50% after that. Austin, Fort Worth, El Paso, and MUD 71 credit 50% of the excess. Dallas reprices the excess at its lowest rate instead of a percentage, and SAWS and Amarillo publish no percentage. The tool applies your utility's formula to your own bills — never a made-up rate.",
  },
  {
    q: "Does a leak adjustment fix my sewer charges too?",
    a: "Usually not. Houston's adjustment covers water and wastewater, and Corpus Christi's ordinance lets the director adjust the wastewater bill for a hidden leak in the winter quarter. But Dallas, Fort Worth, and El Paso state that their adjustment is water-only, so a leak in the December-to-February averaging months still inflates your sewer average for the next twelve months. Brushy Creek MUD is the exception: it corrects the sewer average, with no water-side credit at all.",
  },
];

const TOOL_PATH = "/tools/leak-adjustment-checker/";
const VERIFIED_RULES = UTILITY_RULES.filter((r) => r.verified);

export default function LeakAdjustmentCheckerPage() {
  const faqSchema = faqPageSchemaFromQAs(FAQS);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbListSchema([
              { name: "Home", path: "/" },
              { name: "Leak Adjustment Checker", path: TOOL_PATH },
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
            <span className="text-white">Leak Adjustment Checker</span>
          </nav>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            Can I get money back for my leak?
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-blue-100">
            Most Texas water utilities will credit part of a leak bill — but
            only under their own rule, only inside their deadline, and only
            with proof of repair. This free tool finds your actual
            utility&apos;s published rule, judges your eligibility against
            it, estimates the credit, and drafts your application pack.
          </p>
          <p className="mt-4 max-w-2xl text-base font-semibold text-amber-300">
            One honest limit: the rules below cover each anchor city&apos;s
            utility — Houston, Dallas, San Antonio, Austin, Fort Worth — and
            the verified MUDs. The towns around those cities have their own
            utilities, and we will not show you the anchor city&apos;s rule
            as if it were yours.
          </p>
        </div>
      </section>

      <LeakAdjustmentChecker />

      <section className="mx-auto max-w-4xl px-4 py-14">
        <h2 className="text-2xl font-extrabold text-blue-950">How the check works</h2>
        <p className="mt-3 text-slate-600">
          Every rule on this page was read from an official city, utility, or
          MUD source on November 16, 2026 — the check date shown with each
          rule. Nothing is guessed, and no utility rate is invented. Here is
          the exact method, in plain words:
        </p>
        <ol className="mt-5 list-decimal space-y-3 pl-6 text-slate-600">
          <li>
            <strong className="text-blue-950">Find your utility.</strong>{" "}
            Pick your town, or pick your utility directly. A town is matched
            only to a utility verified to serve it: El Paso serves El Paso,
            Amarillo serves Amarillo, MUD 71 serves parts of Cypress, Brushy
            Creek MUD serves the Brushy Creek community near Round Rock, and
            Woodlands Water serves The Woodlands. Every other town in the
            Houston, Dallas, San Antonio, Austin, and Fort Worth metros is
            served by its own city system or MUD — not by the anchor city —
            so those towns get an honest &ldquo;not verified yet&rdquo; and
            instructions for finding their rule, never the anchor
            city&apos;s rule.
          </li>
          <li>
            <strong className="text-blue-950">Excess usage</strong> = leak-month gallons − normal-month gallons.
            A leak adjustment credits usage above your average — with no
            excess, there is nothing to adjust.
          </li>
          <li>
            <strong className="text-blue-950">Excess cost</strong> comes from your own numbers only: the
            difference between your two bills&apos; dollar amounts, or
            excess gallons × your cost per 1,000 gallons from your bill.
          </li>
          <li>
            <strong className="text-blue-950">Eligibility verdict</strong> is judged against your
            utility&apos;s published rule — what qualifies, whether the leak
            was hidden, whether usage returned to normal, whether you already
            had an adjustment inside the frequency limit, and whether the
            filing deadline has passed. Every reason is shown.
          </li>
          <li>
            <strong className="text-blue-950">Estimated credit</strong> applies your utility&apos;s real
            formula to your excess cost: Houston&apos;s 100% / 75% / 50%
            tiers by repair speed, 50% for Austin, Fort Worth, El Paso, and
            MUD 71. Dallas reprices at its lowest rate and SAWS and Amarillo
            publish no percentage, so no dollar estimate is possible for
            them — the tool says so instead of guessing.
          </li>
          <li>
            <strong className="text-blue-950">Deadline countdown</strong> = repair date + your
            utility&apos;s filing deadline in days. It is calculated when
            you run the check and does not update on its own — re-run the
            check for a fresh count.
          </li>
        </ol>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">
          Worked example — a Houston household
        </h2>
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
              <tr><td className="p-4 font-semibold">Normal month</td><td className="p-4">8,000 gal · $64</td><td className="p-4">Baseline usage</td></tr>
              <tr><td className="p-4 font-semibold">Leak month</td><td className="p-4">24,000 gal · $190</td><td className="p-4">Hidden slab leak, repaired 12 days after it started</td></tr>
              <tr><td className="p-4 font-semibold">Excess usage</td><td className="p-4">24,000 − 8,000 gal</td><td className="p-4">16,000 gal</td></tr>
              <tr><td className="p-4 font-semibold">Excess cost</td><td className="p-4">$190 − $64</td><td className="p-4">$126</td></tr>
              <tr><td className="p-4 font-semibold">Houston tier</td><td className="p-4">Repaired within 30 days → 100%</td><td className="p-4">Estimated credit: $126</td></tr>
              <tr><td className="p-4 font-semibold">If repaired after 60 days</td><td className="p-4">Same excess, 50% tier</td><td className="p-4">Estimated credit: $63</td></tr>
              <tr><td className="p-4 font-semibold">Deadline</td><td className="p-4">Repair date + 180 days</td><td className="p-4">File within 6 months of the repair</td></tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          The same 16,000 gallons would be worth a different amount under
          another utility&apos;s rule — 50% ($63) in Austin, Fort Worth, El
          Paso, or MUD 71 — and no dollar figure at all under Dallas&apos;s
          lowest-rate reprice or SAWS&apos;s unpublished portion. That is why
          the tool never applies one utility&apos;s rule to another
          utility&apos;s customer.
        </p>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">
          Published methodology — every verified rule, with its source
        </h2>
        <p className="mt-3 text-slate-600">
          This table is the tool&apos;s whole rule book, and it works without
          JavaScript: the same rules the interactive checker uses, with the
          official source and the date each rule was checked. &ldquo;No
          published policy&rdquo; means exactly that — the research pass
          found no policy, form, deadline, or formula on the official
          sources, not that no credit exists. Rules change; check the
          official page before you file.
        </p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600">
                <th className="p-4 font-bold">Utility</th>
                <th className="p-4 font-bold">Credit / formula</th>
                <th className="p-4 font-bold">Deadline</th>
                <th className="p-4 font-bold">Frequency</th>
                <th className="p-4 font-bold">Max months</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {VERIFIED_RULES.map((r) => (
                <tr key={r.utility}>
                  <td className="p-4">
                    <span className="font-semibold">{r.utility}</span>
                    <span className="block text-xs text-slate-500">
                      {r.townSlugs.length > 0
                        ? `Verified for: ${r.townSlugs.join(", ")} (verify by address)`
                        : "Anchor city only — none of our towns in this metro is served by it"}
                    </span>
                    <a
                      href={r.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block text-xs font-bold text-blue-800 hover:underline"
                    >
                      Official source · checked {r.checkedDate}
                    </a>
                  </td>
                  <td className="p-4">
                    {r.adjustment
                      ? r.adjustment.formula ?? "No % or formula published."
                      : "No published water-side policy."}
                  </td>
                  <td className="p-4">
                    {r.adjustment
                      ? r.adjustment.deadlineDays !== null
                        ? `${r.adjustment.deadlineDays} days from repair`
                        : "Not published"
                      : "—"}
                  </td>
                  <td className="p-4">
                    {r.adjustment ? r.adjustment.frequencyLimit ?? "Not published" : "—"}
                  </td>
                  <td className="p-4">
                    {r.adjustment
                      ? r.adjustment.maxMonths !== null
                        ? `Up to ${r.adjustment.maxMonths}`
                        : "Not published"
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-slate-600">
          <strong className="text-blue-950">Not in this table, on purpose:</strong>{" "}
          Harris County MUD 501 and MUD 82 (credit %, deadline, and frequency
          not readable or still under board consideration — only the Eye On
          Water precondition is verified) and Baker Road MUD (no standing
          policy; credits are granted case by case by board vote). The
          research also found no published policy for McAllen, Corpus Christi
          water-side, or Lubbock — those three are in the table as
          &ldquo;no published water-side policy&rdquo; rather than as rules.
        </p>
        <p className="mt-3 text-sm text-slate-600">
          <strong className="text-blue-950">Fort Worth — re-verify before you file:</strong>{" "}
          no live fortworthtexas.gov leak-adjustment page was found. The rule
          above rests on a copy of the city&apos;s March 2021 application
          form, corroborated by the City of Denton&apos;s official August
          2025 benchmark — all sources agree on every term, but check the
          live city page before relying on the deadline or the percentage.
        </p>
        <p className="mt-3 text-sm text-slate-600">
          <strong className="text-blue-950">Where the winter-average note fits:</strong>{" "}
          Dallas, Fort Worth, and El Paso state their adjustment is
          water-only, so a December–February leak still inflates the sewer
          average for the following year. Houston&apos;s adjustment covers
          water and wastewater. Corpus Christi&apos;s ordinance lets the
          director adjust the wastewater bill for a hidden leak in the
          winter quarter. Brushy Creek MUD corrects the sewer average only.
          For SAWS, Austin, Amarillo, Lubbock, and Woodlands Water it is
          unverified whether the adjustment corrects the winter average.
        </p>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-14">
          <h2 className="text-2xl font-extrabold text-blue-950">Leak adjustment — questions, answered</h2>
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
            <Link href="/tools/water-bill-spike/" className="font-bold text-blue-800 hover:underline">
              Water Bill Spike Splitter →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              Not sure the spike was a leak at all? Split the jump into the leak part and the rate part first — the excess gallons from that split are the numbers this checker needs.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/tools/insurance-claim-pack/" className="font-bold text-blue-800 hover:underline">
              Insurance Claim Pack Generator →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              If the leak also damaged your home, build the insurance pack next: coverage likelihood per cost bucket, deductible math, and a filled claim-letter draft.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/guides/leak-adjustment/" className="font-bold text-blue-800 hover:underline">
              Leak adjustment guides by city →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              The written rules behind this checker — per-city guides for San Antonio, Austin, Fort Worth, El Paso, Amarillo, plus the MUD explainer.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/tools/freeze-risk-tonight/" className="font-bold text-blue-800 hover:underline">
              Freeze-Burst Risk Tonight →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              If a freeze caused the leak, check tonight&apos;s risk for your town before the next cold night — and know where your main shutoff is.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/services/slab-leak-detection/" className="font-bold text-blue-800 hover:underline">
              Slab leak detection →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              For hidden leaks under concrete: how acoustic and thermal equipment pinpoints the leak without digging — and produces the written findings your utility or insurer asks for.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/guides/sewer-camera-inspection-cost-texas/" className="font-bold text-blue-800 hover:underline">
              Sewer camera inspection cost — Texas →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              If the leak was in a sewer line, a camera inspection shows what is actually wrong — and what it costs in Texas, by access type.
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
          Disclaimer: this tool gives guidance from your utility&apos;s
          published rule and the numbers you enter. It is not a guarantee
          that a credit will be granted, and it is never a quote. Only your
          utility decides a leak adjustment, only your utility can confirm
          its current rule and deadline, and only on-site leak detection can
          confirm a leak. Rules change — check the official page linked
          above before you file.
        </p>
      </section>

      <CtaBand
        title="Need the invoice your claim rests on?"
        subtitle="Book a detection visit that produces a claim-ready invoice — leak location, repair description, and date in writing."
      />
    </>
  );
}
