"use client";

import { useState } from "react";
import Link from "next/link";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/site";
import {
  SEWER_LATERAL_METHODS,
  CAMERA_TIERS,
  SEWER_PERMIT_NOTES,
  SEWER_COST_DRIVERS,
} from "@/lib/sewer-lateral-prices";

const inputCls =
  "w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-lg font-bold text-blue-950 outline-none transition focus:border-blue-800";
const labelCls = "mb-1.5 block text-sm font-bold text-slate-600";

type MethodKey = "open-cut" | "cipp-lining" | "pipe-bursting" | "spot-repair";
type Surface = "lawn" | "driveway" | "patio" | "street";
type Access = "have" | "need-new";

/** Plain-English one-liners, from the assumptions in sewer-lateral-prices.ts. */
const METHOD_EXPLAINERS: Record<MethodKey, string> = {
  "open-cut":
    "Dig a trench along the whole line and lay new pipe. The only option for a collapsed line or one that has lost its grade.",
  "cipp-lining":
    "A resin liner is cured inside your existing pipe through two small access points. Works only if the old pipe still holds its shape.",
  "pipe-bursting":
    "A bursting head breaks the old pipe apart while pulling a brand-new pipe through. Two access pits, no full trench.",
  "spot-repair":
    "Fix one bad section only. The camera must confirm the rest of the line is sound.",
};

const SURFACE_LABELS: Record<Surface, string> = {
  lawn: "Lawn / soil",
  driveway: "Driveway",
  patio: "Patio / concrete",
  street: "Street / road",
};

function fmtMoney(n: number): string {
  return `$${Math.round(n).toLocaleString()}`;
}

function normaliseCity(raw: string): string {
  return raw.trim().toLowerCase().replace(/,\s*tx$/, "").replace(/\s+tx$/, "").trim();
}

interface Result {
  methodKey: MethodKey;
  methodLabel: string;
  lengthFt: number;
  depthFt: number;
  surface: Surface;
  access: Access;
  cityNorm: string;
  cityDisplay: string;
  isPlano: boolean;
  isDallas: boolean;
  perFootLow: number | null;
  perFootHigh: number | null;
  baseLow: number;
  baseHigh: number;
  permitLow: number;
  permitHigh: number;
  planLow: number;
  planHigh: number;
  typicalLow: number;
  typicalHigh: number;
  formula: string;
  cameraLow: number;
  cameraHigh: number;
  cameraLabel: string;
  cameraNote: string;
  position: string;
}

/**
 * Texas Sewer Lateral Replacement Estimator — lead-gen tool #9.
 * Length + depth + method + surface + cleanout access + city -> a 2026
 * planning range from Texas-published contractor prices
 * (SEWER_LATERAL_METHODS, all texasVerified). No invented prices: depth
 * and surface are shown as drivers that move you inside the published
 * range — no dollar amount is added for them, because no published Texas
 * figure prices them separately. The only add-on is the verified Plano
 * permit fee ($400–$1,600), applied only when the user enters Plano.
 * Camera tiers come from CAMERA_TIERS; only the cleanout tier is
 * Texas-verified, the rest are labelled national wherever shown.
 */
