"use client";

import { useState } from "react";
import Link from "next/link";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/site";
import {
  PLUMBER_PRICEBOOK,
  PRICEBOOK_METROS,
  priceTownBySlug,
  type PlumberPriceTown,
} from "@/lib/plumber-pricebook";

// National repair ranges, labeled NATIONAL on the page — Angi, updated
// Sep 22, 2026, via serp-swot-tools-2026-11-16.md §B3. They are the ONLY
// repair figures this tool uses: no town-level repair price is published
// anywhere in the researched data, so none is shown.
const NATIONAL_REPAIR_LOW = 630;
const NATIONAL_REPAIR_HIGH = 4400;
const NATIONAL_REPAIR_AVG = 2300;
const NATIONAL_SLAB_REPAIR_LOW = 1500;
const NATIONAL_SLAB_REPAIR_HIGH = 4000;

// Margin bands are our own planning rule of thumb, not published
// industry data — the methodology on the tool page says so.
const HEALTHY_MARGIN_PCT = 25;
const THIN_MARGIN_PCT = 10;

const inputCls =
  "w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-lg font-bold text-blue-950 outline-none transition focus:border-blue-800";
const labelCls = "mb-1.5 block text-sm font-bold text-slate-600";

type LeakType = "slab" | "leak" | "sewer";
type Access =
  | "detection-only"
  | "slab-spot"
  | "tunnel"
  | "reroute"
  | "yard-dig"
  | "camera";
type Flooring =
  | "tile"
  | "hardwood"
  | "laminate"
  | "carpet"
  | "vinyl"
  | "concrete"
  | "none";

const LEAK_TYPES: Array<{ value: LeakType; label: string }> = [
  { value: "slab", label: "Slab leak detection" },
  { value: "leak", label: "General leak detection (yard / main line)" },
  { value: "sewer", label: "Sewer camera inspection" },
];

const ACCESS_METHODS: Array<{ value: Access; label: string }> = [
  { value: "detection-only", label: "Detection only — no repair on this visit" },
  { value: "slab-spot", label: "Slab spot repair (open the slab at the leak)" },
  { value: "tunnel", label: "Tunnel under the slab" },
  { value: "reroute", label: "Reroute the line overhead / around the slab" },
  { value: "yard-dig", label: "Yard dig (expose the buried line)" },
  { value: "camera", label: "Camera only (sewer scope, no digging)" },
];

const FLOORING: Array<{ value: Flooring; label: string }> = [
  { value: "tile", label: "Tile" },
  { value: "hardwood", label: "Hardwood" },
  { value: "laminate", label: "Laminate" },
  { value: "carpet", label: "Carpet" },
  { value: "vinyl", label: "Vinyl" },
  { value: "concrete", label: "Concrete — no finish to restore" },
  { value: "none", label: "No flooring involved (yard / exterior)" },
];

interface Result {
  town: PlumberPriceTown;
  leakType: LeakType;
  access: Access;
  flooring: Flooring;
  low: number;
  high: number;
  mid: number;
  sell: number;
  hours: number;
  rate: number;
  crew: number;
  materialsCost: number;
  markupPct: number;
  laborCost: number;
  materialsMarked: number;
  markupAmt: number;
  totalCost: number;
  margin: number;
  marginPct: number;
}

function fmtMoney(n: number): string {
  return `$${Math.round(n).toLocaleString()}`;
}

function fmtPct(n: number): string {
  return `${n < 0 ? "−" : ""}${Math.abs(Math.round(n))}%`;
}

function rangeFor(town: PlumberPriceTown, leakType: LeakType): [number, number] {
  if (leakType === "slab") return town.slab;
  if (leakType === "sewer") return town.sewer;
  return town.leak;
}

function leakTypeLabel(leakType: LeakType): string {
  return LEAK_TYPES.find((t) => t.value === leakType)?.label ?? "Leak detection";
}

