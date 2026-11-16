"use client";

import { useState } from "react";
import Link from "next/link";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/site";
import { FREEZE_TOWNS } from "@/lib/freeze-towns";
import { UTILITY_RULES } from "@/lib/utility-rules";

const inputCls =
  "w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-lg font-bold text-blue-950 outline-none transition focus:border-blue-800";
const labelCls = "mb-1.5 block text-sm font-bold text-slate-600";

const TCEQ_FIND_PROVIDER_URL =
  "https://www.tceq.texas.gov/drinkingwater/whatsmysource.html";

type LocationKey =
  | "street"
  | "yard-before-meter"
  | "at-meter"
  | "under-slab"
  | "inside-house"
  | "sewer-lateral"
  | "common-area";

type SymptomKey = "pooling" | "bill-spike" | "low-pressure" | "soggy-strip";

type Side = "city" | "homeowner" | "hoa";

interface Outcome {
  party: string;
  side: Side;
  badge: string;
  badgeClass: string;
  headline: string;
  body: string;
  callSteps: string[];
  dig811: boolean;
  digNote: string;
  script: string;
  serviceHref: string | null;
  serviceLabel: string | null;
}

const LOCATIONS: Array<{ value: LocationKey; label: string }> = [
  { value: "street", label: "In the street / sidewalk — before the meter" },
  { value: "yard-before-meter", label: "In the yard, between the street and the meter" },
  { value: "at-meter", label: "At the meter box / the meter itself" },
  { value: "under-slab", label: "Under the slab / foundation" },
  { value: "inside-house", label: "Inside the house — wall, ceiling or fixture" },
  { value: "sewer-lateral", label: "Sewer line — house to the city main" },
  { value: "common-area", label: "HOA common area — shared lawn, greenbelt or drive" },
];

const SYMPTOMS: Array<{ value: SymptomKey; label: string }> = [
  { value: "pooling", label: "Water pooling on the surface" },
  { value: "bill-spike", label: "Water bill suddenly much higher" },
  { value: "low-pressure", label: "Low water pressure through the house" },
  { value: "soggy-strip", label: "Soggy strip or unusually green line in the lawn" },
];

const SYMPTOM_NOTES: Record<SymptomKey, string> = {
  pooling:
    "Standing water means the leak is active right now — report it today, and note exactly where the water is coming from before you call.",
  "bill-spike":
    "A bill spike with no visible water points to a hidden leak. Run the overnight meter test: if the meter moves with everything off, water is escaping.",
  "low-pressure":
    "Low pressure across the whole house can mean a break in the supply line. If only one tap is weak, it is usually a fixture problem, not a line leak.",
  "soggy-strip":
    "A soggy strip that follows a straight line usually follows the buried pipe. Note where the wet ground starts and ends before you call — it helps whoever comes out.",
};

