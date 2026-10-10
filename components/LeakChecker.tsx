"use client";

import { useState } from "react";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/site";

interface Symptom {
  id: string;
  label: string;
  points: number;
  type: string;
}

const SYMPTOMS: Symptom[] = [
  { id: "bill", label: "Water bill suddenly higher", points: 3, type: "a hidden supply leak" },
  { id: "sound", label: "Hear running water when everything is off", points: 3, type: "a slab or underground leak" },
  { id: "spots", label: "Damp, warm, or discolored spots on floors or walls", points: 3, type: "a slab leak" },
  { id: "pool", label: "Pool losing water faster than evaporation", points: 3, type: "a pool leak" },
  { id: "pressure", label: "Noticeable drop in water pressure", points: 2, type: "a supply line leak" },
  { id: "yard", label: "Soggy patch or extra-green grass in the yard", points: 2, type: "a yard line leak" },
  { id: "mold", label: "Musty smell or mold appearing", points: 2, type: "a hidden leak" },
  { id: "cracks", label: "New cracks in walls, floor, or foundation", points: 2, type: "a slab leak aggravated by soil movement" },
  { id: "heater", label: "Water heater leaking or showing error codes", points: 2, type: "a water heater leak" },
];

const LOCATIONS = [
  "Under the house / floors",
  "In the yard",
  "Near the water heater",
  "Pool / spa area",
  "Not sure",
];

const DURATIONS = [
  { label: "Just noticed it", points: 0 },
  { label: "A few days", points: 1 },
  { label: "A few weeks", points: 2 },
  { label: "Months", points: 3 },
];

function PhoneIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="h-4 w-4" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

/**
 * Interactive 60-second leak check — a lead-gen screening tool.
 * Asks symptoms -> location -> duration, scores risk, ends in a call CTA.
 * Honest by design: it's a screening aid, never a diagnosis.
 */
