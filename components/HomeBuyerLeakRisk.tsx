"use client";

import { useState } from "react";
import Link from "next/link";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/site";
import { BUYER_TOWNS, findBuyerTownByZip, type BuyerTown } from "@/lib/buyer-risk-data";

// Angi national slab-repair range, updated Sep 22, 2026
// (serp-swot-tools-2026-11-16.md §B3). The negotiation-credit planning
// range is built from this range ONLY — the lower half for Watch, the
// upper half for High. No Texas repair total is invented anywhere:
// sewer-lateral replacement is priced by method/length/depth after a
// scope, so it is never given a number on this page.
const ANGI_SLAB_LOW = 630;
const ANGI_SLAB_AVG = 2280;
const ANGI_SLAB_HIGH = 4400;

// Sewer camera cost tiers by access type (serp-swot-tools §B4, from
// published plumber pages): basic $100–$350, with report/dye $250–$600,
// new cleanout $700–$2,000+. Shown as published tiers, not our prices.
const CAMERA_TIER_BASIC = "$100–$350";
const CAMERA_TIER_REPORT = "$250–$600";
const CAMERA_TIER_CLEANOUT = "$700–$2,000+";

const inputCls =
  "w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-lg font-bold text-blue-950 outline-none transition focus:border-blue-800";
const labelCls = "mb-1.5 block text-sm font-bold text-slate-600";

type Band = "low" | "watch" | "high";

interface Factor {
  text: string;
  points: number;
}

interface Result {
  town: BuyerTown;
  yearBuilt: number;
  pipeLabel: string;
  pipeInferred: boolean;
  slabBand: Band;
  sewerBand: Band;
  slabFactors: Factor[];
  sewerFactors: Factor[];
  slabPoints: number;
  sewerPoints: number;
  creditLow: number;
  creditHigh: number;
}

function fmtMoney(n: number): string {
  return `$${Math.round(n).toLocaleString()}`;
}

/**
 * Pipe material inferred from build year — the general Texas pattern
 * from the Katy QA baseline (serp-swot-tools §C1): pre-1980
 * galvanised/cast iron, 1980s–90s copper/PVC, 2000s+ PEX. A general
 * pattern, never a per-house fact — always labeled "inferred".
 */
function inferredPipe(year: number): { label: string; points: number } {
  if (year < 1980)
    return { label: "Cast iron / galvanised steel (inferred from build year)", points: 2 };
  if (year < 2000)
    return { label: "Copper supply, PVC drains (inferred from build year)", points: 1 };
  return { label: "PEX supply, PVC drains (inferred from build year)", points: 0 };
}

function eraPoints(year: number): number {
  if (year < 1980) return 2;
  if (year < 2000) return 1;
  return 0;
}

function eraLabel(year: number): string {
  if (year < 1980) return `Built ${year} — pre-1980`;
  if (year < 2000) return `Built ${year} — 1980s–90s`;
  return `Built ${year} — 2000s or later`;
}

/**
 * Home-Buyer Leak Risk Report — tool #4 (serp-swot-tools §A2).
 * Six facts (town/ZIP, year built, pipe material, big trees, sewer
 * scope done, prior leak history) → a slab risk band + a sewer risk
 * band, expected inspection costs from the town's researched prices,
 * a negotiation-credit planning range, and an option-period checklist.
 * Estimates only — never an inspection, never a guarantee.
 */
