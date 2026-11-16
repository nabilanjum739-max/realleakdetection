"use client";

import { useState } from "react";
import Link from "next/link";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/site";
import { UTILITY_RULES, type UtilityRule } from "@/lib/utility-rules";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const UNLISTED = "unlisted";

// SAWS and Austin Water average over 3 consecutive billing periods
// (mid-Nov to mid-Mar), not over the 5 calendar months in their months
// list — so the divisor is 3 for them, months.length for everyone else.
// Source: utility-adjustment-rules-2026-11-16.md §4.
const AVERAGING_PERIODS: Record<string, number> = {
  "San Antonio Water System (SAWS)": 3,
  "Austin Water": 3,
};

// Hints shown under the sewer-rate field, from the verified rule text.
const RATE_HINTS: Record<string, string> = {
  "Brushy Creek MUD":
    "Brushy Creek MUD's published sewer rate is $3.20 per 1,000 gallons — check your bill and change it if yours differs.",
  "El Paso Water":
    "El Paso sewer is charged at 90% of the winter average for volume above a 5 CCF allowance — this estimate uses the full average, so it may overstate the tail slightly.",
  "City of Dallas Water Utilities":
    "Dallas sewer is the winter average or the current month's use, whichever is less (capped at 40,000 gal/month) — this estimate uses the average.",
};

// What to tell users whose utility's correction status is unverified and
// has no published adjustment route. Wording is from utility-rules.ts notes.
const UNVERIFIED_ADVICE: Record<string, string> = {
  "City of Lubbock Water Utilities":
    "No written leak-adjustment policy was found for Lubbock — ask City of Lubbock Utilities (806-775-2509) whether a case-by-case credit is reviewed.",
  "Woodlands Water (The Woodlands Water Agency)":
    "A one-time leak adjustment exists but no formula or deadline is published — call Woodlands Water at 281-367-1271 and ask.",
};

type CorrectionStatus = "corrected" | "not-corrected" | "unverified" | "none";

/**
 * The data file states the correction outcome in the first words of
 * leakMonthEffect ("YES — corrected", "NOT corrected", "UNVERIFIED", or
 * "No winter averaging"). This parser matches that wording exactly.
 */
function correctionStatus(rule: UtilityRule): CorrectionStatus {
  const wa = rule.winterAveraging;
  if (!wa || !wa.used) return "none";
  if (wa.leakMonthEffect.startsWith("YES")) return "corrected";
  if (wa.leakMonthEffect.startsWith("NOT corrected")) return "not-corrected";
  return "unverified";
}

const inputCls =
  "w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-lg font-bold text-blue-950 outline-none transition focus:border-blue-800";
const labelCls = "mb-1.5 block text-sm font-bold text-slate-600";

interface Result {
  utilityLabel: string;
  used: boolean;
  inWindow: boolean;
  months: string[];
  periodCount: number;
  leakMonth: string;
  normalGal: number;
  leakGal: number;
  rate: number;
  inflatedAvg: number;
  extraGalPerMonth: number;
  extraPerMonth: number;
  tail12: number;
  correctedMonthly: number;
  correctedTotal12: number;
  status: CorrectionStatus;
  effectText: string;
  sourceUrl: string;
  hasWaterAdjustment: boolean;
  adjustmentFormula: string | null;
  adjustmentDeadlineDays: number | null;
}

function fmtGal(n: number): string {
  return Math.round(n).toLocaleString();
}

function fmtMoney(n: number): string {
  return `$${Math.round(n).toLocaleString()}`;
}

/**
 * Sewer Winter-Averaging Impact Calculator — lead-gen tool #6.
 * A leak inside the averaging months inflates the sewer average for the
 * NEXT 12 months. The user enters the leak month, a normal month's
 * gallons, the leak month's gallons, their utility/MUD, and their own
 * sewer rate from their bill (never guessed). The tool shows the extra
 * sewer per month, the 12-month tail, and whether that utility's
 * adjustment can correct the average — from the verified rules in
 * lib/utility-rules.ts only. Everything is an estimate; only the
 * utility/MUD decides.
 */
