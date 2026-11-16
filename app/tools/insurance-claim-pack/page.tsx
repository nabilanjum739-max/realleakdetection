import Link from "next/link";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { breadcrumbListSchema, faqPageSchemaFromQAs } from "@/lib/schema";
import { HO_B_FACTS, DEDUCTIBLE_MATH } from "@/lib/texas-insurance";
import InsuranceClaimPack from "@/components/InsuranceClaimPack";
import CtaBand from "@/components/CtaBand";

/**
 * Insurance Claim Pack Generator — tool page #5.
 * One tool, one query: "does insurance cover my leak, and what do I file?"
 *
 * Server-rendered by design (tools-research §7 checklist): the tool is
 * interactive, but the methodology (every verified HO-B fact, with
 * sources), a no-JS fallback table of three example claim profiles, and
 * the FAQ are all in the HTML — the page is complete before any
 * JavaScript runs.
 *
 * FAQ answers are 50–80 words each (verified by hand at write time).
 * The visible FAQ block and the FAQPage schema are rendered from the same
 * FAQS constant, so they can never drift apart.
 *
 * Every coverage fact on this page comes from lib/texas-insurance
 * (HO_B_FACTS, CLAIM_CHECKLIST, DEDUCTIBLE_MATH), researched Nov 16,
 * 2026 from TDI and ISO HO-3 summaries. Nothing from the research
 * report's §6 UNVERIFIED list appears here.
 */

export const metadata: Metadata = {
  title: "Insurance Claim Pack Generator — Texas HO-B".slice(0, 60),
  description:
    "Build your Texas leak insurance claim pack: coverage likelihood per bucket, deductible math, document checklist, and a claim-letter draft. Free tool.".slice(
      0,
      155
    ),
  alternates: { canonical: `${SITE_URL}/tools/insurance-claim-pack/` },
};

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "Does insurance cover slab leaks in Texas?",
    a: "Sometimes — and the split matters. A Texas policy usually covers sudden and accidental water damage from a burst pipe, and it can cover the cost of tearing out the slab to reach the leak. It almost never covers the failed pipe itself, and it usually does not cover damage from a slow, gradual leak. Foundation damage is the contested part: the old HO-B form covered it, but modern company forms may word it differently, so check your own policy.",
  },
  {
    q: "What is tear-out coverage?",
    a: "Tear-out is the cost of opening a wall or slab to reach a hidden leak, and putting it back afterwards. The standard HO-3 form covers the cost to tear out and replace any part of the building, but only when necessary to repair the system. The failed pipe itself is not covered. Many Texas company forms narrow tear-out for lines in or below the slab, so the wording on your own form decides what access costs are covered.",
  },
  {
    q: "What documents do I need for a leak claim?",
    a: "Take dated photos and video of all damage, taken before cleanup or repair, and keep damaged items until the adjuster has seen them. Add a list of damaged property, a plumber's detection report stating the leak's location, cause, and how long it ran, and itemized repair invoices with detection, tear-out, repair, and restoration as separate lines. Keep water bills and meter readings from when symptoms began, receipts for temporary repairs, and a log of every call with the insurer.",
  },
  {
    q: "How long does my insurer have to decide my claim?",
    a: "Texas law sets the clock: the insurer must acknowledge your claim within 15 days, then accept or deny it within 15 business days of getting all the information it needs. A denial must be in writing, with reasons. If the company needs more time it can take 45 days to decide. Once it agrees to pay, it must pay within 5 business days. Keep a log of every call — those dates make the deadlines usable.",
  },
  {
    q: "Should I file a claim or pay for the repair myself?",
    a: "Compare the numbers first. Your insurer pays the covered loss minus your deductible, so if the covered repair cost is at or below your deductible, filing pays nothing. Filing also creates a claims record: most insurers report claims to CLUE, which keeps seven years of history, and a company may refuse coverage or charge more after repeated claims. This tool shows the arithmetic; it never tells you whether to file — that choice is yours, with your agent.",
  },
  {
    q: "Does my policy cover mold from a leak?",
    a: "Mold is covered only when the water loss that caused it was covered. TDI: mold on an item damaged by a sudden, accidental loss is covered, while mold from gradual leaks, seepage, or flooding is not. Even when covered, most policies cap mold cleanup with a sub-limit — national examples run $2,500–$15,000 — and most policies do not include mold cleanup and testing after the damaged item is removed. Check your declarations page for your limit.",
  },
];