// The responsibility rules are the standard Texas pattern, stated as
// general guidance — never as a per-town legal fact. The utility or
// MUD's own rules decide; the result says so.
const OUTCOMES: Record<LocationKey, Outcome> = {
  street: {
    party: "Your water utility or MUD",
    side: "city",
    badge: "City / utility side — call them first",
    badgeClass: "bg-green-100 text-green-800",
    headline: "This one is most likely the city's — call them first, not us.",
    body: "A leak in the street is on the public side of the meter, and the water line there belongs to your utility or MUD. They fix it at their cost, and they send their own crew — a plumber cannot repair the city's line, and you should not pay for a visit you do not need.",
    callSteps: [
      "Your water utility or MUD — report it as a possible main or service-line leak in the street.",
      "A plumber only if the utility says the leak is past your meter.",
    ],
    dig811: false,
    digNote: "No — do not dig in the street. The utility sends its own crew with its own locates.",
    script:
      "“There's water pooling in the street outside [your address]. Can you check whether it's your main or a service line?”",
    serviceHref: null,
    serviceLabel: null,
  },
  "yard-before-meter": {
    party: "Your water utility or MUD",
    side: "city",
    badge: "City / utility side — call them first",
    badgeClass: "bg-green-100 text-green-800",
    headline: "This one is most likely the city's — call them first, not us.",
    body: "The utility owns the line up to the meter, so a leak in the yard between the street and the meter is normally theirs to fix. The meter itself is the dividing line: if the utility checks and the leak is past the meter, it becomes yours — but let them confirm that first.",
    callSteps: [
      "Your water utility or MUD — report a possible leak on their side of the meter.",
      "A plumber only if the utility says the leak is past your meter.",
    ],
    dig811: true,
    digNote: "Yes — call 811 before any digging, so underground lines can be marked. The utility's own crew handles its side.",
    script:
      "“There's a soggy patch in my yard between the street and the meter at [your address]. Can you check whether the leak is on your side of the meter?”",
    serviceHref: null,
    serviceLabel: null,
  },
  "at-meter": {
    party: "Your water utility or MUD",
    side: "city",
    badge: "City / utility side — call them first",
    badgeClass: "bg-green-100 text-green-800",
    headline: "This one is most likely the city's — call them first, not us.",
    body: "The meter itself belongs to your utility, so water pooling at the meter box is normally theirs to check. Do not open or adjust the meter yourself — report it, and let the utility confirm whether the leak is at the meter or in the line just past it.",
    callSteps: [
      "Your water utility or MUD — report water at the meter box and ask them to check the meter and its connections.",
      "A plumber only if the utility says the leak is past the meter.",
    ],
    dig811: false,
    digNote: "No — do not dig around the meter box. The utility checks the meter itself.",
    script:
      "“Water is pooling at the meter box at [your address]. Can you check the meter and its connections?”",
    serviceHref: null,
    serviceLabel: null,
  },
  "under-slab": {
    party: "You, the homeowner",
    side: "homeowner",
    badge: "Homeowner side",
    badgeClass: "bg-amber-100 text-amber-800",
    headline: "This one is most likely yours — the homeowner's side.",
    body: "Everything from the meter into the house is the homeowner's, and that includes the lines under the slab. A leak there is yours to find and fix — but find it first: non-invasive detection pinpoints the leak so nobody has to cut concrete to go looking for it.",
    callSteps: [
      "A leak-detection visit to pinpoint the leak without digging.",
      "A plumber for the repair, once the location is known.",
    ],
    dig811: true,
    digNote: "Yes — call 811 before any digging or cutting, so underground lines can be marked.",
    script:
      "“There's a warm spot and damp flooring over the slab at [your address]. Can you pinpoint the leak before anyone digs?”",
    serviceHref: "/services/slab-leak-detection/",
    serviceLabel: "Slab leak detection",
  },
  "inside-house": {
    party: "You, the homeowner",
    side: "homeowner",
    badge: "Homeowner side",
    badgeClass: "bg-amber-100 text-amber-800",
    headline: "This one is most likely yours — the homeowner's side.",
    body: "Pipes inside the house — in walls, ceilings and fixtures — are the homeowner's from the meter in. A leak there is yours to fix, and the first job is to stop the water: shut off the fixture valve, or the main valve where the line enters the house, before you call anyone.",
    callSteps: [
      "Shut off the water first — the fixture valve, or the main valve where the line enters the house.",
      "A plumber to find and repair the leak; a detection visit if the leak's location is not obvious.",
    ],
    dig811: false,
    digNote: "No — this is inside the house, so no digging is involved and 811 does not apply.",
    script:
      "“Water is coming through a wall at [your address]. I've shut off the water — can you find and fix the leak?”",
    serviceHref: null,
    serviceLabel: null,
  },
  "sewer-lateral": {
    party: "You, the homeowner",
    side: "homeowner",
    badge: "Homeowner side — verify per city",
    badgeClass: "bg-amber-100 text-amber-800",
    headline: "This one is most likely yours — the homeowner's side.",
    body: "The usual Texas pattern is that the homeowner owns the sewer lateral — the line from the house to the city main — and the city owns the main itself. That split is set by each city, so confirm it with your city before you pay for a repair; the rule can vary.",
    callSteps: [
      "A sewer camera inspection to find where the lateral is broken or blocked.",
      "A plumber for the repair, once the camera shows the location and the cause.",
    ],
    dig811: true,
    digNote: "Yes — call 811 before any digging, so underground lines can be marked.",
    script:
      "“I have sewage smells and a wet patch over the sewer line at [your address]. Can you camera the lateral to the city main?”",
    serviceHref: "/services/sewer-line-leak-detection/",
    serviceLabel: "Sewer line leak detection",
  },
  "common-area": {
    party: "Your HOA",
    side: "hoa",
    badge: "HOA side — call the HOA first",
    badgeClass: "bg-blue-100 text-blue-800",
    headline: "This one is most likely the HOA's — call them first.",
    body: "Pipes and landscaping in HOA common areas — shared lawns, greenbelts and drives — are normally the HOA's responsibility, not any single homeowner's. Report it to the HOA or property manager; they arrange the repair, and you should not hire a plumber for shared ground on your own.",
    callSteps: [
      "Your HOA or property manager — report the leak in the common area and ask them to send someone.",
      "A detection visit only if the HOA asks you to arrange it.",
    ],
    dig811: true,
    digNote: "Yes — before any digging in a common area, call 811 so underground lines can be marked. The HOA's contractor normally makes that call.",
    script:
      "“There's water pooling in the HOA common area near [your address]. Can you send someone to check it?”",
    serviceHref: null,
    serviceLabel: null,
  },
};

