"use client";

import { useEffect, useState } from "react";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/site";
import { FREEZE_TOWNS } from "@/lib/freeze-towns";

// Risk bands — MUST match scripts/fetch-freeze-risk.py band() exactly.
// Change both together; the thresholds are published on the tool page.
type Band = "low" | "watch" | "high";

function bandFor(lowF: number, freezeHours: number): Band {
  if (freezeHours === 0) return "low";
  if (lowF > 28 && freezeHours < 4) return "watch";
  return "high";
}

/**
 * Tonight's window, in America/Chicago wall time: 18:00 today -> 09:00
 * tomorrow (16 hourly readings). The Open-Meteo API returns local ISO
 * times ("2026-11-16T18:00") when a timezone is requested, so the
 * window is matched on the date + hour strings — no timezone-offset
 * math, and no DST edge cases.
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

interface RiskResult {
  place: string;
  lowF: number;
  freezeHours: number;
  hardFreezeHours: number;
  hardFreeze: boolean;
  band: Band;
  source: "nightly" | "live";
  generatedAt?: string;
  nightLabel: string;
}

const inputCls =
  "w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-lg font-bold text-blue-950 outline-none transition focus:border-blue-800";
const labelCls = "mb-1.5 block text-sm font-bold text-slate-600";

function assessHourly(times: string[], temps: Array<number | null>): Omit<RiskResult, "place" | "source" | "generatedAt" | "nightLabel"> {
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

/**
 * Freeze-Burst Risk Tonight — lead-gen tool #4.
 * Tonight's pipe freeze-burst risk for a Texas town: forecast low, hours
 * below freezing, and a Low / Watch / High band from published
 * thresholds. Prefers the nightly committed forecast
 * (/data/freeze-risk.json) when it is fresh for tonight; falls back to
 * a live Open-Meteo fetch. Guidance only — never a burst prediction.
 */
