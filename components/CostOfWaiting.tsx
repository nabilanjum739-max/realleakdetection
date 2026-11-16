"use client";

import { useState } from "react";
import Link from "next/link";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/site";

// EPA WaterSense benchmark: average American uses ~82 gallons per
// person per day at home (tools-research-2026-11-15.md §3.7).
const EPA_GAL_PER_PERSON_DAY = 82;
// EPA / AWWA drip figure: a faucet dripping once a second wastes about
// 3,000 gallons a year. 1 drip/min therefore wastes
// 3,000 / 60 drips-per-sec / 8,760 hours ≈ 0.0057 gal/hr.
const GAL_PER_HOUR_PER_DRIP_PER_MIN = 3000 / 60 / 8760;
// Example rate used only in the static fallback table on the tool page.
const DAYS_PER_MONTH = 30;
const DAYS_PER_YEAR = 365;

const inputCls =
  "w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-lg font-bold text-blue-950 outline-none transition focus:border-blue-800";
const labelCls = "mb-1.5 block text-sm font-bold text-slate-600";

// Escalation stages (serp-swot-tools-2026-11-16.md §A2 tool #8, §B9).
// Month 3 carries a published cost range (Angi, Sep 2026). Months 6 and
// 12 carry NO number: no verified published Texas range exists for mold
// remediation or foundation repair, and the page says so rather than
// inventing one.
interface Stage {
  when: string;
  title: string;
  body: string;
  cost: string;
  costIsNumber: boolean;
  costSource?: string;
}

const STAGES: Stage[] = [
  {
    when: "Month 1",
    title: "Bill only",
    body: "The only cost so far is the wasted water itself — the monthly figure above. Nothing is damaged yet, which is why this is the cheapest moment to act.",
    cost: "Only the wasted water — see the monthly estimate above",
    costIsNumber: false,
  },
  {
    when: "Month 3",
    title: "Soil shift and cracks",
    body: "Water leaking under the slab softens the soil. Texas clay swells when wet and shrinks when dry, so the ground moves and the slab and walls start to crack.",
    cost: "$630–$4,400, average $2,280",
    costIsNumber: true,
    costSource: "Slab leak repair, published national range (Angi, updated Sep 22, 2026). Planning range, not a quote.",
  },
  {
    when: "Month 6",
    title: "Mold and floors",
    body: "Trapped moisture feeds mold behind walls and under floors, and flooring warps or buckles. The repair is no longer one pipe — it is the pipe plus the rooms around it.",
    cost: "No number shown — costs rise sharply",
    costIsNumber: false,
    costSource:
      "No verified published range exists for mold remediation or flooring replacement in Texas — the cost depends on the area, materials, and containment needed — so no figure is shown rather than an invented one.",
  },
  {
    when: "Year 1",
    title: "Foundation",
    body: "Months of soil movement stress the foundation itself. What started as a leak can end as foundation work on top of the pipe repair, the mold cleanup, and the floors.",
    cost: "No number shown — costs rise sharply",
    costIsNumber: false,
    costSource:
      "Foundation repair varies too widely by method and extent for a single published range to be honest — so no figure is shown rather than an invented one.",
  },
];

const SIGNS = [
  "Warm spot on the floor",
  "Sound of running water when every tap is off",
  "Water bill jumped for no clear reason",
  "Water heater cycling on more often than usual",
  "Flooring warping, buckling, or damp to the touch",
] as const;

interface Result {
  galPerHr: number;
  galDay: number;
  galWeek: number;
  galMonth: number;
  galYear: number;
  costDay: number;
  costWeek: number;
  costMonth: number;
  costYear: number;
  alreadyGal: number;
  alreadyCost: number;
  weeks: number;
  stageIndex: number;
  personEquivalents: number;
}

function fmtGal(n: number): string {
  return Math.round(n).toLocaleString();
}

function fmtMoney(n: number): string {
  return `$${Math.round(n).toLocaleString()}`;
}

function fmtMoneyExact(n: number): string {
  return `$${n.toFixed(2)}`;
}

function stageIndexForWeeks(weeks: number): number {
  if (weeks < 5) return 0;
  if (weeks < 13) return 1;
  if (weeks < 27) return 2;
  return 3;
}

/**
 * Cost of Waiting Calculator — lead-gen tool #8.
 * User enters a leak rate (gal/hr from a meter test, or drips/min) plus
 * their own water rate and how long the leak has already run. The tool
 * shows gallons and dollars wasted per day / week / month / year, what
 * has already been wasted, and the damage escalation curve — month 1
 * bill only, month 3 soil shift, month 6 mold/floors, year 1
 * foundation — with a published cost range only where one exists.
 * Every number is labeled an estimate, planning range, not a quote.
 */
