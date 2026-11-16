import Link from "next/link";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { breadcrumbListSchema, faqPageSchemaFromQAs } from "@/lib/schema";
import WhoPaysFinder from "@/components/WhoPaysFinder";
import CtaBand from "@/components/CtaBand";

/**
 * "Who Pays?" Responsibility Finder — tool page #7.
 * One tool, one query: "who pays for a water leak — me or the city?"
 *
 * Server-rendered by design (tools-research §7 checklist): the tool is
 * interactive, but the methodology, the verified-utility table, a no-JS
 * fallback table, and the FAQ are all in the HTML — the page is
 * complete before any JavaScript runs.
 *
 * FAQ answers are 50–80 words each (verified by hand at write time).
 * The visible FAQ block and the FAQPage schema are rendered from the same
 * FAQS constant, so they can never drift apart.
 */

export const metadata: Metadata = {
  title: "Who Pays for a Leak? Responsibility Finder".slice(0, 60),
  description:
    "Find out who pays for a water leak in Texas — city, MUD, homeowner or HOA — who to call first, and whether to call 811. Free tool, no signup.".slice(
      0,
      155
    ),
  alternates: { canonical: `${SITE_URL}/tools/who-pays/` },
};

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "Who pays for a leak before the meter?",
    a: "Your water utility or MUD pays. The Texas pattern is that the utility owns the water line up to the meter, and the homeowner owns everything from the meter into the house. A leak in the street, or in the yard between the street and the meter, is the utility's to fix at its cost. Report it to the utility — a plumber cannot repair the utility's line, and you should not pay for a visit you do not need.",
  },
  {
    q: "Is a yard leak mine or the city's?",
    a: "It depends on which side of the meter the leak is on. The utility owns the line up to the meter, so a leak between the street and the meter is normally the city's to fix. A leak past the meter — in the yard line or under the slab — is the homeowner's. If you cannot tell, call the utility first: they can say where the meter sits and which side the water is coming from.",
  },
  {
    q: "Do I call 811 before digging to find a leak?",
    a: "Yes — call 811 before any digging, even a small hole to expose a pipe. The call gets underground water, gas, electric and sewer lines marked, so nobody hits one while digging. Never dig first and call later: a shovel through a gas or electric line turns a water leak into a far worse emergency. If a utility or plumber is doing the digging, they make the 811 call as part of the job.",
  },
  {
    q: "Who pays for a sewer line leak?",
    a: "Usually the homeowner. The standard pattern in Texas is that the homeowner owns the sewer lateral — the line from the house to the city main — and the city owns the main itself. That split is set by each city, so confirm it with your city before paying for a repair, because the rule can vary. A camera inspection shows where the break is, which is the evidence your city or insurer asks for.",
  },
  {
    q: "Who pays if the leak is under my slab?",
    a: "You do — the homeowner. Everything from the meter into the house is the homeowner's, including the water lines buried under the slab. A slab leak is yours to find and fix, and the cost of the repair is yours too. Find it before anyone digs: non-invasive detection pinpoints the leak under the concrete, so the repair opens one small spot instead of cutting the floor to go looking for it.",
  },
  {
    q: "What should I say when I call my water utility?",
    a: "Say where the water is, your address, and that you want to know whether the leak is on their side of the meter. Have your account number from your water bill ready, plus a photo of where the water is showing and the date you first noticed it. Ask two things: will they send someone to check, and what happens if the leak turns out to be past the meter. Write down the name of the person you spoke to.",
  },
];

const TOOL_PATH = "/tools/who-pays/";

