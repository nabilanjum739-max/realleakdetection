"use client";

import { useState } from "react";
import Link from "next/link";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/site";

// EPA WaterSense benchmark: average American uses ~82 gallons per
// person per day at home (tools-research-2026-11-15.md §3.7).
const EPA_GAL_PER_PERSON_DAY = 82;
// 1 CCF (100 cubic feet) = 748 gallons — the unit most US water bills use.
const GAL_PER_CCF = 748;

// Leak-likelihood bands (gallons of extra use per day). Rough guide only —
// the methodology on the tool page says so, and the result says so too.
const SMALL_MAX_GAL_PER_DAY = 25;
const MEDIUM_MAX_GAL_PER_DAY = 200;

const inputCls =
  "w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-lg font-bold text-blue-950 outline-none transition focus:border-blue-800";
const labelCls = "mb-1.5 block text-sm font-bold text-slate-600";

type Band = "none" | "rate" | "small" | "medium" | "large";

interface Result {
  extraGal: number;
  galPerDay: number;
  totalIncrease: number;
  usageCost: number;
  rateCost: number;
  costLow: number;
  costHigh: number;
  costIsRange: boolean;
  prevPerPerson: number;
  curPerPerson: number;
  band: Band;
  householdChanged: boolean;
  days: number;
}

function fmtGal(n: number): string {
  return Math.round(n).toLocaleString();
}

function fmtMoney(n: number): string {
  return `$${Math.round(n).toLocaleString()}`;
}

/**
 * Water Bill Spike Splitter — lead-gen tool #3.
 * User enters two bills (gallons + dollars), household size, and optionally
 * their own per-gallon rate. The tool splits the dollar spike into a
 * usage-driven part (the leak estimate) and a rate-driven part (rate/tier
 * increases), estimates the extra gallons per day, and gives a rough
 * likelihood of the leak type. Estimates only — never a diagnosis, and
 * never an invented utility rate: rates come from the user's own bills
 * (or a rate they type in) and nothing else.
 */
