import Link from "next/link";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { breadcrumbListSchema } from "@/lib/schema";
import CtaBand from "@/components/CtaBand";

/**
 * Methodology — one section per tool (all 12).
 *
 * Every figure below is a summary of the tool page's own methodology
 * section — nothing is added here that the tool page does not state,
 * and no new number is introduced. Where a tool page says a figure
 * does not exist, this page says so too.
 *
 * Server page, all content static/SSR. No Supabase access.
 */

export const metadata: Metadata = {
  title: "How Our Tools Calculate Numbers | Texas".slice(0, 60),
  description:
    "How each of our 12 free leak tools calculates its numbers — inputs, formulas, thresholds, and sources. Estimates for planning, never quotes.".slice(
      0,
      155
    ),
  alternates: { canonical: `${SITE_URL}/tools/methodology/` },
};

const PAGE_PATH = "/tools/methodology/";

function MethodSection({
  id,
  title,
  href,
  children,
}: {
  id: string;
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-12 scroll-mt-20 first:mt-0">
      <h2 className="text-2xl font-extrabold text-blue-950">{title}</h2>
      <p className="mt-2 text-sm text-slate-500">
        Tool:{" "}
        <Link href={href} className="font-bold text-blue-800 hover:underline">
          {title.replace(/^(\d+)\.\s*/, "")} →
        </Link>
      </p>
      <div className="mt-3 space-y-3 text-slate-600">{children}</div>
    </section>
  );
}