export default function FreezeRiskTonight({ town }: { town?: string }) {
  const defaultSlug = town && FREEZE_TOWNS.some((t) => t.slug === town) ? town : "katy";
  const [slug, setSlug] = useState(defaultSlug);
  const [zip, setZip] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [result, setResult] = useState<RiskResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadTown = async (townSlug: string) => {
    const t = FREEZE_TOWNS.find((x) => x.slug === townSlug);
    if (!t) return;
    // Computed here (event handler), never during render: Next.js blocks
    // `new Date()` reads while prerendering a Client Component.
    const label = nightLabelFor(new Date());
    setStatus("loading");
    setError(null);
    setResult(null);
    try {
      // 1) Prefer the nightly committed forecast when it is fresh.
      try {
        const res = await fetch("/data/freeze-risk.json", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          const entry = data?.towns?.[townSlug];
          if (data?.forecast_date === chicagoToday(new Date()) && entry) {
            setResult({
              place: `${entry.town}, TX`,
              lowF: entry.low_f,
              freezeHours: entry.freeze_hours,
              hardFreezeHours: entry.hard_freeze_hours,
              hardFreeze: entry.hard_freeze,
              band: entry.band,
              source: "nightly",
              generatedAt: data.generated_at_utc,
              nightLabel: label,
            });
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
      setResult({ place: `${t.town}, TX`, ...assessed, source: "live", nightLabel: label });
      setStatus("ready");
    } catch {
      setError("Could not load tonight's forecast right now. Check your connection and try again — or use the typical freeze-season table below, which needs no forecast.");
      setStatus("error");
    }
  };

  const loadZip = async () => {
    const z = zip.trim();
    if (!/^\d{5}$/.test(z)) {
      setError("Enter a 5-digit ZIP code — or pick a town from the list.");
      return;
    }
    // Same as loadTown: compute the label here, never during render.
    const label = nightLabelFor(new Date());
    setStatus("loading");
    setError(null);
    setResult(null);
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(z)}&count=5&language=en&format=json`
      );
      if (!res.ok) throw new Error("geocode failed");
      const data = await res.json();
      const cands = (data.results ?? []).filter((r: { country_code?: string }) => r.country_code === "US");
      const hit = cands.find((r: { admin1?: string }) => r.admin1 === "Texas") ?? cands[0];
      if (!hit) {
        setError(`No US place found for ZIP ${z}. Pick a town from the list instead.`);
        setStatus("error");
        return;
      }
      const hourly = await fetchForecast(hit.latitude, hit.longitude);
      const assessed = assessHourly(hourly.time, hourly.temperature_2m);
      const place = `${hit.name}, ${hit.admin1 === "Texas" ? "TX" : hit.admin1 ?? "US"}`;
      setResult({ place, ...assessed, source: "live", nightLabel: label });
      setStatus("ready");
    } catch {
      setError("Could not look up that ZIP right now. Pick a town from the list instead.");
      setStatus("error");
    }
  };

  useEffect(() => {
    loadTown(slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onTownChange = (value: string) => {
    setSlug(value);
    setZip("");
    loadTown(value);
  };

  const metros = [...new Set(FREEZE_TOWNS.map((t) => t.metro))];

  const bandCopy = {
    low: {
      badge: "Low risk — no freeze tonight",
      badgeClass: "bg-green-100 text-green-800",
      headline: "Tonight stays above freezing.",
      body: "No hours below 32°F are forecast, so water in pipes should stay liquid. No freeze precautions needed tonight — but it is still worth disconnecting garden hoses before winter, because one cold snap is all it takes.",
    },
    watch: {
      badge: "Watch — brief freeze tonight",
      badgeClass: "bg-amber-100 text-amber-800",
      headline: "A brief dip below freezing tonight.",
      body: "Tonight drops below 32°F for a short stretch. Indoor pipes are usually fine, but exposed pipes, hose bibs, and irrigation lines can freeze. Drip the taps on exterior walls and open the cabinet doors under those sinks tonight.",
    },
    high: {
      badge: "High risk — sustained freeze tonight",
      badgeClass: "bg-red-100 text-red-800",
      headline: "A sustained freeze tonight — act before bed.",
      body: "Tonight stays below freezing for hours, cold enough to freeze and burst pipes. Drip faucets on exterior walls, open cabinet doors, insulate exposed pipes and hose bibs, and know where your main water shutoff is before you go to sleep.",
    },
  }[result?.band ?? "low"];

  return (
    <section id="freeze-risk-tonight" className="scroll-mt-20 bg-blue-950" aria-label="Freeze-burst risk tonight">
      <div className="mx-auto max-w-3xl px-4 py-14">
        <div className="rounded-3xl border border-blue-800 bg-white p-6 shadow-xl md:p-10">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
            Free tool · no signup
          </p>
          <h2 className="mt-3 text-center text-3xl font-extrabold tracking-tight text-blue-950">
            Tonight&apos;s freeze risk
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-slate-600">
            Pick your town — or enter a ZIP — and see tonight&apos;s pipe
            freeze-burst risk: the forecast low, how long it stays below
            freezing, and what to do before bed.
          </p>

          <div className="mx-auto mt-8 grid max-w-xl gap-5">
            <div>
              <label className={labelCls} htmlFor="fr-town">Your town</label>
              <select
                id="fr-town"
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
            </div>

            <div>
              <label className={labelCls} htmlFor="fr-zip">
                Or enter your ZIP code
              </label>
              <div className="flex gap-3">
                <input
                  id="fr-zip"
                  inputMode="numeric"
                  className={inputCls}
                  placeholder="e.g. 77494"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") loadZip();
                  }}
                />
                <button
                  onClick={loadZip}
                  className="shrink-0 rounded-full bg-blue-800 px-6 py-3 text-base font-extrabold text-white transition hover:bg-blue-700"
                >
                  Check ZIP
                </button>
              </div>
              <p className="mt-1.5 text-xs text-slate-400">
                ZIP lookup uses the free Open-Meteo geocoder — it shows the place it found, so you can see if it matched.
              </p>
            </div>
          </div>

          {status === "loading" && (
            <p className="mt-8 text-center font-bold text-slate-500">Checking tonight&apos;s forecast…</p>
          )}

          {error && (
            <p className="mx-auto mt-8 max-w-xl rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>
          )}

          {status === "ready" && result && (
            <div className="mt-8 text-center">
              <span className={`inline-block rounded-full px-4 py-1.5 text-sm font-extrabold ${bandCopy.badgeClass}`}>
                {bandCopy.badge}
              </span>
              <h3 className="mt-4 text-2xl font-extrabold text-blue-950">{bandCopy.headline}</h3>
              <p className="mx-auto mt-3 max-w-xl text-slate-600">{bandCopy.body}</p>

              <div className="mx-auto mt-8 grid max-w-xl gap-4 text-left sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-3xl font-extrabold text-blue-950">
                    {Math.round(result.lowF)}
                    <span className="text-base font-bold text-slate-500">°F</span>
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">tonight&apos;s low in {result.place}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-3xl font-extrabold text-blue-950">
                    {result.freezeHours}
                    <span className="text-base font-bold text-slate-500"> hrs</span>
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">below 32°F tonight (6pm–9am)</p>
                </div>
                <div className="rounded-2xl bg-amber-50 p-5">
                  <p className="text-3xl font-extrabold text-blue-950">
                    {result.hardFreezeHours}
                    <span className="text-base font-bold text-slate-500"> hrs</span>
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">
                    at or below 20°F {result.hardFreeze ? "— hard freeze" : "(none tonight)"}
                  </p>
                </div>
              </div>

              {result.band !== "low" && (
                <div className="mx-auto mt-6 max-w-xl rounded-2xl bg-blue-50 p-5 text-left">
                  <p className="font-extrabold text-blue-950">What to do tonight — before bed</p>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
                    <li>Let cold-water taps on exterior walls drip slowly — moving water is much harder to freeze.</li>
                    <li>Open cabinet doors under sinks on exterior walls so warm room air reaches the pipes.</li>
                    <li>Disconnect garden hoses; insulate exposed pipes and hose bibs with foam covers or towels.</li>
                    <li>Know where your main water shutoff is — if a pipe bursts, shutting it off first limits the damage.</li>
                    <li>If you have irrigation or a pool, drain or shut off exposed lines where you can.</li>
                  </ul>
                </div>
              )}

              <p className="mx-auto mt-6 max-w-xl text-xs text-slate-500">
                Night of {result.nightLabel} · Forecast: Open-Meteo
                {result.source === "nightly"
                  ? ` · nightly forecast file, generated ${result.generatedAt ?? "today"} (UTC)`
                  : " · live forecast, fetched just now"}
                . Guidance, not a guarantee — a forecast is not a measurement, and pipe location and insulation change the outcome.
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
              <button
                onClick={() => loadTown(slug)}
                className="mt-6 text-sm font-bold text-blue-800 hover:underline"
              >
                Refresh tonight&apos;s forecast
              </button>
            </div>
          )}
        </div>
        <p className="mt-4 text-center text-xs text-blue-200">
          Estimates from tonight&apos;s forecast — guidance, not a guarantee, and never a burst prediction. Only on-site inspection can confirm a frozen or burst pipe.
        </p>
      </div>
    </section>
  );
}
