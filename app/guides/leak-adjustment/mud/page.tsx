import Link from "next/link";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { breadcrumbListSchema, faqPageSchemaFromQAs } from "@/lib/schema";
import CtaBand from "@/components/CtaBand";
import {
  BRUSHY_CREEK_EXAMPLE,
  MUD_FAQS,
  MUD_FIND_STEPS,
  MUD_FIND_TCEQ_URL,
  MUD_RULES,
} from "@/lib/adjustment-pages";

/**
 * Texas MUD leak adjustments — explainer page.
 *
 * Covers what a MUD is, how to find yours, the ONE fully verified MUD
 * rule (Harris County MUD 71, amended resolution Aug 28, 2023), the
 * partial rules (HCMUD 501 and 82 — Eye On Water precondition verified,
 * percentages and deadlines NOT verified), the verified Brushy Creek
 * sewer-average example ($423.40 → $40.04, board agenda Aug 14, 2025),
 * and the "no standing policy" honesty for MUDs that decide case by
 * case (Baker Road MUD; Woodlands Water one-time adjustment, terms
 * unpublished).
 *
 * The Eye On Water precondition is presented as "some MUDs require
 * it", with sources cited — never as a universal rule. Nothing marked
 * UNVERIFIED in the research is published as a rule.
 *
 * FAQ answers are 50–80 words each. The visible FAQ block and the
 * FAQPage schema are rendered from the same MUD_FAQS constant, so they
 * can never drift apart.
 *
 * Server page, all content static/SSR. No Supabase access. No
 * date construction at render — check dates are static text from research.
 */

export const metadata: Metadata = {
  title: "MUD Leak Adjustments in Texas — Who to Call".slice(0, 60),
  description:
    "Texas MUD leak adjustments: what a MUD is, how to find yours, the verified MUD 71 rule, Eye On Water rules, and MUDs with no policy. Checked Nov 16, 2026.".slice(
      0,
      155
    ),
  alternates: { canonical: `${SITE_URL}/guides/leak-adjustment/mud/` },
};

const PAGE_PATH = "/guides/leak-adjustment/mud/";