export default function SewerWinterAveraging() {
  const [utility, setUtility] = useState("Brushy Creek MUD");
  const [leakMonth, setLeakMonth] = useState("December");
  const [normalGal, setNormalGal] = useState("");
  const [leakGal, setLeakGal] = useState("");
  const [rate, setRate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [unlisted, setUnlisted] = useState(false);

  const calculate = () => {
    setError(null);
    setResult(null);
    setUnlisted(false);

    if (utility === UNLISTED) {
      setUnlisted(true);
      return;
    }
    const rule = UTILITY_RULES.find((r) => r.utility === utility);
    if (!rule || !rule.winterAveraging) {
      setError("That utility's winter-averaging rule is not verified — pick your utility from the list, or choose “My utility isn't listed”.");
      return;
    }

    const ng = parseFloat(normalGal);
    const lg = parseFloat(leakGal);
    const r = parseFloat(rate);
    if ([ng, lg, r].some((x) => isNaN(x))) {
      setError("Please fill in a normal month's gallons, the leak month's gallons, and your sewer rate per 1,000 gallons.");
      return;
    }
    if (ng <= 0 || ng > 200000) {
      setError("A normal month's gallons should be between 1 and 200,000.");
      return;
    }
    if (lg <= 0 || lg > 500000) {
      setError("The leak month's gallons should be between 1 and 500,000.");
      return;
    }
    if (lg <= ng) {
      setError("The leak month should show more gallons than a normal month — otherwise there is no extra water to inflate the average.");
      return;
    }
    if (r <= 0 || r > 50) {
      setError("Your sewer rate should be between $1 and $50 per 1,000 gallons — find it on your bill.");
      return;
    }

    const wa = rule.winterAveraging;
    const status = correctionStatus(rule);
    if (!wa.used) {
      setResult({
        utilityLabel: rule.utility,
        used: false,
        inWindow: false,
        months: [],
        periodCount: 0,
        leakMonth,
        normalGal: ng,
        leakGal: lg,
        rate: r,
        inflatedAvg: ng,
        extraGalPerMonth: 0,
        extraPerMonth: 0,
        tail12: 0,
        correctedMonthly: ng * (r / 1000),
        correctedTotal12: ng * (r / 1000) * 12,
        status,
        effectText: wa.leakMonthEffect,
        sourceUrl: rule.sourceUrl,
        hasWaterAdjustment: rule.adjustment !== null,
        adjustmentFormula: rule.adjustment?.formula ?? null,
        adjustmentDeadlineDays: rule.adjustment?.deadlineDays ?? null,
      });
      return;
    }

    const inWindow = wa.months.includes(leakMonth);
    const periodCount = AVERAGING_PERIODS[rule.utility] ?? wa.months.length;
    const inflatedAvg = inWindow
      ? (ng * (periodCount - 1) + lg) / periodCount
      : ng;
    const extraGalPerMonth = Math.max(0, inflatedAvg - ng);
    const extraPerMonth = (extraGalPerMonth * r) / 1000;
    const tail12 = extraPerMonth * 12;
    // Corrected monthly sewer: the normal average, but only when the
    // utility's rule verifies that the average can be corrected. When it
    // cannot be corrected, the inflated average stays — that is the point.
    const correctedMonthly =
      status === "corrected" ? (ng * r) / 1000 : (inflatedAvg * r) / 1000;

    setResult({
      utilityLabel: rule.utility,
      used: true,
      inWindow,
      months: wa.months,
      periodCount,
      leakMonth,
      normalGal: ng,
      leakGal: lg,
      rate: r,
      inflatedAvg,
      extraGalPerMonth,
      extraPerMonth,
      tail12,
      correctedMonthly,
      correctedTotal12: correctedMonthly * 12,
      status,
      effectText: wa.leakMonthEffect,
      sourceUrl: rule.sourceUrl,
      hasWaterAdjustment: rule.adjustment !== null,
      adjustmentFormula: rule.adjustment?.formula ?? null,
      adjustmentDeadlineDays: rule.adjustment?.deadlineDays ?? null,
    });
  };

  const reset = () => {
    setResult(null);
    setUnlisted(false);
    setError(null);
  };

  const metros = [...new Set(UTILITY_RULES.map((r) => r.metro))];

  const resultBadge = result
    ? !result.used
      ? { text: "No winter averaging — no 12-month tail", cls: "bg-green-100 text-green-800" }
      : !result.inWindow
        ? { text: "Outside the averaging months — no tail", cls: "bg-green-100 text-green-800" }
        : result.status === "corrected"
          ? { text: "In the averaging window — but it can be corrected", cls: "bg-amber-100 text-amber-800" }
          : result.status === "not-corrected"
            ? { text: "In the averaging window — and it stays for 12 months", cls: "bg-red-100 text-red-800" }
            : { text: "In the averaging window — correction unverified", cls: "bg-amber-100 text-amber-800" }
    : null;

  return (
    <section id="sewer-winter-averaging" className="scroll-mt-20 bg-blue-950" aria-label="Sewer winter-averaging impact calculator">
      <div className="mx-auto max-w-3xl px-4 py-14">
        <div className="rounded-3xl border border-blue-800 bg-white p-6 shadow-xl md:p-10">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
            Free tool · no signup
          </p>
          <h2 className="mt-3 text-center text-3xl font-extrabold tracking-tight text-blue-950">
            How much will a winter leak cost you in sewer?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-slate-600">
            Many Texas utilities set your sewer charge from the water you
            used in the winter months — and bill on that average for the
            next 12 months. Enter your numbers and see the tail.
          </p>

          {!result && !unlisted ? (
            <div className="mx-auto mt-8 grid max-w-xl gap-5">
              <div>
                <label className={labelCls} htmlFor="swa-utility">Your utility or MUD</label>
                <select
                  id="swa-utility"
                  className={inputCls}
                  value={utility}
                  onChange={(e) => setUtility(e.target.value)}
                >
                  {metros.map((metro) => (
                    <optgroup key={metro} label={`${metro} metro`}>
                      {UTILITY_RULES.filter((r) => r.metro === metro).map((r) => (
                        <option key={r.utility} value={r.utility}>
                          {r.utility}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                  <option value={UNLISTED}>My utility isn&apos;t listed</option>
                </select>
                <p className="mt-1.5 text-xs text-slate-400">
                  Anchor-city rules cover the anchor city only — most suburbs run their own system or MUD.
                  If yours isn&apos;t here, pick “My utility isn&apos;t listed”.
                </p>
              </div>

              <div>
                <label className={labelCls} htmlFor="swa-month">Month the leak happened</label>
                <select
                  id="swa-month"
                  className={inputCls}
                  value={leakMonth}
                  onChange={(e) => setLeakMonth(e.target.value)}
                >
                  {MONTHS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <p className="mt-1.5 text-xs text-slate-400">
                  The averaging months are what matter — a leak in December can cost you all year;
                  a leak in July cannot inflate a winter average.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls} htmlFor="swa-normal">Normal month — gallons</label>
                  <input id="swa-normal" inputMode="decimal" className={inputCls} placeholder="e.g. 8000"
                    value={normalGal} onChange={(e) => setNormalGal(e.target.value)} />
                </div>
                <div>
                  <label className={labelCls} htmlFor="swa-leak">Leak month — gallons</label>
                  <input id="swa-leak" inputMode="decimal" className={inputCls} placeholder="e.g. 30000"
                    value={leakGal} onChange={(e) => setLeakGal(e.target.value)} />
                </div>
              </div>
              <p className="-mt-2 text-xs text-slate-400">
                Bill shows CCF instead of gallons? 1 CCF = 748 gallons — multiply your CCF by 748.
              </p>

              <div>
                <label className={labelCls} htmlFor="swa-rate">
                  Your sewer rate — $ per 1,000 gallons
                </label>
                <input id="swa-rate" inputMode="decimal" className={inputCls} placeholder="e.g. 8"
                  value={rate} onChange={(e) => setRate(e.target.value)} />
                <p className="mt-1.5 text-xs text-slate-400">
                  Find it on your bill (sewer dollars ÷ sewer gallons × 1,000). We never guess a rate for you.
                  {RATE_HINTS[utility] ? ` ${RATE_HINTS[utility]}` : ""}
                </p>
              </div>

              {error && (
                <p className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>
              )}

              <button
                onClick={calculate}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-800 px-7 py-4 text-lg font-extrabold text-white transition hover:bg-blue-700"
              >
                Show my 12-month sewer tail →
              </button>
            </div>
          ) : unlisted ? (
            <div className="mx-auto mt-8 max-w-xl text-center">
              <span className="inline-block rounded-full bg-amber-100 px-4 py-1.5 text-sm font-extrabold text-amber-800">
                Utility not verified
              </span>
              <h3 className="mt-4 text-2xl font-extrabold text-blue-950">
                We can&apos;t show another utility&apos;s months as yours.
              </h3>
              <p className="mx-auto mt-3 max-w-xl text-slate-600">
                This tool only covers the 13 Texas utilities whose
                winter-averaging rules were verified on November 16, 2026.
                Your town most likely has its own city system or MUD, and
                its averaging months — and whether an adjustment can correct
                them — are not verified here. Do not assume the months of a
                nearby big city apply to you.
              </p>
              <div className="mx-auto mt-6 max-w-xl rounded-2xl bg-blue-50 p-5 text-left">
                <p className="font-extrabold text-blue-950">How to check your own utility or MUD</p>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-600">
                  <li>Check your water bill — the utility or district name is printed on it.</li>
                  <li>Use the Association of Water Board Directors&apos; Find My District search (awbd-tx.org).</li>
                  <li>Use the TCEQ Water District Map Viewer or the TWDB Water Service Boundary Viewer.</li>
                  <li>
                    Call your utility and ask three things: which months set my sewer average, can a leak
                    adjustment correct the average, and what is the filing deadline?
                  </li>
                </ol>
                <p className="mt-3 text-sm text-slate-600">
                  TCEQ&apos;s guide:{" "}
                  <a
                    href="https://www.tceq.texas.gov/drinkingwater/whatsmysource.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-blue-800 hover:underline"
                  >
                    Who provides water to my property?
                  </a>
                </p>
              </div>
              <p className="mx-auto mt-6 max-w-xl text-slate-600">
                In the meantime, the rule is simple: if your utility uses
                winter averaging, a leak in the averaging months raises your
                sewer bill for the next 12 months — so fix the leak fast and
                keep the repair invoice.
              </p>
              <button onClick={reset} className="mt-6 text-sm font-bold text-blue-800 hover:underline">
                Check a listed utility instead
              </button>
            </div>
          ) : result && resultBadge ? (
            <div className="mt-8 text-center">
              <span className={`inline-block rounded-full px-4 py-1.5 text-sm font-extrabold ${resultBadge.cls}`}>
                {resultBadge.text}
              </span>
              <h3 className="mt-4 text-2xl font-extrabold text-blue-950">
                {!result.used
                  ? "No winter averaging — no 12-month tail."
                  : !result.inWindow
                    ? `A ${result.leakMonth} leak does not inflate next year's sewer average.`
                    : `A leak in ${result.leakMonth} costs you all year.`}
              </h3>
              <p className="mx-auto mt-3 max-w-xl text-slate-600">
                {!result.used
                  ? `${result.utilityLabel} bills sewer on monthly water use, not on a winter average — so a winter leak cannot inflate a future sewer average. You still pay sewer on the leak month's own use.`
                  : !result.inWindow
                    ? `${result.utilityLabel} averages ${result.months.join(", ")} for sewer. Your leak fell in ${result.leakMonth}, outside that window, so next year's sewer average is not inflated by it.`
                    : `Your leak fell inside ${result.utilityLabel}'s averaging months (${result.months.join(", ")}). The inflated average below sets your sewer charge for the next 12 months.`}
              </p>

              {result.used && result.inWindow && (
                <>
                  <div className="mx-auto mt-8 grid max-w-xl gap-4 text-left sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-5">
                      <p className="text-3xl font-extrabold text-blue-950">
                        {fmtGal(result.inflatedAvg)}
                        <span className="text-base font-bold text-slate-500"> gal/mo</span>
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-600">
                        inflated sewer average (was {fmtGal(result.normalGal)} gal/mo)
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-5">
                      <p className="text-3xl font-extrabold text-blue-950">
                        {fmtMoney(result.extraPerMonth)}
                        <span className="text-base font-bold text-slate-500"> /mo</span>
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-600">
                        extra sewer every month (estimate) — {fmtGal(result.extraGalPerMonth)} extra gal/mo
                      </p>
                    </div>
                    <div className="rounded-2xl bg-amber-50 p-5 sm:col-span-2">
                      <p className="text-3xl font-extrabold text-blue-950">
                        {fmtMoney(result.tail12)}
                        <span className="text-base font-bold text-slate-500"> over 12 months</span>
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-600">
                        the 12-month sewer tail (estimate): {fmtMoney(result.extraPerMonth)} × 12 months
                      </p>
                    </div>
                  </div>

                  <div className="mx-auto mt-6 max-w-xl rounded-2xl bg-slate-50 p-5 text-left">
                    <p className="font-extrabold text-blue-950">The formula, with your numbers</p>
                    <p className="mt-2 text-sm text-slate-600">
                      Inflated average = ({fmtGal(result.normalGal)} × {result.periodCount - 1} +{" "}
                      {fmtGal(result.leakGal)}) ÷ {result.periodCount} = {fmtGal(result.inflatedAvg)} gal/mo
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      12-month tail = ({fmtGal(result.inflatedAvg)} − {fmtGal(result.normalGal)}) × $
                      {result.rate} ÷ 1,000 × 12 = {fmtMoney(result.tail12)}
                    </p>
                  </div>
                </>
              )}

              {(!result.used || !result.inWindow) && (
                <div className="mx-auto mt-8 grid max-w-xl gap-4 text-left sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-5">
                    <p className="text-3xl font-extrabold text-blue-950">
                      {fmtMoney(0)}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-600">12-month sewer tail from this leak (estimate)</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-5">
                    <p className="text-3xl font-extrabold text-blue-950">
                      {fmtMoney(result.correctedMonthly)}
                      <span className="text-base font-bold text-slate-500"> /mo</span>
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-600">
                      sewer at your normal average of {fmtGal(result.normalGal)} gal/mo
                    </p>
                  </div>
                </div>
              )}

              <div className="mx-auto mt-6 max-w-xl rounded-2xl bg-blue-50 p-5 text-left">
                <p className="font-extrabold text-blue-950">
                  {result.status === "corrected"
                    ? "Corrected bill after an adjustment (estimate)"
                    : result.status === "not-corrected"
                      ? "Can an adjustment fix the sewer average? No."
                      : result.status === "unverified"
                        ? "Can an adjustment fix the sewer average? Not verified."
                        : "Your utility's rule"}
                </p>
                {result.status === "corrected" && result.used && result.inWindow && (
                  <p className="mt-2 text-sm text-slate-600">
                    If your wastewater-average correction is approved, your sewer goes back to your normal
                    average: {fmtMoney(result.correctedMonthly)} a month, or {fmtMoney(result.correctedTotal12)}{" "}
                    over 12 months — saving about {fmtMoney(result.tail12)} versus the inflated average.
                    File with proof of repairs, and watch the deadline in your utility&apos;s rule below.
                  </p>
                )}
                {result.status === "not-corrected" && result.used && result.inWindow && (
                  <p className="mt-2 text-sm text-slate-600">
                    Your utility&apos;s leak adjustment covers water only — it does not fix the sewer average,
                    so the {fmtMoney(result.tail12)} tail above stays even after a water-side credit.
                    {result.hasWaterAdjustment && result.adjustmentFormula
                      ? ` The water-side rule: ${result.adjustmentFormula}`
                      : ""}
                    {result.adjustmentDeadlineDays
                      ? ` File the water-side request within ${result.adjustmentDeadlineDays} days of the repair.`
                      : ""}
                  </p>
                )}
                {result.status === "unverified" && result.used && result.inWindow && (
                  <p className="mt-2 text-sm text-slate-600">
                    Adjustment rule not verified for your utility, check with them — no official source states
                    whether the adjustment corrects the winter average.{" "}
                    {UNVERIFIED_ADVICE[result.utilityLabel] ??
                      "Ask your utility whether the adjustment corrects the sewer average, and what the filing deadline is."}
                  </p>
                )}
                {(!result.used || !result.inWindow) && (
                  <p className="mt-2 text-sm text-slate-600">
                    {result.effectText}{" "}
                    {result.hasWaterAdjustment && result.adjustmentFormula
                      ? `A water-side leak adjustment still exists: ${result.adjustmentFormula}`
                      : ""}
                  </p>
                )}
                <p className="mt-3 text-sm text-slate-600">
                  <strong className="text-blue-950">What your utility&apos;s rule says:</strong> {result.effectText}
                </p>
                <p className="mt-3 text-sm">
                  <a
                    href={result.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-blue-800 hover:underline"
                  >
                    Check the official source →
                  </a>{" "}
                  <span className="text-slate-500">(rule checked November 16, 2026)</span>
                </p>
              </div>

              {result.used && result.inWindow && (
                <div className="mx-auto mt-6 max-w-xl rounded-2xl bg-white p-6 text-left shadow-sm ring-1 ring-slate-200">
                  <p className="font-extrabold text-blue-950">What to do now</p>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
                    <li>Fix the leak and keep the repair invoice — every adjustment route asks for proof of repairs.</li>
                    <li>
                      Split the one-month bill with the{" "}
                      <Link href="/tools/water-bill-spike/" className="font-bold text-blue-800 hover:underline">
                        Water Bill Spike Splitter
                      </Link>{" "}
                      to see the leak part versus the rate part.
                    </li>
                    <li>
                      If your utility can correct the average, file before its deadline — a late request can be
                      refused even when the leak is real.
                    </li>
                  </ul>
                </div>
              )}

              <a
                href={`tel:${PHONE_TEL}`}
                className="mt-8 inline-flex items-center gap-3 rounded-full bg-amber-500 px-8 py-4 text-lg font-extrabold text-blue-950 shadow-lg transition hover:bg-amber-400"
              >
                Call {PHONE_DISPLAY}
              </a>
              <p className="mt-3 text-sm text-slate-500">
                Non-invasive detection pinpoints it — without exploratory digging — and the report supports your adjustment filing.
              </p>
              <button onClick={reset} className="mt-6 text-sm font-bold text-blue-800 hover:underline">
                Calculate another leak
              </button>
            </div>
          ) : null}
        </div>
        <p className="mt-4 text-center text-xs text-blue-200">
          Estimates from your own numbers and your utility&apos;s verified rule — guidance, not a guarantee.
          Only your utility/MUD decides your sewer average or an adjustment.
        </p>
      </div>
    </section>
  );
}