interface Result {
  townLabel: string;
  outcome: Outcome;
  symptom: SymptomKey;
  utilityName: string | null;
  utilitySourceUrl: string | null;
  utilityCheckedDate: string | null;
  utilityCaveat: string | null;
}

// Address-level coverage caveats, from the notes in lib/utility-rules.ts:
// these two providers serve part of the town, not the whole town.
const UTILITY_CAVEATS: Record<string, string> = {
  cypress:
    "Harris County MUD 71 serves parts of the Cypress / Katy area — confirm by address that it serves your street.",
  "round-rock":
    "Brushy Creek MUD serves the Brushy Creek community in the Round Rock area — confirm by address that it serves your street.",
};

/**
 * "Who Pays?" Responsibility Finder — lead-gen tool #7.
 * Town + problem location + what you see → who is responsible
 * (city / MUD / homeowner / HOA), who to call first and in what order,
 * whether to call 811 before digging, and a one-line call script.
 *
 * The serving utility is named ONLY when lib/utility-rules.ts verifies
 * that town is served by that utility (8 of our 100 towns). Every other
 * town shows "not verified — check your bill". Anchor-city rules
 * (Houston, Dallas, SAWS, Austin, Fort Worth) have no town slugs in
 * that file, so they are never shown to a suburb homeowner.
 * General guidance only — never a per-town legal fact.
 */
