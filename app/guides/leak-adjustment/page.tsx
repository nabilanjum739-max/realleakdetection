import Link from "next/link";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { breadcrumbListSchema } from "@/lib/schema";
import CtaBand from "@/components/CtaBand";
import { METRO_ADJUSTMENT_ROWS } from "@/lib/adjustment-pages";

/**
 * Leak adjustments in Texas — index of all 10 metros.
 *
 * Seven metros have a verified city guide — San Antonio, Austin,
 * Fort Worth, El Paso, Amarillo, Houston, and Dallas. Houston and
 * Dallas were added in Phase 2 (Nov 16, 2026) as beat-pages against
 * WaterShortcut. McAllen, Corpus Christi (water-side) and Lubbock have
 * no verified published policy, so each gets an honest "no written
 * policy found" guide instead of an invented rule.
 *
 * Scope rule stated on this page and every city page: the anchor-city
 * rule covers the anchor city itself. The metro towns run their own
 * systems or MUDs — see the MUD explainer.
 *
 * Server page, all content static/SSR. No Supabase access. No
 * date construction at render — check dates are static text from research.
 */

export const metadata: Metadata = {
  title: "Texas Leak Adjustment Rules by City | Real Leak Detection".slice(0, 60),
  description:
    "Leak adjustment rules for Texas utilities by city: what qualifies, the credit, the deadline, and where to apply. 7 verified guides + 3 no-policy guides, checked Nov 16, 2026.".slice(
      0,
      155
    ),
  alternates: { canonical: `${SITE_URL}/guides/leak-adjustment/` },
};

const PAGE_PATH = "/guides/leak-adjustment/";

export default function LeakAdjustmentIndexPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbListSchema([
              { name: "Home", path: "/" },
              { name: "Guides", path: "/guides/" },
              { name: "Leak Adjustment", path: PAGE_PATH },
            ])
          ).replace(/</g, "\\u003c"),
        }}
      />

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
            <span className="text-white">Leak Adjustment</span>
          </nav>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            Leak Adjustments in Texas — Utility Rules by City
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-blue-100">
            A leak adjustment is a credit from your water utility for the
            water a leak wasted — but every utility sets its own rule: its
            own percentage, its own deadline, its own limit on how often
            you can ask. There is no statewide rule, and your city&apos;s
            rule does not cover the suburbs around it.
          </p>
          <p className="mt-4 max-w-2xl text-base text-blue-200">
            Rules checked <strong className="text-white">Nov 16, 2026</strong>.
            Each city guide below carries its own check date and a link to
            the official source. Rules change — a stale deadline is a trust
            killer, so confirm the rule on the official page before you
            apply.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-14">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h2 className="text-lg font-extrabold text-blue-950">
            First, check whose water you are on
          </h2>
          <p className="mt-2 text-slate-600">
            The name on your water bill decides which rule applies. The
            anchor-city rules below cover the anchor city itself — San
            Antonio, Austin, Fort Worth, El Paso, Amarillo. The towns
            around those cities run their own water systems or MUDs, so a
            SAWS rule does not help a New Braunfels homeowner, and a Dallas
            rule does not help a Plano homeowner. If your bill names a MUD,
            start with the{" "}
            <Link href="/guides/leak-adjustment/mud/" className="font-bold text-blue-800 hover:underline">
              Texas MUD leak adjustment explainer
            </Link>
            .
          </p>
        </div>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">All 10 metros — status</h2>
        <p className="mt-3 text-slate-600">
          Seven metros have a verified guide, including Houston and Dallas
          — added in Phase 2 as full beat-pages with a worked dollar
          example, a deadline countdown, and the eligibility checker at
          the top. Three metros have no verified published policy at all,
          and each of those gets an honest &ldquo;no written policy
          found&rdquo; guide — what was checked, the ask-the-utility
          script, and the proof checklist — rather than a guessed rule.
        </p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600">
                <th className="p-4 font-bold">Metro</th>
                <th className="p-4 font-bold">Utility</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">What we know</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {METRO_ADJUSTMENT_ROWS.map((row) => (
                <tr key={row.metro}>
                  <td className="p-4 font-semibold">
                    {row.pagePath ? (
                      <Link href={row.pagePath} className="font-bold text-blue-800 hover:underline">
                        {row.metro} →
                      </Link>
                    ) : (
                      row.metro
                    )}
                  </td>
                  <td className="p-4">{row.utility}</td>
                  <td className="p-4 font-semibold">{row.statusLabel}</td>
                  <td className="p-4">
                    {row.note}{" "}
                    {row.officialUrl && row.officialLabel && (
                      <a
                        href={row.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-blue-800 hover:underline"
                      >
                        {row.officialLabel} →
                      </a>
                    )}
                    {row.phone && (
                      <>
                        {" "}Call {row.phone}.
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">On MUD water? The rules are different</h2>
        <p className="mt-3 text-slate-600">
          A Municipal Utility District is the water provider for many Texas
          subdivisions, especially around Houston — and each MUD sets its
          own leak-adjustment rule in a rate order or board resolution.
          Some MUDs publish a full rule, some require you to register for
          Eye On Water before a leak ever happens, and some have no standing
          policy at all and vote on credits case by case. The explainer
          covers the one fully verified MUD rule (Harris County MUD 71),
          the partial rules (MUD 501 and 82), the verified Brushy Creek
          sewer-average example ($423.40 → $40.04), and a directory table
          for Harris County MUD 501, 71, and 365 — MUD 365 has no verified
          terms yet, and its row says so. It also explains how to find
          which MUD serves your home.
        </p>
        <p className="mt-4">
          <Link href="/guides/leak-adjustment/mud/" className="font-bold text-blue-800 hover:underline">
            Texas MUD leak adjustments — who to call and what to ask →
          </Link>
        </p>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">Before you apply anywhere</h2>
        <ul className="mt-5 list-disc space-y-3 pl-6 text-slate-600">
          <li>
            <strong className="text-blue-950">Repair the leak first.</strong>{" "}
            Every verified rule requires the leak to be fixed and usage to
            return to normal before a credit is granted.
          </li>
          <li>
            <strong className="text-blue-950">Keep the plumber&apos;s invoice.</strong>{" "}
            It is the document every adjustment asks for — repair date,
            address, type of repair, and cost. Without it, the utility has
            nothing to tie the repair to the high bill.
          </li>
          <li>
            <strong className="text-blue-950">Mind the deadline clock.</strong>{" "}
            Deadlines run from the repair date, not the bill date — 60 days
            in Fort Worth and El Paso, 90 days in Austin, 6 months in
            Houston. San Antonio and Amarillo publish no deadline, so apply
            immediately.
          </li>
          <li>
            <strong className="text-blue-950">Check the winter average.</strong>{" "}
            In most Texas cities, sewer charges are set from winter water
            use. A leak in December, January, or February can inflate your
            sewer bill for the next 12 months — and in several cities the
            leak adjustment does not correct it.
          </li>
          <li>
            <strong className="text-blue-950">Confirm the rule on the official page.</strong>{" "}
            Rules change. Every city guide links its official source — use
            it.
          </li>
        </ul>
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
            <Link href="/guides/leak-adjustment/mud/" className="font-bold text-blue-800 hover:underline">
              Texas MUD leak adjustments →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              On MUD water instead of city water? MUDs set their own rules
              — including the Eye On Water precondition some districts
              require before a leak ever happens.
            </p>
          </li>
        </ul>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">Methodology &amp; sources</h2>
        <p className="mt-3 text-slate-600">
          The rules behind these guides come from official city, utility,
          and MUD pages, rate orders, ordinances, and board minutes, all
          read Nov 16, 2026. The full research report is{" "}
          <code className="rounded bg-slate-100 px-1 text-sm">
            utility-adjustment-rules-2026-11-16.md
          </code>
          ; the machine-readable rules live in{" "}
          <code className="rounded bg-slate-100 px-1 text-sm">
            lib/utility-rules.ts
          </code>
          . Secondary sources were used only where flagged, and never as
          the sole basis for a rule. Anything marked unverified in the
          report is omitted from these guides entirely — including the
          60-day SAWS deadline reported by secondary summaries, which does
          not appear on SAWS&apos;s own page.
        </p>
        <p className="mt-3 text-slate-600">
          Houston and Dallas rules were verified from the same official
          sources (City of Houston Universal Adjustment Request page; City
          of Dallas leak adjustment page) and are now published as full
          guides in this wave — each with a worked dollar example, a
          deadline countdown, the eligibility checker, and, for Houston,
          the City-vs-MUD table. The Houston and Dallas official pages
          were re-checked live on Nov 16, 2026: Houston's 100/75/50%
          tiers and 6-month deadline are confirmed on the form, Dallas
          processing is up to 60 days, and Dallas's filing deadline is
          still not stated on the city's current page.
        </p>
        <p className="mt-6 text-xs text-slate-400">
          Disclaimer: utility rules change. The status table above was
          checked Nov 16, 2026 — confirm the rule on the official page
          before you apply. This guide is not a quote and not legal advice;
          only the utility can grant the adjustment.
        </p>
      </section>

      <CtaBand
        title="High bill after a leak?"
        subtitle="Get the repair documented first — a plumber's invoice with the date, address, and repair type is the document every adjustment asks for."
      />
    </>
  );
}