export default function LeakChecker({ town }: { town: string }) {
  const [step, setStep] = useState(0);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [location, setLocation] = useState<string | null>(null);
  const [duration, setDuration] = useState<string | null>(null);

  const toggleSymptom = (id: string) =>
    setSymptoms((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const score = () => {
    const sPts = SYMPTOMS.filter((s) => symptoms.includes(s.id)).reduce((a, s) => a + s.points, 0);
    const dPts = DURATIONS.find((d) => d.label === duration)?.points ?? 0;
    return sPts + dPts;
  };

  const likelyType = () => {
    const picked = SYMPTOMS.filter((s) => symptoms.includes(s.id)).sort((a, b) => b.points - a.points)[0];
    return picked ? picked.type : "a leak worth investigating";
  };

  const band = () => {
    const sc = score();
    if (sc >= 6) return "high";
    if (sc >= 3) return "medium";
    return "low";
  };

  const reset = () => {
    setStep(0);
    setSymptoms([]);
    setLocation(null);
    setDuration(null);
  };

  const btnPrimary =
    "inline-flex items-center justify-center gap-2 rounded-full bg-blue-800 px-7 py-3 font-extrabold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40";
  const btnGhost =
    "inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-3 font-bold text-slate-600 transition hover:border-slate-400";

  return (
    <section id="leak-check" className="scroll-mt-20 bg-white" aria-label="Interactive leak check">
      <div className="mx-auto max-w-3xl px-4 py-14">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm md:p-10">
          {step === 0 && (
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">Free 60-second check</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-blue-950">
                Think you have a leak{town ? ` in ${town}` : ""}?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-slate-600">
                Answer 3 quick questions. We'll tell you how urgent it looks,
                what it might be — and what to do next. No signup, no spam.
              </p>
              <button onClick={() => setStep(1)} className={`${btnPrimary} mt-8`}>
                Start the leak check
              </button>
            </div>
          )}

          {step >= 1 && step <= 3 && (
            <div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-500">Step {step} of 3</p>
                <div className="flex gap-1.5" aria-hidden="true">
                  {[1, 2, 3].map((i) => (
                    <span key={i} className={`h-2 w-8 rounded-full ${i <= step ? "bg-amber-500" : "bg-slate-200"}`} />
                  ))}
                </div>
              </div>

              {step === 1 && (
                <div className="mt-6">
                  <h3 className="text-xl font-extrabold text-blue-950">What symptoms have you noticed?</h3>
                  <p className="mt-1 text-sm text-slate-500">Select all that apply.</p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {SYMPTOMS.map((s) => {
                      const on = symptoms.includes(s.id);
                      return (
                        <button
                          key={s.id}
                          onClick={() => toggleSymptom(s.id)}
                          aria-pressed={on}
                          className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left text-sm font-semibold transition ${
                            on
                              ? "border-blue-800 bg-blue-50 text-blue-950"
                              : "border-slate-200 bg-white text-slate-700 hover:border-blue-300"
                          }`}
                        >
                          <span
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${
                              on ? "bg-blue-800 text-white" : "bg-slate-200 text-transparent"
                            }`}
                          >
                            <CheckIcon />
                          </span>
                          {s.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="mt-6">
                  <h3 className="text-xl font-extrabold text-blue-950">Where is it happening?</h3>
                  <div className="mt-5 grid gap-3">
                    {LOCATIONS.map((l) => (
                      <button
                        key={l}
                        onClick={() => setLocation(l)}
                        aria-pressed={location === l}
                        className={`rounded-xl border-2 p-4 text-left text-sm font-semibold transition ${
                          location === l
                            ? "border-blue-800 bg-blue-50 text-blue-950"
                            : "border-slate-200 bg-white text-slate-700 hover:border-blue-300"
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="mt-6">
                  <h3 className="text-xl font-extrabold text-blue-950">How long has this been going on?</h3>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {DURATIONS.map((d) => (
                      <button
                        key={d.label}
                        onClick={() => setDuration(d.label)}
                        aria-pressed={duration === d.label}
                        className={`rounded-xl border-2 p-4 text-left text-sm font-semibold transition ${
                          duration === d.label
                            ? "border-blue-800 bg-blue-50 text-blue-950"
                            : "border-slate-200 bg-white text-slate-700 hover:border-blue-300"
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8 flex items-center justify-between">
                <button onClick={() => setStep(step - 1)} className={btnGhost}>
                  ← Back
                </button>
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={
                    (step === 1 && symptoms.length === 0) ||
                    (step === 2 && !location) ||
                    (step === 3 && !duration)
                  }
                  className={btnPrimary}
                >
                  {step === 3 ? "See my result" : "Continue →"}
                </button>
              </div>
            </div>
          )}

          {step === 4 && <Result band={band()} likelyType={likelyType()} town={town} onReset={reset} />}
        </div>
        <p className="mt-4 text-center text-xs text-slate-400">
          Screening aid only — not a diagnosis. Only on-site detection equipment can confirm a leak.
        </p>
      </div>
    </section>
  );
}

function Result({
  band,
  likelyType,
  town,
  onReset,
}: {
  band: "high" | "medium" | "low";
  likelyType: string;
  town: string;
  onReset: () => void;
}) {
  const config = {
    high: {
      badge: "High likelihood",
      badgeClass: "bg-red-100 text-red-800",
      barClass: "bg-red-500",
      fill: 90,
      headline: "Your answers point to an active leak.",
      body: `The pattern matches ${likelyType}. Water damage gets more expensive every day — a small leak left for months can turn into foundation or mold remediation. Don't wait on this one.`,
      cta: `Call ${PHONE_DISPLAY}`,
      ctaSub: "Most leaks are pinpointed in a single non-invasive visit.",
    },
    medium: {
      badge: "Worth checking",
      badgeClass: "bg-amber-100 text-amber-800",
      barClass: "bg-amber-500",
      fill: 55,
      headline: "Some real warning signs here.",
      body: `Could be ${likelyType}. Before you call anyone, do the 2-hour meter test — it takes one look at your water meter to confirm.`,
      cta: "Call for advice",
      ctaSub: "Describe your symptoms — we'll tell you honestly if you need detection.",
    },
    low: {
      badge: "Low risk",
      badgeClass: "bg-green-100 text-green-800",
      barClass: "bg-green-500",
      fill: 20,
      headline: "No strong leak signals right now.",
      body: "Nothing here screams leak. Keep an eye on your water bill — a sudden jump is the earliest warning most homeowners get.",
      cta: "Questions? Call us",
      ctaSub: "Free advice — no pressure, no upsell.",
    },
  }[band];

  return (
    <div className="text-center">
      <span className={`inline-block rounded-full px-4 py-1.5 text-sm font-extrabold ${config.badgeClass}`}>
        {config.badge}
      </span>
      <h3 className="mt-4 text-2xl font-extrabold text-blue-950">{config.headline}</h3>
      <div className="mx-auto mt-4 h-3 max-w-md overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full rounded-full ${config.barClass}`} style={{ width: `${config.fill}%` }} />
      </div>
      <p className="mx-auto mt-5 max-w-xl text-slate-600">{config.body}</p>

      {band === "medium" && (
        <div className="mx-auto mt-6 max-w-xl rounded-2xl bg-white p-6 text-left shadow-sm">
          <p className="font-extrabold text-blue-950">The 2-hour meter test</p>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-600">
            <li>Turn off all water — taps, appliances, sprinklers.</li>
            <li>Find your water meter and note the reading (including the small dial).</li>
            <li>Use no water for 2 hours.</li>
            <li>Check again — if the reading moved, water is escaping: you have a leak.</li>
          </ol>
        </div>
      )}

      {band === "low" && (
        <div className="mx-auto mt-6 max-w-xl rounded-2xl bg-white p-6 text-left shadow-sm">
          <p className="font-extrabold text-blue-950">Early signs to watch for{town ? ` in ${town}` : ""}</p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
            <li>A water bill that jumps without explanation</li>
            <li>The sound of running water when everything is off</li>
            <li>Warm or damp spots on floors</li>
            <li>A drop in water pressure</li>
          </ul>
        </div>
      )}

      <a
        href={`tel:${PHONE_TEL}`}
        className="mt-8 inline-flex items-center gap-3 rounded-full bg-amber-500 px-8 py-4 text-lg font-extrabold text-blue-950 shadow-lg transition hover:bg-amber-400"
      >
        <PhoneIcon />
        {config.cta === `Call ${PHONE_DISPLAY}` ? config.cta : `${config.cta} — ${PHONE_DISPLAY}`}
      </a>
      <p className="mt-3 text-sm text-slate-500">{config.ctaSub}</p>
      <button onClick={onReset} className="mt-6 text-sm font-bold text-blue-800 hover:underline">
        Retake the check
      </button>
    </div>
  );
}