export default function WhoPaysFinder({ town }: { town?: string }) {
  const defaultSlug =
    town && FREEZE_TOWNS.some((t) => t.slug === town) ? town : "katy";
  const [slug, setSlug] = useState(defaultSlug);
  const [zip, setZip] = useState("");
  const [location, setLocation] = useState<LocationKey>("yard-before-meter");
  const [symptom, setSymptom] = useState<SymptomKey>("soggy-strip");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const buildResult = (townSlug: string | null, townLabel: string): Result => {
    const rule = townSlug
      ? UTILITY_RULES.find((r) => r.townSlugs.includes(townSlug))
      : undefined;
    return {
      townLabel,
      outcome: OUTCOMES[location],
      symptom,
      utilityName: rule ? rule.utility : null,
      utilitySourceUrl: rule ? rule.sourceUrl : null,
      utilityCheckedDate: rule ? rule.checkedDate : null,
      utilityCaveat:
        townSlug && UTILITY_CAVEATS[townSlug] ? UTILITY_CAVEATS[townSlug] : null,
    };
  };

  const calculate = () => {
    setError(null);
    const t = FREEZE_TOWNS.find((x) => x.slug === slug);
    if (!t) {
      setError("Pick a town from the list — or enter a ZIP code below.");
      return;
    }
    setResult(buildResult(t.slug, `${t.town}, TX`));
  };

  const checkZip = async () => {
    const z = zip.trim();
    if (!/^\d{5}$/.test(z)) {
      setError("Enter a 5-digit ZIP code — or pick a town from the list.");
      return;
    }
    setError(null);
    setResult(null);
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(z)}&count=5&language=en&format=json`
      );
      if (!res.ok) throw new Error("geocode failed");
      const data = await res.json();
      const cands = (data.results ?? []).filter(
        (r: { country_code?: string }) => r.country_code === "US"
      );
      const hit = cands.find((r: { admin1?: string }) => r.admin1 === "Texas") ?? cands[0];
      if (!hit) {
        setError(`No US place found for ZIP ${z}. Pick a town from the list instead.`);
        return;
      }
      const placeName: string = hit.name ?? "";
      const matched = FREEZE_TOWNS.find(
        (t) => t.town.toLowerCase() === placeName.toLowerCase()
      );
      if (matched) {
        setSlug(matched.slug);
        setResult(
          buildResult(matched.slug, `${matched.town}, TX`)
        );
      } else {
        // ZIP outside our 100 towns: the responsibility rules still
        // apply, but no serving utility is named — it is not verified
        // for this lookup, so the result says so.
        const place = `${placeName}, ${hit.admin1 === "Texas" ? "TX" : hit.admin1 ?? "US"}`;
        setResult(buildResult(null, place));
      }
    } catch {
      setError("Could not look up that ZIP right now. Pick a town from the list instead.");
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  const metros = [...new Set(FREEZE_TOWNS.map((t) => t.metro))];

  return (
    <section id="who-pays-finder" className="scroll-mt-20 bg-blue-950" aria-label="Who pays responsibility finder">
      <div className="mx-auto max-w-3xl px-4 py-14">
        <div className="rounded-3xl border border-blue-800 bg-white p-6 shadow-xl md:p-10">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
            Free tool · no signup
          </p>
          <h2 className="mt-3 text-center text-3xl font-extrabold tracking-tight text-blue-950">
            Who pays for your leak?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-slate-600">
            Pick your town, say where the problem is and what you see. We&apos;ll
            tell you who is responsible, who to call first, whether to call
            811 before any digging — and what to say on the call.
          </p>

          {!result ? (
            <div className="mx-auto mt-8 grid max-w-xl gap-5">
              <div>
                <label className={labelCls} htmlFor="wp-town">Your town</label>
                <select
                  id="wp-town"
                  className={inputCls}
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
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
                <label className={labelCls} htmlFor="wp-zip">
                  Or enter your ZIP code
                </label>
                <div className="flex gap-3">
                  <input
                    id="wp-zip"
                    inputMode="numeric"
                    className={inputCls}
                    placeholder="e.g. 77494"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") checkZip();
                    }}
                  />
                  <button
                    onClick={checkZip}
                    className="shrink-0 rounded-full bg-blue-800 px-6 py-3 text-base font-extrabold text-white transition hover:bg-blue-700"
                  >
                    Check ZIP
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-slate-400">
                  ZIP lookup uses the Open-Meteo geocoder — it shows the place it found. If your ZIP is outside our 100 towns, the rules still apply but no serving utility is named.
                </p>
              </div>

              <div>
                <label className={labelCls} htmlFor="wp-location">Where is the problem?</label>
                <select
                  id="wp-location"
                  className={inputCls}
                  value={location}
                  onChange={(e) => setLocation(e.target.value as LocationKey)}
                >
                  {LOCATIONS.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls} htmlFor="wp-symptom">What are you seeing?</label>
                <select
                  id="wp-symptom"
                  className={inputCls}
                  value={symptom}
                  onChange={(e) => setSymptom(e.target.value as SymptomKey)}
                >
                  {SYMPTOMS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <p className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>
              )}

              <button
                onClick={calculate}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-800 px-7 py-4 text-lg font-extrabold text-white transition hover:bg-blue-700"
              >
                Find out who pays →
              </button>
              <p className="text-center text-xs text-slate-400">
                General guidance — your utility or MUD&apos;s own rules decide. Confirm with them.
              </p>
            </div>
          ) : (
            <div className="mt-8 text-center">
              <span className={`inline-block rounded-full px-4 py-1.5 text-sm font-extrabold ${result.outcome.badgeClass}`}>
                {result.outcome.badge}
              </span>
              <h3 className="mt-4 text-2xl font-extrabold text-blue-950">{result.outcome.headline}</h3>
              <p className="mx-auto mt-3 max-w-xl text-slate-600">{result.outcome.body}</p>

              {result.outcome.side === "city" && (
                <div className="mx-auto mt-6 max-w-xl rounded-2xl bg-green-50 p-5 text-left ring-1 ring-green-200">
                  <p className="text-lg font-extrabold text-green-900">
                    Call the city first, not us.
                  </p>
                  <p className="mt-2 text-sm text-green-800">
                    If the leak is before your meter, your utility or MUD fixes it at their cost.
                    Calling a plumber first would mean paying for a visit you do not need — so
                    start with the utility, and only call a pro if they say the leak is past the meter.
                  </p>
                </div>
              )}

              <div className="mx-auto mt-6 grid max-w-xl gap-4 text-left sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-sm font-bold uppercase tracking-wide text-slate-500">Who pays</p>
                  <p className="mt-1 text-xl font-extrabold text-blue-950">{result.outcome.party}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">in {result.townLabel}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-sm font-bold uppercase tracking-wide text-slate-500">Call 811 before digging?</p>
                  <p className="mt-1 text-xl font-extrabold text-blue-950">
                    {result.outcome.dig811 ? "Yes" : "No"}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">{result.outcome.digNote}</p>
                </div>
              </div>

              <div className="mx-auto mt-6 max-w-xl rounded-2xl bg-blue-50 p-5 text-left">
                <p className="font-extrabold text-blue-950">Who to call first — in this order</p>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-600">
                  {result.outcome.callSteps.map((step, i) => (
                    <li key={i} className="font-semibold">{step}</li>
                  ))}
                </ol>
              </div>

              <div className="mx-auto mt-6 max-w-xl rounded-2xl bg-white p-6 text-left shadow-sm ring-1 ring-slate-200">
                <p className="font-extrabold text-blue-950">What to say on the call</p>
                <p className="mt-2 text-sm text-slate-600">{result.outcome.script}</p>
                <p className="mt-3 text-sm text-slate-600">
                  Have ready: your address, your account number from your water bill, and a photo of
                  where the water is showing. {SYMPTOM_NOTES[result.symptom]}
                </p>
              </div>

              <div className="mx-auto mt-6 max-w-xl rounded-2xl bg-slate-50 p-5 text-left">
                <p className="font-extrabold text-blue-950">Your water provider</p>
                {result.utilityName ? (
                  <>
                    <p className="mt-2 text-sm text-slate-600">
                      Your water in {result.townLabel} comes from{" "}
                      <strong className="text-blue-950">{result.utilityName}</strong> — verified
                      {result.utilityCheckedDate ? ` ${result.utilityCheckedDate}` : ""}. That is the
                      utility to call first for anything on their side of the meter.
                    </p>
                    {result.utilityCaveat && (
                      <p className="mt-2 text-sm text-slate-600">{result.utilityCaveat}</p>
                    )}
                    {result.utilitySourceUrl && (
                      <p className="mt-2 text-sm">
                        <a
                          href={result.utilitySourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-blue-800 hover:underline"
                        >
                          Official source for this provider →
                        </a>
                      </p>
                    )}
                  </>
                ) : (
                  <p className="mt-2 text-sm text-slate-600">
                    We have <strong className="text-blue-950">not verified</strong> which utility or
                    MUD serves {result.townLabel}. The provider&apos;s name is printed on your water
                    bill — that is the fastest way to find it. You can also look it up on the{" "}
                    <a
                      href={TCEQ_FIND_PROVIDER_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-blue-800 hover:underline"
                    >
                      TCEQ &ldquo;who provides water to my property&rdquo; page
                    </a>
                    . The responsibility rules above still apply; only the provider&apos;s name is unverified.
                  </p>
                )}
              </div>

              {result.outcome.serviceHref && result.outcome.serviceLabel && (
                <p className="mx-auto mt-6 max-w-xl text-sm text-slate-600">
                  Related service:{" "}
                  <Link href={result.outcome.serviceHref} className="font-bold text-blue-800 hover:underline">
                    {result.outcome.serviceLabel} →
                  </Link>
                </p>
              )}

              {result.outcome.side === "homeowner" ? (
                <>
                  <a
                    href={`tel:${PHONE_TEL}`}
                    className="mt-8 inline-flex items-center gap-3 rounded-full bg-amber-500 px-8 py-4 text-lg font-extrabold text-blue-950 shadow-lg transition hover:bg-amber-400"
                  >
                    Call {PHONE_DISPLAY}
                  </a>
                  <p className="mt-3 text-sm text-slate-500">
                    Non-invasive detection pinpoints it — without exploratory digging.
                  </p>
                </>
              ) : (
                <p className="mx-auto mt-8 max-w-xl rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-600">
                  No booking needed for this one — call the{" "}
                  {result.outcome.side === "city" ? "utility first" : "HOA first"} using the script above.
                </p>
              )}
              <button onClick={reset} className="mt-6 block text-sm font-bold text-blue-800 hover:underline">
                Check another problem
              </button>
            </div>
          )}
        </div>
        <p className="mt-4 text-center text-xs text-blue-200">
          General guidance — your utility or MUD&apos;s own rules decide; confirm with them. Only on-site inspection can confirm where a leak is.
        </p>
      </div>
    </section>
  );
}