export default function WhoPaysPage() {
  const faqSchema = faqPageSchemaFromQAs(FAQS);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbListSchema([
              { name: "Home", path: "/" },
              { name: "Who Pays? Responsibility Finder", path: TOOL_PATH },
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
            <span className="text-white">Who Pays? Responsibility Finder</span>
          </nav>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            Who pays for a water leak — me or the city?
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-blue-100">
            Before you call a plumber, find out whose leak it is. This free
            tool tells you who is responsible — city, MUD, homeowner or HOA —
            who to call first, whether to call 811 before any digging, and
            what to say on the call. If it is the city&apos;s leak, we will
            tell you to call the city first, not us.
          </p>
        </div>
      </section>

      <WhoPaysFinder />

      <section className="mx-auto max-w-4xl px-4 py-14">
        <h2 className="text-2xl font-extrabold text-blue-950">How the finder decides — the responsibility rules</h2>
        <p className="mt-3 text-slate-600">
          These are the standard Texas rules the tool uses. They are general
          guidance, not a legal ruling for your address — your utility or
          MUD&apos;s own rules decide, and the tool tells you to confirm with
          them. Nothing here is a per-town legal fact:
        </p>
        <ol className="mt-5 list-decimal space-y-3 pl-6 text-slate-600">
          <li>
            <strong className="text-blue-950">The meter is the dividing line.</strong> The water
            utility or MUD owns the line up to the meter; the homeowner owns
            everything from the meter into the house.
          </li>
          <li>
            <strong className="text-blue-950">Before the meter = call the utility first.</strong> A
            leak in the street, or in the yard between the street and the
            meter, is normally the utility&apos;s to fix at its cost — not a
            plumber&apos;s job, and not a visit you should pay for.
          </li>
          <li>
            <strong className="text-blue-950">After the meter = the homeowner&apos;s.</strong> A leak
            past the meter — in the yard line, under the slab, or inside the
            house — is the homeowner&apos;s to find and fix.
          </li>
          <li>
            <strong className="text-blue-950">Sewer: the homeowner owns the lateral to the city
            main.</strong> That split is set by each city, so verify it with
            your city before paying for a repair. HOA common areas are the
            HOA&apos;s, not any single homeowner&apos;s.
          </li>
          <li>
            <strong className="text-blue-950">Call 811 before any digging.</strong> The call gets
            underground water, gas, electric and sewer lines marked, so
            nobody hits one while digging for a leak.
          </li>
        </ol>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">Towns where we verified the serving utility</h2>
        <p className="mt-3 text-slate-600">
          The tool names your water provider only for the towns below — the
          8 of our 100 towns where our November 16, 2026 research verified
          the serving utility from official city, utility or MUD sources.
          For the other 92 towns, the tool says so plainly and tells you to
          check your water bill, which prints the provider&apos;s name. The
          anchor-city rules (Houston, Dallas, SAWS, Austin, Fort Worth)
          cover the anchor city only — none of the suburbs in those metros
          is served by the anchor-city utility, so they are never shown to
          a suburb homeowner.
        </p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600">
                <th className="p-4 font-bold">Town</th>
                <th className="p-4 font-bold">Serving utility / MUD (verified)</th>
                <th className="p-4 font-bold">Checked</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr><td className="p-4 font-semibold">El Paso</td><td className="p-4">El Paso Water</td><td className="p-4">Nov 16, 2026</td></tr>
              <tr><td className="p-4 font-semibold">Amarillo</td><td className="p-4">City of Amarillo Water</td><td className="p-4">Nov 16, 2026</td></tr>
              <tr><td className="p-4 font-semibold">Corpus Christi</td><td className="p-4">City of Corpus Christi Water</td><td className="p-4">Nov 16, 2026</td></tr>
              <tr><td className="p-4 font-semibold">Lubbock</td><td className="p-4">City of Lubbock Water Utilities</td><td className="p-4">Nov 16, 2026</td></tr>
              <tr><td className="p-4 font-semibold">McAllen</td><td className="p-4">McAllen Public Utility (MPU)</td><td className="p-4">Nov 16, 2026</td></tr>
              <tr><td className="p-4 font-semibold">Cypress</td><td className="p-4">Harris County MUD 71 — parts of town, verify by address</td><td className="p-4">Nov 16, 2026</td></tr>
              <tr><td className="p-4 font-semibold">Round Rock</td><td className="p-4">Brushy Creek MUD — Brushy Creek community, verify by address</td><td className="p-4">Nov 16, 2026</td></tr>
              <tr><td className="p-4 font-semibold">The Woodlands</td><td className="p-4">Woodlands Water (The Woodlands Water Agency)</td><td className="p-4">Nov 16, 2026</td></tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          Sources: official city, utility and MUD pages, rate orders and
          ordinances, checked November 16, 2026. Rules change — re-check
          with your provider before relying on a name or a deadline. If
          your town is not in this table, your provider is printed on your
          water bill, or look it up on the{" "}
          <a
            href="https://www.tceq.texas.gov/drinkingwater/whatsmysource.html"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-blue-800 hover:underline"
          >
            TCEQ &ldquo;who provides water to my property&rdquo; page
          </a>
          .
        </p>

        <h2 className="mt-12 text-2xl font-extrabold text-blue-950">Quick reference — no tool needed</h2>
        <p className="mt-3 text-slate-600">
          If you can&apos;t use the interactive tool, this table gives the same
          answers for five common problems. It is general guidance — your
          utility or MUD&apos;s own rules decide.
        </p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600">
                <th className="p-4 font-bold">Problem</th>
                <th className="p-4 font-bold">Who pays</th>
                <th className="p-4 font-bold">Who to call first</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr><td className="p-4 font-semibold">Water pooling in the street</td><td className="p-4">City / utility</td><td className="p-4">Your water utility first — do not hire a plumber</td></tr>
              <tr><td className="p-4 font-semibold">Soggy strip in the yard before the meter</td><td className="p-4">City / utility</td><td className="p-4">Your utility first; call 811 before any digging</td></tr>
              <tr><td className="p-4 font-semibold">Warm spot or damp floor over the slab</td><td className="p-4">Homeowner</td><td className="p-4">A detection visit; call 811 before any digging</td></tr>
              <tr><td className="p-4 font-semibold">Water through a wall or ceiling inside</td><td className="p-4">Homeowner</td><td className="p-4">Shut off the water, then call a plumber</td></tr>
              <tr><td className="p-4 font-semibold">Sewage smell over the sewer line</td><td className="p-4">Homeowner (lateral to the city main — verify per city)</td><td className="p-4">A sewer camera inspection; call 811 before any digging</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-14">
          <h2 className="text-2xl font-extrabold text-blue-950">Who pays for a leak — questions, answered</h2>
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
              If the leak showed up as a bill spike first: split the jump into the leak part and the rate part.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/tools/freeze-risk-tonight/" className="font-bold text-blue-800 hover:underline">
              Freeze-Burst Risk Tonight →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              If the leak followed a freeze: tonight&apos;s pipe freeze-burst risk for your town, and what to do before bed.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/tools/leak-adjustment-checker/" className="font-bold text-blue-800 hover:underline">
              Leak-Adjustment Eligibility Checker →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              If the leak is yours and the bill spiked: check whether your utility will credit the leak month — and generate the application pack.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/services/water-main-leak-detection/" className="font-bold text-blue-800 hover:underline">
              Water main leak detection →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              For a broken yard or main line on your side of the meter: pressure testing plus acoustic pinpointing before any excavation.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/services/slab-leak-detection/" className="font-bold text-blue-800 hover:underline">
              Slab leak detection →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              For a leak under the slab: how acoustic and thermal equipment pinpoints it under concrete without digging.
            </p>
          </li>
          <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/services/sewer-line-leak-detection/" className="font-bold text-blue-800 hover:underline">
              Sewer line leak detection →
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              For a sewer lateral leak: camera inspection and diagnosis before any repair decision.
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
          Disclaimer: this tool gives general information about who is usually responsible for a water or sewer
          leak in Texas. It is not legal advice, and it is not a ruling for your address. Responsibility is set
          by your utility or MUD&apos;s own rules and by your city — confirm with them before you pay for a
          repair. Only on-site inspection can confirm where a leak is.
        </p>
      </section>

      <CtaBand
        title="Leak on your side of the meter?"
        subtitle="If the finder says the leak is yours, describe what you see — a local pro can tell you honestly whether you need detection or something else."
      />
    </>
  );
}