export default function MethodologyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbListSchema([
              { name: "Home", path: "/" },
              { name: "Tools", path: "/tools/" },
              { name: "Methodology", path: PAGE_PATH },
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
            <Link href="/tools/" className="hover:text-white hover:underline">Tools</Link>
            <span className="mx-2 text-blue-400">›</span>
            <span className="text-white">Methodology</span>
          </nav>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            How Our Tools Calculate Their Numbers
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-blue-100">
            Every tool on this site publishes its method on its own page.
            This page brings all twelve together: what each tool computes,
            the inputs it needs, the formula and thresholds it applies, and
            the sources behind them — so you can check any number before
            you rely on it.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-14">
        <MethodSection id="water-bill-spike" title="1. Water Bill Spike Splitter" href="/tools/water-bill-spike/">
          <p>
            <strong className="text-blue-950">What it computes:</strong> whether a bill jump is a leak or a
            rate increase, the extra gallons and their cost, and the most likely leak type.
          </p>
          <p>
            <strong className="text-blue-950">Inputs:</strong> your previous and current bills (gallons and
            dollars), days in the billing period, people in the house, and optionally your own cost per 1,000 gallons.
          </p>
          <p>
            <strong className="text-blue-950">Formula:</strong> extra gallons = current gallons − previous
            gallons; extra per day = extra gallons ÷ days; implied rate = bill dollars ÷ bill gallons, worked out
            separately for each bill; usage-driven cost (the leak estimate) = extra gallons × the previous bill&apos;s
            implied rate; rate-driven cost = total dollar increase − usage-driven cost (never below $0). Per-person use
            = gallons ÷ people ÷ days. The leak-type band is a rough likelihood by extra gallons per day: under 25 is a
            small, steady loss (toilet flapper, dripping faucet); 25–200 is a medium loss (running toilet, supply-line
            leak); over 200 is a large loss (slab leak, broken yard/main line).
          </p>
          <p>
            <strong className="text-blue-950">Sources:</strong> the typical benchmark of about 82 gallons per
            person per day comes from EPA WaterSense; a running toilet wastes about 200 gallons a day (EPA). No utility
            rate is invented — every rate comes from your own bills.
          </p>
        </MethodSection>

        <MethodSection id="freeze-risk-tonight" title="2. Freeze-Burst Risk Tonight" href="/tools/freeze-risk-tonight/">
          <p>
            <strong className="text-blue-950">What it computes:</strong> tonight&apos;s pipe freeze-burst risk
            band for a Texas town, from the forecast low and the hours below freezing.
          </p>
          <p>
            <strong className="text-blue-950">Inputs:</strong> your town (the forecast is read at the town&apos;s
            own coordinates) or a forecast typed in by hand. &ldquo;Tonight&rdquo; means 6pm today to 9am tomorrow,
            Central time — 16 hourly readings.
          </p>
          <p>
            <strong className="text-blue-950">Formula:</strong> tonight&apos;s low = the coldest hourly
            temperature in the window; hours below freezing = how many of the 16 readings are below 32°F; hard-freeze
            hours = how many readings are at or below 20°F. Bands: Low = no hours below 32°F; Watch = below 32°F but
            above 28°F, and fewer than 4 hours below freezing; High = 28°F or below, or 4+ hours below 32°F. Inside
            High, a low at or below 20°F is flagged as a hard freeze.
          </p>
          <p>
            <strong className="text-blue-950">Sources:</strong> the forecast is the Open-Meteo forecast,
            refreshed by a nightly run in freeze season (November–March, 02:00 UTC) and weekly in summer, fetched live
            when the stored forecast is stale. The 20°F threshold comes from the University of Illinois Building
            Research Council (1996): at or below 20°F, exposed pipes can freeze and burst within hours. The worked
            example uses Open-Meteo archive (ERA5 reanalysis) hourly temperatures for Katy on the night of February 14,
            2021 (low 14.4°F, 16 of 16 hours below freezing); about 511,000 Winter Storm Uri insurance claims were filed
            in Texas (Texas Department of Insurance).
          </p>
        </MethodSection>

        <MethodSection id="freeze-damage-estimator" title="3. Freeze-Burst Damage Estimator" href="/tools/freeze-damage-estimator/">
          <p>
            <strong className="text-blue-950">What it computes:</strong> the gallons a burst pipe releases and
            the damage dollars by room, starting from tonight&apos;s freeze risk, plus what insurance typically covers.
          </p>
          <p>
            <strong className="text-blue-950">Inputs:</strong> town or a typed-in forecast, pipe location, power
            status, flow rate, hours undetected, affected area in square feet, water category, and your deductible.
          </p>
          <p>
            <strong className="text-blue-950">Formula:</strong> the burst band reuses the Freeze-Burst Risk
            Tonight rule exactly, with two adjustments that are our own rule, not a published model: power out raises
            the band one step, and pipes in an unheated space raise a Watch night to High. Adjustments never apply with
            zero freeze hours, and the band is capped at High. Gallons released = flow rate (gallons per minute) × 60 ×
            hours undetected; the default flow rate is 6 gallons per minute — a planning assumption for a burst 1/2-inch
            line at typical household pressure, clearly labeled as an assumption, not a measured rate. Damage dollars =
            affected area × (mitigation rate + rebuild rate).
          </p>
          <p>
            <strong className="text-blue-950">Sources:</strong> water categories follow the IICRC S500 standard.
            Mitigation bands come from published trade cost guides that price by S500 category (RestoreAdvisor, 2026):
            Category 1 clean water $3–$4, Category 2 gray water $4–$6.50, Category 3 black water $7–$7.50 per square
            foot. Rebuild and repair run about $20–$37 per square foot in the same guide; the tool uses the $28 midpoint
            as an editable default. The insurance split follows the typical HO-3 / HO-B pattern (ISO HO-3 form, as
            summarized by LegalClarity): the burst pipe itself is usually not covered, tear-out and access is often
            covered, water damage from a sudden, accidental burst is often covered, and gradual leaks and seepage over
            14 days are usually excluded. The Texas Department of Insurance notes a policy might not pay if you did not
            protect pipes from freezing. The insurer share shown is damage minus your deductible, labeled a typical
            pattern, never a coverage promise.
          </p>
        </MethodSection>

        <MethodSection id="leak-cost-estimator" title="4. Leak Cost Estimator" href="/tools/leak-cost-estimator/">
          <p>
            <strong className="text-blue-950">What it computes:</strong> what leak detection should cost in your
            Texas town, the repair range, and the combined planning range — and whether a quote is fair.
          </p>
          <p>
            <strong className="text-blue-950">Inputs:</strong> town, leak type (slab, sewer, yard line, gas, pool),
            and access method.
          </p>
          <p>
            <strong className="text-blue-950">Formula:</strong> two kinds of numbers are kept strictly apart.
            Detection is local: your town&apos;s researched range from the research CSVs (price_leak_detection,
            price_slab_detection, price_sewer_camera). Slab leaks use the slab range, sewer leaks use the camera range,
            and yard-line, gas, and pool leaks use the general detection range. Repair is national and labeled
            national. Where both numbers exist (slab, yard line, full sewer replacement), the planning range is
            detection + repair, low to low and high to high. Access method and flooring change the drivers, not the
            numbers — the tool explains them in words and never invents a price multiplier.
          </p>
          <p>
            <strong className="text-blue-950">Sources:</strong> detection ranges come from our researched
            per-town data (plumber-published prices, local guides, Angi local data); the research is metro-typical, so
            towns in the same metro share the same range. Repair ranges are national: slab and yard-line repair uses
            Angi&apos;s national slab-leak repair range, $630–$4,400, average $2,300 (updated September 22, 2026);
            full sewer-line replacement uses the national guide range of $5,000–$20,000. Gas and pool have no
            gas-specific or pool-specific detection price in the researched data, so the tool shows the town&apos;s
            general detection range and labels the gap.
          </p>
        </MethodSection>

        <MethodSection id="home-buyer-leak-risk" title="5. Home-Buyer Leak Risk Report" href="/tools/home-buyer-leak-risk/">
          <p>
            <strong className="text-blue-950">What it computes:</strong> slab and sewer risk bands for a specific
            house, what the inspections should cost in that town, and a credit planning range for the option period.
          </p>
          <p>
            <strong className="text-blue-950">Inputs:</strong> six facts — town, year built, pipe material, big
            trees near the sewer line, sewer scope already done, and leak history.
          </p>
          <p>
            <strong className="text-blue-950">Formula:</strong> points are added per factor. Slab risk: 0–2 Low,
            3–4 Watch, 5+ High. Expansive clay soil +2, mixed or sandy-loam-over-clay +1, sandy soil 0; built before
            1980 +2, 1980–1999 +1, 2000 or later 0; cast iron or galvanized pipes +2, copper +1, PVC or PEX 0; prior leak
            history yes +2, don&apos;t know +1. Sewer risk: 0–1 Low, 2–3 Watch, 4+ High. Built before 1980 +2,
            1980–1999 +1; big trees near the sewer line +2; prior leak history yes +1; sewer scope already done −2. If
            pipe material is &ldquo;don&apos;t know&rdquo;, the tool infers it from the build year using the general
            Texas pattern (pre-1980 galvanized steel or cast iron; 1980s–90s copper supply with PVC drains; 2000s+ PEX
            supply with PVC drains) — always labeled &ldquo;inferred&rdquo;, never a fact about one house. The
            negotiation-credit planning range is built only from the Angi national slab-repair range ($630–$4,400,
            average $2,280, updated September 22, 2026): Watch takes the lower half ($630–$2,280), High the upper half
            ($2,280–$4,400), Low $0. Sewer-lateral replacement is never given a number here — it is priced by method,
            length, and depth, and only after a scope shows what is wrong.
          </p>
          <p>
            <strong className="text-blue-950">Sources:</strong> town soil, housing era, pipe materials, and
            inspection prices come from our researched per-town data for all 100 towns. Camera cost by access type —
            basic $100–$350, with a written report and dye test $250–$600, a brand-new cleanout $700–$2,000+ — comes
            from published plumber price pages. One gap is stated plainly: no Rio Grande Valley firm publishes a
            standalone sewer-camera price, so McAllen-metro towns show a hydrostatic-testing figure ($575–$975) instead.
          </p>
        </MethodSection>

        <MethodSection id="insurance-claim-pack" title="6. Insurance Claim Pack" href="/tools/insurance-claim-pack/">
          <p>
            <strong className="text-blue-950">What it computes:</strong> the coverage likelihood for each cost
            bucket of a Texas leak claim, the deductible math, a document checklist, and a claim-letter draft.
          </p>
          <p>
            <strong className="text-blue-950">Inputs:</strong> what caused the leak, how long it ran, which areas
            were damaged, your deductible, and the damage total.
          </p>
          <p>
            <strong className="text-blue-950">Formula:</strong> the tool shows the standard HO-B / HO-3 position
            for each bucket (pipe repair, tear-out, water damage, mold, additional living expenses, service line) and
            adjusts the likelihoods from your answers. Deductible math: the insurer pays the covered loss minus your
            deductible. The 14-day seepage wording is form-specific — the ISO HO-3 base form has no 14-day seepage
            clause, and the tool asks about your form&apos;s wording instead of stating a universal 14-day rule.
          </p>
          <p>
            <strong className="text-blue-950">Sources:</strong> every coverage fact comes from the Texas
            Department of Insurance (TDI) and ISO HO-3 form summaries, researched November 16, 2026. Since 2003, Texas
            insurers file their own forms, so your policy may word any of these differently — your declarations page is
            the final word. TDI&apos;s 2018 comparison found three seepage wordings in use in Texas: seepage over 14 or
            more days, over &ldquo;weeks, months, or years&rdquo;, or seepage that results in deterioration, corrosion,
            rust, or wet or dry rot. HO-B foundation coverage is historical: TDI Bulletin B-0032-97 (1997) took the
            position that the old standard HO-B form covered foundation damage from an accidental plumbing discharge,
            and the Texas Supreme Court agreed for the 1991 HO-B form in Balandran v. Safeco (1998) — that was the old
            form, so the tool presents it as history, never as a current guarantee. Mold sub-limits in national examples
            run $2,500–$15,000.
          </p>
        </MethodSection>

        <MethodSection id="leak-adjustment-checker" title="7. Leak Adjustment Checker" href="/tools/leak-adjustment-checker/">
          <p>
            <strong className="text-blue-950">What it computes:</strong> whether your utility will credit your
            leak bill, the estimated credit, the filing deadline, and an application pack.
          </p>
          <p>
            <strong className="text-blue-950">Inputs:</strong> town or utility, normal-month and leak-month
            gallons and dollars, and the repair date.
          </p>
          <p>
            <strong className="text-blue-950">Formula:</strong> excess usage = leak-month gallons − normal-month
            gallons; excess cost comes from your own numbers only (the difference between your two bills&apos; dollar
            amounts, or excess gallons × your cost per 1,000 gallons from your bill). The eligibility verdict is judged
            against your utility&apos;s published rule — what qualifies, whether the leak was hidden, whether usage
            returned to normal, whether you already had an adjustment inside the frequency limit, and whether the filing
            deadline has passed. The estimated credit applies your utility&apos;s real formula: Houston&apos;s 100% /
            75% / 50% tiers by repair speed; 50% for Austin, Fort Worth, El Paso, and MUD 71. Dallas reprices the
            excess at its lowest rate, and SAWS and Amarillo publish no percentage, so no dollar estimate is possible
            for them — the tool says so instead of guessing. Deadline countdown = repair date + your utility&apos;s
            filing deadline in days.
          </p>
          <p>
            <strong className="text-blue-950">Sources:</strong> every rule was read from an official city,
            utility, or MUD source on November 16, 2026 — the check date is shown with each rule. A town is matched
            only to a utility verified to serve it; other towns get an honest &ldquo;not verified yet&rdquo; and
            instructions for finding their rule, never the anchor city&apos;s rule. One caveat: for Fort Worth, no live
            fortworthtexas.gov leak-adjustment page was found — the rule rests on a copy of the city&apos;s March 2021
            application form, corroborated by the City of Denton&apos;s official August 2025 benchmark. Harris County
            MUD 501 and MUD 82 and Baker Road MUD are left out on purpose (credit terms not readable, still under board
            consideration, or granted case by case by board vote), and no published water-side policy was found for
            McAllen, Corpus Christi, or Lubbock.
          </p>
        </MethodSection>

        <MethodSection id="sewer-winter-averaging" title="8. Sewer Winter-Averaging Calculator" href="/tools/sewer-winter-averaging/">
          <p>
            <strong className="text-blue-950">What it computes:</strong> the 12-month sewer-bill tail a leak in
            the winter-averaging months causes, and whether your utility can correct the inflated average.
          </p>
          <p>
            <strong className="text-blue-950">Inputs:</strong> normal-month and leak-month gallons, your sewer
            rate per 1,000 gallons, and your utility.
          </p>
          <p>
            <strong className="text-blue-950">Formula:</strong> inflated average = (normal month&apos;s gallons
            × (averaging months − 1) + leak month&apos;s gallons) ÷ averaging months. Extra sewer per month =
            (inflated average − normal average) × your sewer rate per 1,000 gallons. 12-month tail = extra sewer per
            month × 12. Corrected bill = normal average × your sewer rate — but only when your utility&apos;s rule
            verifies that the average can be corrected; where the adjustment is water-only, or the correction is
            unverified, the tool says so instead of showing a corrected bill that may not exist. A leak outside the
            averaging months does not inflate the average at all — the tail is $0.
          </p>
          <p>
            <strong className="text-blue-950">Sources:</strong> winter-averaging rules for 13 Texas utilities,
            verified November 16, 2026, from official utility pages, rate orders, and ordinances (City of Houston,
            Dallas Water Utilities, SAWS, Austin Water, Fort Worth, El Paso Water, Amarillo, Corpus Christi Code
            Sec. 55-100, Lubbock Code, Brushy Creek MUD rate orders and board agenda, Woodlands Water, Harris County
            MUD 71 resolution). Two rules are noted where they apply: El Paso sewer is 90% of the winter average above
            a 5 CCF allowance, and Dallas sewer is the average or the current month&apos;s use, whichever is less. The
            worked example is a verified case from the Brushy Creek MUD board agenda, August 14, 2025: the sewer average
            was $423.40 a month and would fall to $40.04 if the request was approved — a 12-month tail of $4,600.32.
          </p>
        </MethodSection>

        <MethodSection id="who-pays" title="9. Who Pays? Finder" href="/tools/who-pays/">
          <p>
            <strong className="text-blue-950">What it computes:</strong> who is responsible for a leak — city,
            MUD, homeowner, or HOA — who to call first, and whether to call 811 before any digging.
          </p>
          <p>
            <strong className="text-blue-950">Inputs:</strong> where the leak is (street, yard before the meter,
            yard after the meter, inside the house, sewer line, HOA common area) and your town.
          </p>
          <p>
            <strong className="text-blue-950">Formula:</strong> the standard Texas rules, applied as general
            guidance, not a legal ruling for your address. The meter is the dividing line: the water utility or MUD
            owns the line up to the meter; the homeowner owns everything from the meter into the house. Before the meter
            = call the utility first — a leak in the street, or in the yard between the street and the meter, is
            normally the utility&apos;s to fix at its cost. After the meter = the homeowner&apos;s. Sewer: the
            homeowner owns the lateral to the city main, and that split is set by each city, so verify it with your city
            before paying for a repair. HOA common areas are the HOA&apos;s, not any single homeowner&apos;s. Call 811
            before any digging, so underground water, gas, electric, and sewer lines are marked.
          </p>
          <p>
            <strong className="text-blue-950">Sources:</strong> official city, utility, and MUD pages, rate
            orders, and ordinances, checked November 16, 2026. The tool names your water provider only for the 8 of
            our 100 towns where the research verified the serving utility (El Paso, Amarillo, Corpus Christi, Lubbock,
            McAllen, Cypress — Harris County MUD 71 for parts of town, Round Rock — Brushy Creek MUD, and The Woodlands
            — Woodlands Water). For the other 92 towns, the tool says so plainly and tells you to check your water bill,
            which prints the provider&apos;s name, or the TCEQ &ldquo;who provides water to my property&rdquo; page.
          </p>
        </MethodSection>

        <MethodSection id="cost-of-waiting" title="10. Cost of Waiting Calculator" href="/tools/cost-of-waiting/">
          <p>
            <strong className="text-blue-950">What it computes:</strong> what a leak wastes every day, week,
            month, and year, what it has already wasted, and which stage of the escalation curve you are on.
          </p>
          <p>
            <strong className="text-blue-950">Inputs:</strong> leak rate in gallons per hour (from your 2-hour
            meter test: gallons used ÷ 2, or converted from drips per minute), your water rate (cost per 1,000 gallons
            from your own bill), and how many weeks the leak has been running.
          </p>
          <p>
            <strong className="text-blue-950">Formula:</strong> gallons wasted = leak rate × 24 hours (per day),
            × 7 (per week), × 30 (per month), × 365 (per year). Dollars wasted = gallons wasted × your rate per gallon
            (your cost per 1,000 gallons ÷ 1,000). Already wasted = gallons per day × 7 × the weeks you enter. Your
            stage on the curve: under 5 weeks is month 1 (bill only); 5–12 weeks is month 3 (soil shift and cracks);
            13–26 weeks is month 6 (mold and floors); 27 weeks or more is year 1 (foundation). For context, the tool
            shows your daily loss in people&apos;s worth of water, against the typical use of about 82 gallons per
            person per day.
          </p>
          <p>
            <strong className="text-blue-950">Sources:</strong> EPA WaterSense (typical use ≈ 82 gallons per
            person per day; household leaks waste ~9,300–10,000 gallons a year; a running toilet wastes ~200 gallons a
            day; a 1-drip-per-second faucet wastes ~3,000 gallons a year, so 1 drip per minute ≈ 0.0057 gallons per
            hour). Slab leaks waste 5,000–30,000 gallons a month (Restoflo). Slab leak repair $630–$4,400, average
            $2,280 — Angi, updated September 22, 2026 (national range). Mold coverage is commonly capped at
            $2,500–$15,000 — homeowners (HO-3) policy mold sub-limits, via LegalClarity; that is a coverage cap, not a
            remediation cost. No published, citable Texas range was found for mold remediation or foundation repair
            costs, so the tool shows no number for those two stages instead of inventing one.
          </p>
        </MethodSection>

        <MethodSection id="sewer-lateral-estimator" title="11. Sewer Lateral Replacement Estimator" href="/tools/sewer-lateral-estimator/">
          <p>
            <strong className="text-blue-950">What it computes:</strong> a planning range for replacing a sewer
            lateral in Texas, by method, length, depth, and surface.
          </p>
          <p>
            <strong className="text-blue-950">Inputs:</strong> replacement method (open-cut, lining, bursting,
            spot repair), lateral length, depth, surface above the line, and town.
          </p>
          <p>
            <strong className="text-blue-950">Formula:</strong> for per-foot methods (open-cut, lining,
            bursting), the planning range = published per-foot range × your lateral length. Spot repair is priced per
            job, not per foot: $1,500–$4,000. Permit add-on: only Plano has a published permit fee ($400–$1,600), so it
            is added only when you enter Plano; every other Texas city gets the note &ldquo;permit required — fee varies
            by city&rdquo; and no fee is added. Depth and surface move you inside the published range — no dollar amount
            is added for them, because no published Texas figure prices them separately. Typical totals are shown next
            to the per-foot math as a cross-check, because per-foot math alone can understate a short job. Camera cost
            is shown separately, because it is a different job.
          </p>
          <p>
            <strong className="text-blue-950">Sources:</strong> all prices come from Texas contractor-published
            sources, checked November 16, 2026: open-cut / trench replacement $50–$250 per foot, typical total
            $4,000–$15,000 (complex jobs to $30,000+); pipe lining (CIPP) $80–$250 per foot, $5,000–$15,000; pipe
            bursting $60–$250 per foot, $6,000–$18,000; spot repair $1,500–$4,000 per job. A typical DFW residential
            lateral is 30–40 ft. SewerLineLab (surveyed August 2026, 260 quotes) puts the Texas aggregate at
            $3,800–$13,500. Camera tiers: $150–$500 through an existing cleanout is Texas-verified (cluster $250–$400);
            the toilet-pull ($175–$750) and new-cleanout ($700–$2,000+) tiers are national ranges, labeled so. No San
            Antonio, Austin, El Paso, McAllen, Corpus Christi, Lubbock, or Amarillo metro-specific lateral price was
            found — the figures are the DFW/Houston Texas evidence base, and they are not relabeled as prices for other
            metros.
          </p>
        </MethodSection>

        <MethodSection id="plumber-price-estimator" title="12. Plumber Job-Price Estimator (B2B — for plumbers)" href="/tools/plumber-price-estimator/">
          <p>
            <strong className="text-blue-950">What it computes:</strong> a flat-rate sell price for a leak job
            from the researched local going rate, with a labor and material split at your own rates and a margin check.
          </p>
          <p>
            <strong className="text-blue-950">Inputs:</strong> job type and town, hours on site, your hourly rate,
            crew size, materials at your cost, and your markup %.
          </p>
          <p>
            <strong className="text-blue-950">Formula:</strong> the local detection range is the researched
            price_leak_detection, price_slab_detection, or price_sewer_camera range for the town you pick. Your
            flat-rate sell price starts at the middle of that range — move it up or down to your own price; the tool
            never sets a price for you. Labor cost = hours on site × your hourly rate × crew size (all three are numbers
            you enter; no labor rate is published here). Materials cost = materials at your cost + your markup %, shown
            separately. Total job cost = labor + marked-up materials. Margin = sell price − total job cost, shown in
            dollars and as a percentage of the sell price — at your price and at the low, middle, and high end of the
            local range. Access method and flooring do not change the detection price; they change the repair that
            follows, so they are recorded on the job and priced on your own hours and materials. Margin bands (healthy
            25%+, thin 10–25%, below 10% priced too low) are our own planning rule of thumb, not published industry data.
          </p>
          <p>
            <strong className="text-blue-950">Sources:</strong> the pricebook holds researched detection-only
            ranges for all 100 towns in 10 Texas metros (researched 2026). Across those towns, general leak detection
            runs $125–$800, slab-leak detection $150–$950, and sewer camera inspection $100–$975. Repairs beyond
            detection use national ranges only, labeled NATIONAL: $630–$4,400, average $2,300 (Angi, updated September
            22, 2026), and slab repair $1,500–$4,000+. Two cells carry a caveat: Leander and Lakeway sewer camera uses
            the $100–$600 camera-only figure (the research cell leads with Angi&apos;s broad Austin sewer-cost range of
            $260–$1,700, which covers broader sewer work); the McAllen metro $575–$975 figure is main sewer line
            hydrostatic testing, and no Rio Grande Valley firm publishes a standalone camera price.
          </p>
        </MethodSection>

        <section className="mt-12">
          <h2 className="text-2xl font-extrabold text-blue-950">What &ldquo;estimate&rdquo; means</h2>
          <p className="mt-3 text-slate-600">
            Every number on this site is a planning range, not a quote. A quote needs the leak&apos;s location, the
            method, and the access — only on-site detection provides those. A diagnosis needs the same: only on-site
            detection can confirm a leak, its type, or its cause. And only your utility or insurer decides your rate, a
            bill adjustment, or coverage — the tools apply the published rule as we read it, but the utility&apos;s or
            insurer&apos;s own page and your own policy are the final word. Rules change: utility rules on this site
            were checked November 16, 2026, and prices were researched in November 2026, so re-check the official source
            before you file, book, or spend.
          </p>
          <h3 className="mt-8 text-xl font-extrabold text-blue-950">If a number looks wrong</h3>
          <p className="mt-3 text-slate-600">
            First, check the inputs: the wrong bill, the wrong town, or the wrong utility is the most common cause — a
            suburb&apos;s rule is not its anchor city&apos;s rule, and a rate from the wrong bill changes every dollar
            downstream. Re-run the tool with the corrected numbers. If the tool&apos;s own published rule, price, or
            threshold looks out of date, note the tool, the number, and the source that shows otherwise, and pass it on
            when you contact us — the call button is at the bottom of every tool page. Wrong numbers get fixed; the
            method above is the record to check them against.
          </p>
          <p className="mt-6 text-xs text-slate-400">
            Disclaimer: the tools on this site give estimates from the numbers you enter. They are screening aids, not
            diagnoses and never quotes. Only on-site leak detection can confirm a leak, and only your utility or insurer
            can confirm your rate, a bill adjustment, or coverage.
          </p>
        </section>
      </div>

      <CtaBand
        title="A number still doesn't add up?"
        subtitle="Describe your bills and what the tool showed — a local pro can tell you honestly whether the tool or the numbers need a second look."
      />
    </>
  );
}