/**
 * Plumber Job-Price Estimator — B2B tool #10 (serp-swot-tools §A2).
 * Built for leak-detection pros, NOT homeowners: the plumber picks a
 * leak type and a town, and the tool shows the researched local
 * detection-only price range for that town, then splits the job into
 * labor and materials at the plumber's OWN rates (hourly rate, crew
 * size, hours, materials cost, markup — all entered by the plumber)
 * and checks the margin at the sell price they set.
 *
 * Nothing here is a rate we researched and are passing off as local:
 * the only researched numbers are the per-town detection ranges in
 * lib/plumber-pricebook.ts. Labor and materials come from the plumber.
 * Access method and flooring do NOT change the detection price —
 * detection is priced by the local going rate. They change the repair
 * that follows, which is why the margin check asks for the plumber's
 * own hours and materials. Repair totals beyond detection use national
 * ranges only, labeled NATIONAL.
 */
export default function PlumberPriceEstimator() {
  const [townSlug, setTownSlug] = useState("katy");
  const [leakType, setLeakType] = useState<LeakType>("slab");
  const [access, setAccess] = useState<Access>("detection-only");
  const [flooring, setFlooring] = useState<Flooring>("tile");
  const [crew, setCrew] = useState("1");
  const [hourlyRate, setHourlyRate] = useState("85");
  const [hours, setHours] = useState("2");
  const [materialsCost, setMaterialsCost] = useState("40");
  const [markupPct, setMarkupPct] = useState("20");
  const [sellPrice, setSellPrice] = useState("275");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const town = priceTownBySlug(townSlug) ?? PLUMBER_PRICEBOOK[0];
  const [rangeLow, rangeHigh] = rangeFor(town, leakType);
  const rangeMid = Math.round((rangeLow + rangeHigh) / 2);

  const onTownChange = (slug: string) => {
    setTownSlug(slug);
    const t = priceTownBySlug(slug);
    if (t) {
      const [lo, hi] = rangeFor(t, leakType);
      setSellPrice(String(Math.round((lo + hi) / 2)));
    }
    setResult(null);
  };

  const onLeakTypeChange = (value: LeakType) => {
    setLeakType(value);
    const [lo, hi] = rangeFor(town, value);
    setSellPrice(String(Math.round((lo + hi) / 2)));
    if (value === "sewer") setAccess("camera");
    if (value !== "sewer" && access === "camera") setAccess("detection-only");
    setResult(null);
  };

  const calculate = () => {
    setError(null);
    const crewN = parseFloat(crew);
    const rateN = parseFloat(hourlyRate);
    const hoursN = parseFloat(hours);
    const matN = parseFloat(materialsCost);
    const markupN = parseFloat(markupPct);
    const sellN = parseFloat(sellPrice);
    if ([crewN, rateN, hoursN, matN, markupN, sellN].some((x) => isNaN(x))) {
      setError("Fill in every field — crew size, your hourly rate, hours on site, materials cost, markup, and your sell price.");
      return;
    }
    if (crewN < 1 || crewN > 6 || !Number.isInteger(crewN)) {
      setError("Crew size should be a whole number from 1 to 6 techs on site.");
      return;
    }
    if (rateN <= 0 || rateN > 500) {
      setError("Your hourly rate should be between $1 and $500 per tech per hour.");
      return;
    }
    if (hoursN <= 0 || hoursN > 24) {
      setError("Hours on site should be between 0 and 24 — enter your own estimate for this job.");
      return;
    }
    if (matN < 0 || matN > 10000) {
      setError("Materials cost should be between $0 and $10,000 at your cost.");
      return;
    }
    if (markupN < 0 || markupN > 200) {
      setError("Material markup should be between 0% and 200%.");
      return;
    }
    if (sellN <= 0 || sellN > 10000) {
      setError("Your flat-rate sell price should be between $1 and $10,000.");
      return;
    }

    const laborCost = hoursN * rateN * crewN;
    const markupAmt = (matN * markupN) / 100;
    const materialsMarked = matN + markupAmt;
    const totalCost = laborCost + materialsMarked;
    const margin = sellN - totalCost;
    const marginPct = sellN > 0 ? (margin / sellN) * 100 : 0;

    setResult({
      town,
      leakType,
      access,
      flooring,
      low: rangeLow,
      high: rangeHigh,
      mid: rangeMid,
      sell: sellN,
      hours: hoursN,
      rate: rateN,
      crew: crewN,
      materialsCost: matN,
      markupPct: markupN,
      laborCost,
      materialsMarked,
      markupAmt,
      totalCost,
      margin,
      marginPct,
    });
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  const marginBand =
    result === null
      ? null
      : result.marginPct >= HEALTHY_MARGIN_PCT
        ? {
            badge: "Healthy margin",
            badgeClass: "bg-green-100 text-green-800",
            headline: "That price covers your costs with room to spare.",
            body: "At this sell price, after your labor and marked-up materials, you keep at least a quarter of the job price. That cushion is what absorbs the jobs that run long, the callbacks, and the materials you forgot to list.",
          }
        : result.marginPct >= THIN_MARGIN_PCT
          ? {
              badge: "Thin margin — check your hours",
              badgeClass: "bg-amber-100 text-amber-800",
              headline: "This price barely covers the job.",
              body: "You make money on paper, but not much of it — one extra hour on site or one extra part wipes it out. Either the sell price needs to sit higher in the local range, or the hours need to come down. Do not let a thin job set the price for the next one.",
            }
          : {
              badge: "Priced below a safe margin",
              badgeClass: "bg-red-100 text-red-800",
              headline: "At this price, the job loses money — or nearly does.",
              body: "Your labor and materials cost more than the sell price, or leave almost nothing over. That usually means the hours are too high for a detection-only visit, the crew is too big for the job, or the sell price sits below what this town pays. Fix one of the three before you quote it.",
            };

  const accessLabel = ACCESS_METHODS.find((a) => a.value === access)?.label ?? "";
  const flooringLabel = FLOORING.find((f) => f.value === flooring)?.label ?? "";

  return (
    <section id="plumber-price-estimator" className="scroll-mt-20 bg-blue-950" aria-label="Plumber job-price estimator">
      <div className="mx-auto max-w-3xl px-4 py-14">
        <div className="rounded-3xl border border-blue-800 bg-white p-6 shadow-xl md:p-10">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
            Free tool for plumbers · no signup
          </p>
          <h2 className="mt-3 text-center text-3xl font-extrabold tracking-tight text-blue-950">
            Price the job before you quote it
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-slate-600">
            Pick the job and the town. We show what that town pays for
            detection, you enter your own rates — and the tool splits the
            job into labor and materials and checks your margin.
          </p>

          {!result ? (
            <div className="mx-auto mt-8 grid max-w-xl gap-5">
              <div>
                <label className={labelCls} htmlFor="pp-leak-type">Leak type</label>
                <select
                  id="pp-leak-type"
                  className={inputCls}
                  value={leakType}
                  onChange={(e) => onLeakTypeChange(e.target.value as LeakType)}
                >
                  {LEAK_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls} htmlFor="pp-town">Town</label>
                <select
                  id="pp-town"
                  className={inputCls}
                  value={townSlug}
                  onChange={(e) => onTownChange(e.target.value)}
                >
                  {PRICEBOOK_METROS.map((metro) => (
                    <optgroup key={metro} label={`${metro} metro`}>
                      {PLUMBER_PRICEBOOK.filter((t) => t.metro === metro).map((t) => (
                        <option key={t.slug} value={t.slug}>
                          {t.town}, TX
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <p className="mt-1.5 text-xs text-slate-400">
                  {leakTypeLabel(leakType)} in {town.town} runs {fmtMoney(rangeLow)}–{fmtMoney(rangeHigh)} — researched local range, detection only.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls} htmlFor="pp-access">Access / repair method</label>
                  <select
                    id="pp-access"
                    className={inputCls}
                    value={access}
                    onChange={(e) => setAccess(e.target.value as Access)}
                  >
                    {ACCESS_METHODS.map((a) => (
                      <option key={a.value} value={a.value}>{a.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls} htmlFor="pp-flooring">Flooring</label>
                  <select
                    id="pp-flooring"
                    className={inputCls}
                    value={flooring}
                    onChange={(e) => setFlooring(e.target.value as Flooring)}
                  >
                    {FLOORING.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="-mt-2 text-xs text-slate-400">
                Access and flooring do not change the detection price — detection is priced by the local going rate.
                They change the repair that follows, so price that part on your own hours and materials below.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls} htmlFor="pp-crew">Crew size (techs on site)</label>
                  <input id="pp-crew" inputMode="numeric" className={inputCls}
                    value={crew} onChange={(e) => setCrew(e.target.value)} />
                </div>
                <div>
                  <label className={labelCls} htmlFor="pp-rate">Your hourly rate ($ per tech)</label>
                  <input id="pp-rate" inputMode="decimal" className={inputCls} placeholder="e.g. 85"
                    value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls} htmlFor="pp-hours">Hours on site (your estimate)</label>
                  <input id="pp-hours" inputMode="decimal" className={inputCls} placeholder="e.g. 2"
                    value={hours} onChange={(e) => setHours(e.target.value)} />
                </div>
                <div>
                  <label className={labelCls} htmlFor="pp-materials">Materials cost ($, at your cost)</label>
                  <input id="pp-materials" inputMode="decimal" className={inputCls} placeholder="e.g. 40"
                    value={materialsCost} onChange={(e) => setMaterialsCost(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls} htmlFor="pp-markup">Material markup (%)</label>
                  <input id="pp-markup" inputMode="decimal" className={inputCls} placeholder="e.g. 20"
                    value={markupPct} onChange={(e) => setMarkupPct(e.target.value)} />
                </div>
                <div>
                  <label className={labelCls} htmlFor="pp-sell">Your flat-rate sell price ($)</label>
                  <input id="pp-sell" inputMode="decimal" className={inputCls}
                    value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} />
                </div>
              </div>
              <p className="-mt-2 text-xs text-slate-400">
                Sell price starts at the middle of the local range ({fmtMoney(rangeMid)}) — move it up or down to
                your own price. Your hourly rate, hours, and materials are yours: we never publish a labor rate
                we did not research, so this tool never guesses one for you.
              </p>

              {error && (
                <p className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>
              )}

              <button
                onClick={calculate}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-800 px-7 py-4 text-lg font-extrabold text-white transition hover:bg-blue-700"
              >
                Check my price and margin →
              </button>
            </div>
          ) : (
            <div className="mt-8 text-center">
              <span className={`inline-block rounded-full px-4 py-1.5 text-sm font-extrabold ${marginBand?.badgeClass}`}>
                {marginBand?.badge}
              </span>
              <h3 className="mt-4 text-2xl font-extrabold text-blue-950">{marginBand?.headline}</h3>
              <p className="mx-auto mt-3 max-w-xl text-slate-600">{marginBand?.body}</p>

              <div className="mx-auto mt-8 grid max-w-xl gap-4 text-left sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-3xl font-extrabold text-blue-950">
                    {fmtMoney(result.low)}–{fmtMoney(result.high)}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">
                    researched flat-rate range — {leakTypeLabel(result.leakType).toLowerCase()} in {result.town.town}, TX (detection only)
                  </p>
                </div>
                <div className="rounded-2xl bg-amber-50 p-5">
                  <p className="text-3xl font-extrabold text-blue-950">{fmtMoney(result.sell)}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">
                    your flat-rate sell price (planning estimate — set your own final price)
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-3xl font-extrabold text-blue-950">{fmtMoney(result.laborCost)}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">
                    labor — {result.hours} hrs × {fmtMoney(result.rate)}/hr × {result.crew} tech{result.crew > 1 ? "s" : ""} (your rates)
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-3xl font-extrabold text-blue-950">{fmtMoney(result.materialsMarked)}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">
                    materials — {fmtMoney(result.materialsCost)} at cost + {fmtMoney(result.markupAmt)} markup ({result.markupPct}%)
                  </p>
                </div>
              </div>

              <div className="mx-auto mt-6 max-w-xl rounded-2xl bg-blue-50 p-5 text-left">
                <p className="font-extrabold text-blue-950">The margin math — show your work</p>
                <div className="mt-3 space-y-1 text-sm font-semibold text-slate-600">
                  <p>Sell price: {fmtMoney(result.sell)}</p>
                  <p>− Labor ({result.hours} × {fmtMoney(result.rate)} × {result.crew}): {fmtMoney(result.laborCost)}</p>
                  <p>− Materials ({fmtMoney(result.materialsCost)} + {result.markupPct}% markup): {fmtMoney(result.materialsMarked)}</p>
                  <p className="border-t border-blue-200 pt-2 text-base font-extrabold text-blue-950">
                    = Margin: {fmtMoney(result.margin)} ({fmtPct(result.marginPct)} of the sell price)
                  </p>
                  <p className="pt-1 text-slate-500">
                    Total job cost: {fmtMoney(result.totalCost)}. Margin bands are our own planning rule of thumb
                    (healthy 25%+, thin 10–25%, below 10% is priced too low) — not published industry data.
                  </p>
                </div>
              </div>

              <div className="mx-auto mt-6 max-w-xl rounded-2xl bg-slate-50 p-5 text-left">
                <p className="font-extrabold text-blue-950">Margin at each end of the local range</p>
                <div className="mt-3 space-y-1 text-sm font-semibold text-slate-600">
                  {([result.low, result.mid, result.high] as const).map((sell) => {
                    const m = sell - result.totalCost;
                    const pct = sell > 0 ? (m / sell) * 100 : 0;
                    return (
                      <p key={sell}>
                        At {fmtMoney(sell)} ({sell === result.low ? "low end" : sell === result.mid ? "middle" : "high end"}): margin {fmtMoney(m)} ({fmtPct(pct)})
                      </p>
                    );
                  })}
                </div>
              </div>

              <div className="mx-auto mt-6 max-w-xl rounded-2xl bg-white p-6 text-left shadow-sm ring-1 ring-slate-200">
                <p className="font-extrabold text-blue-950">Compare with the local going rate</p>
                <p className="mt-2 text-sm text-slate-600">
                  In {result.town.town}, researched {leakTypeLabel(result.leakType).toLowerCase()} runs{" "}
                  {fmtMoney(result.low)}–{fmtMoney(result.high)} ({result.town.metro}-metro typical, detection only).
                  Your sell price of {fmtMoney(result.sell)} sits{" "}
                  {result.sell < result.low
                    ? "below that range — fine if that is your call, but check the margin above before you hold it."
                    : result.sell > result.high
                      ? "above that range — fine if the job justifies it, but expect the customer to compare it with the local range."
                      : "inside that range — in line with what this town pays."}
                </p>
                {result.leakType === "sewer" && result.town.sewerNote && (
                  <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-slate-600">
                    Note on this range: {result.town.sewerNote}
                  </p>
                )}
                <p className="mt-3 text-sm text-slate-600">
                  Job: {leakTypeLabel(result.leakType)} · {accessLabel} · flooring: {flooringLabel}. Access and
                  flooring do not change the detection price above — they change the repair that follows. Repairs
                  beyond detection are national figures only: {fmtMoney(NATIONAL_REPAIR_LOW)}–
                  {fmtMoney(NATIONAL_REPAIR_HIGH)} (average {fmtMoney(NATIONAL_REPAIR_AVG)}), and slab repair{" "}
                  {fmtMoney(NATIONAL_SLAB_REPAIR_LOW)}–{fmtMoney(NATIONAL_SLAB_REPAIR_HIGH)}+ — NATIONAL ranges
                  from Angi, not local prices. Price the repair on your own hours and materials.
                </p>
                <p className="mt-3 text-sm text-slate-600">
                  Plumbers interested in leads can reach us —{" "}
                  <a href={`tel:${PHONE_TEL}`} className="font-bold text-blue-800 hover:underline">
                    call {PHONE_DISPLAY}
                  </a>
                  . This tool brings plumbers, not homeowner callers, and it is a planning estimate, not a quote.
                </p>
              </div>

              <a
                href={`tel:${PHONE_TEL}`}
                className="mt-8 inline-flex items-center gap-3 rounded-full bg-amber-500 px-8 py-4 text-lg font-extrabold text-blue-950 shadow-lg transition hover:bg-amber-400"
              >
                Call {PHONE_DISPLAY}
              </a>
              <p className="mt-3 text-sm text-slate-500">
                For plumbers interested in leads — not a homeowner booking line.
              </p>
              <button onClick={reset} className="mt-6 text-sm font-bold text-blue-800 hover:underline">
                Price another job
              </button>
            </div>
          )}
        </div>
        <p className="mt-4 text-center text-xs text-blue-200">
          Planning estimate, not a quote — set your own final price. Detection ranges are researched local prices;
          labor and materials are your own numbers. Only an on-site visit can set a real job price.
        </p>
      </div>
    </section>
  );
}