export default function CostOfWaiting() {
  const [mode, setMode] = useState<"meter" | "drips">("meter");
  const [galPerHr, setGalPerHr] = useState("");
  const [dripsPerMin, setDripsPerMin] = useState("");
  const [rate, setRate] = useState("");
  const [weeks, setWeeks] = useState("");
  const [signs, setSigns] = useState<boolean[]>(SIGNS.map(() => false));
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const signsCount = signs.filter(Boolean).length;

  const toggleSign = (i: number) => {
    setSigns((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  };

  const calculate = () => {
    setError(null);
    const r = parseFloat(rate);
    const w = parseFloat(weeks);
    if (isNaN(r) || r < 1 || r > 50) {
      setError("Enter your cost per 1,000 gallons — between $1 and $50. Find it on your bill (total ÷ gallons × 1,000). We never guess a rate for you.");
      return;
    }
    if (isNaN(w) || w < 0 || w > 104) {
      setError("Enter how many weeks the leak has already been running — 0 if you just found it, up to 104 weeks.");
      return;
    }
    let gph: number;
    if (mode === "meter") {
      const g = parseFloat(galPerHr);
      if (isNaN(g) || g <= 0 || g > 500) {
        setError("Enter your meter rate in gallons per hour — between 0.01 and 500. Measure it with the 2-hour meter test below.");
        return;
      }
      gph = g;
    } else {
      const d = parseFloat(dripsPerMin);
      if (isNaN(d) || d < 1 || d > 600) {
        setError("Enter the drip rate in drips per minute — between 1 and 600. Count drips for one minute at the leak.");
        return;
      }
      gph = d * GAL_PER_HOUR_PER_DRIP_PER_MIN;
    }

    const galDay = gph * 24;
    const galWeek = galDay * 7;
    const galMonth = galDay * DAYS_PER_MONTH;
    const galYear = galDay * DAYS_PER_YEAR;
    const perGal = r / 1000;
    setResult({
      galPerHr: gph,
      galDay,
      galWeek,
      galMonth,
      galYear,
      costDay: galDay * perGal,
      costWeek: galWeek * perGal,
      costMonth: galMonth * perGal,
      costYear: galYear * perGal,
      alreadyGal: galDay * 7 * w,
      alreadyCost: galDay * 7 * w * perGal,
      weeks: w,
      stageIndex: stageIndexForWeeks(w),
      personEquivalents: galDay / EPA_GAL_PER_PERSON_DAY,
    });
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  const triage =
    signsCount >= 2
      ? {
          badge: "2+ signs — book detection this week",
          badgeClass: "bg-red-100 text-red-800",
          headline: "Two or more signs means a leak is already doing damage.",
          body: "One sign alone can have another cause, but two or more together — a warm spot, running-water sound, a bill jump, a cycling heater, buckling floors — point to a leak that is already past the bill-only stage. The meter test takes one night and confirms it either way.",
        }
      : signsCount === 1
        ? {
            badge: "1 sign — check it tonight",
            badgeClass: "bg-amber-100 text-amber-800",
            headline: "One sign is worth one night of checking.",
            body: "A single sign can have another cause, so confirm it before worrying: run the overnight meter test tonight. If the meter moves with everything off, water is escaping — and the cost curve on this page shows what each month of waiting adds.",
          }
        : {
            badge: "No signs checked",
            badgeClass: "bg-slate-100 text-slate-600",
            headline: "Check any signs you have noticed.",
            body: "Tick the signs above if any apply — a warm spot, running-water sound, a bill jump, a cycling heater, or buckling floors. Two or more checked means detection this week; one means run the meter test tonight.",
          };

  return (
    <section id="cost-of-waiting" className="scroll-mt-20 bg-blue-950" aria-label="Cost of waiting calculator">
      <div className="mx-auto max-w-3xl px-4 py-14">
        <div className="rounded-3xl border border-blue-800 bg-white p-6 shadow-xl md:p-10">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
            Free tool · no signup
          </p>
          <h2 className="mt-3 text-center text-3xl font-extrabold tracking-tight text-blue-950">
            What is waiting costing you?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-slate-600">
            Enter your leak rate and your water rate. We&apos;ll show what
            the leak wastes every day, week, month, and year — and what
            each month of waiting adds to the repair.
          </p>

          {!result ? (
            <div className="mx-auto mt-8 grid max-w-xl gap-5">
              <div>
                <span className={labelCls}>How do you want to enter the leak?</span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMode("meter")}
                    aria-pressed={mode === "meter"}
                    className={`rounded-xl border-2 px-4 py-3 text-sm font-extrabold transition ${
                      mode === "meter"
                        ? "border-blue-800 bg-blue-800 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-blue-800"
                    }`}
                  >
                    Meter rate (gal/hr)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("drips")}
                    aria-pressed={mode === "drips"}
                    className={`rounded-xl border-2 px-4 py-3 text-sm font-extrabold transition ${
                      mode === "drips"
                        ? "border-blue-800 bg-blue-800 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-blue-800"
                    }`}
                  >
                    Drips per minute
                  </button>
                </div>
              </div>

              {mode === "meter" ? (
                <div>
                  <label className={labelCls} htmlFor="cow-gal-hr">Leak rate — gallons per hour</label>
                  <input
                    id="cow-gal-hr"
                    inputMode="decimal"
                    className={inputCls}
                    placeholder="e.g. 5"
                    value={galPerHr}
                    onChange={(e) => setGalPerHr(e.target.value)}
                  />
                  <p className="mt-1.5 text-xs text-slate-400">
                    How to measure it: run the{" "}
                    <Link href="/tx/houston/katy/#meter-test" className="font-bold text-blue-800 hover:underline">
                      2-hour meter test
                    </Link>{" "}
                    — turn off all water, read the meter, wait 2 hours, read it again. Gallons used ÷ 2 = gallons per hour.
                  </p>
                </div>
              ) : (
                <div>
                  <label className={labelCls} htmlFor="cow-drips">Leak size — drips per minute</label>
                  <input
                    id="cow-drips"
                    inputMode="numeric"
                    className={inputCls}
                    placeholder="e.g. 60 (one drip a second)"
                    value={dripsPerMin}
                    onChange={(e) => setDripsPerMin(e.target.value)}
                  />
                  <p className="mt-1.5 text-xs text-slate-400">
                    Count the drips for one full minute where you can see the leak. One drip a second = 60 drips a minute ≈ 3,000 gallons a year (EPA).
                  </p>
                </div>
              )}

              <div>
                <label className={labelCls} htmlFor="cow-rate">Your water rate — cost per 1,000 gallons ($)</label>
                <input
                  id="cow-rate"
                  inputMode="decimal"
                  className={inputCls}
                  placeholder="e.g. 8"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                />
                <p className="mt-1.5 text-xs text-slate-400">
                  Find it on your bill (total ÷ gallons × 1,000). We never guess a rate for you — and for context, the typical American uses about {EPA_GAL_PER_PERSON_DAY} gallons per person per day (EPA WaterSense).
                </p>
              </div>

              <div>
                <label className={labelCls} htmlFor="cow-weeks">How long has it already been leaking? (weeks)</label>
                <input
                  id="cow-weeks"
                  inputMode="numeric"
                  className={inputCls}
                  placeholder="e.g. 8 (enter 0 if you just found it)"
                  value={weeks}
                  onChange={(e) => setWeeks(e.target.value)}
                />
                <p className="mt-1.5 text-xs text-slate-400">
                  Your best guess is fine — even a rough number shows which stage of the curve you are on.
                </p>
              </div>

              <div>
                <span className={labelCls}>Warning signs you have noticed (tick any that apply)</span>
                <div className="space-y-2">
                  {SIGNS.map((s, i) => (
                    <label
                      key={s}
                      className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700"
                    >
                      <input
                        type="checkbox"
                        className="mt-0.5 h-5 w-5 shrink-0 accent-blue-800"
                        checked={signs[i]}
                        onChange={() => toggleSign(i)}
                      />
                      {s}
                    </label>
                  ))}
                </div>
              </div>

              {error && (
                <p className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>
              )}

              <button
                onClick={calculate}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-800 px-7 py-4 text-lg font-extrabold text-white transition hover:bg-blue-700"
              >
                Show what waiting costs →
              </button>
            </div>
          ) : (
            <div className="mt-8 text-center">
              <span className="inline-block rounded-full bg-red-100 px-4 py-1.5 text-sm font-extrabold text-red-800">
                Estimate — planning range, not a quote
              </span>
              <h3 className="mt-4 text-2xl font-extrabold text-blue-950">
                At {result.galPerHr < 1 ? result.galPerHr.toFixed(2) : result.galPerHr.toFixed(1)} gallons an hour, waiting costs:
              </h3>
              <p className="mx-auto mt-3 max-w-xl text-slate-600">
                That is about {fmtGal(result.galDay)} gallons a day — roughly the daily water use of{" "}
                {result.personEquivalents < 1
                  ? " less than one person"
                  : ` ${result.personEquivalents.toFixed(1)} people`}{" "}
                (typical use ≈ {EPA_GAL_PER_PERSON_DAY} gallons per person per day, EPA WaterSense).
              </p>

              <div className="mx-auto mt-8 grid max-w-xl gap-4 text-left sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-3xl font-extrabold text-blue-950">
                    {fmtGal(result.galDay)}
                    <span className="text-base font-bold text-slate-500"> gal / {fmtMoneyExact(result.costDay)}</span>
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">wasted per day (estimate)</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-3xl font-extrabold text-blue-950">
                    {fmtGal(result.galWeek)}
                    <span className="text-base font-bold text-slate-500"> gal / {fmtMoney(result.costWeek)}</span>
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">wasted per week (estimate)</p>
                </div>
                <div className="rounded-2xl bg-amber-50 p-5">
                  <p className="text-3xl font-extrabold text-blue-950">
                    {fmtGal(result.galMonth)}
                    <span className="text-base font-bold text-slate-500"> gal / {fmtMoney(result.costMonth)}</span>
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">wasted per month (estimate)</p>
                </div>
                <div className="rounded-2xl bg-red-50 p-5">
                  <p className="text-3xl font-extrabold text-blue-950">
                    {fmtGal(result.galYear)}
                    <span className="text-base font-bold text-slate-500"> gal / {fmtMoney(result.costYear)}</span>
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">wasted per year if it keeps running (estimate)</p>
                </div>
              </div>

              {result.weeks > 0 && (
                <div className="mx-auto mt-6 max-w-xl rounded-2xl bg-blue-50 p-5 text-left">
                  <p className="font-extrabold text-blue-950">
                    Already wasted in {result.weeks} {result.weeks === 1 ? "week" : "weeks"} (estimate)
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    About <strong className="text-blue-950">{fmtGal(result.alreadyGal)} gallons</strong> and{" "}
                    <strong className="text-blue-950">{fmtMoney(result.alreadyCost)}</strong> — before any repair
                    cost. That water is already gone; the question now is how many more months it runs.
                  </p>
                </div>
              )}

              <h3 className="mt-10 text-2xl font-extrabold text-blue-950">The escalation curve — what waiting adds</h3>
              <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
                The bill is only the first stage. Each stage adds a new kind of damage — and a new cost.
              </p>
              <div className="mx-auto mt-6 grid max-w-xl gap-4 text-left">
                {STAGES.map((stage, i) => (
                  <div
                    key={stage.when}
                    className={`rounded-2xl border-2 p-5 ${
                      i === result.stageIndex
                        ? "border-red-400 bg-red-50"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-extrabold uppercase tracking-wide text-slate-500">{stage.when}</p>
                      {i === result.stageIndex && (
                        <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-extrabold text-white">
                          You are here
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-lg font-extrabold text-blue-950">{stage.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{stage.body}</p>
                    <p className="mt-3 text-sm font-extrabold text-blue-950">
                      Cost: {stage.cost}
                    </p>
                    {stage.costSource && (
                      <p className="mt-1 text-xs text-slate-500">{stage.costSource}</p>
                    )}
                  </div>
                ))}
              </div>
              <p className="mx-auto mt-4 max-w-xl text-left text-xs text-slate-500">
                Why two stages show no number: mold remediation and foundation repair have no verified published
                Texas range we can cite, so this page shows no figure rather than an invented one. The month-3
                repair range is a published national range (Angi) — a planning range, not a quote for your home.
              </p>

              <div className="mx-auto mt-8 max-w-xl rounded-2xl bg-white p-6 text-left shadow-sm ring-1 ring-slate-200">
                <span className={`inline-block rounded-full px-4 py-1.5 text-sm font-extrabold ${triage.badgeClass}`}>
                  {triage.badge}
                </span>
                <h3 className="mt-4 text-xl font-extrabold text-blue-950">{triage.headline}</h3>
                <p className="mt-2 text-sm text-slate-600">{triage.body}</p>
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
                Calculate another leak
              </button>
            </div>
          )}
        </div>
        <p className="mt-4 text-center text-xs text-blue-200">
          Estimates from the numbers you enter — planning ranges, not a diagnosis and never a quote. Only on-site detection can confirm a leak.
        </p>
      </div>
    </section>
  );
}
