"use client";

import { useState } from "react";
import Link from "next/link";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/site";
import { TOWN_PRICES, townPriceBySlug, type TownPrice } from "@/lib/town-prices";

// NATIONAL repair ranges — labelled NATIONAL on the page, never presented
// as local. Source: Angi slab-leak repair $630–$4,400, average $2,300
// (updated Sep 22, 2026; also cited by This Old House, Apr 2026, via
// foundationrepairhq.com) — serp-swot-tools-2026-11-16.md §B3.
const NATIONAL_REPAIR_LOW = 630;
const NATIONAL_REPAIR_HIGH = 4400;
const NATIONAL_REPAIR_AVG = 2300;
// Sewer line replacement, national guide range only —
// serp-swot-tools-2026-11-16.md §A2 tool #9 ("a $5k–$20k decision").
const NATIONAL_SEWER_REPLACEMENT_LOW = 5000;
const NATIONAL_SEWER_REPLACEMENT_HIGH = 20000;

const inputCls =
  "w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-lg font-bold text-blue-950 outline-none transition focus:border-blue-800";
const labelCls = "mb-1.5 block text-sm font-bold text-slate-600";

type LeakType = "slab" | "yard" | "sewer" | "gas" | "pool";

const LEAK_TYPES: Array<{ value: LeakType; label: string; hint: string }> = [
  { value: "slab", label: "Slab leak (under the concrete floor)", hint: "Hot spot on the floor, warm tiles, sound of running water under the slab." },
  { value: "yard", label: "Yard line / water main leak", hint: "Soggy strip in the yard, green stripe along the line, whole-house pressure drop." },
  { value: "sewer", label: "Sewer line leak", hint: "Slow drains, sewage smell, wet patches or sinkholes in the yard." },
  { value: "gas", label: "Gas line leak", hint: "Smell of gas, hissing near a line, dead grass strip above a buried line." },
  { value: "pool", label: "Pool leak", hint: "Water level drops faster than evaporation, wet ground near the pool, pump losing prime." },
];

const ACCESS_METHODS: Record<LeakType, Array<{ value: string; label: string; driver: string }>> = {
  slab: [
    { value: "spot", label: "Spot repair — break the slab at the leak", driver: "One access point through the slab. The cheapest way in when the leak is pinpointed, but it means breaking and restoring the floor above it." },
    { value: "tunnel", label: "Tunnel under the slab", driver: "Digging from outside, under the slab, so the floor stays intact. More labour hours than a spot repair, but no floor tear-out or re-tiling." },
    { value: "reroute", label: "Reroute — new line overhead / through walls", driver: "Abandon the buried line and run a new one above the slab. No concrete work at all, but more pipe, fittings, and wall/ceiling patching." },
  ],
  yard: [
    { value: "dig", label: "Yard dig — excavate at the break", driver: "Digging at the leak point. Cost moves with depth, soil, and what sits above the line (lawn is cheapest to restore; driveway or patio costs more)." },
    { value: "reroute", label: "Reroute — new yard line", driver: "A new line from meter to house instead of patching the old one. More pipe and trenching up front, but no second dig if the old line fails again nearby." },
  ],
  sewer: [
    { value: "camera", label: "Camera inspection only — no repair yet", driver: "A camera plus a recorded video and a written diagnosis. This is the step that tells you whether you need a repair at all — and which one." },
    { value: "spot", label: "Spot repair — dig at the fault", driver: "Excavate at the break or separation and replace that section. Cost moves with depth and what sits above it (lawn vs driveway vs patio)." },
    { value: "lining", label: "Pipe lining (trenchless)", driver: "A liner is pulled through the old pipe, so there is little or no digging. Priced per job — it depends on length, diameter, and how many bends the line has." },
    { value: "replacement", label: "Full line replacement", driver: "The whole lateral is replaced, open-cut or trenchless. The biggest sewer job — length, depth, and the surface above it drive the price." },
  ],
  gas: [
    { value: "survey", label: "Pressure test + electronic survey", driver: "The line is pressure-tested and surveyed with a gas detector to find the leak point. Detection first — no digging until the leak is located." },
    { value: "replacement", label: "Line replacement after location", driver: "Once located, the failed section or the whole line is replaced and pressure-tested again before the gas is turned back on." },
  ],
  pool: [
    { value: "pressure", label: "Pressure test + dye test", driver: "Lines are pressure-tested and dye is used to find the leak point. Detection first — no deck cutting until the leak is located." },
    { value: "repair", label: "Repair at the leak (dig / cut deck)", driver: "Once located, the leak is repaired at the point — which can mean cutting deck or digging, depending on where the line runs." },
  ],
};

