import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { breadcrumbListSchema, faqPageSchemaFromQAs } from "@/lib/schema";
import CtaBand from "@/components/CtaBand";
import { ADJUSTMENT_CITIES, getAdjustmentCity } from "@/lib/adjustment-pages";

/**
 * Leak-adjustment guide per verified city — first wave (Nov 16, 2026).
 *
 * Only the 5 metros with a VERIFIED adjustment rule get a page:
 * San Antonio (SAWS), Austin (Austin Water), Fort Worth (City of Fort
 * Worth Water — with the "re-verify on the city page" caveat, since its
 * rule rests on a 2021 form copy), El Paso (El Paso Water), Amarillo
 * (City of Amarillo Water). Houston and Dallas are deliberately NOT
 * built in this wave (WaterShortcut owns them; second wave).
 * McAllen, Corpus Christi (water-side) and Lubbock have no verified
 * policy, so they get no city page — the index says so instead.
 *
 * Every rule field on this page renders from lib/utility-rules.ts via
 * lib/adjustment-pages.ts — never from hand-typed copies. A null
 * deadline / formula means the utility does not publish it (a verified
 * absence), and the page says so plainly.
 *
 * Each city page covers THAT CITY's utility only. The anchor-city
 * scope limit is stated up front: the surrounding towns in the metro
 * run their own systems or MUDs.
 *
 * FAQ answers are 50–80 words each. The visible FAQ block and the
 * FAQPage schema are rendered from the same FAQS constant in the data
 * file, so they can never drift apart.
 *
 * Server page, all content static/SSR. No Supabase access. No
 * date construction at render — check dates are static text from research.
 */

/** Only the 5 verified cities are prerendered; anything else 404s via
 * notFound() in the page. (No `dynamicParams = false` — Next 16 with
 * Cache Components enabled rejects that segment config.) */

export function generateStaticParams() {
  return ADJUSTMENT_CITIES.map((c) => ({ city: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city } = await params;
  const page = getAdjustmentCity(city);
  if (!page) return { title: "Leak Adjustment | Real Leak Detection" };
  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: `${SITE_URL}/guides/leak-adjustment/${page.slug}/`,
    },
  };
}