export default function BillSpikeSplitter({ town }: { town?: string }) {
  const [prevGal, setPrevGal] = useState("");
  const [prevAmt, setPrevAmt] = useState("");
  const [curGal, setCurGal] = useState("");
  const [curAmt, setCurAmt] = useState("");
  const [people, setPeople] = useState("4");
  const [days, setDays] = useState("30");
  const [rate, setRate] = useState("");
  const [householdChanged, setHouseholdChanged] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const calculate = () => {
    setError(null);
    const pg = parseFloat(prevGal);
    const pa = parseFloat(prevAmt);
    const cg = parseFloat(curGal);
    const ca = parseFloat(curAmt);
    const ppl = parseFloat(people);
    const d = parseFloat(days);
    const r = rate.trim() === "" ? null : parseFloat(rate);
    if ([pg, pa, cg, ca, ppl, d].some((x) => isNaN(x))) {
      setError("Please fill in both bills, household size, and days in the billing period.");
      return;
    }
    if (r !== null && (isNaN(r) || r <= 0 || r > 50)) {
      setError("Your cost per 1,000 gallons should be between $1 and $50 — or leave it blank and we'll use your bills' own rates.");
      return;
    }
    if (pg <= 0 || cg <= 0) {
      setError("Gallons on both bills must be more than 0. (Bill shows CCF? 1 CCF = 748 gallons — multiply your CCF by 748.)");
      return;
    }
    if (pa <= 0 || ca <= 0) {
      setError("Both bill amounts must be more than $0 — the split needs your bills' own rates.");
      return;
    }
    if (ppl < 1 || ppl > 20) {
      setError("Household size should be between 1 and 20 people.");
      return;
    }
    if (d < 20 || d > 45) {
      setError("Days in the billing period should be between 20 and 45 (most bills cover about 30 days).");
      return;
    }

    const extraGal = cg - pg;
    const galPerDay = extraGal / d;
    const totalIncrease = ca - pa;
    // Implied rates from the user's own bills — never invented.
    const prevRate = pa / pg; // $ per gallon on the previous bill
    const curRate = ca / cg; // $ per gallon on the current bill
    const effectiveRate = r !== null ? r / 1000 : prevRate;
    const usageCost = Math.max(0, extraGal) * effectiveRate;
    const rateCost = Math.max(0, totalIncrease - usageCost);
    const costIsRange = r === null;
    const costLow = Math.max(0, extraGal) * Math.min(prevRate, curRate);
    const costHigh = Math.max(0, extraGal) * Math.max(prevRate, curRate);
    const prevPerPerson = pg / ppl / d;
    const curPerPerson = cg / ppl / d;

    let band: Band;
    if (extraGal <= 0) band = "none";
    else if (rateCost > usageCost) band = "rate";
    else if (galPerDay < SMALL_MAX_GAL_PER_DAY) band = "small";
    else if (galPerDay <= MEDIUM_MAX_GAL_PER_DAY) band = "medium";
    else band = "large";

    setResult({
      extraGal,
      galPerDay,
      totalIncrease,
      usageCost,
      rateCost,
      costLow,
      costHigh,
      costIsRange,
      prevPerPerson,
      curPerPerson,
      band,
      householdChanged,
      days: d,
    });
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  const townSuffix = town ? ` in ${town}` : "";
  const bandCopy = {
    none: {
      badge: "No usage spike",
      badgeClass: "bg-green-100 text-green-800",
      headline: "Your water use didn't jump.",
      body: "The current bill used the same gallons or fewer than the previous one — so the extra dollars (if any) came from rates or fees, not from water escaping. Keep an eye on the next bill: a jump in gallons is the earliest warning most homeowners get.",
      likely: "No leak signal in these two bills.",
    },
    rate: {
      badge: "Rate increase is the bigger driver",
      badgeClass: "bg-amber-100 text-amber-800",
      headline: "Most of this spike is the rate, not a leak.",
      body: "Your utility charged more per gallon this month — a rate rise or a higher tier — and that explains more of the dollar jump than the extra water does. The extra gallons below are still worth checking, but start by asking your utility what changed on the rate.",
      likely: "Rate or tier change first — leak second.",
    },
    small: {
      badge: "Small leak likely",
      badgeClass: "bg-amber-100 text-amber-800",
      headline: "A small, steady loss — most often a toilet or a drip.",
      body: "This pace is a slow, continuous loss. The usual suspects are a toilet flapper that never fully seals, a dripping faucet, or a fixture that never quite shuts off. Small leaks are cheap to fix and expensive to ignore — they run 24 hours a day.",
      likely: "Most often a toilet flapper, a dripping faucet, or a slow fixture leak.",
    },
    medium: {
      badge: "Medium leak likely",
      badgeClass: "bg-red-100 text-red-800",
      headline: "A real leak is the most likely cause.",
      body: "This is too much water for a drip. The usual suspects are a toilet running (or running on and off), a supply-line leak, or several small leaks adding up. Confirm it with the overnight meter test below — it takes one look at your meter.",
      likely: "Most often a running toilet, a supply-line leak, or several small leaks adding up.",
    },
    large: {
      badge: "Large leak likely",
      badgeClass: "bg-red-100 text-red-800",
      headline: "That's a lot of water — act on this one.",
      body: "Loss at this pace points to something big: a slab leak, a broken yard or main line, or a toilet running nonstop. Every day it runs, the bill and the damage grow. Run the meter test tonight, and call a pro for non-invasive detection — no digging to find it.",
      likely: "Most often a slab leak, a broken yard/main line, or a toilet running nonstop.",
    },
  }[result?.band ?? "none"];

  const usageShare =
    result && result.totalIncrease > 0
      ? Math.min(100, Math.max(0, Math.round((result.usageCost / result.totalIncrease) * 100)))
      : 100;

  return (
    <section id="bill-spike-splitter" className="scroll-mt-20 bg-blue-950" aria-label="Water bill spike splitter">
      <div className="mx-auto max-w-3xl px-4 py-14">
        <div className="rounded-3xl border border-blue-800 bg-white p-6 shadow-xl md:p-10">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
            Free tool · no signup
          </p>
          <h2 className="mt-3 text-center text-3xl font-extrabold tracking-tight text-blue-950">
            Split your bill spike
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-slate-600">
            Enter your last two water bills. We&apos;ll split the jump into
            the part a leak caused and the part a rate increase caused — and
            estimate what the extra water is costing you.
          </p>

          {!result ? (
            <div className="mx-auto mt-8 grid max-w-xl gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls} htmlFor="bs-prev-gal">Previous bill — gallons</label>
                  <input id="bs-prev-gal" inputMode="decimal" className={inputCls} placeholder="e.g. 8000"
                    value={prevGal} onChange={(e) => setPrevGal(e.target.value)} />
                </div>
                <div>
                  <label className={labelCls} htmlFor="bs-prev-amt">Previous bill — amount ($)</label>
                  <input id="bs-prev-amt" inputMode="decimal" className={inputCls} placeholder="e.g. 64"
                    value={prevAmt} onChange={(e) => setPrevAmt(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls} htmlFor="bs-cur-gal">Current bill — gallons</label>
                  <input id="bs-cur-gal" inputMode="decimal" className={inputCls} placeholder="e.g. 14000"
                    value={curGal} onChange={(e) => setCurGal(e.target.value)} />
                </div>
                <div>
                  <label className={labelCls} htmlFor="bs-cur-amt">Current bill — amount ($)</label>
                  <input id="bs-cur-amt" inputMode="decimal" className={inputCls} placeholder="e.g. 112"
                    value={curAmt} onChange={(e) => setCurAmt(e.target.value)} />
                </div>
              </div>
              <p className="-mt-2 text-xs text-slate-400">
                Bill shows CCF instead of gallons? 1 CCF = 748 gallons — multiply your CCF by 748.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls} htmlFor="bs-people">People in the household</label>
                  <input id="bs-people" inputMode="numeric" className={inputCls}
                    value={people} onChange={(e) => setPeople(e.target.value)} />
                </div>
                <div>
                  <label className={labelCls} htmlFor="bs-days">Days in the billing period</label>
                  <input id="bs-days" inputMode="numeric" className={inputCls}
                    value={days} onChange={(e) => setDays(e.target.value)} />
                </div>
              </div>

              <div>
                <label className={labelCls} htmlFor="bs-rate">
                  Your cost per 1,000 gallons ($) — optional
                </label>
                <input id="bs-rate" inputMode="decimal" className={inputCls} placeholder="Leave blank to use your bills' own rates"
                  value={rate} onChange={(e) => setRate(e.target.value)} />
                <p className="mt-1.5 text-xs text-slate-400">
                  Find it on your bill (total ÷ gallons × 1,000). Blank is fine — we never guess a rate for you.
                </p>
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  className="mt-0.5 h-5 w-5 shrink-0 accent-blue-800"
                  checked={householdChanged}
                  onChange={(e) => setHouseholdChanged(e.target.checked)}
                />
                Someone moved in, long-term guests, or new lawn / pool watering this month
              </label>

              {error && (
                <p className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>
              )}

              <button
                onClick={calculate}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-800 px-7 py-4 text-lg font-extrabold text-white transition hover:bg-blue-700"
              >
                Split my bill spike →
              </button>
            </div>
          ) : (
            <div className="mt-8 text-center">
              <span className={`inline-block rounded-full px-4 py-1.5 text-sm font-extrabold ${bandCopy.badgeClass}`}>
                {bandCopy.badge}
              </span>
              <h3 className="mt-4 text-2xl font-extrabold text-blue-950">{bandCopy.headline}</h3>
              <p className="mx-auto mt-3 max-w-xl text-slate-600">{bandCopy.body}</p>

              <div className="mx-auto mt-8 grid max-w-xl gap-4 text-left sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-3xl font-extrabold text-blue-950">
                    {fmtGal(Math.max(0, result.extraGal))}
                    <span className="text-base font-bold text-slate-500"> gal</span>
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">extra gallons this month (estimate)</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-3xl font-extrabold text-blue-950">
                    {result.galPerDay < 10 ? result.galPerDay.toFixed(1) : fmtGal(result.galPerDay)}
                    <span className="text-base font-bold text-slate-500"> gal/day</span>
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">extra loss per day (estimate)</p>
                </div>
                <div className="rounded-2xl bg-amber-50 p-5">
                  <p className="text-3xl font-extrabold text-blue-950">
                    {result.costIsRange
                      ? `${fmtMoney(result.costLow)}–${fmtMoney(result.costHigh)}`
                      : fmtMoney(result.usageCost)}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">
                    estimated extra cost this month{result.costIsRange ? " — range from your two bills' rates" : ""}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-3xl font-extrabold text-blue-950">
                    {Math.round(result.curPerPerson)}
                    <span className="text-base font-bold text-slate-500"> gal</span>
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">
                    per person per day now (was {Math.round(result.prevPerPerson)} · typical ≈ {EPA_GAL_PER_PERSON_DAY})
                  </p>
                </div>
              </div>

              {result.extraGal > 0 && result.totalIncrease > 0 && (
                <div className="mx-auto mt-6 max-w-xl rounded-2xl bg-slate-50 p-5 text-left">
                  <p className="font-extrabold text-blue-950">What drove the ${fmtMoney(result.totalIncrease).replace("$", "")} jump?</p>
                  <div className="mt-3 flex h-4 overflow-hidden rounded-full bg-slate-200" role="img"
                    aria-label={`${usageShare}% of the dollar increase is extra water, ${100 - usageShare}% is the rate`}>
                    <div className="h-full bg-blue-800" style={{ width: `${usageShare}%` }} />
                    <div className="h-full bg-amber-500" style={{ width: `${100 - usageShare}%` }} />
                  </div>
                  <div className="mt-3 space-y-1 text-sm font-semibold text-slate-600">
                    <p>
                      <span className="mr-2 inline-block h-3 w-3 rounded-full bg-blue-800 align-middle" />
                      Extra water (likely leak): {fmtMoney(result.usageCost)} · {usageShare}%
                    </p>
                    <p>
                      <span className="mr-2 inline-block h-3 w-3 rounded-full bg-amber-500 align-middle" />
                      Rate / tier increase: {fmtMoney(result.rateCost)} · {100 - usageShare}%
                    </p>
                    {result.usageCost > result.totalIncrease && (
                      <p className="pt-1 text-slate-500">
                        Note: your per-gallon rate fell this month, so the extra water alone cost more than the
                        bill&apos;s total increase.
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="mx-auto mt-6 max-w-xl rounded-2xl bg-blue-50 p-5 text-left">
                <p className="font-extrabold text-blue-950">Most likely leak type — rough likelihood, not a diagnosis</p>
                <p className="mt-2 text-sm text-slate-600">{bandCopy.likely}</p>
                {result.householdChanged && (
                  <p className="mt-3 rounded-xl bg-white p-3 text-sm font-semibold text-slate-600">
                    You said the household changed — some of this increase may be normal use. The per-person
                    figures above matter more than the raw gallons: if per-person use jumped too, a leak is
                    still the likely cause.
                  </p>
                )}
              </div>

              <div className="mx-auto mt-6 max-w-xl rounded-2xl bg-white p-6 text-left shadow-sm ring-1 ring-slate-200">
                <p className="font-extrabold text-blue-950">What to tell a pro{townSuffix}</p>
                <p className="mt-2 text-sm text-slate-600">
                  {result.extraGal > 0
                    ? `“My bill jumped by about ${fmtGal(result.extraGal)} gallons in ${result.days} days — roughly ${result.galPerDay < 10 ? result.galPerDay.toFixed(1) : fmtGal(result.galPerDay)} gallons a day. The meter test confirmed water is escaping.”`
                    : "“My bill went up but my usage didn't — can you check whether it's a rate change or a meter issue?”"}
                </p>
                <p className="mt-3 text-sm text-slate-600">
                  Next step: run the{" "}
                  <Link href="/tx/houston/katy/#meter-test" className="font-bold text-blue-800 hover:underline">
                    overnight meter test
                  </Link>{" "}
                  — if the meter moves with everything off, water is escaping and you have a leak.
                </p>
              </div>

              <a
                href={`tel:${PHONE_TEL}`}
                className="mt-8 inline-flex items-center gap-3 rounded-full bg-amber-500 px-8 py-4 text-lg font-extrabold text-blue-950 shadow-lg transition hover:bg-amber-400"
              >
                Call {PHONE_DISPLAY}
              </a>
              <p className="mt-3 text-sm text-slate-500">
                Non-invasive detection pinpoints it — without exploratory digging.
              </p>
              <button onClick={reset} className="mt-6 text-sm font-bold text-blue-800 hover:underline">
                Split another bill
              </button>
            </div>
          )}
        </div>
        <p className="mt-4 text-center text-xs text-blue-200">
          Estimates from your own bills — not a diagnosis, and never a quote. Only on-site detection can confirm a leak.
        </p>
      </div>
    </section>
  );
}