export default function HomeBuyerLeakRisk({ town }: { town?: string }) {
  const defaultSlug =
    town && BUYER_TOWNS.some((t) => t.slug === town) ? town : "katy";
  const [slug, setSlug] = useState(defaultSlug);
  const [zip, setZip] = useState("");
  const [yearBuilt, setYearBuilt] = useState("");
  const [pipe, setPipe] = useState("dont-know");
  const [trees, setTrees] = useState("no");
  const [scopeDone, setScopeDone] = useState("no");
  const [history, setHistory] = useState("dont-know");
  const [optionDays, setOptionDays] = useState("");
  const [optionEnd, setOptionEnd] = useState("");
  const [deadline, setDeadline] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const selectedTown =
    BUYER_TOWNS.find((t) => t.slug === slug) ?? BUYER_TOWNS[0];

  const bandCopy = {
    low: {
      badge: "Low",
      badgeClass: "bg-green-100 text-green-800",
      headline: "Low risk — nothing in these facts points to a leak.",
    },
    watch: {
      badge: "Watch",
      badgeClass: "bg-amber-100 text-amber-800",
      headline: "Watch — one or two risk factors. Check before you close.",
    },
    high: {
      badge: "High",
      badgeClass: "bg-red-100 text-red-800",
      headline: "High risk — several risk factors stack up. Inspect first.",
    },
  };

  const calculate = () => {
    setError(null);
    const t = BUYER_TOWNS.find((x) => x.slug === slug);
    if (!t) {
      setError("Pick a town from the list first.");
      return;
    }
    const year = parseInt(yearBuilt, 10);
    if (isNaN(year) || year < 1900 || year > 2026) {
      setError("Enter the year the house was built — between 1900 and 2026.");
      return;
    }

    const inferred = pipe === "dont-know";
    const pipeInfo = inferred
      ? inferredPipe(year)
      : pipe === "cast-iron" || pipe === "galvanised"
        ? { label: pipe === "cast-iron" ? "Cast iron" : "Galvanised steel", points: 2 }
        : pipe === "copper"
          ? { label: "Copper", points: 1 }
          : { label: pipe === "pvc" ? "PVC" : "PEX", points: 0 };

    const soilPoints = t.soilRisk === "high" ? 2 : t.soilRisk === "moderate" ? 1 : 0;
    const soilLabel =
      t.soilRisk === "high"
        ? "Expansive clay soil — moves with wet and dry seasons"
        : t.soilRisk === "moderate"
          ? "Mixed / sandy-loam-over-clay soil — some movement"
          : "Sandy soil — little shrink-swell movement";
    const historySlabPoints = history === "yes" ? 2 : history === "dont-know" ? 1 : 0;

    const slabFactors: Factor[] = [
      { text: `${soilLabel} in ${t.town} (${t.soilShort})`, points: soilPoints },
      { text: eraLabel(year), points: eraPoints(year) },
      { text: `Pipes: ${pipeInfo.label}`, points: pipeInfo.points },
      {
        text:
          history === "yes"
            ? "Prior leak history — a past leak can mean the same weakness is still there"
            : history === "dont-know"
              ? "Leak history unknown — ask the seller; unknown counts against the house, not for it"
              : "No prior leak history reported",
        points: historySlabPoints,
      },
    ];
    const slabPoints = slabFactors.reduce((s, f) => s + f.points, 0);
    const slabBand: Band = slabPoints >= 5 ? "high" : slabPoints >= 3 ? "watch" : "low";

    const historySewerPoints = history === "yes" ? 1 : 0;
    const sewerFactors: Factor[] = [
      { text: eraLabel(year), points: eraPoints(year) },
      {
        text:
          trees === "yes"
            ? "Big trees near the sewer line — roots seek out old joints and cracks"
            : "No big trees near the sewer line",
        points: trees === "yes" ? 2 : 0,
      },
      {
        text:
          history === "yes"
            ? "Prior leak history — ask whether any of it was the sewer line"
            : "No prior leak history reported for the sewer line",
        points: historySewerPoints,
      },
      {
        text:
          scopeDone === "yes"
            ? "Sewer scope already done — get the video and the written report before closing"
            : "No sewer scope done yet — the line has never been seen from the inside",
        points: scopeDone === "yes" ? -2 : 0,
      },
    ];
    const sewerPoints = Math.max(
      0,
      sewerFactors.reduce((s, f) => s + f.points, 0)
    );
    const sewerBand: Band =
      sewerPoints >= 4 ? "high" : sewerPoints >= 2 ? "watch" : "low";

    // Negotiation-credit planning range — built ONLY from the sourced
    // Angi national slab-repair range ($630–$4,400, avg $2,280, Sep 2026).
    // Worst band High → upper half; Watch → lower half; Low → $0.
    // Sewer-lateral replacement is NOT in this number: it is priced by
    // method/length/depth after a scope, so no number is given for it.
    const worst: Band =
      slabBand === "high" || sewerBand === "high"
        ? "high"
        : slabBand === "watch" || sewerBand === "watch"
          ? "watch"
          : "low";
    const creditLow =
      worst === "high" ? ANGI_SLAB_AVG : worst === "watch" ? ANGI_SLAB_LOW : 0;
    const creditHigh =
      worst === "high" ? ANGI_SLAB_HIGH : worst === "watch" ? ANGI_SLAB_AVG : 0;

    setResult({
      town: t,
      yearBuilt: year,
      pipeLabel: pipeInfo.label,
      pipeInferred: inferred,
      slabBand,
      sewerBand,
      slabFactors,
      sewerFactors,
      slabPoints,
      sewerPoints,
      creditLow,
      creditHigh,
    });
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  const lookupZip = () => {
    const z = zip.trim();
    if (!/^\d{5}$/.test(z)) {
      setError("Enter a 5-digit ZIP code — or pick a town from the list.");
      return;
    }
    const hit = findBuyerTownByZip(z);
    if (!hit) {
      setError(
        `ZIP ${z} isn't in our 100-town list. Pick the nearest town from the list instead.`
      );
      return;
    }
    setError(null);
    setSlug(hit.slug);
  };

  // Dates are computed ONLY inside event handlers — never during render
  // (Next 16 blocks render-time `new Date()` in Client Components).
  const setDeadlineFromDays = () => {
    const d = parseInt(optionDays, 10);
    if (isNaN(d) || d < 0 || d > 60) {
      setError("Days left in the option period should be between 0 and 60.");
      return;
    }
    setError(null);
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + d);
    const label = expiry.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    setDeadline(
      d === 0
        ? `Your option period ends today (${label}) — the scope has to happen now, before you sign anything else.`
        : d === 1
          ? `Your option period ends tomorrow (${label}) — 1 day left. Book the sewer scope and slab check today.`
          : `Your option period ends ${label} — ${d} days left.`
    );
  };

  const setDeadlineFromDate = () => {
    if (!optionEnd) {
      setError("Pick your option-period end date from the calendar.");
      return;
    }
    const end = new Date(`${optionEnd}T12:00:00`);
    if (isNaN(end.getTime())) {
      setError("That date doesn't look right — pick it from the calendar.");
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = Math.round((end.getTime() - today.getTime()) / 86400000);
    if (days < 0) {
      setError("That date is in the past — the option period has already ended.");
      return;
    }
    setError(null);
    const label = end.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    setDeadline(
      days === 0
        ? `Your option period ends today (${label}) — the scope has to happen now, before you sign anything else.`
        : days === 1
          ? `Your option period ends tomorrow (${label}) — 1 day left. Book the sewer scope and slab check today.`
          : `Your option period ends ${label} — ${days} days left.`
    );
  };

  const metros = [...new Set(BUYER_TOWNS.map((t) => t.metro))];

  const renderBandCard = (
    title: string,
    band: Band,
    points: number,
    factors: Factor[],
    note: string
  ) => {
    const copy = bandCopy[band];
    return (
      <div className="rounded-2xl border border-slate-200 p-5 text-left">
        <p className="font-extrabold text-blue-950">{title}</p>
        <span
          className={`mt-3 inline-block rounded-full px-4 py-1.5 text-sm font-extrabold ${copy.badgeClass}`}
        >
          {copy.badge} · {points} points
        </span>
        <p className="mt-3 font-bold text-blue-950">{copy.headline}</p>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          {factors.map((f) => (
            <li key={f.text} className="flex gap-2">
              <span
                className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${
                  f.points > 0
                    ? "bg-red-100 text-red-700"
                    : f.points < 0
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-500"
                }`}
              >
                {f.points > 0 ? `+${f.points}` : f.points}
              </span>
              <span>{f.text}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-slate-500">{note}</p>
      </div>
    );
  };

  return (
    <section id="home-buyer-leak-risk" className="scroll-mt-20 bg-blue-950" aria-label="Home-buyer leak risk report">
      <div className="mx-auto max-w-3xl px-4 py-14">
        <div className="rounded-3xl border border-blue-800 bg-white p-6 shadow-xl md:p-10">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
            Free tool · no signup
          </p>
          <h2 className="mt-3 text-center text-3xl font-extrabold tracking-tight text-blue-950">
            Your home-buyer leak risk report
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-slate-600">
            Six facts about the house you&apos;re buying — and you get a slab
            risk band, a sewer risk band, what the inspections should cost
            in that town, and what to ask for before your option period
            runs out. Estimates only, never an inspection.
          </p>

          {!result ? (
            <div className="mx-auto mt-8 grid max-w-xl gap-5">
              <div>
                <label className={labelCls} htmlFor="hb-town">Town the house is in</label>
                <select
                  id="hb-town"
                  className={inputCls}
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setZip("");
                  }}
                >
                  {metros.map((metro) => (
                    <optgroup key={metro} label={`${metro} metro`}>
                      {BUYER_TOWNS.filter((t) => t.metro === metro).map((t) => (
                        <option key={t.slug} value={t.slug}>
                          {t.town}, TX
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <p className="mt-1.5 text-xs text-slate-400">
                  {selectedTown.town} soil: {selectedTown.soilShort}
                </p>
              </div>

              <div>
                <label className={labelCls} htmlFor="hb-zip">
                  Or enter the house&apos;s ZIP code
                </label>
                <div className="flex gap-3">
                  <input
                    id="hb-zip"
                    inputMode="numeric"
                    className={inputCls}
                    placeholder="e.g. 77494"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") lookupZip();
                    }}
                  />
                  <button
                    onClick={lookupZip}
                    className="shrink-0 rounded-full bg-blue-800 px-6 py-3 text-base font-extrabold text-white transition hover:bg-blue-700"
                  >
                    Find town
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls} htmlFor="hb-year">Year built</label>
                  <input
                    id="hb-year"
                    inputMode="numeric"
                    className={inputCls}
                    placeholder="e.g. 1975"
                    value={yearBuilt}
                    onChange={(e) => setYearBuilt(e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls} htmlFor="hb-pipe">Pipe material</label>
                  <select
                    id="hb-pipe"
                    className={inputCls}
                    value={pipe}
                    onChange={(e) => setPipe(e.target.value)}
                  >
                    <option value="dont-know">Don&apos;t know — infer from year built</option>
                    <option value="cast-iron">Cast iron</option>
                    <option value="galvanised">Galvanised steel</option>
                    <option value="copper">Copper</option>
                    <option value="pvc">PVC</option>
                    <option value="pex">PEX</option>
                  </select>
                </div>
              </div>
              <p className="-mt-2 text-xs text-slate-400">
                Don&apos;t know the pipes? The general Texas pattern is pre-1980 galvanised/cast iron, 1980s–90s
                copper/PVC, 2000s+ PEX — used only as an inference, and labeled as one.
              </p>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelCls} htmlFor="hb-trees">Big trees near the sewer line?</label>
                  <select id="hb-trees" className={inputCls} value={trees} onChange={(e) => setTrees(e.target.value)}>
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls} htmlFor="hb-scope">Sewer scope done?</label>
                  <select id="hb-scope" className={inputCls} value={scopeDone} onChange={(e) => setScopeDone(e.target.value)}>
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls} htmlFor="hb-history">Prior leak history?</label>
                  <select id="hb-history" className={inputCls} value={history} onChange={(e) => setHistory(e.target.value)}>
                    <option value="dont-know">Don&apos;t know</option>
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="font-extrabold text-blue-950">Option period countdown (optional)</p>
                <p className="mt-1 text-sm text-slate-600">
                  Enter the days left, or the end date — the tool works out when your option expires.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls} htmlFor="hb-days">Days left in option period</label>
                    <input
                      id="hb-days"
                      inputMode="numeric"
                      className={inputCls}
                      placeholder="e.g. 7"
                      value={optionDays}
                      onChange={(e) => setOptionDays(e.target.value)}
                    />
                    <button
                      onClick={setDeadlineFromDays}
                      className="mt-2 w-full rounded-full bg-blue-800 px-4 py-2 text-sm font-extrabold text-white transition hover:bg-blue-700"
                    >
                      Set my deadline
                    </button>
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="hb-end">Or option end date</label>
                    <input
                      id="hb-end"
                      type="date"
                      className={inputCls}
                      value={optionEnd}
                      onChange={(e) => setOptionEnd(e.target.value)}
                    />
                    <button
                      onClick={setDeadlineFromDate}
                      className="mt-2 w-full rounded-full bg-blue-800 px-4 py-2 text-sm font-extrabold text-white transition hover:bg-blue-700"
                    >
                      Count from this date
                    </button>
                  </div>
                </div>
                {deadline && (
                  <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm font-bold text-amber-800">{deadline}</p>
                )}
              </div>

              {error && (
                <p className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>
              )}

              <button
                onClick={calculate}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-800 px-7 py-4 text-lg font-extrabold text-white transition hover:bg-blue-700"
              >
                Get my leak risk report →
              </button>
            </div>
          ) : (
            <div className="mt-8 text-center">
              <p className="text-sm font-bold text-slate-500">
                {result.town.town}, TX · built {result.yearBuilt} · {result.pipeLabel}
                {result.pipeInferred ? " (inferred — confirm it at the house)" : ""}
              </p>
              <h3 className="mt-4 text-2xl font-extrabold text-blue-950">
                Your report — estimates, not an inspection
              </h3>

              <div className="mx-auto mt-8 grid max-w-2xl gap-4 text-left sm:grid-cols-2">
                {renderBandCard(
                  "Slab leak risk",
                  result.slabBand,
                  result.slabPoints,
                  result.slabFactors,
                  "Slab band: 0–2 Low, 3–4 Watch, 5+ High. Soil moves the slab; old pipes under it fail first."
                )}
                {renderBandCard(
                  "Sewer line risk",
                  result.sewerBand,
                  result.sewerPoints,
                  result.sewerFactors,
                  "Sewer band: 0–1 Low, 2–3 Watch, 4+ High. Age and tree roots are the two drivers — only a camera sees the line."
                )}
              </div>

              <div className="mx-auto mt-6 max-w-2xl rounded-2xl bg-slate-50 p-5 text-left">
                <p className="font-extrabold text-blue-950">
                  Expected inspection costs in {result.town.town} (estimates)
                </p>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  <li>
                    <strong className="text-blue-950">Sewer camera inspection:</strong>{" "}
                    {result.town.cameraPrice}
                    {result.town.cameraUnverified && (
                      <>
                        {" "}
                        <strong className="text-amber-700">
                          Note: no Rio Grande Valley firm publishes a standalone camera price — the $575–$975
                          figure above is hydrostatic testing, not a camera scope. Get a written camera quote
                          before you book.
                        </strong>
                      </>
                    )}
                  </li>
                  <li>
                    <strong className="text-blue-950">Slab leak detection:</strong> {result.town.slabPrice}
                  </li>
                  <li>
                    <strong className="text-blue-950">Camera cost by access type (published tiers):</strong>{" "}
                    basic cleanout access {CAMERA_TIER_BASIC}; with a written report and dye test{" "}
                    {CAMERA_TIER_REPORT}; a brand-new cleanout {CAMERA_TIER_CLEANOUT}. Ask which access
                    your house has — it decides the price.
                  </li>
                </ul>
                <p className="mt-3 text-xs text-slate-500">
                  Town prices are the researched metro-typical ranges for {result.town.metro}; they are
                  estimates, not quotes — the access type and line length decide the final price.
                </p>
              </div>

              <div className="mx-auto mt-6 max-w-2xl rounded-2xl bg-amber-50 p-5 text-left">
                <p className="font-extrabold text-blue-950">
                  Negotiation-credit planning range:{" "}
                  {result.creditLow === 0
                    ? "$0 — nothing to ask for yet"
                    : `${fmtMoney(result.creditLow)}–${fmtMoney(result.creditHigh)}`}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Rough planning range only — not a price, not a demand. Formula: the worst of your two
                  bands sets the range from the Angi national slab-repair range ($630–$4,400, average
                  $2,280, updated Sep 22, 2026). Watch takes the lower half ($630–$2,280); High takes
                  the upper half ($2,280–$4,400); Low takes $0, because there is nothing to credit yet.
                  Ask for a credit only after a written inspection finding — never on this estimate alone.
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  If the scope finds sewer-lateral damage, replacement is priced by method, length, and
                  depth after the scope — get a scope first; no replacement number belongs in a credit
                  ask before the video exists.
                </p>
              </div>

              <div className="mx-auto mt-6 max-w-2xl rounded-2xl bg-blue-50 p-5 text-left">
                <p className="font-extrabold text-blue-950">Option-period inspection checklist</p>
                {deadline && (
                  <p className="mt-2 rounded-xl bg-white p-3 text-sm font-bold text-amber-800">{deadline}</p>
                )}
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
                  <li>
                    <strong className="text-blue-950">Sewer scope first:</strong> camera the line from the
                    house to the street; keep the video and the written report — the report is what a
                    credit ask is built on.
                  </li>
                  <li>
                    <strong className="text-blue-950">Slab check:</strong> overnight meter test, then
                    acoustic/thermal detection if the meter moves or the house shows slab signs (warm
                    spots, cracks, a bill that jumped).
                  </li>
                  <li>
                    <strong className="text-blue-950">Ask the seller:</strong> any prior leaks or slab
                    repairs, insurance claims for water damage, and any earlier sewer scope video. Get
                    the answers in writing.
                  </li>
                  <li>
                    <strong className="text-blue-950">Ask the inspector:</strong> where the cleanout is,
                    whether the line is cast iron, and whether roots or separations showed on camera.
                  </li>
                  <li>
                    <strong className="text-blue-950">Before the option expires:</strong> hold the written
                    findings, not a verbal summary. A credit or repair ask needs the paper.
                  </li>
                </ul>
              </div>

              <a
                href={`tel:${PHONE_TEL}`}
                className="mt-8 inline-flex items-center gap-3 rounded-full bg-amber-500 px-8 py-4 text-lg font-extrabold text-blue-950 shadow-lg transition hover:bg-amber-400"
              >
                Call {PHONE_DISPLAY}
              </a>
              <p className="mt-3 text-sm text-slate-500">
                Book a sewer scope + slab check before your option expires — non-invasive detection
                pinpoints it without digging.
              </p>
              <button onClick={reset} className="mt-6 text-sm font-bold text-blue-800 hover:underline">
                Check another house
              </button>
            </div>
          )}
        </div>
        <p className="mt-4 text-center text-xs text-blue-200">
          Estimates from the facts you entered and researched town data — not an inspection, not a
          guarantee, and never a quote. Only on-site inspection can confirm a leak.
        </p>
      </div>
    </section>
  );
}
