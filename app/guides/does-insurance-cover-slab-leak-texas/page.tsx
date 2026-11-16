import Link from "next/link";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { breadcrumbListSchema, faqPageSchemaFromQAs } from "@/lib/schema";
import {
  HO_B_FACTS,
  CLAIM_CHECKLIST,
  DEDUCTIBLE_MATH,
} from "@/lib/texas-insurance";
import CtaBand from "@/components/CtaBand";

/**
 * Does insurance cover a slab leak in Texas? — guide page.
 *
 * Target query: "does insurance cover slab leak Texas".
 * SERP study (Nov 16, 2026, §B10): the best national page is
 * legalclarity.org (HO-3 form citations, tear-out, 14-day seepage,
 * earth-movement exclusion, mold sub-limits $2,500–$15,000) — but
 * ZERO Texas content in any top page. The Texas edge here is the
 * HO-B vs HO-3 distinction, TDI guidance, the documentation
 * checklist, the statutory claim timeline, and the freeze-burst
 * condition (TDI: the policy might not pay if you did not protect
 * your pipes).
 *
 * Fact discipline: every insurance fact below comes from the
 * verified data file lib/texas-insurance.ts (HO_B_FACTS,
 * CLAIM_CHECKLIST, DEDUCTIBLE_MATH), researched Nov 16, 2026 from
 * TDI and ISO HO-3 form summaries. Nothing from the research
 * file's §6 UNVERIFIED list appears on this page: no foundation
 * endorsement price, no per-insurer form claims, no non-statutory
 * claim timelines, no Texas-specific mold sub-limit or service-line
 * premium (national ranges are labeled NATIONAL where shown).
 *
 * FAQ answers are 50–80 words each (counted by hand at write time).
 * The visible FAQ block and the FAQPage schema are rendered from the
 * same FAQS constant, so they can never drift apart.
 *
 * Server page, all content static/SSR. No Supabase access.
 */

export const metadata: Metadata = {
  title: "Does Insurance Cover Slab Leaks in Texas? | HO-B Guide".slice(0, 60),
  description:
    "Does insurance cover a slab leak in Texas? Sudden damage is usually covered; the pipe itself is not. HO-B vs HO-3, tear-out, mold, and deductible math.".slice(
      0,
      155
    ),
  alternates: { canonical: `${SITE_URL}/guides/does-insurance-cover-slab-leak-texas/` },
};

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "Does insurance cover slab leak repair in Texas?",
    a: "Usually, the damage from a slab leak is covered but the pipe repair itself is not. Most Texas policies pay for sudden and accidental water damage — a burst pipe, for example — including the cost to tear out and replace the slab to reach it, when that access is necessary. The failed pipe segment is the homeowner's cost, and damage from a gradual leak is usually denied. Check your declarations page before you file.",
  },
  {
    q: "What is tear-out coverage?",
    a: "Tear-out coverage pays the cost to open up part of a building to reach a leak — for a slab leak, cutting through the concrete slab. The standard HO-3 form covers tearing out and replacing that part of the building, but only when the access is necessary to repair the system. The failed pipe itself is not covered. Many Texas company forms narrow tear-out for lines in or below the slab, so read your own form.",
  },
  {
    q: "Will my claim be denied if the leak was slow?",
    a: "Often, yes. Most Texas policies cover sudden and accidental water damage but not damage from gradual leaks, according to the Texas Department of Insurance. If the leak ran for weeks or months before you noticed it, the insurer may treat it as gradual and deny the damage. Many Texas forms exclude seepage lasting 14 days or more, but others use weeks or months, or a result-based wording. Your water bills and meter readings help show when the leak started.",
  },
  {
    q: "Does insurance cover foundation damage from a slab leak in Texas?",
    a: "It depends on your policy form. In 1997 the Texas Department of Insurance said the old HO-B form covered foundation damage caused by an accidental plumbing discharge, and the Texas Supreme Court agreed in 1998 for the 1991 HO-B form. But that was the old form: since 2003 Texas insurers file their own forms, so a modern policy may word it differently. Expect the insurer to investigate whether the leak moved the slab or the soil moved first.",
  },
  {
    q: "Does insurance cover mold from a slab leak?",
    a: "Only when the water loss that caused the mold was covered. The Texas Department of Insurance says mold on an item damaged by a sudden, accidental loss is covered, but mold from a gradual leak, seepage, or flood is not. Even when it is covered, most policies cap mold cleanup with a sub-limit — published national examples run $2,500–$15,000. Most policies do not include mold cleanup and testing after the damaged item is removed, though an endorsement may add it.",
  },
  {
    q: "Should I file a claim or pay for a slab leak myself?",
    a: "Compare the covered repair cost with your deductible first. Your insurer pays the covered loss minus the deductible, so if the covered cost is at or below the deductible, filing pays nothing — and the claim still goes on your record. Most insurers report claims to CLUE, which shows seven years of history, and a company may charge more or refuse coverage based on it. If the covered damage is well above the deductible, filing usually makes sense.",
  },
];

