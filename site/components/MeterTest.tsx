"use client";

import { useEffect, useRef, useState } from "react";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/site";

const GAL_PER_CUBIC_FT = 7.48052;
// EPA WaterSense: a faucet dripping once per second wastes ~3,000 gal/year
// => 3000 / 365 / 24 = 0.342 gal/hr per drip/sec
const GAL_PER_HR_PER_DRIP = 0.342;

function PhoneIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  );
}

function ClockIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M12 7v5l3 2" />
    </svg>
  );
}

interface Result {
  usedGal: number;
  galPerHour: number;
  galPerYear: number;
  costPerYear: number;
  dripsPerSec: number;
  band: "none" | "small" | "big";
}

const inputCls =
  "w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-lg font-bold text-blue-950 outline-none transition focus:border-blue-800";
const labelCls = "mb-1.5 block text-sm font-bold text-slate-600";

/**
 * Overnight meter-test calculator — lead-gen tool #2.
 * User enters evening + morning meter readings; the tool computes how much
 * water escaped overnight, the yearly waste + cost, and runs a live "leak
 * cost clock". Screening aid only — never a diagnosis.
 */
export default function MeterTest({ town }: { town: string }) {
  const [evening, setEvening] = useState("");
  const [morning, setMorning] = useState("");
  const [unit, setUnit] = useState<"gal" | "ft3">("gal");
  const [hours, setHours] = useState("8");
  const [rate, setRate] = useState("8");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [clock, setClock] = useState(0);
  const clockRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (clockRef.current) window.clearInterval(clockRef.current);
    };
  }, []);

  const calculate = () => {
    setError(null);
    const e = parseFloat(evening);
    const m = parseFloat(morning);
    const h = parseFloat(hours);
    const r = parseFloat(rate);
    if ([e, m, h, r].some((x) => isNaN(x))) {
      setError("Please fill in all four numbers.");
      return;
    }
    if (h <= 0 || h > 24) {
      setError("Hours between readings should be between 1 and 24.");
      return;
    }
    if (m < e) {
      setError("The morning reading should be higher than the evening reading — double-check the numbers (or your meter rolled over).");
      return;
    }
    const mult = unit === "ft3" ? GAL_PER_CUBIC_FT : 1;
    const usedGal = (m - e) * mult;
    const galPerHour = usedGal / h;
    const galPerYear = galPerHour * 24 * 365;
    const costPerYear = (galPerYear / 1000) * r;
    const band = usedGal <= 0.5 ? "none" : usedGal <= 5 ? "small" : "big";
    setResult({
      usedGal,
      galPerHour,
      galPerYear,
      costPerYear,
      dripsPerSec: galPerHour / GAL_PER_HR_PER_DRIP,
      band,
    });
    // (re)start the live cost clock
    if (clockRef.current) window.clearInterval(clockRef.current);
    setClock(0);
    const perSec = costPerYear / (365 * 24 * 3600);
    const t0 = Date.now();
    clockRef.current = window.setInterval(() => {
      setClock(perSec * ((Date.now() - t0) / 1000));
    }, 250);
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setClock(0);
    if (clockRef.current) window.clearInterval(clockRef.current);
  };

  const bandCopy = {
    none: {
      badge: "No leak detected",
      badgeClass: "bg-green-100 text-green-800",
      headline: "Your meter didn't move overnight.",
      body: "That's the result you want. No water escaped while everything was off — no hidden leak in your supply lines right now.",
    },
    small: {
      badge: "Small leak",
      badgeClass: "bg-amber-100 text-amber-800",
      headline: "Something is dripping somewhere.",
      body: "A small but real leak — often a toilet flapper, a dripping faucet, or a pinhole in a supply line. Small leaks become big bills: see what yours costs per year below.",
    },
    big: {
      badge: "Significant leak",
      badgeClass: "bg-red-100 text-red-800",
      headline: "That's a lot of water overnight.",
      body: `This pace points to an active leak${town ? ` in your ${town} home` : ""} — a running toilet, a slab leak, or a broken yard line. Every day it runs, the damage and the bill grow.`,
    },
  }[result?.band ?? "none"];

  return (
    <section id="meter-test" className="scroll-mt-20 bg-blue-950" aria-label="Overnight meter test calculator">
      <div className="mx-auto max-w-3xl px-4 py-14">
        <div className="rounded-3xl border border-blue-800 bg-white p-6 shadow-xl md:p-10">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
            Free tool · no signup
          </p>
          <h2 className="mt-3 text-center text-3xl font-extrabold tracking-tight text-blue-950">
            The overnight meter test
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-slate-600">
            The simplest leak test there is: read your water meter before bed
            and again in the morning. Enter both readings — we'll do the math.
          </p>

          {!result ? (
            <div className="mt-8">
              <ol className="mx-auto grid max-w-xl gap-3 text-sm text-slate-600 md:grid-cols-3">
                {[
                  "Before bed: turn off all water, note the meter reading.",
                  "Sleep. Use no water overnight.",
                  "Morning: read the meter again — enter both below.",
                ].map((s, i) => (
                  <li key={i} className="rounded-xl bg-slate-50 p-4">
                    <span className="font-extrabold text-blue-800">{i + 1}.</span> {s}
                  </li>
                ))}
              </ol>

              <div className="mx-auto mt-8 grid max-w-xl gap-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls} htmlFor="mt-evening">Evening reading</label>
                    <input id="mt-evening" inputMode="decimal" className={inputCls} placeholder="e.g. 1234"
                      value={evening} onChange={(e) => setEvening(e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="mt-morning">Morning reading</label>
                    <input id="mt-morning" inputMode="decimal" className={inputCls} placeholder="e.g. 1241"
                      value={morning} onChange={(e) => setMorning(e.target.value)} />
                  </div>
                </div>

                <div>
                  <span className={labelCls}>Meter units</span>
                  <div className="grid grid-cols-2 gap-3">
                    {(["gal", "ft3"] as const).map((u) => (
                      <button key={u} onClick={() => setUnit(u)} aria-pressed={unit === u}
                        className={`rounded-xl border-2 p-3 text-sm font-bold transition ${
                          unit === u
                            ? "border-blue-800 bg-blue-50 text-blue-950"
                            : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                        }`}>
                        {u === "gal" ? "Gallons" : "Cubic feet"}
                      </button>
                    ))}
                  </div>
                  <p className="mt-1.5 text-xs text-slate-400">Check your meter face or water bill — US meters use one of these.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls} htmlFor="mt-hours">Hours between readings</label>
                    <input id="mt-hours" inputMode="decimal" className={inputCls}
                      value={hours} onChange={(e) => setHours(e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="mt-rate">Your cost per 1,000 gal ($)</label>
                    <input id="mt-rate" inputMode="decimal" className={inputCls}
                      value={rate} onChange={(e) => setRate(e.target.value)} />
                  </div>
                </div>
                <p className="-mt-2 text-xs text-slate-400">US average is roughly $8 per 1,000 gallons (water + sewer) — adjust to match your bill.</p>

                {error && (
                  <p className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>
                )}

                <button
                  onClick={calculate}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-800 px-7 py-4 text-lg font-extrabold text-white transition hover:bg-blue-700"
                >
                  <ClockIcon /> Calculate my leak
                </button>
              </div>
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
                    {result.usedGal < 10 ? result.usedGal.toFixed(1) : Math.round(result.usedGal).toLocaleString()}
                    <span className="text-base font-bold text-slate-500"> gal</span>
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">lost overnight</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-3xl font-extrabold text-blue-950">
                    {result.galPerHour < 10 ? result.galPerHour.toFixed(2) : Math.round(result.galPerHour).toLocaleString()}
                    <span className="text-base font-bold text-slate-500"> gal/hr</span>
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">
                    ≈ {result.dripsPerSec < 10 ? result.dripsPerSec.toFixed(1) : Math.round(result.dripsPerSec)} drips/second
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-3xl font-extrabold text-blue-950">
                    {Math.round(result.galPerYear).toLocaleString()}
                    <span className="text-base font-bold text-slate-500"> gal</span>
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">wasted per year at this pace</p>
                </div>
                <div className="rounded-2xl bg-amber-50 p-5">
                  <p className="text-3xl font-extrabold text-blue-950">
                    ${Math.round(result.costPerYear).toLocaleString()}
                    <span className="text-base font-bold text-slate-500"> /yr</span>
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">estimated yearly cost</p>
                </div>
              </div>

              {result.band !== "none" && (
                <div className="mx-auto mt-6 max-w-xl rounded-2xl bg-blue-950 p-6 text-white">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">Live leak cost clock</p>
                  <p className="mt-2 text-4xl font-extrabold tabular-nums text-amber-400">
                    ${clock.toFixed(2)}
                  </p>
                  <p className="mt-2 text-sm text-blue-100">
                    …burned since you opened this result. It never stops until the leak is fixed.
                  </p>
                </div>
              )}

              <a
                href={`tel:${PHONE_TEL}`}
                className="mt-8 inline-flex items-center gap-3 rounded-full bg-amber-500 px-8 py-4 text-lg font-extrabold text-blue-950 shadow-lg transition hover:bg-amber-400"
              >
                <PhoneIcon /> Call {PHONE_DISPLAY}
              </a>
              <p className="mt-3 text-sm text-slate-500">
                {result.band === "none"
                  ? "No leak today — but save this page. The meter test is worth repeating twice a year."
                  : "Non-invasive detection pinpoints it — usually in a single visit."}
              </p>
              <button onClick={reset} className="mt-6 text-sm font-bold text-blue-800 hover:underline">
                Test again
              </button>
            </div>
          )}
        </div>
        <p className="mt-4 text-center text-xs text-blue-200">
          Screening aid only — estimates from your readings, not a diagnosis. Only on-site detection can confirm a leak.
        </p>
      </div>
    </section>
  );
}
