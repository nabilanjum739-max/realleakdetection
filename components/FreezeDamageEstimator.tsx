"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/site";
import { FREEZE_TOWNS } from "@/lib/freeze-towns";

// Burst-likelihood bands — MUST match FreezeRiskTonight (Tool 2) and
// scripts/fetch-freeze-risk.py band() exactly. Change all three together;
// the thresholds are published on the tool page.
type Band = "low" | "watch" | "high";

function bandFor(lowF: number, freezeHours: number): Band {
  if (freezeHours === 0) return "low";
  if (lowF > 28 && freezeHours < 4) return "watch";
  return "high";
}

function stepUp(band: Band): Band {
  if (band === "low") return "watch";
  return "high";
}

// The tool's own adjustment rule — published on the page, not a
// published model: power out raises the band one step (a house with no
// heat loses its protection), and an exposed location (attic, garage,
// outdoor tankless) raises a Watch night to High. Capped at High.
function effectiveBand(
  base: Band,
  freezeHours: number,
  location: Location,
  power: Power
): Band {
  if (freezeHours === 0) return base;
  let band = base;
  if (power === "out") band = stepUp(band);
  if (
    (location === "attic" || location === "garage" || location === "tankless") &&
    band === "watch"
  ) {
    band = "high";
  }
  return band;
}

/**
 * Tonight's window, in America/Chicago wall time: 18:00 today -> 09:00
 * tomorrow (16 hourly readings). Copied from FreezeRiskTonight so the
 * two tools always agree on what "tonight" means.
 */
function tonightDates(now: Date): { today: string; tomorrow: string } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const y = Number(get("year"));
  const m = Number(get("month"));
  const d = Number(get("day"));
  const pad = (n: number) => String(n).padStart(2, "0");
  const today = `${y}-${pad(m)}-${pad(d)}`;
  const tmr = new Date(Date.UTC(y, m - 1, d + 1));
  const tomorrow = tmr.toISOString().slice(0, 10);
  return { today, tomorrow };
}