export default async function AdjustmentCityPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  const page = getAdjustmentCity(city);
  if (!page) notFound();
  const rule = page.rule;
  const adj = rule.adjustment;
  if (!adj) notFound();
  const winter = rule.winterAveraging;
  const faqSchema = faqPageSchemaFromQAs(page.faqs);
  const pagePath = `/guides/leak-adjustment/${page.slug}/`;

  const deadlineText =
    adj.deadlineDays !== null
      ? `Within ${adj.deadlineDays} days of the repair date`
      : "Not published by the utility — apply as soon as the repair is complete";
  const creditText =
    adj.formula ?? "Not published by the utility";
  const maxMonthsText =
    adj.maxMonths !== null
      ? `Up to ${adj.maxMonths} billing ${adj.maxMonths === 1 ? "period" : "periods"}`
      : "Not published by the utility";

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
              { name: `Leak Adjustment in ${page.city}`, path: pagePath },
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
            <span className="text-white">Leak Adjustment in {page.city}</span>
          </nav>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            Leak Adjustment in {page.city}, TX — {page.utility} Rules
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-blue-100">{page.intro}</p>
          <p className="mt-4 max-w-2xl text-base text-blue-200">
            Rule checked <strong className="text-white">Nov 16, 2026</strong>.
            Source:{" "}
            <a
              href={rule.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-white hover:underline"
            >
              {page.utility} — official page
            </a>
            . Rules change — confirm the rule on the official page before
            you apply.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-14">
        <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5">
          <h2 className="text-lg font-extrabold text-amber-900">
            Deadline warning — apply within{" "}
            {adj.deadlineDays !== null
              ? `${adj.deadlineDays} days of the repair`
              : "days of the repair: no deadline is published"}
          </h2>
          <p className="mt-2 text-slate-700">{page.deadlineWarning}</p>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h2 className="text-lg font-extrabold text-blue-950">
            This rule covers {page.city} itself — not the whole metro
          </h2>
          <p className="mt-2 text-slate-600">{page.scopeNote}</p>
          <p className="mt-2 text-slate-600">
            If your bill names a different utility or a MUD, that
            provider&apos;s rule applies instead. See the{" "}
            <Link href="/guides/leak-adjustment/mud/" className="font-bold text-blue-800 hover:underline">
              Texas MUD leak adjustment explainer
            </Link>{" "}
            if your home is on MUD water.
          </p>
        </div>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">The rule at a glance</h2>
        <p className="mt-3 text-slate-600">
          Every field below comes from the utility&apos;s own published
          rule, checked Nov 16, 2026. Where the utility publishes nothing,
          the table says so — that is a verified absence, not a gap in
          this guide.
        </p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="w-40 p-4 font-bold text-blue-950">Utility</td>
                <td className="p-4">{page.utility}</td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-blue-950">What qualifies</td>
                <td className="p-4">{adj.qualifies}</td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-blue-950">Credit</td>
                <td className="p-4">{creditText}</td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-blue-950">Deadline</td>
                <td className="p-4">{deadlineText}</td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-blue-950">How often</td>
                <td className="p-4">{adj.frequencyLimit ?? "Not published by the utility"}</td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-blue-950">Most it covers</td>
                <td className="p-4">{maxMonthsText}</td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-blue-950">Proof required</td>
                <td className="p-4">{adj.proofRequired}</td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-blue-950">Apply</td>
                <td className="p-4">
                  <a
                    href={adj.formUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-blue-800 hover:underline"
                  >
                    {page.formLabel} →
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">What you need before you apply</h2>
        <p className="mt-3 text-slate-600">
          The plumber&apos;s invoice is the document that matters most —
          it ties the repair date, the address, and the cost to your
          account. Gather everything below before you start the request.
        </p>
        <ul className="mt-5 list-disc space-y-3 pl-6 text-slate-600">
          {page.checklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">How to apply, step by step</h2>
        <ol className="mt-5 list-decimal space-y-4 pl-6 text-slate-600">
          {page.steps.map((step) => (
            <li key={step.title}>
              <strong className="text-blue-950">{step.title}.</strong>{" "}
              {step.text}
            </li>
          ))}
        </ol>

        {winter && (
          <>
            <h2 className="mt-12 text-2xl font-extrabold text-blue-950">
              Watch out: the winter sewer average
            </h2>
            {winter.used ? (
              <>
                <p className="mt-3 text-slate-600">
                  {page.utility} sets sewer charges from winter water use —{" "}
                  {winter.months.join(", ")} — so a leak in those months can
                  inflate your sewer bill for the next 12 months, on top of
                  the high water bill itself.
                </p>
                <p className="mt-3 text-slate-600">{winter.leakMonthEffect}</p>
              </>
            ) : (
              <p className="mt-3 text-slate-600">{winter.leakMonthEffect}</p>
            )}
            <p className="mt-3 text-slate-600">
              If your leak fell in the averaging months, ask the utility
              directly whether the sewer average will be corrected — and
              keep the repair proof for that question too.
            </p>
          </>
        )}

        {page.caveats.length > 0 && (
          <>
            <h2 className="mt-12 text-2xl font-extrabold text-blue-950">Caveats — read before you rely on this</h2>
            <ul className="mt-5 list-disc space-y-3 pl-6 text-slate-600">
              {page.caveats.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-14">
          <h2 className="text-2xl font-extrabold text-blue-950">
            Leak adjustment in {page.city} — questions, answered
          </h2>
          <div className="faq mt-6 space-y-6">
            {page.faqs.map((f) => (
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
              the same repair documentation an insurer asks for — invoice,
              dates, and photos in one place.
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
          {page.townGuidePath && (
            <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <Link href={page.townGuidePath} className="font-bold text-blue-800 hover:underline">
                Leak detection in {page.city}, TX →
              </Link>
              <p className="mt-1 text-sm text-slate-600">
                The full researched guide for {page.city}: soil, housing
                era, pipe materials, and what detection really costs there.
              </p>
            </li>
          )}
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
          The rule on this page comes from the utility&apos;s own published
          sources, read Nov 16, 2026: the official leak-adjustment page
          or application form, the city code or council resolution behind
          it, and — for Fort Worth — the City of Denton&apos;s official
          benchmarking review, since no live city page was found. The full
          research report is{" "}
          <code className="rounded bg-slate-100 px-1 text-sm">
            utility-adjustment-rules-2026-11-16.md
          </code>
          ; the machine-readable rules live in{" "}
          <code className="rounded bg-slate-100 px-1 text-sm">
            lib/utility-rules.ts
          </code>
          , and this page renders its rule fields from that file.
        </p>
        <p className="mt-3 text-slate-600">
          Official source:{" "}
          <a
            href={rule.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-blue-800 hover:underline"
          >
            {page.utility}
          </a>{" "}
          — checked Nov 16, 2026. Apply on the official page linked above.
        </p>
        {rule.notes && (
          <p className="mt-3 text-slate-600">{rule.notes}</p>
        )}
        <p className="mt-6 text-xs text-slate-400">
          Disclaimer: utility rules change. The deadline, percentage, and
          frequency limit on this page were verified Nov 16, 2026 — confirm
          them on the official page before you apply. This guide is not a
          quote and not legal advice; only the utility can grant the
          adjustment.
        </p>
      </section>

      <CtaBand
        title="High bill after a leak?"
        subtitle="Get the repair documented first — a plumber's invoice with the date, address, and repair type is the document every adjustment asks for."
      />
    </>
  );
}