export default function MudLeakAdjustmentPage() {
  const faqSchema = faqPageSchemaFromQAs(MUD_FAQS);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbListSchema([
              { name: "Home", path: "/" },
              { name: "Guides", path: "/guides/" },
              { name: "Leak Adjustment", path: "/guides/leak-adjustment/" },
              { name: "MUD Leak Adjustments", path: PAGE_PATH },
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
            <Link href="/guides/leak-adjustment/" className="hover:text-white hover:underline">
              Leak Adjustment
            </Link>
            <span className="mx-2 text-blue-400">›</span>
            <span className="text-white">MUD Leak Adjustments</span>
          </nav>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            Texas MUD Leak Adjustments — Who to Call and What to Ask
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-blue-100">
            If your home is on MUD water, no city leak-adjustment rule
            applies to you. Your Municipal Utility District sets its own
            rule — or has no rule at all — and the district next door can
            have a completely different policy. This guide covers the one
            fully verified MUD rule, the districts where only part of the
            rule is verified, and what to do when your MUD has no published
            policy.
          </p>
          <p className="mt-4 max-w-2xl text-base text-blue-200">
            Rules checked <strong className="text-white">Nov 16, 2026</strong>.
            Each district below links its official source. Rules change —
            confirm the rule with the district or its operator before you
            apply.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-14">
        <h2 className="text-2xl font-extrabold text-blue-950">What a MUD is — and why it sets your leak rules</h2>
        <p className="mt-3 text-slate-600">
          A Municipal Utility District is a local government district that
          provides water and sewer service to a specific community or
          subdivision. MUDs are very common in Houston-area suburbs, where
          the city does not serve the neighbourhood: the district — not the
          city — bills you, runs the system through an operator, and sets
          its leak-adjustment rule in a rate order or a board resolution.
          There is no statewide MUD rule. Your neighbour across the
          district line can have a completely different policy, a different
          deadline, or no policy at all.
        </p>
        <p className="mt-3 text-slate-600">
          That is also why the city guides on this site do not cover MUD
          homes. A SAWS rule does not help a homeowner on a MUD, and a
          City of Houston rule does not help a homeowner in Towne Lake or
          The Woodlands. Find your district first — then read its rule.
        </p>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">How to find which MUD serves your home</h2>
        <p className="mt-3 text-slate-600">
          There is no single statewide address-to-MUD lookup. These are
          the verified routes, in order of speed:
        </p>
        <ol className="mt-5 list-decimal space-y-3 pl-6 text-slate-600">
          {MUD_FIND_STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p className="mt-4 text-slate-600">
          The TCEQ&apos;s own starting point is{" "}
          <a
            href={MUD_FIND_TCEQ_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-blue-800 hover:underline"
          >
            “Water: Who Provides Water to My Property?” →
          </a>
        </p>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">MUD leak-adjustment rules — what is verified</h2>
        <p className="mt-3 text-slate-600">
          Six districts were researched. One has a fully verified rule, two
          have only part of their rule verified, one has a verified
          sewer-average adjustment instead of a water credit, and two have
          no published terms at all. Where a term is not verified, this
          page says so — it does not fill the gap with another
          district&apos;s number.
        </p>
        <div className="mt-6 space-y-6">
          {MUD_RULES.map((mud) => (
            <article key={mud.name} className="rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-xl font-extrabold text-blue-950">{mud.name}</h3>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                {mud.area} · {mud.statusLabel}
              </p>
              <p className="mt-3 text-slate-600">{mud.summary}</p>
              {mud.deadline && (
                <p className="mt-3 text-slate-600">
                  <strong className="text-blue-950">Deadline / limits: </strong>
                  {mud.deadline}
                </p>
              )}
              {mud.proof && (
                <p className="mt-3 text-slate-600">
                  <strong className="text-blue-950">Proof / how to apply: </strong>
                  {mud.proof}
                </p>
              )}
              {mud.notVerified && (
                <p className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-slate-700">
                  <strong className="text-amber-900">Not verified: </strong>
                  {mud.notVerified}
                </p>
              )}
              <p className="mt-3 text-sm text-slate-500">
                Source:{" "}
                <a
                  href={mud.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-blue-800 hover:underline"
                >
                  {mud.sourceLabel} →
                </a>{" "}
                — checked Nov 16, 2026.
              </p>
            </article>
          ))}
        </div>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">
          Eye On Water: the precondition some MUDs require
        </h2>
        <p className="mt-3 text-slate-600">
          Eye On Water is the customer portal for smart water meters: it
          shows your usage and lets you set leak alerts. Some MUDs have
          written it into their leak-adjustment policy as a precondition —
          and the timing matters. Harris County MUD 501 requires you to
          create an Eye On Water account and register your smart meter in
          order to be eligible for a credit. Harris County MUD 82 goes
          further: its board will only consider an adjustment if you were
          actively signed up for EyeOnWater <em>before the leak
          occurred</em>. Harris County MUD 71 also requires an Eye On Water
          account with the smart meter registered, and grants no credit
          until the district confirms the registration.
        </p>
        <p className="mt-3 text-slate-600">
          This is a condition of <em>some</em> districts, not a statewide
          rule — city utilities do not require it, and most MUDs have never
          published such a condition. But if your MUD is one of the ones
          that does, signing up after the leak is already too late. Check
          your district&apos;s policy now, before you need it.
        </p>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">
          A real example: Brushy Creek MUD, $423.40 → $40.04
        </h2>
        <p className="mt-3 text-slate-600">
          Brushy Creek MUD has no water-side leak credit — what it has is a
          wastewater (sewer-average) adjustment for leaks during the
          averaging months. The district&apos;s board agenda for Aug 14,
          2025 records a real case at {BRUSHY_CREEK_EXAMPLE.address}: the
          sewer average rate was {BRUSHY_CREEK_EXAMPLE.before}, and if the
          request was approved it would fall to{" "}
          {BRUSHY_CREEK_EXAMPLE.after}.
        </p>
        <p className="mt-3 text-slate-600">{BRUSHY_CREEK_EXAMPLE.note}</p>
        <p className="mt-3 text-sm text-slate-500">
          Source:{" "}
          <a
            href={BRUSHY_CREEK_EXAMPLE.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-blue-800 hover:underline"
          >
            Brushy Creek MUD board agenda, Aug 14, 2025 →
          </a>{" "}
          — checked Nov 16, 2026. The adjustment needs a Wastewater
          (Sewer) Adjustment Request form with proof of repairs, and no
          adjustments are approved after April 30 (2025 order) or May 31
          (2026 order).
        </p>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">
          When your MUD has no standing policy
        </h2>
        <p className="mt-3 text-slate-600">
          Some MUDs decide leak credits case by case, by board vote, with
          no published formula, deadline, or form. Baker Road MUD is one:
          its board has granted credits on the operator&apos;s
          recommendation, with no published rule to cite — and single-case
          outcomes are not a policy, so no dollar figure from those votes
          is quoted here as a rule. Woodlands Water is similar in a
          different way: a one-time leak adjustment can be granted under
          certain circumstances, but no formula, deadline, or eligibility
          list is published.
        </p>
        <p className="mt-3 text-slate-600">
          If your MUD is in this position, write to the district&apos;s
          operator or board and ask whether credits are considered case by
          case. Keep the plumber&apos;s invoice, note the repair date, and
          ask in writing what the board needs. A written request creates a
          record the board can act on — and if the board has no rule, your
          letter is the start of the process, not the end of it.
        </p>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-14">
          <h2 className="text-2xl font-extrabold text-blue-950">MUD leak adjustments — questions, answered</h2>
          <div className="faq mt-6 space-y-6">
            {MUD_FAQS.map((f) => (
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
            <Link href="/tools/leak-adjustment-checker/" className="font-bold text-blue-800 hover:underline">
              Leak-Adjustment Eligibility Checker →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              Check your own utility&apos;s rule and eligibility, then
              generate the application pack — filled letter, document
              checklist, and deadline.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/tools/water-bill-spike/" className="font-bold text-blue-800 hover:underline">
              Water Bill Spike Splitter →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              Not sure the spike is a leak at all? Split a bill spike into
              leak vs rate increase first — a usage-driven spike is what a
              leak adjustment is for.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/tools/insurance-claim-pack/" className="font-bold text-blue-800 hover:underline">
              Insurance Claim Pack →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              If the leak also caused water damage, the claim pack gathers
              the same repair documentation an insurer asks for.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/guides/leak-adjustment/" className="font-bold text-blue-800 hover:underline">
              All Texas leak adjustment guides →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              The status of all 10 metros: which cities have a verified
              guide, which are covered by WaterShortcut, and which have no
              verified policy yet.
            </p>
          </li>
        </ul>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">Methodology &amp; sources</h2>
        <p className="mt-3 text-slate-600">
          The district rules on this page come from official MUD sources
          read Nov 16, 2026: Harris County MUD 71&apos;s amended resolution
          (Aug 28, 2023), Harris County MUD 501&apos;s policy update page,
          Harris County MUD 82&apos;s July 2026 newsletter and board
          minutes (Oct 27, 2025 and Jan 27, 2025), Brushy Creek MUD&apos;s
          rate orders and board agenda (Aug 14, 2025), Baker Road
          MUD&apos;s board minutes, and Woodlands Water&apos;s FAQs. The
          full research report is{" "}
          <code className="rounded bg-slate-100 px-1 text-sm">
            utility-adjustment-rules-2026-11-16.md
          </code>
          ; the machine-readable rules live in{" "}
          <code className="rounded bg-slate-100 px-1 text-sm">
            lib/utility-rules.ts
          </code>
          . The MUD 501 policy PDF would not render in the research pass,
          and the MUD 82 Rate Order was not retrievable — so no percentage,
          deadline, or frequency is published for either district here.
        </p>
        <p className="mt-6 text-xs text-slate-400">
          Disclaimer: MUD rules change, and boards vote on new rate orders.
          The rules above were checked Nov 16, 2026 — confirm them with the
          district or its operator before you apply. This guide is not a
          quote and not legal advice; only the district can grant the
          credit.
        </p>
      </section>

      <CtaBand
        title="On MUD water with a high bill?"
        subtitle="Find your district first — the name is printed on your water bill — then check whether it requires Eye On Water registration before a leak ever happens."
      />
    </>
  );
}