const TOOL_PATH = "/tools/insurance-claim-pack/";

const BUCKET_LABELS: Record<string, string> = {
  "pipe repair": "Pipe repair",
  "tear-out": "Tear-out",
  "water damage": "Water damage",
  mold: "Mold",
  ale: "Additional living expenses (ALE)",
  "service line": "Service line",
  foundation: "Foundation",
  "earth movement": "Earth movement",
  "seepage-14-day": "Seepage wording",
  "freeze-burst": "Freeze-burst condition",
};

const VERDICT_LABELS: Record<string, string> = {
  yes: "Usually covered",
  sometimes: "Sometimes — depends on your form",
  no: "Usually not covered",
};

export default function InsuranceClaimPackPage() {
  const faqSchema = faqPageSchemaFromQAs(FAQS);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbListSchema([
              { name: "Home", path: "/" },
              { name: "Insurance Claim Pack Generator", path: TOOL_PATH },
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
            <span className="text-white">Insurance Claim Pack Generator</span>
          </nav>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            Does insurance cover my leak — and what do I file?
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-blue-100">
            A Texas leak claim is really several claims in one: the pipe,
            the tear-out to reach it, the water damage, the mold, the
            place you stay while it is fixed. This free tool shows the
            coverage likelihood for each bucket under Texas HO-B / HO-3
            rules, does the deductible math, and drafts your claim letter.
          </p>
          <p className="mt-4 max-w-2xl text-sm font-semibold text-amber-300">
            Guidance, not insurance advice, and not a coverage promise —
            confirm everything with your insurer or agent.
          </p>
        </div>
      </section>

      <InsuranceClaimPack />

      <section className="mx-auto max-w-4xl px-4 py-14">
        <h2 className="text-2xl font-extrabold text-blue-950">How the pack is built — every fact, with its source</h2>
        <p className="mt-3 text-slate-600">
          Every coverage fact in the tool comes from the Texas Department
          of Insurance (TDI) and ISO HO-3 form summaries, researched
          November 16, 2026. The tool shows the standard HO-B / HO-3
          position for each bucket. Since 2003, Texas insurers file their
          own forms, so your policy may word any of these differently —
          your declarations page is the final word.
        </p>
        <div className="mt-6 space-y-4">
          {HO_B_FACTS.map((b) => (
            <div key={b.bucket} className="rounded-2xl border border-slate-200 p-5">
              <p className="font-extrabold text-blue-950">
                {BUCKET_LABELS[b.bucket] ?? b.bucket}
                {" — "}
                <span className="text-slate-600">{VERDICT_LABELS[b.covered]}</span>
              </p>
              <p className="mt-2 text-sm text-slate-600">{b.condition}</p>
              <p className="mt-2 text-xs text-slate-400">
                Source:{" "}
                <a href={b.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-blue-800 hover:underline">
                  {b.sourceUrl.replace("https://", "")}
                </a>
              </p>
            </div>
          ))}
        </div>

        <h3 className="mt-10 text-xl font-extrabold text-blue-950">Deductible math — the rules the tool uses</h3>
        <ul className="mt-4 space-y-3 text-slate-600">
          {DEDUCTIBLE_MATH.map((d) => (
            <li key={d.topic} className="list-disc pl-1 ml-4">{d.note}</li>
          ))}
        </ul>
        <p className="mt-4 text-slate-600">
          <strong className="text-blue-950">The 14-day seepage wording is form-specific.</strong>{" "}
          The ISO HO-3 base form has no 14-day seepage clause. Many
          insurers&apos; own Texas forms add one, and TDI&apos;s 2018
          comparison found three wordings in use in Texas: seepage over
          14 or more days, over &ldquo;weeks, months, or years&rdquo;, or
          seepage that results in deterioration, corrosion, rust, or wet
          or dry rot. The tool asks about your form&apos;s wording — it
          never states a universal 14-day rule.
        </p>
        <p className="mt-3 text-slate-600">
          <strong className="text-blue-950">HO-B foundation coverage is historical and contested.</strong>{" "}
          TDI Bulletin B-0032-97 (1997) took the position that the old
          standard HO-B form covered foundation damage from an accidental
          plumbing discharge, and the Texas Supreme Court agreed for the
          1991 HO-B form in <em>Balandran v. Safeco</em> (1998). That was
          the old form. Modern company forms may word foundation coverage
          differently, so the tool presents it as history — never as a
          current guarantee.
        </p>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">Three example claims — no calculator needed</h2>
        <p className="mt-3 text-slate-600">
          If you can&apos;t use the interactive tool, this table shows the
          per-bucket likelihoods for three common claim profiles. These
          are examples, clearly labeled — your own policy and facts decide
          your claim.
        </p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600">
                <th className="p-4 font-bold">Example profile</th>
                <th className="p-4 font-bold">Pipe repair</th>
                <th className="p-4 font-bold">Tear-out</th>
                <th className="p-4 font-bold">Water damage</th>
                <th className="p-4 font-bold">Mold</th>
                <th className="p-4 font-bold">ALE</th>
                <th className="p-4 font-bold">Service line</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="p-4 font-semibold">Burst pipe, found the same day; $12,000 damage, $1,000 deductible</td>
                <td className="p-4">Usually not covered</td>
                <td className="p-4">Sometimes — depends on form</td>
                <td className="p-4">Usually covered (sudden / accidental)</td>
                <td className="p-4">Sometimes — sub-limit applies</td>
                <td className="p-4">Sometimes — if a covered loss forces you out</td>
                <td className="p-4">Usually not covered</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">Slow seepage under the slab, running about 30 days; $8,000 damage</td>
                <td className="p-4">Usually not covered</td>
                <td className="p-4">Sometimes — often narrowed for slab / slow leaks</td>
                <td className="p-4">Usually not covered (gradual leak)</td>
                <td className="p-4">Usually not covered (gradual leak)</td>
                <td className="p-4">Usually not covered (loss itself not covered)</td>
                <td className="p-4">Usually not covered</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">Frozen pipe burst in the attic, heat was on; $15,000 damage</td>
                <td className="p-4">Usually not covered</td>
                <td className="p-4">Sometimes — depends on form</td>
                <td className="p-4">Usually covered (sudden / accidental)</td>
                <td className="p-4">Sometimes — sub-limit applies</td>
                <td className="p-4">Sometimes — if a covered loss forces you out</td>
                <td className="p-4">Usually not covered</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          The frozen-pipe profile assumes the pipes were protected (heat
          on). TDI warns that policies might not pay for frozen-pipe
          damage if you didn&apos;t take steps to protect your pipes.
          Deductible math for the first profile: $12,000 − $1,000 =
          $11,000 paid by the insurer (estimate, up to policy and
          sub-limits) and $1,000 paid by you.
        </p>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-14">
          <h2 className="text-2xl font-extrabold text-blue-950">Insurance claim pack — questions, answered</h2>
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
            <Link href="/tools/freeze-damage-estimator/" className="font-bold text-blue-800 hover:underline">
              Freeze-Burst Damage Estimator →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              If a freeze caused the loss: estimate the burst damage by room and flooring, and the insurance coverage split.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/tools/leak-cost-estimator/" className="font-bold text-blue-800 hover:underline">
              Leak Cost Estimator →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              Estimate what the leak itself costs to find and fix, so your damage figure for the deductible math is grounded in real numbers.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/tools/water-bill-spike/" className="font-bold text-blue-800 hover:underline">
              Water Bill Spike Splitter →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              Your water bills and meter readings are evidence of when the leak started — split the spike to date it.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/tools/freeze-risk-tonight/" className="font-bold text-blue-800 hover:underline">
              Freeze-Burst Risk Tonight →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              Tonight&apos;s freeze risk for your town — protecting pipes is what keeps a freeze claim payable.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/services/slab-leak-detection/" className="font-bold text-blue-800 hover:underline">
              Slab leak detection →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              How acoustic and thermal equipment pinpoints a leak under concrete without digging — and what the written report contains.
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
          Disclaimer: this tool gives general information about Texas
          homeowners insurance, based on TDI guidance and ISO HO-3 form
          summaries. It is not legal or insurance advice, not a coverage
          promise, and never a recommendation to file or not file a claim.
          Only your policy — read with your insurer or agent — decides
          what is covered. If you need help with a claim, contact the TDI
          Help Line at 800-252-3439.
        </p>
      </section>

      <CtaBand
        title="Claim in motion? Get the report your insurer asks for."
        subtitle="A detection report stating the leak's location, cause, and how long it ran is the evidence your insurer asks for — book a detection visit that produces an insurance-ready report."
      />
    </>
  );
}