const FLOORING: Array<{ value: string; label: string; driver: string }> = [
  { value: "tile", label: "Tile / stone", driver: "Tile has to be broken out and re-laid after a spot repair — matching old tile and grout adds restoration cost." },
  { value: "hardwood", label: "Hardwood / laminate", driver: "Boards are cut out and replaced, then refinished to match — more restoration work than carpet or vinyl." },
  { value: "carpet", label: "Carpet", driver: "Carpet is cut, rolled back, and re-stretched after the repair — usually the cheapest floor to restore." },
  { value: "vinyl", label: "Vinyl / luxury vinyl plank", driver: "Planks or sheets are lifted and replaced — cost depends on whether matching planks are still available." },
  { value: "concrete", label: "Polished / bare concrete", driver: "The slab is patched and the finish redone — the patch is visible unless the whole floor is refinished." },
];

function fmtMoney(n: number): string {
  return `$${Math.round(n).toLocaleString()}`;
}

interface Result {
  town: TownPrice;
  leakType: LeakType;
  accessLabel: string;
  accessDriver: string;
  flooringLabel: string | null;
  flooringDriver: string | null;
  detectLow: number;
  detectHigh: number;
  detectLabel: string;
  detectNote: string | null;
  repairLow: number | null;
  repairHigh: number | null;
  repairLabel: string | null;
  repairNote: string | null;
  totalLow: number | null;
  totalHigh: number | null;
}

/**
 * Per-Town Leak Repair Cost Estimator — lead-gen tool #5.
 * Detection prices come from the town's own researched range
 * (site/lib/town-prices.ts, generated from the research CSVs).
 * Repair prices are NATIONAL ranges only, labelled as such — no local
 * repair price is invented. Access method and flooring change the
 * drivers and the repair picture, never the detection numbers.
 * Every result is an estimate, not a quote.
 */