function nightLabelFor(now: Date): string {
  const { today } = tonightDates(now);
  const [y, m, d] = today.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function chicagoToday(now: Date): string {
  return tonightDates(now).today;
}

interface ForecastNumbers {
  lowF: number;
  freezeHours: number;
  hardFreezeHours: number;
  hardFreeze: boolean;
  band: Band;
}

function assessHourly(
  times: string[],
  temps: Array<number | null>
): ForecastNumbers {
  const { today, tomorrow } = tonightDates(new Date());
  const vals: number[] = [];
  for (let i = 0; i < times.length; i++) {
    const v = temps[i];
    if (v === null || v === undefined || Number.isNaN(v)) continue;
    const [date, clock] = times[i].split("T");
    const hour = Number((clock ?? "00:00").slice(0, 2));
    const inWindow =
      (date === today && hour >= 18) || (date === tomorrow && hour <= 9);
    if (inWindow) vals.push(v);
  }
  if (vals.length < 12) throw new Error("forecast did not cover tonight");
  const lowF = Math.min(...vals);
  const freezeHours = vals.filter((v) => v < 32).length;
  const hardFreezeHours = vals.filter((v) => v <= 20).length;
  return {
    lowF: Math.round(lowF * 10) / 10,
    freezeHours,
    hardFreezeHours,
    hardFreeze: lowF <= 20,
    band: bandFor(lowF, freezeHours),
  };
}

async function fetchForecast(lat: number, lon: number) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&hourly=temperature_2m&forecast_days=2&temperature_unit=fahrenheit&timezone=America%2FChicago`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("forecast request failed");
  const data = await res.json();
  return data.hourly as { time: string[]; temperature_2m: Array<number | null> };
}

// --- Damage math ---------------------------------------------------------
// IICRC S500 defines the water categories (1 clean, 2 gray, 3 black).
// It is a standard of care, not a price book — so the $/sq ft bands
// below come from published trade cost guides that price by S500
// category (RestoreAdvisor, 2026): Cat 1 $3–$4, Cat 2 $4–$6.50,
// Cat 3 $7–$7.50 per sq ft for mitigation (extraction + drying).
// Rebuild/repair: $20–$37 per sq ft from the same published guide;
// the tool uses the $28 midpoint as an editable default. Every rate is
// editable — the tool never presents a rate as your quote.
// No Bureau of Labor Statistics figure is used here: the published
// bands above already include extraction, drying, and labor.
type Category = "1" | "2" | "3";

const MITIGATION_BANDS: Record<
  Category,
  { low: number; high: number; label: string }
> = {
  "1": { low: 3, high: 4, label: "Category 1 — clean water (burst supply line)" },
  "2": { low: 4, high: 6.5, label: "Category 2 — gray water (washer / dishwasher overflow)" },
  "3": { low: 7, high: 7.5, label: "Category 3 — black water (sewage, flood, groundwater)" },
};

const REBUILD_RATE_DEFAULT = 28; // Midpoint of the published $20–$37/sq ft range.
const REBUILD_RATE_PUBLISHED = "$20–$37";

// Planning assumption for a burst 1/2-inch line at typical household
// pressure — labeled as an assumption everywhere it appears. A real
// burst line's flow depends on pressure, pipe size, and distance from
// the main, so the tool lets the user change it.
const FLOW_GPM_DEFAULT = 6;

type Location = "attic" | "garage" | "exterior-wall" | "crawl-space" | "tankless";
type Power = "on" | "out";

const LOCATION_LABELS: Record<Location, string> = {
  attic: "Attic",
  garage: "Garage",
  "exterior-wall": "Exterior wall",
  "crawl-space": "Crawl space",
  tankless: "Outdoor tankless unit",
};

const inputCls =
  "w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-lg font-bold text-blue-950 outline-none transition focus:border-blue-800";
const labelCls = "mb-1.5 block text-sm font-bold text-slate-600";

function fmtMoney(n: number): string {
  return `$${Math.round(n).toLocaleString()}`;
}

function fmtGal(n: number): string {
  return Math.round(n).toLocaleString();
}

interface Result {
  place: string;
  source: "nightly" | "live" | "typed";
  generatedAt?: string;
  nightLabel: string;
  lowF: number;
  freezeHours: number;
  hardFreezeHours: number;
  hardFreeze: boolean;
  baseBand: Band;
  band: Band;
  location: Location;
  power: Power;
  room: string;
  flooring: string;
  sqft: number;
  hoursUndetected: number;
  gpm: number;
  gallons: number;
  category: Category;
  mitLow: number;
  mitHigh: number;
  rebuildRate: number;
  rebuild: number;
  totalLow: number;
  totalHigh: number;
  deductible: number;
  insurerLow: number;
  insurerHigh: number;
}

const FLOORING_NOTES: Record<string, string> = {
  Hardwood:
    "Hardwood can cup and buckle when soaked — drying starts fast, or boards may need replacing. A crew decides on site.",
  Carpet:
    "Soaked carpet pad is often removed; the carpet itself can sometimes be dried. A crew decides on site.",
  "Tile / stone":
    "Tile often survives a burst; the subfloor and grout underneath are what a crew checks first.",
  "Laminate / vinyl plank":
    "Laminate and vinyl plank swell at the edges when soaked and are often replaced rather than dried.",
};

/**
 * Freeze-Burst Damage Estimator — lead-gen tool #5, companion to
 * Freeze-Burst Risk Tonight (Tool 2). Forecast low + freeze hours
 * (fetched live per town, or typed in) + pipe location + power status
 * → burst-likelihood band, gallons released, damage $ range by
 * affected area, and the typical insurance split. Estimates only —
 * guidance, not a guarantee, not a quote, not insurance advice.
 */
export default function FreezeDamageEstimator({ town }: { town?: string }) {
  const defaultSlug = town && FREEZE_TOWNS.some((t) => t.slug === town) ? town : "katy";
  const [slug, setSlug] = useState(defaultSlug);
  const [lowF, setLowF] = useState("");
  const [freezeHours, setFreezeHours] = useState("");
  const [hardFreezeHours, setHardFreezeHours] = useState("");
  const [location, setLocation] = useState<Location>("attic");
  const [power, setPower] = useState<Power>("on");
  const [room, setRoom] = useState("Living room / bedroom");
  const [flooring, setFlooring] = useState("Hardwood");
  const [sqft, setSqft] = useState("200");
  const [hoursUndetected, setHoursUndetected] = useState("8");
  const [gpm, setGpm] = useState(String(FLOW_GPM_DEFAULT));
  const [category, setCategory] = useState<Category>("1");
  const [rebuildRate, setRebuildRate] = useState(String(REBUILD_RATE_DEFAULT));
  const [deductible, setDeductible] = useState("1000");
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [forecastNote, setForecastNote] = useState<string | null>(null);

  const loadTown = async (townSlug: string) => {
    const t = FREEZE_TOWNS.find((x) => x.slug === townSlug);
    if (!t) return;
    // Computed here (event handler), never during render: Next.js blocks
    // `new Date()` reads while prerendering a Client Component.
    const label = nightLabelFor(new Date());
    setStatus("loading");
    setError(null);
    setForecastNote(null);
    try {
      // 1) Prefer the nightly committed forecast when it is fresh.
      try {
        const res = await fetch("/data/freeze-risk.json", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          const entry = data?.towns?.[townSlug];
          if (data?.forecast_date === chicagoToday(new Date()) && entry) {
            setLowF(String(entry.low_f));
            setFreezeHours(String(entry.freeze_hours));
            setHardFreezeHours(String(entry.hard_freeze_hours));
            setForecastNote(
              `${t.town}, TX — tonight's forecast from the nightly file (generated ${data.generated_at_utc ?? "today"} UTC). Edit the numbers below if your thermometer disagrees.`
            );
            setStatus("ready");
            return;
          }
        }
      } catch {
        // Stale or missing file — fall through to the live forecast.
      }
      // 2) Live fallback: Open-Meteo forecast at the town's coordinates.
      const hourly = await fetchForecast(t.lat, t.lon);
      const assessed = assessHourly(hourly.time, hourly.temperature_2m);
      setLowF(String(assessed.lowF));
      setFreezeHours(String(assessed.freezeHours));
      setHardFreezeHours(String(assessed.hardFreezeHours));
      setForecastNote(
        `${t.town}, TX — tonight's forecast fetched live from Open-Meteo just now. Edit the numbers below if your thermometer disagrees.`
      );
      setStatus("ready");
    } catch {
      setError(
        "Could not load tonight's forecast right now. Type tonight's low and freeze hours in by hand instead — the estimate works the same."
      );
      setStatus("error");
    }
  };

  useEffect(() => {
    loadTown(slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onTownChange = (value: string) => {
    setSlug(value);
    loadTown(value);
  };

  const calculate = () => {
    setError(null);
    const low = parseFloat(lowF);
    const hrs = parseFloat(freezeHours);
    const hardHrs = hardFreezeHours.trim() === "" ? 0 : parseFloat(hardFreezeHours);
    const area = parseFloat(sqft);
    const undetected = parseFloat(hoursUndetected);
    const flow = parseFloat(gpm);
    const rebuild = parseFloat(rebuildRate);
    const ded = deductible.trim() === "" ? 0 : parseFloat(deductible);
    if ([low, hrs, area, undetected, flow, rebuild].some((x) => isNaN(x)) || isNaN(ded)) {
      setError("Fill in tonight's low, freeze hours, affected area, hours undetected, flow rate, rebuild rate, and deductible.");
      return;
    }
    if (low < -30 || low > 60) {
      setError("Tonight's low should be between −30°F and 60°F.");
      return;
    }
    if (hrs < 0 || hrs > 16) {
      setError("Freeze hours should be between 0 and 16 (tonight is a 16-hour window, 6pm–9am).");
      return;
    }
    if (hardHrs < 0 || hardHrs > 16 || hardHrs > hrs) {
      setError("Hard-freeze hours should be between 0 and the freeze hours above.");
      return;
    }
    if (area <= 0 || area > 10000) {
      setError("Affected area should be between 1 and 10,000 sq ft — measure the wet floor area.");
      return;
    }
    if (undetected <= 0 || undetected > 72) {
      setError("Hours undetected should be between 1 and 72.");
      return;
    }
    if (flow <= 0 || flow > 50) {
      setError("Flow rate should be between 1 and 50 gallons per minute.");
      return;
    }
    if (rebuild < 0 || rebuild > 200) {
      setError("Rebuild rate should be between $0 and $200 per sq ft (enter 0 to see mitigation only).");
      return;
    }
    if (ded < 0 || ded > 50000) {
      setError("Deductible should be between $0 and $50,000.");
      return;
    }

    const base = bandFor(low, hrs);
    const band = effectiveBand(base, hrs, location, power);
    const gallons = flow * 60 * undetected;
    const bandRates = MITIGATION_BANDS[category];
    const mitLow = area * bandRates.low;
    const mitHigh = area * bandRates.high;
    const rebuildTotal = area * rebuild;
    const totalLow = mitLow + rebuildTotal;
    const totalHigh = mitHigh + rebuildTotal;
    const insurerLow = Math.max(0, totalLow - ded);
    const insurerHigh = Math.max(0, totalHigh - ded);
    const t = FREEZE_TOWNS.find((x) => x.slug === slug);
    // Date read inside the event handler, never during render.
    const label = nightLabelFor(new Date());

    setResult({
      place: t ? `${t.town}, TX` : "Your town",
      source: forecastNote ? (forecastNote.includes("live") ? "live" : "nightly") : "typed",
      nightLabel: label,
      lowF: low,
      freezeHours: hrs,
      hardFreezeHours: hardHrs,
      hardFreeze: low <= 20,
      baseBand: base,
      band,
      location,
      power,
      room,
      flooring,
      sqft: area,
      hoursUndetected: undetected,
      gpm: flow,
      gallons,
      category,
      mitLow,
      mitHigh,
      rebuildRate: rebuild,
      rebuild: rebuildTotal,
      totalLow,
      totalHigh,
      deductible: ded,
      insurerLow,
      insurerHigh,
    });
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  const metros = [...new Set(FREEZE_TOWNS.map((t) => t.metro))];

  const bandCopy = {
    low: {
      badge: "Low burst likelihood",
      badgeClass: "bg-green-100 text-green-800",
      headline: "A burst is unlikely tonight.",
      body: "No hours below freezing are in the numbers you entered, so water in pipes should stay liquid. The damage figures below are $0 — there is nothing to estimate until a freeze is actually forecast.",
    },
    watch: {
      badge: "Watch — burst possible",
      badgeClass: "bg-amber-100 text-amber-800",
      headline: "A burst is possible — the damage below is what it could cost.",
      body: "Tonight dips below freezing for a short stretch. Indoor pipes in heated space are usually fine, but pipes in unheated spaces can freeze. The gallons and dollars below assume a burst happens — they are the cost if it does, not a prediction that it will.",
    },
    high: {
      badge: "High burst likelihood — act now",
      badgeClass: "bg-red-100 text-red-800",
      headline: "Conditions tonight can burst pipes — act before bed.",
      body: "Tonight stays below freezing for hours, cold enough to freeze and burst pipes. The gallons and dollars below are what a burst could cost if one happens. Do the shut-off triage below now, before you go to sleep.",
    },
  }[result?.band ?? "low"];

  return (
    <section id="freeze-damage-estimator" className="scroll-mt-20 bg-blue-950" aria-label="Freeze-burst damage estimator">
      <div className="mx-auto max-w-3xl px-4 py-14">
        <div className="rounded-3xl border border-blue-800 bg-white p-6 shadow-xl md:p-10">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
            Free tool · no signup
          </p>
          <h2 className="mt-3 text-center text-3xl font-extrabold tracking-tight text-blue-950">
            Estimate tonight&apos;s freeze damage
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-slate-600">
            Start with{" "}
            <Link href="/tools/freeze-risk-tonight/" className="font-bold text-blue-800 hover:underline">
              tonight&apos;s freeze risk
            </Link>{" "}
            — then see what a burst would cost: gallons released, damage
            dollars by room, and what insurance typically covers. Every
            figure is an estimate, never a quote.
          </p>

          <div className="mx-auto mt-8 grid max-w-xl gap-5">
            <div>
              <label className={labelCls} htmlFor="fd-town">Your town — tonight&apos;s forecast</label>
              <select
                id="fd-town"
                className={inputCls}
                value={slug}
                onChange={(e) => onTownChange(e.target.value)}
              >
                {metros.map((metro) => (
                  <optgroup key={metro} label={`${metro} metro`}>
                    {FREEZE_TOWNS.filter((t) => t.metro === metro).map((t) => (
                      <option key={t.slug} value={t.slug}>
                        {t.town}, TX
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-slate-400">
                The forecast fills in tonight&apos;s low and freeze hours below — or type your own numbers in.
              </p>
            </div>

            {status === "loading" && (
              <p className="text-center font-bold text-slate-500">Checking tonight&apos;s forecast…</p>
            )}
            {forecastNote && (
              <p className="rounded-xl bg-blue-50 p-4 text-sm font-semibold text-blue-800">{forecastNote}</p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls} htmlFor="fd-low">Tonight&apos;s low (°F)</label>
                <input id="fd-low" inputMode="decimal" className={inputCls} placeholder="e.g. 24"
                  value={lowF} onChange={(e) => setLowF(e.target.value)} />
              </div>
              <div>
                <label className={labelCls} htmlFor="fd-hours">Hours below 32°F</label>
                <input id="fd-hours" inputMode="decimal" className={inputCls} placeholder="e.g. 6"
                  value={freezeHours} onChange={(e) => setFreezeHours(e.target.value)} />
              </div>
            </div>
            <div>
              <label className={labelCls} htmlFor="fd-hard">Hours at or below 20°F (hard freeze)</label>
              <input id="fd-hard" inputMode="decimal" className={inputCls} placeholder="e.g. 0"
                value={hardFreezeHours} onChange={(e) => setHardFreezeHours(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls} htmlFor="fd-location">Where are the pipes?</label>
                <select id="fd-location" className={inputCls} value={location}
                  onChange={(e) => setLocation(e.target.value as Location)}>
                  {(Object.keys(LOCATION_LABELS) as Location[]).map((loc) => (
                    <option key={loc} value={loc}>{LOCATION_LABELS[loc]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls} htmlFor="fd-power">Power tonight</label>
                <select id="fd-power" className={inputCls} value={power}
                  onChange={(e) => setPower(e.target.value as Power)}>
                  <option value="on">Power on — heat running</option>
                  <option value="out">Power out — no heat</option>
                </select>
              </div>
            </div>
            <p className="-mt-2 text-xs text-slate-400">
              Power out raises the burst band one step; attic, garage, or outdoor tankless pipes raise a Watch night to High. The full rule is published below the tool.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls} htmlFor="fd-room">Room that would flood</label>
                <select id="fd-room" className={inputCls} value={room}
                  onChange={(e) => setRoom(e.target.value)}>
                  <option>Living room / bedroom</option>
                  <option>Kitchen</option>
                  <option>Bathroom</option>
                  <option>Garage / utility room</option>
                </select>
              </div>
              <div>
                <label className={labelCls} htmlFor="fd-flooring">Flooring in that room</label>
                <select id="fd-flooring" className={inputCls} value={flooring}
                  onChange={(e) => setFlooring(e.target.value)}>
                  <option>Hardwood</option>
                  <option>Carpet</option>
                  <option>Tile / stone</option>
                  <option>Laminate / vinyl plank</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls} htmlFor="fd-sqft">Affected area (sq ft)</label>
                <input id="fd-sqft" inputMode="decimal" className={inputCls} placeholder="e.g. 200"
                  value={sqft} onChange={(e) => setSqft(e.target.value)} />
                <p className="mt-1.5 text-xs text-slate-400">Measure the wet floor area — 200 sq ft is an example, not a typical size.</p>
              </div>
              <div>
                <label className={labelCls} htmlFor="fd-undetected">Hours undetected</label>
                <input id="fd-undetected" inputMode="decimal" className={inputCls} placeholder="e.g. 8"
                  value={hoursUndetected} onChange={(e) => setHoursUndetected(e.target.value)} />
                <p className="mt-1.5 text-xs text-slate-400">How long before someone finds it — 8 hours is one night asleep.</p>
              </div>
            </div>

            <div>
              <label className={labelCls} htmlFor="fd-gpm">Flow rate if it bursts (gallons per minute)</label>
              <input id="fd-gpm" inputMode="decimal" className={inputCls}
                value={gpm} onChange={(e) => setGpm(e.target.value)} />
              <p className="mt-1.5 text-xs text-slate-400">
                Default {FLOW_GPM_DEFAULT} gpm is a planning assumption for a burst 1/2-inch line at typical household pressure — not a measured rate. Change it if your line is bigger or your pressure is higher.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls} htmlFor="fd-category">Water category (IICRC S500)</label>
                <select id="fd-category" className={inputCls} value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}>
                  <option value="1">Category 1 — clean water</option>
                  <option value="2">Category 2 — gray water</option>
                  <option value="3">Category 3 — black water</option>
                </select>
                <p className="mt-1.5 text-xs text-slate-400">A burst supply line is Category 1 clean water.</p>
              </div>
              <div>
                <label className={labelCls} htmlFor="fd-rebuild">Rebuild rate ($ per sq ft)</label>
                <input id="fd-rebuild" inputMode="decimal" className={inputCls}
                  value={rebuildRate} onChange={(e) => setRebuildRate(e.target.value)} />
                <p className="mt-1.5 text-xs text-slate-400">
                  Default ${REBUILD_RATE_DEFAULT} is the midpoint of the published {REBUILD_RATE_PUBLISHED}/sq ft range. Enter 0 for mitigation only.
                </p>
              </div>
            </div>

            <div>
              <label className={labelCls} htmlFor="fd-deductible">Your insurance deductible ($)</label>
              <input id="fd-deductible" inputMode="decimal" className={inputCls} placeholder="e.g. 1000"
                value={deductible} onChange={(e) => setDeductible(e.target.value)} />
              <p className="mt-1.5 text-xs text-slate-400">
                From your policy&apos;s declarations page — $1,000 here is an example, not a typical deductible.
              </p>
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>
            )}

            <button
              onClick={calculate}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-800 px-7 py-4 text-lg font-extrabold text-white transition hover:bg-blue-700"
            >
              Estimate the damage →
            </button>
          </div>

          {result && (
            <div className="mt-8 text-center">
              <span className={`inline-block rounded-full px-4 py-1.5 text-sm font-extrabold ${bandCopy.badgeClass}`}>
                {bandCopy.badge}
              </span>
              <h3 className="mt-4 text-2xl font-extrabold text-blue-950">{bandCopy.headline}</h3>
              <p className="mx-auto mt-3 max-w-xl text-slate-600">{bandCopy.body}</p>

              <p className="mx-auto mt-4 max-w-xl text-sm font-semibold text-slate-600">
                Night of {result.nightLabel} · {result.place} · low {Math.round(result.lowF)}°F ·{" "}
                {result.freezeHours} hrs below 32°F · {result.hardFreezeHours} hrs at or below 20°F
                {result.hardFreeze ? " — hard freeze" : ""}
              </p>
              {result.baseBand !== result.band && (
                <p className="mx-auto mt-2 max-w-xl rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-800">
                  Forecast band was {result.baseBand === "watch" ? "Watch" : "Low"} — raised to{" "}
                  {result.band === "high" ? "High" : "Watch"} because{" "}
                  {result.power === "out"
                    ? "the power is out (no heat)"
                    : "the pipes sit in an unheated space"}{result.power === "out" && (result.location === "attic" || result.location === "garage" || result.location === "tankless") ? " and the pipes sit in an unheated space" : ""}.
                </p>
              )}

              {result.band === "high" && (
                <div className="mx-auto mt-6 max-w-xl rounded-2xl bg-red-50 p-5 text-left ring-1 ring-red-200">
                  <p className="font-extrabold text-red-800">Shut off now — triage before bed</p>
                  <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-700">
                    <li>Find your main water shutoff (where the line enters the house) and make sure everyone at home knows where it is.</li>
                    <li>Let cold-water taps on exterior walls drip, and open cabinet doors under those sinks.</li>
                    <li>Disconnect garden hoses and cover exposed hose bibs.</li>
                    <li>If a pipe bursts: shut the main valve off first, then open a faucet to drain the pressure — before you call anyone.</li>
                    <li>Take photos of any water and keep every receipt — your insurer asks for both.</li>
                  </ol>
                </div>
              )}

              <div className="mx-auto mt-8 grid max-w-xl gap-4 text-left sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-3xl font-extrabold text-blue-950">
                    {result.band === "low" ? "0" : fmtGal(result.gallons)}
                    <span className="text-base font-bold text-slate-500"> gal</span>
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">
                    estimated water released — {result.gpm} gpm × 60 × {result.hoursUndetected} hrs undetected
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-3xl font-extrabold text-blue-950">
                    {fmtGal(result.gpm * 60)}
                    <span className="text-base font-bold text-slate-500"> gal/hr</span>
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">
                    release rate while it runs (planning assumption — see the method below)
                  </p>
                </div>
                <div className="rounded-2xl bg-amber-50 p-5">
                  <p className="text-3xl font-extrabold text-blue-950">
                    {result.band === "low" ? "$0" : `${fmtMoney(result.totalLow)}–${fmtMoney(result.totalHigh)}`}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">
                    estimated damage — {fmtGal(result.sqft)} sq ft in the {result.room.toLowerCase()} ({result.flooring.toLowerCase()})
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-3xl font-extrabold text-blue-950">
                    {result.band === "low" ? "$0" : `${fmtMoney(result.insurerLow)}–${fmtMoney(result.insurerHigh)}`}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">
                    estimated insurer share if covered — damage minus your {fmtMoney(result.deductible)} deductible
                  </p>
                </div>
              </div>

              <div className="mx-auto mt-6 max-w-xl rounded-2xl bg-slate-50 p-5 text-left">
                <p className="font-extrabold text-blue-950">How the damage $ is built — formula shown, nothing hidden</p>
                <div className="mt-3 space-y-1 text-sm font-semibold text-slate-600">
                  <p>
                    Mitigation (extraction + drying): {fmtGal(result.sqft)} sq ft ×{" "}
                    {fmtMoney(MITIGATION_BANDS[result.category].low)}–{fmtMoney(MITIGATION_BANDS[result.category].high)} ={" "}
                    {fmtMoney(result.mitLow)}–{fmtMoney(result.mitHigh)} (Category {result.category}, published band)
                  </p>
                  <p>
                    Rebuild / repair: {fmtGal(result.sqft)} sq ft × {fmtMoney(result.rebuildRate)} ={" "}
                    {fmtMoney(result.rebuild)}
                  </p>
                  <p>
                    Total: {fmtMoney(result.totalLow)}–{fmtMoney(result.totalHigh)} (estimate — not a quote)
                  </p>
                </div>
                <p className="mt-3 text-sm text-slate-600">{FLOORING_NOTES[result.flooring] ?? ""}</p>
              </div>

              <div className="mx-auto mt-6 max-w-xl overflow-x-auto rounded-2xl border border-slate-200 text-left">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600">
                      <th className="p-4 font-bold">Insurance bucket</th>
                      <th className="p-4 font-bold">Typically…</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="p-4 font-semibold">The burst pipe itself (repair / replacement)</td>
                      <td className="p-4">Usually NOT covered — the pipe repair is yours. Not included in the damage $ above.</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold">Tear-out / access (opening a wall or floor to reach the pipe)</td>
                      <td className="p-4">Often covered under a standard HO-3 / Texas HO-B policy.</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold">Water damage to your home (floors, walls, contents) from a sudden burst</td>
                      <td className="p-4">Often covered when the burst was sudden and accidental — {fmtMoney(result.insurerLow)}–{fmtMoney(result.insurerHigh)} above, after your deductible.</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold">Gradual leaks / seepage over days or weeks</td>
                      <td className="p-4">Usually NOT covered — most policies exclude seepage over 14 days.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mx-auto mt-3 max-w-xl text-left text-xs text-slate-500">
                Typical HO-3 / HO-B pattern — confirm with your insurer. This is not insurance advice, and no
                coverage is promised. The Texas Department of Insurance notes a policy might not pay if you
                did not protect pipes from freezing — keep photos and receipts showing you dripped taps and
                insulated exposed lines.
              </p>

              <a
                href={`tel:${PHONE_TEL}`}
                className="mt-8 inline-flex items-center gap-3 rounded-full bg-amber-500 px-8 py-4 text-lg font-extrabold text-blue-950 shadow-lg transition hover:bg-amber-400"
              >
                Call {PHONE_DISPLAY}
              </a>
              <p className="mt-3 text-sm text-slate-500">
                If a pipe already burst, shut off the main valve first — then call. Non-invasive detection pinpoints it.
              </p>
              <button onClick={reset} className="mt-6 text-sm font-bold text-blue-800 hover:underline">
                Estimate another night
              </button>
            </div>
          )}
        </div>
        <p className="mt-4 text-center text-xs text-blue-200">
          Estimates from your forecast and your numbers — guidance, not a guarantee, never a quote, and not insurance advice. Only on-site inspection can confirm a burst pipe or the real damage.
        </p>
      </div>
    </section>
  );
}