const PAGE_PATH = "/guides/does-insurance-cover-slab-leak-texas/";

const BUCKET_LABELS: Record<string, string> = {
  "pipe repair": "Pipe repair",
  "tear-out": "Tear-out (access)",
  "water damage": "Water damage",
  mold: "Mold",
  ale: "Additional living expenses (ALE)",
  "service line": "Service line (underground lateral)",
  foundation: "Foundation",
  "earth movement": "Earth movement",
  "seepage-14-day": "Seepage / 14-day rule",
  "freeze-burst": "Freeze-burst",
};

const VERDICT_LABELS: Record<string, { label: string; className: string }> = {
  yes: { label: "Usually yes", className: "bg-emerald-50 text-emerald-800" },
  no: { label: "Usually no", className: "bg-red-50 text-red-800" },
  sometimes: { label: "Depends on the policy", className: "bg-amber-50 text-amber-800" },
};

export default function InsuranceCoverSlabLeakTexasPage() {
  const faqSchema = faqPageSchemaFromQAs(FAQS);
  const howItWorks = DEDUCTIBLE_MATH.find((d) => d.topic === "how-it-works");
  const fileOrPay = DEDUCTIBLE_MATH.find((d) => d.topic === "file-or-pay-yourself");
  const holdback = DEDUCTIBLE_MATH.find((d) => d.topic === "depreciation-holdback");
  const historyCost = DEDUCTIBLE_MATH.find((d) => d.topic === "claims-history-cost");
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbListSchema([
              { name: "Home", path: "/" },
              { name: "Guides", path: "/guides/" },
              { name: "Does Insurance Cover Slab Leaks in Texas?", path: PAGE_PATH },
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
            <span className="text-white">Does Insurance Cover Slab Leaks in Texas?</span>
          </nav>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            Does Insurance Cover Slab Leaks in Texas?
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-blue-100">
            <strong className="text-white">Usually, the damage is covered — the pipe is not.</strong>{" "}
            Most Texas homeowners policies pay for sudden and accidental
            water damage, like a burst pipe, including the cost of tearing
            out the slab to reach it. They almost never pay to repair the
            failed pipe itself, and they usually deny damage from a gradual
            leak that ran for weeks or months. Which side of that line your
            leak falls on decides the claim.
          </p>
          <p className="mt-4 max-w-2xl text-base text-blue-200">
            Texas adds one more twist: the old Texas HO-B form is not the
            form most Texans hold today. Since 2003, insurers file their
            own TDI-approved forms, so your policy may be an HO-3, a
            company form, or an HO-A with endorsements — and the exact
            wording on your declarations page is what decides coverage.
          </p>
          <p className="mt-5 max-w-2xl rounded-xl border border-amber-300/40 bg-amber-400/10 p-4 text-sm font-semibold text-amber-100">
            This page is general information, not legal or insurance advice.
            Confirm every coverage question with your insurer or agent
            before you file a claim.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-14">
        <h2 className="text-2xl font-extrabold text-blue-950">What is covered, bucket by bucket</h2>
        <p className="mt-3 text-slate-600">
          A slab-leak claim is not one decision — the insurer judges each
          cost separately. The pipe, the access to reach it, the water
          damage, the mold, and the time out of your home are all
          different buckets with different answers. The table below is the
          verified Texas picture, from the Texas Department of Insurance
          (TDI) and the ISO HO-3 form.
        </p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600">
                <th className="p-4 font-bold">Cost bucket</th>
                <th className="p-4 font-bold">Covered?</th>
                <th className="p-4 font-bold">Condition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {HO_B_FACTS.map((fact) => {
                const verdict = VERDICT_LABELS[fact.covered];
                return (
                  <tr key={fact.bucket}>
                    <td className="p-4 font-semibold">
                      {BUCKET_LABELS[fact.bucket] ?? fact.bucket}
                    </td>
                    <td className="p-4">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${verdict.className}`}>
                        {verdict.label}
                      </span>
                    </td>
                    <td className="p-4">
                      {fact.condition}{" "}
                      <a
                        href={fact.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-blue-800 hover:underline"
                      >
                        Source
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          &ldquo;Depends on the policy&rdquo; means the answer changes with
          the form and endorsements on your own policy — check the
          declarations page. The mold sub-limit range ($2,500–$15,000) and
          the service-line endorsement figures ($20–$50/year, $10,000–
          $25,000 limit) are published national ranges; no Texas-specific
          figures were found for either.
        </p>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">HO-B vs HO-3: which form do Texans actually have?</h2>
        <p className="mt-3 text-slate-600">
          The <strong className="text-blue-950">HO-B (Texas Broad Form)</strong> is
          the historic Texas standard: open-peril coverage for the dwelling
          and named perils for contents. The{" "}
          <strong className="text-blue-950">HO-3 (Special Form)</strong> is the
          national standard, with the same structure — open-peril dwelling,
          named-peril contents. In practice the two now overlap heavily.
        </p>
        <p className="mt-3 text-slate-600">
          But the old HO-B is largely history. Insurers have been able to
          file and use their own TDI-approved forms since 2003, and today a
          Texan is more likely to hold an HO-3, a company form, or an HO-A
          (named-peril) policy with endorsements that mimic the old
          HO-B&apos;s broad water coverage than a strict HO-B form. The
          Texas Attorney General notes most Texas homeowners policies sold
          are HO-A policies, which generally cover only sudden and
          accidental water leaks.
        </p>
        <p className="mt-3 text-slate-600">
          That matters for a slab-leak claim because the old HO-B is the
          form behind the famous foundation-coverage history (see below).
          What your policy actually says — not what the form was called in
          1997 — decides your claim.
        </p>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">Foundation damage: the 1997 HO-B history — not a current guarantee</h2>
        <p className="mt-3 text-slate-600">
          Foundation damage from soil movement alone is excluded on a
          standard policy: TDI lists earthquakes and earth movement among
          damages most Texas policies do not cover, and settling,
          shrinking, bulging, or expansion of foundations is a standard
          exclusion.
        </p>
        <p className="mt-3 text-slate-600">
          The exception is history, not a promise. In Commissioner&apos;s
          Bulletin B-0032-97 (August 22, 1997), TDI took the position that
          the then-standard HO-B form did cover damage to the dwelling,
          including the foundation, resulting from accidental discharge,
          leakage, or overflow of water from a plumbing system — even
          where the discharge caused settling or cracking. The Texas
          Supreme Court agreed in <em>Balandran v. Safeco</em> (July 3,
          1998) for the 1991 HO-B form.
        </p>
        <p className="mt-3 text-slate-600">
          Present that as what it is: a 1997 position about the old HO-B
          form. Since 2003 Texas insurers file their own forms, so a
          modern company form can word foundation coverage differently.
          Never treat it as a guarantee for a current policy. Expect the
          insurer to investigate the cause — did the leak move the slab,
          or did the clay move first and break the pipe? TDI also lists
          &ldquo;damage to foundations or slabs&rdquo; as an optional
          endorsement you can add; no Texas price for that endorsement was
          found, so none is published here.
        </p>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">The 14-day seepage rule: real, but form-specific — not universal</h2>
        <p className="mt-3 text-slate-600">
          You will read that leaks running 14 days or more are excluded.
          That is true on many policies and false on others. The ISO HO-3
          base form (HO 00 03, 2011 edition) contains no 14-day seepage
          clause at all — the 14-day wording (&ldquo;constant or repeated
          seepage or leakage of water or steam over a period of 14 days or
          more&rdquo;) is a carrier-filed addition found in many insurers&apos;
          own forms.
        </p>
        <p className="mt-3 text-slate-600">
          Texas specifically has three wordings in use, documented in
          TDI&apos;s 2018 <em>Texas Homeowners Policies</em> comparison:
        </p>
        <ul className="mt-5 list-disc space-y-3 pl-6 text-slate-600">
          <li>
            <strong className="text-blue-950">Fixed period:</strong> seepage
            &ldquo;over a period of 14 or more days.&rdquo;
          </li>
          <li>
            <strong className="text-blue-950">Open-ended period:</strong>{" "}
            seepage over &ldquo;weeks, months, or years.&rdquo;
          </li>
          <li>
            <strong className="text-blue-950">Result-based:</strong> seepage
            that &ldquo;results in deterioration, corrosion, rust, or wet
            or dry rot.&rdquo;
          </li>
        </ul>
        <p className="mt-5 text-slate-600">
          Some Texas companies also sell full or limited coverage for
          continuous or repeated leakage as an add-on. The only way to
          know which wording your policy uses is to read it — it is on
          your declarations page and policy form. That is also why your
          water bills and meter readings matter so much: they are the
          evidence of when the leak started.
        </p>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">Freeze-burst: the pipe-protection condition</h2>
        <p className="mt-3 text-slate-600">
          A burst pipe is TDI&apos;s textbook example of sudden and
          accidental damage, and sudden/accidental coverage pays for
          damage from burst pipes. But there is a condition. TDI&apos;s
          winter-storm tips (last updated April 29, 2025) warn in exact
          words: &ldquo;Home and renters policies might not pay for
          damages caused by frozen pipes if you didn&apos;t take steps to
          protect your pipes, such as keeping the heater on in your
          house.&rdquo;
        </p>
        <p className="mt-3 text-slate-600">
          Note the hedge — &ldquo;might not.&rdquo; TDI does not say which
          policies carry the condition or how an insurer applies it, so
          this page does not guess either. If you leave before a freeze,
          TDI advises turning off the water at the shutoff valve and
          leaving the heat on. If pipes do freeze, turn off the water at
          the shutoff valve so broken pipes do not leak into the house
          after they thaw. Flood insurance does not pay for burst-pipe
          damage.
        </p>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">Deductible math: file a claim or pay it yourself?</h2>
        <p className="mt-3 text-slate-600">
          The insurer pays the covered loss minus the deductible, up to
          the policy limits and sub-limits. The formula is simple; the
          decision is not.
        </p>
        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-center text-lg font-extrabold text-blue-950">
            Amount the insurer pays = covered loss &minus; deductible
          </p>
          <p className="mt-3 text-center text-sm text-slate-600">
            TDI&apos;s own example: a $1,000 claim with a $300 deductible
            means the insurer deducts $300 and pays $700. Scaled up:
            $18,000 of covered repairs minus a $2,000 deductible is
            $16,000 paid, subject to policy terms.
          </p>
        </div>
        <ul className="mt-5 list-disc space-y-3 pl-6 text-slate-600">
          {howItWorks && (
            <li>
              <strong className="text-blue-950">How it works.</strong>{" "}
              {howItWorks.note}
            </li>
          )}
          {fileOrPay && (
            <li>
              <strong className="text-blue-950">File or pay yourself.</strong>{" "}
              {fileOrPay.note}
            </li>
          )}
          {holdback && (
            <li>
              <strong className="text-blue-950">The two-check catch.</strong>{" "}
              {holdback.note}
            </li>
          )}
          {historyCost && (
            <li>
              <strong className="text-blue-950">The cost of a claim on your record.</strong>{" "}
              {historyCost.note}
            </li>
          )}
        </ul>
        <p className="mt-5 text-slate-600">
          The rule of thumb: if the covered repair cost is at or below
          your deductible, filing pays $0 — pay it yourself and avoid a
          claim on your record. If the covered damage is well above the
          deductible, filing usually makes sense. Compare the numbers
          before you report the loss.
        </p>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">Documentation checklist: what the claim needs</h2>
        <p className="mt-3 text-slate-600">
          TDI&apos;s advice is blunt: document before you clean up, make
          only temporary repairs, and do not throw damaged items away
          until the adjuster has seen them. The detection report is the
          evidence that ties the damage to a sudden leak — without it, a
          slow-leak denial is hard to argue against.
        </p>
        <ul className="mt-5 space-y-3">
          {CLAIM_CHECKLIST.map((item) => (
            <li key={item.item} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="font-bold text-blue-950">{item.item}</p>
              <p className="mt-1 text-sm text-slate-600">{item.why}</p>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-slate-600">
          Keep every receipt: temporary-repair materials, drying costs,
          and any hotel, rental, or meal spending if you had to move out.
          Additional living expenses are paid from receipts for the
          increase in living costs, up to the policy limit.
        </p>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">Claim timeline: the Texas statutory deadlines</h2>
        <p className="mt-3 text-slate-600">
          Texas law (Insurance Code Chapter 542, the prompt-payment law)
          sets hard deadlines for the insurer — these are the only
          timelines on this page, because no verified non-statutory
          timeline (how long adjuster scheduling or estimate review takes
          in practice) was found.
        </p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600">
                <th className="p-4 font-bold">Step</th>
                <th className="p-4 font-bold">Deadline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="p-4 font-semibold">Insurer acknowledges the claim</td>
                <td className="p-4">Within 15 days</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">Insurer accepts or denies the claim</td>
                <td className="p-4">Within 15 business days of getting all the information it needs (denial must be in writing, with reasons)</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">Insurer pays after agreeing to pay</td>
                <td className="p-4">Within 5 business days</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">Extension, if the insurer needs more time</td>
                <td className="p-4">Up to 45 days to decide, if it tells you why (deadline may be longer after major disasters)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          Missed payment deadlines can expose the insurer to interest and
          attorney fees. Your part of the timeline: report the loss as
          soon as possible — hidden water damage usually must be reported
          within days after you first see it. If a dispute cannot be
          settled, TDI&apos;s Help Line is 800-252-3439.
        </p>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-14">
          <h2 className="text-2xl font-extrabold text-blue-950">Slab leak insurance — questions, answered</h2>
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
            <Link href="/tools/insurance-claim-pack/" className="font-bold text-blue-800 hover:underline">
              Insurance Claim Pack Generator →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              Turn your leak facts into coverage likelihood per bucket, deductible math, a document checklist, and a filled claim-letter draft.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/tools/freeze-damage-estimator/" className="font-bold text-blue-800 hover:underline">
              Freeze-Burst Damage Estimator →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              Forecast-linked burst risk and damage by room, with the insurance coverage split — including the pipe-protection condition above.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/tools/leak-cost-estimator/" className="font-bold text-blue-800 hover:underline">
              Leak Cost Estimator →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              Estimate leak detection and repair costs for your Texas town, so you can compare the covered cost with your deductible before you file.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/guides/sewer-camera-inspection-cost-texas/" className="font-bold text-blue-800 hover:underline">
              Sewer Camera Inspection Cost in Texas →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              Sewer-side leaks are a different test with different coverage — a camera inspection typically costs $150–$500 in Texas.
            </p>
          </li>
        </ul>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">Methodology &amp; sources</h2>
        <p className="mt-3 text-slate-600">
          Every insurance fact on this page was researched on November 16,
          2026, from official and public sources, and is stored in the
          site&apos;s verified data file (lib/texas-insurance.ts). The
          primary source is the Texas Department of Insurance: its water
          damage and mold guidance, its Home Insurance guide, its winter
          storm tips, Commissioner&apos;s Bulletin B-0032-97, and its
          2018 <em>Texas Homeowners Policies</em> comparison. Form
          wording (ISO HO-3) comes from published summaries of the
          standard form. No Texas-specific mold sub-limit, service-line
          premium, foundation-endorsement price, or per-insurer form
          wording was found — where a figure is national, the page says
          so, and where no figure was found, none is published.
        </p>
        <p className="mt-3 text-slate-600">
          Sources: TDI —{" "}
          <a href="https://www.tdi.texas.gov/tips/when-are-water-damage-and-mold-covered-by-insurance.html" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-800 hover:underline">When are water damage and mold covered by insurance?</a>
          {" · "}
          <a href="https://www.tdi.texas.gov/pubs/consumer/cb025.html" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-800 hover:underline">TDI Home insurance guide</a>
          {" · "}
          <a href="https://www.tdi.texas.gov/tips/winter-safety.html" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-800 hover:underline">TDI winter storm tips</a>
          {" · "}
          <a href="https://www.tdi.texas.gov/bulletins/1997/b-0032-7.html" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-800 hover:underline">TDI Bulletin B-0032-97</a>
          {" · "}
          <a href="https://www.tdi.texas.gov/reports/documents/texas-homeowners-policies-04122018.pdf" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-800 hover:underline">TDI Texas Homeowners Policies (2018)</a>
          {" · "}
          <a href="https://legalclarity.org/does-homeowners-insurance-cover-slab-leak-repairs/" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-800 hover:underline">LegalClarity — slab leak repairs</a>
          {" · "}
          <a href="https://legalclarity.org/what-is-tear-out-and-replacement-coverage-in-home-insurance/" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-800 hover:underline">LegalClarity — tear-out coverage</a>
          {" · "}
          <a href="https://legalclarity.org/what-is-service-line-coverage-on-homeowners-insurance/" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-800 hover:underline">LegalClarity — service line coverage</a>
          {" · "}
          <a href="https://www.4homeownersinsurance.com/guides/sudden-vs-gradual-water-damage/" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-800 hover:underline">4homeownersinsurance — sudden vs gradual water damage</a>
          .
        </p>
        <p className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
          Disclaimer: this page is general information, not legal or
          insurance advice. Coverage depends on the exact wording of your
          policy, your endorsements, and your insurer&apos;s decision.
          Confirm with your insurer or agent before you file a claim or
          rely on any coverage described here.
        </p>
      </section>

      <CtaBand
        title="Filing a slab-leak claim?"
        subtitle="Build your claim pack first — coverage likelihood per bucket, deductible math, and the document checklist, ready to hand to your adjuster."
      />
    </>
  );
}