export default function LeakCostEstimator({ town }: { town?: string }) {
  const defaultSlug = town && townPriceBySlug(town) ? town : "katy";
  const [townSlug, setTownSlug] = useState(defaultSlug);
  const [leakType, setLeakType] = useState<LeakType>("slab");
  const [access, setAccess] = useState(ACCESS_METHODS.slab[0].value);
  const [flooring, setFlooring] = useState(FLOORING[0].value);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const methods = ACCESS_METHODS[leakType];

  const onLeakTypeChange = (value: LeakType) => {
    setLeakType(value);
    setAccess(ACCESS_METHODS[value][0].value);
    setResult(null);
    setError(null);
  };

  const calculate = () => {
    setError(null);
    const t = townPriceBySlug(townSlug);
    if (!t) {
      setError("Pick a town from the list.");
      return;
    }
    const method = ACCESS_METHODS[leakType].find((m) => m.value === access) ?? ACCESS_METHODS[leakType][0];
    const floor = FLOORING.find((f) => f.value === flooring) ?? null;

    let detectLow: number;
    let detectHigh: number;
    let detectLabel: string;
    let detectNote: string | null = null;
    if (leakType === "slab") {
      detectLow = t.slabLow;
      detectHigh = t.slabHigh;
      detectLabel = "Slab leak detection";
    } else if (leakType === "sewer") {
      detectLow = t.cameraLow;
      detectHigh = t.cameraHigh;
      detectLabel = "Sewer camera inspection";
      if (t.cameraNote) detectNote = t.cameraNote;
    } else {
      detectLow = t.leakLow;
      detectHigh = t.leakHigh;
      detectLabel =
        leakType === "yard"
          ? "General leak detection (yard / water main)"
          : leakType === "gas"
            ? "General leak detection — gas survey uses the same visit"
            : "General leak detection (pool)";
      if (leakType === "gas") {
        detectNote =
          "No gas-specific detection price is in our researched data, so the town's general leak-detection range is shown. Confirm the gas-survey price by phone before booking.";
      } else if (leakType === "pool") {
        detectNote =
          "No pool-specific detection price is in our researched data, so the town's general leak-detection range is shown. Confirm the pool pressure-test price by phone before booking.";
      }
    }

    let repairLow: number | null = null;
    let repairHigh: number | null = null;
    let repairLabel: string | null = null;
    let repairNote: string | null = null;
    if (leakType === "slab" || leakType === "yard") {
      repairLow = NATIONAL_REPAIR_LOW;
      repairHigh = NATIONAL_REPAIR_HIGH;
      repairLabel = "Repair — NATIONAL range";
      repairNote = `National slab-leak repair range (Angi, updated Sep 22, 2026), average ${fmtMoney(NATIONAL_REPAIR_AVG)}. It is a national figure, not a ${t.town} price — the method and access you picked move a real quote inside (or outside) it.`;
    } else if (leakType === "sewer" && access === "replacement") {
      repairLow = NATIONAL_SEWER_REPLACEMENT_LOW;
      repairHigh = NATIONAL_SEWER_REPLACEMENT_HIGH;
      repairLabel = "Full sewer replacement — NATIONAL guide range";
      repairNote =
        "National guide range for a full sewer lateral replacement. Spot repair and pipe lining are separate, smaller jobs — no national range for them is in our sources, so they are priced per job.";
    } else if (leakType === "sewer") {
      repairNote =
        access === "camera"
          ? "No repair priced here — the camera inspection is the step that decides whether a repair is needed at all."
          : "Spot repair and pipe lining are priced per job (length, depth, surface above the line). No national range for them is in our sources, so this estimate stops at detection.";
    } else {
      repairNote =
        leakType === "gas"
          ? "Gas-line repair is priced per job after the leak is located (line length, material, depth, permit). No national repair range for gas lines is in our sources, so this estimate stops at detection."
          : "Pool repair is priced per job after the leak is located (line, fitting, or shell — and whether deck has to be cut). No national repair range for pool leaks is in our sources, so this estimate stops at detection.";
    }

    setResult({
      town: t,
      leakType,
      accessLabel: method.label,
      accessDriver: method.driver,
      flooringLabel: leakType === "slab" ? (floor?.label ?? null) : null,
      flooringDriver: leakType === "slab" ? (floor?.driver ?? null) : null,
      detectLow,
      detectHigh,
      detectLabel,
      detectNote,
      repairLow,
      repairHigh,
      repairLabel,
      repairNote,
      totalLow: repairLow !== null ? detectLow + repairLow : null,
      totalHigh: repairHigh !== null ? detectHigh + repairHigh : null,
    });
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  const metros = [...new Set(TOWN_PRICES.map((t) => t.metro))];
  const selectedTown = townPriceBySlug(townSlug);
  const leakHint = LEAK_TYPES.find((l) => l.value === leakType)?.hint ?? "";

  return (
    <section id="leak-cost-estimator" className="scroll-mt-20 bg-blue-950" aria-label="Leak repair cost estimator">
      <div className="mx-auto max-w-3xl px-4 py-14">
        <div className="rounded-3xl border border-blue-800 bg-white p-6 shadow-xl md:p-10">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
            Free tool · no signup
          </p>
          <h2 className="mt-3 text-center text-3xl font-extrabold tracking-tight text-blue-950">
            Estimate your leak repair cost
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-slate-600">
            Pick your town, the leak type, and how it would be reached. The
            detection price comes from that town&apos;s researched range —
            the repair price is a clearly labelled national range.
            Everything here is an estimate, not a quote.
          </p>

          {leakType === "gas" && (
            <p className="mx-auto mt-6 max-w-xl rounded-xl bg-red-50 p-4 text-sm font-bold text-red-700">
              Safety first: if you smell gas, leave the building and call 911
              first — do not use phones, lights, or switches inside. Only
              then call a pro or your gas utility.
            </p>
          )}

          <div className="mx-auto mt-8 grid max-w-xl gap-5">
            <div>
              <label className={labelCls} htmlFor="lc-town">Your town</label>
              <select
                id="lc-town"
                className={inputCls}
                value={townSlug}
                onChange={(e) => {
                  setTownSlug(e.target.value);
                  setResult(null);
                }}
              >
                {metros.map((metro) => (
                  <optgroup key={metro} label={`${metro} metro`}>
                    {TOWN_PRICES.filter((t) => t.metro === metro).map((t) => (
                      <option key={t.townSlug} value={t.townSlug}>
                        {t.town}, TX
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {selectedTown && (
                <p className="mt-1.5 text-xs text-slate-400">
                  Researched ranges for {selectedTown.town}: detection {fmtMoney(selectedTown.leakLow)}–{fmtMoney(selectedTown.leakHigh)} · slab {fmtMoney(selectedTown.slabLow)}–{fmtMoney(selectedTown.slabHigh)} · sewer camera {fmtMoney(selectedTown.cameraLow)}–{fmtMoney(selectedTown.cameraHigh)} (metro-typical, see methodology).
                </p>
              )}
            </div>

            <div>
              <label className={labelCls} htmlFor="lc-type">Leak type</label>
              <select
                id="lc-type"
                className={inputCls}
                value={leakType}
                onChange={(e) => onLeakTypeChange(e.target.value as LeakType)}
              >
                {LEAK_TYPES.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-slate-400">{leakHint}</p>
            </div>

            <div>
              <label className={labelCls} htmlFor="lc-access">Access method</label>
              <select
                id="lc-access"
                className={inputCls}
                value={access}
                onChange={(e) => setAccess(e.target.value)}
              >
                {methods.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {leakType === "slab" && (
              <div>
                <label className={labelCls} htmlFor="lc-flooring">Flooring above the slab</label>
                <select
                  id="lc-flooring"
                  className={inputCls}
                  value={flooring}
                  onChange={(e) => setFlooring(e.target.value)}
                >
                  {FLOORING.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-xs text-slate-400">
                  Flooring changes the restoration cost after a spot repair — not the detection price.
                </p>
              </div>
            )}

            {error && (
              <p className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>
            )}

            <button
              onClick={calculate}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-800 px-7 py-4 text-lg font-extrabold text-white transition hover:bg-blue-700"
            >
              Estimate my cost →
            </button>
          </div>

          {result && (
            <div className="mt-8 text-center">
              <span className="inline-block rounded-full bg-blue-100 px-4 py-1.5 text-sm font-extrabold text-blue-800">
                Estimate for {result.town.town}, TX — not a quote
              </span>
              <h3 className="mt-4 text-2xl font-extrabold text-blue-950">
                {result.totalLow !== null && result.totalHigh !== null
                  ? `${fmtMoney(result.totalLow)}–${fmtMoney(result.totalHigh)} planning range`
                  : `${fmtMoney(result.detectLow)}–${fmtMoney(result.detectHigh)} for detection`}
              </h3>
              <p className="mx-auto mt-3 max-w-xl text-slate-600">
                {result.totalLow !== null
                  ? "Detection plus repair, added together — the planning range for the whole job. A real quote can land outside it: only on-site detection confirms the method."
                  : "Detection only — the repair is priced per job after the leak is located, so no repair range is shown. Only on-site detection confirms the method."}
              </p>

              <div className="mx-auto mt-8 grid max-w-xl gap-4 text-left sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-3xl font-extrabold text-blue-950">
                    {fmtMoney(result.detectLow)}–{fmtMoney(result.detectHigh)}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">
                    {result.detectLabel} in {result.town.town} — researched range (estimate)
                  </p>
                </div>
                <div className="rounded-2xl bg-amber-50 p-5">
                  <p className="text-3xl font-extrabold text-blue-950">
                    {result.repairLow !== null && result.repairHigh !== null
                      ? `${fmtMoney(result.repairLow)}–${fmtMoney(result.repairHigh)}`
                      : "Priced per job"}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">
                    {result.repairLabel ?? "Repair — no range in our sources"}
                  </p>
                </div>
              </div>

              {result.detectNote && (
                <p className="mx-auto mt-4 max-w-xl rounded-xl bg-amber-50 p-4 text-left text-sm font-semibold text-slate-600">
                  {result.detectNote}
                </p>
              )}
              {result.repairNote && (
                <p className="mx-auto mt-4 max-w-xl rounded-xl bg-slate-50 p-4 text-left text-sm text-slate-600">
                  {result.repairNote}
                </p>
              )}

              <div className="mx-auto mt-6 max-w-xl rounded-2xl bg-blue-50 p-5 text-left">
                <p className="font-extrabold text-blue-950">What drives the price</p>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
                  <li>
                    <strong className="text-blue-950">Access ({result.accessLabel}):</strong> {result.accessDriver}
                  </li>
                  {result.flooringLabel && result.flooringDriver && (
                    <li>
                      <strong className="text-blue-950">Flooring ({result.flooringLabel}):</strong> {result.flooringDriver}
                    </li>
                  )}
                  <li>
                    <strong className="text-blue-950">The town range itself:</strong> {result.town.town}&apos;s
                    researched {result.leakType === "slab" ? "slab" : result.leakType === "sewer" ? "camera" : "general"} detection
                    range is {fmtMoney(result.detectLow)}–{fmtMoney(result.detectHigh)}. A wider range means quotes in
                    this metro vary more — compare at least two before you decide.
                  </li>
                  <li>
                    <strong className="text-blue-950">What the quote includes:</strong> detection and repair are
                    separate jobs. A quote that bundles them without splitting the two hides which part is expensive.
                  </li>
                </ul>
              </div>

              <div className="mx-auto mt-6 max-w-xl rounded-2xl bg-white p-6 text-left shadow-sm ring-1 ring-slate-200">
                <p className="font-extrabold text-blue-950">Is that quote fair? Check it against this list</p>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
                  <li><strong className="text-blue-950">Split the quote:</strong> detection and repair on separate lines. Compare the detection line with the {fmtMoney(result.detectLow)}–{fmtMoney(result.detectHigh)} range above.</li>
                  <li><strong className="text-blue-950">Method in writing:</strong> the quote names the method ({result.accessLabel.toLowerCase()}) — not just &ldquo;fix the leak&rdquo;.</li>
                  <li><strong className="text-blue-950">Location in writing:</strong> the detection report states where the leak is, so a second pro can price the same job.</li>
                  <li><strong className="text-blue-950">Restoration included?</strong> Floor, drywall, or yard restoration is listed — or listed as excluded, so it cannot surprise you later.</li>
                  <li><strong className="text-blue-950">Permit and inspection:</strong> ask whether a plumbing permit and inspection are included and who arranges them.</li>
                  <li><strong className="text-blue-950">Two quotes, same method:</strong> get a second quote for the same method and the same leak location. Different methods are not comparable prices.</li>
                </ul>
              </div>

              <a
                href={`tel:${PHONE_TEL}`}
                className="mt-8 inline-flex items-center gap-3 rounded-full bg-amber-500 px-8 py-4 text-lg font-extrabold text-blue-950 shadow-lg transition hover:bg-amber-400"
              >
                Call {PHONE_DISPLAY}
              </a>
              <p className="mt-3 text-sm text-slate-500">
                Get a detection visit to confirm the method — the estimate above assumes a method; only on-site
                detection can confirm which one your leak needs.
              </p>
              <p className="mt-4 text-sm text-slate-500">
                Your town guide:{" "}
                <Link
                  href={`/tx/${result.town.metroSlug}/${result.town.townSlug}/`}
                  className="font-bold text-blue-800 hover:underline"
                >
                  Leak detection in {result.town.town}, TX →
                </Link>
              </p>
              <button onClick={reset} className="mt-6 text-sm font-bold text-blue-800 hover:underline">
                Estimate another leak
              </button>
            </div>
          )}
        </div>
        <p className="mt-4 text-center text-xs text-blue-200">
          Estimates from researched ranges — not a diagnosis, and never a quote. Only on-site detection can confirm a leak and its repair method.
        </p>
      </div>
    </section>
  );
}