export default function SewerLateralEstimator() {
  const [length, setLength] = useState("35");
  const [depth, setDepth] = useState("4");
  const [method, setMethod] = useState<MethodKey>("open-cut");
  const [surface, setSurface] = useState<Surface>("lawn");
  const [access, setAccess] = useState<Access>("have");
  const [city, setCity] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const calculate = () => {
    setError(null);
    const len = parseFloat(length);
    const dep = parseFloat(depth);
    if (isNaN(len) || len < 10 || len > 200) {
      setError("Lateral length should be between 10 and 200 feet. Most DFW homes need 30–40 feet.");
      return;
    }
    if (isNaN(dep) || dep < 1 || dep > 20) {
      setError("Depth should be between 1 and 20 feet.");
      return;
    }
    const m = SEWER_LATERAL_METHODS.find((x) => x.method === method);
    if (!m) {
      setError("Pick a replacement method first.");
      return;
    }
    const cityNorm = normaliseCity(city);
    const isPlano = cityNorm === "plano";
    const isDallas = cityNorm === "dallas";
    const isReplacement = method !== "spot-repair";

    const baseLow = m.pricePerFootLow !== null ? m.pricePerFootLow * len : m.totalLow;
    const baseHigh = m.pricePerFootHigh !== null ? m.pricePerFootHigh * len : m.totalHigh;
    // Verified permit add-on: Plano only, replacement methods only.
    const permitLow = isPlano && isReplacement ? 400 : 0;
    const permitHigh = isPlano && isReplacement ? 1600 : 0;
    const planLow = baseLow + permitLow;
    const planHigh = baseHigh + permitHigh;

    const formula =
      m.pricePerFootLow !== null
        ? `${m.label}: $${m.pricePerFootLow}–$${m.pricePerFootHigh}/ft × ${len} ft = ${fmtMoney(baseLow)}–${fmtMoney(baseHigh)}${permitLow > 0 ? ` + Plano permit $400–$1,600 = ${fmtMoney(planLow)}–${fmtMoney(planHigh)}` : ""}`
        : `${m.label}: ${fmtMoney(m.totalLow)}–${fmtMoney(m.totalHigh)} per job (not priced per foot)${permitLow > 0 ? " + Plano permit $400–$1,600" : ""}`;

    const cleanoutTier = CAMERA_TIERS.find((t) => t.accessType === "cleanout");
    const newCleanoutTier = CAMERA_TIERS.find((t) => t.accessType === "new-cleanout");
    const cameraLow = access === "have" ? (cleanoutTier?.low ?? 150) : (newCleanoutTier?.low ?? 700);
    const cameraHigh = access === "have" ? (cleanoutTier?.high ?? 500) : (newCleanoutTier?.high ?? 2000);
    const cameraLabel =
      access === "have"
        ? "Camera scope through your existing cleanout — Texas-verified price"
        : "New cleanout install before a scope can run — national range, not a Texas price";
    const cameraNote =
      access === "have"
        ? "Texas cluster is $250–$400 (most-cited). Some DFW/Houston plumbers include the camera with a cleaning or repair job."
        : "That is the install cost alone, before the camera inspection itself ($150–$500 through a cleanout, Texas-verified). No Texas-specific install price was found.";

    // Position inside the range — a disclosed rule of thumb, not a price:
    // hard surface above and a deep line both push toward the high end.
    const highPushes = (dep >= 6 ? 1 : 0) + (surface !== "lawn" ? 1 : 0);
    const position =
      highPushes >= 2
        ? "Toward the upper half of the range — a deep line under a hard surface is the expensive end of this method."
        : highPushes === 1
          ? "Around the middle of the range — one factor pushes the price up, the rest are typical."
          : "Toward the lower half of the range — a shallow line under lawn is the cheaper end of this method.";

    setResult({
      methodKey: method,
      methodLabel: m.label,
      lengthFt: len,
      depthFt: dep,
      surface,
      access,
      cityNorm,
      cityDisplay: city.trim(),
      isPlano,
      isDallas,
      perFootLow: m.pricePerFootLow,
      perFootHigh: m.pricePerFootHigh,
      baseLow,
      baseHigh,
      permitLow,
      permitHigh,
      planLow,
      planHigh,
      typicalLow: m.totalLow,
      typicalHigh: m.totalHigh,
      formula,
      cameraLow,
      cameraHigh,
      cameraLabel,
      cameraNote,
      position,
    });
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  const statewideNote = SEWER_PERMIT_NOTES.find((n) => n.city.startsWith("Statewide"));
  const dallasNote = SEWER_PERMIT_NOTES.find((n) => n.city === "Dallas");
  const planoNote = SEWER_PERMIT_NOTES.find((n) => n.city === "Plano");

  return (
    <section id="sewer-lateral-estimator" className="scroll-mt-20 bg-blue-950" aria-label="Texas sewer lateral replacement estimator">
      <div className="mx-auto max-w-3xl px-4 py-14">
        <div className="rounded-3xl border border-blue-800 bg-white p-6 shadow-xl md:p-10">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
            Free tool · no signup
          </p>
          <h2 className="mt-3 text-center text-3xl font-extrabold tracking-tight text-blue-950">
            Estimate your sewer lateral replacement
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-slate-600">
            Enter your lateral&apos;s length and depth, pick a method, and
            get a 2026 planning range from Texas-published contractor
            prices — DFW and Houston figures, not national averages.
          </p>

          {!result ? (
            <div className="mx-auto mt-8 grid max-w-xl gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls} htmlFor="sl-length">Lateral length (ft)</label>
                  <input id="sl-length" inputMode="decimal" className={inputCls} placeholder="e.g. 35"
                    value={length} onChange={(e) => setLength(e.target.value)} />
                  <p className="mt-1.5 text-xs text-slate-400">Most DFW homes need 30–40 ft.</p>
                </div>
                <div>
                  <label className={labelCls} htmlFor="sl-depth">Depth of the line (ft)</label>
                  <input id="sl-depth" inputMode="decimal" className={inputCls} placeholder="e.g. 4"
                    value={depth} onChange={(e) => setDepth(e.target.value)} />
                  <p className="mt-1.5 text-xs text-slate-400">Deeper digs cost more — see the drivers below.</p>
                </div>
              </div>

              <div>
                <label className={labelCls} htmlFor="sl-method">Replacement method</label>
                <select id="sl-method" className={inputCls} value={method}
                  onChange={(e) => setMethod(e.target.value as MethodKey)}>
                  {SEWER_LATERAL_METHODS.map((m) => (
                    <option key={m.method} value={m.method}>
                      {m.label}
                      {m.pricePerFootLow !== null
                        ? ` — $${m.pricePerFootLow}–$${m.pricePerFootHigh}/ft`
                        : ` — ${fmtMoney(m.totalLow)}–${fmtMoney(m.totalHigh)} per job`}
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-sm text-slate-500">{METHOD_EXPLAINERS[method]}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls} htmlFor="sl-surface">Surface above the line</label>
                  <select id="sl-surface" className={inputCls} value={surface}
                    onChange={(e) => setSurface(e.target.value as Surface)}>
                    {(Object.keys(SURFACE_LABELS) as Surface[]).map((s) => (
                      <option key={s} value={s}>{SURFACE_LABELS[s]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls} htmlFor="sl-access">Cleanout access</label>
                  <select id="sl-access" className={inputCls} value={access}
                    onChange={(e) => setAccess(e.target.value as Access)}>
                    <option value="have">I have an exterior cleanout</option>
                    <option value="need-new">No cleanout — need a new one</option>
                  </select>
                </div>
              </div>
              <p className="-mt-2 text-xs text-slate-400">
                No cleanout means a toilet-pull or a new cleanout install before a camera can run — see the
                camera costs in your result.
              </p>

              <div>
                <label className={labelCls} htmlFor="sl-city">
                  Your city (optional — for the permit note)
                </label>
                <input id="sl-city" className={inputCls} placeholder="e.g. Dallas, Plano, Houston"
                  value={city} onChange={(e) => setCity(e.target.value)} />
                <p className="mt-1.5 text-xs text-slate-400">
                  Permit fees are published only for Dallas and Plano. Any other Texas city gets the statewide
                  note — fee varies by city.
                </p>
              </div>

              {error && (
                <p className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>
              )}

              <button
                onClick={calculate}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-800 px-7 py-4 text-lg font-extrabold text-white transition hover:bg-blue-700"
              >
                Estimate my replacement →
              </button>
              <p className="text-center text-xs text-slate-400">
                2026 planning range — an estimate, not a quote. Only a camera scope and an on-site look can
                price your house.
              </p>
            </div>
          ) : (
            <div className="mt-8 text-center">
              <span className="inline-block rounded-full bg-amber-100 px-4 py-1.5 text-sm font-extrabold text-amber-800">
                2026 planning range — estimate, not a quote
              </span>
              <h3 className="mt-4 text-2xl font-extrabold text-blue-950">
                {result.methodLabel} · {result.lengthFt} ft
              </h3>
              <p className="mx-auto mt-3 max-w-xl text-slate-600">{result.position}</p>

              <div className="mx-auto mt-8 grid max-w-xl gap-4 text-left sm:grid-cols-2">
                <div className="rounded-2xl bg-amber-50 p-5 sm:col-span-2">
                  <p className="text-3xl font-extrabold text-blue-950">
                    {fmtMoney(result.planLow)}–{fmtMoney(result.planHigh)}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">
                    planning range for your job (estimate, not a quote)
                  </p>
                  <p className="mt-3 font-mono text-xs leading-relaxed text-slate-600">{result.formula}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-2xl font-extrabold text-blue-950">
                    {result.perFootLow !== null
                      ? `$${result.perFootLow}–$${result.perFootHigh}/ft`
                      : `${fmtMoney(result.typicalLow)}–${fmtMoney(result.typicalHigh)}`}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">
                    {result.perFootLow !== null
                      ? "published Texas per-foot range for this method"
                      : "published Texas per-job range for this method"}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-2xl font-extrabold text-blue-950">
                    {fmtMoney(result.typicalLow)}–{fmtMoney(result.typicalHigh)}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">
                    typical total for this method in Texas (published totals)
                  </p>
                </div>
              </div>

              {result.perFootLow !== null && result.baseLow < result.typicalLow && (
                <p className="mx-auto mt-4 max-w-xl rounded-2xl bg-slate-50 p-4 text-left text-sm text-slate-600">
                  Note: the per-foot math alone gives {fmtMoney(result.baseLow)} at the low end, but published
                  Texas totals for {result.methodLabel.toLowerCase()} start at {fmtMoney(result.typicalLow)}.
                  Fixed costs — access, permit, mobilization — mean a short lateral rarely lands at the
                  per-foot low end.
                </p>
              )}

              <div className="mx-auto mt-6 max-w-xl rounded-2xl bg-blue-50 p-5 text-left">
                <p className="font-extrabold text-blue-950">What drives your price</p>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
                  <li>
                    <strong className="text-blue-950">Length — {result.lengthFt} ft.</strong> Totals scale
                    almost linearly per foot; most DFW homes need 30–40 ft.
                  </li>
                  <li>
                    <strong className="text-blue-950">Depth — {result.depthFt} ft.</strong> Deeper digs cost
                    more (excavation, shoring); deep clay or cast-iron lines price very differently from
                    shallow 2000s PVC.
                  </li>
                  <li>
                    <strong className="text-blue-950">Surface — {SURFACE_LABELS[result.surface].toLowerCase()}.</strong>{" "}
                    {result.surface === "lawn"
                      ? "Lawn is the cheapest surface to restore."
                      : "A hard surface costs more to cut and restore than lawn, which pushes the price toward the high end."}
                  </li>
                  <li>
                    <strong className="text-blue-950">Method — {result.methodLabel.toLowerCase()}.</strong>{" "}
                    {METHOD_EXPLAINERS[result.methodKey]}
                  </li>
                  <li>
                    <strong className="text-blue-950">Cleanout access.</strong>{" "}
                    {result.access === "have"
                      ? "You have a cleanout, so a camera can run straight away."
                      : "No cleanout means access work before a camera can run — see the camera cost below."}
                  </li>
                </ul>
                <p className="mt-3 text-xs text-slate-500">
                  Depth and surface move you inside the published range — no dollar amount is added for them,
                  because no published Texas figure prices them separately.
                </p>
              </div>

              <div className="mx-auto mt-6 max-w-xl rounded-2xl bg-slate-50 p-5 text-left">
                <p className="font-extrabold text-blue-950">Permit note{result.cityDisplay ? ` — ${result.cityDisplay}` : ""}</p>
                <p className="mt-2 text-sm text-slate-600">{statewideNote?.note}</p>
                {result.isDallas && dallasNote && (
                  <p className="mt-2 text-sm text-slate-600">
                    <strong className="text-blue-950">Dallas:</strong> {dallasNote.note}
                  </p>
                )}
                {result.isPlano && planoNote && (
                  <p className="mt-2 text-sm text-slate-600">
                    <strong className="text-blue-950">Plano:</strong> {planoNote.note}
                    {result.permitLow > 0
                      ? " That $400–$1,600 is already included in your range above."
                      : " A permit may still be required for a spot repair — the fee is not included in your range."}
                  </p>
                )}
                {!result.isDallas && !result.isPlano && (
                  <p className="mt-2 text-sm text-slate-600">
                    No per-city permit fee is published for {result.cityDisplay || "your city"} — permit
                    required, fee varies by city. Ask your plumber what your city charges.
                  </p>
                )}
              </div>

              <div className="mx-auto mt-6 max-w-xl rounded-2xl bg-white p-6 text-left shadow-sm ring-1 ring-slate-200">
                <p className="font-extrabold text-blue-950">Get a camera scope first</p>
                <p className="mt-2 text-sm text-slate-600">
                  A scope tells you whether you need a repair at all — and whether the line can be lined, must
                  be burst, or needs a full trench. Don&apos;t price a replacement before you know what the
                  pipe actually looks like inside.
                </p>
                <p className="mt-3 text-sm text-slate-600">
                  <strong className="text-blue-950">{result.cameraLabel}:</strong>{" "}
                  {fmtMoney(result.cameraLow)}–{fmtMoney(result.cameraHigh)}
                  {result.access === "need-new" ? "+" : ""}. {result.cameraNote}
                </p>
                <p className="mt-3 text-sm text-slate-600">
                  Ask for the recording plus a written report with the defect&apos;s depth and location marked —{" "}
                  <Link href="/guides/sewer-camera-inspection-cost-texas/" className="font-bold text-blue-800 hover:underline">
                    sewer camera inspection costs in Texas →
                  </Link>
                </p>
              </div>

              <a
                href={`tel:${PHONE_TEL}`}
                className="mt-8 inline-flex items-center gap-3 rounded-full bg-amber-500 px-8 py-4 text-lg font-extrabold text-blue-950 shadow-lg transition hover:bg-amber-400"
              >
                Call {PHONE_DISPLAY}
              </a>
              <p className="mt-3 text-sm text-slate-500">
                Start with a camera scope — a scope tells you whether you need a repair at all.
              </p>
              <button onClick={reset} className="mt-6 text-sm font-bold text-blue-800 hover:underline">
                Estimate another job
              </button>
            </div>
          )}
        </div>
        <p className="mt-4 text-center text-xs text-blue-200">
          2026 planning range from Texas-published contractor prices — an estimate, not a quote. Only a camera
          scope and an on-site look can price your house.
        </p>
        <div className="mx-auto mt-6 max-w-xl text-left">
          <p className="text-sm font-bold text-blue-100">Cost drivers behind every estimate</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-blue-200">
            {SEWER_COST_DRIVERS.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
