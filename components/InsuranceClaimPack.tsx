"use client";

import { useState } from "react";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/site";
import {
  HO_B_FACTS,
  CLAIM_CHECKLIST,
  DEDUCTIBLE_MATH,
} from "@/lib/texas-insurance";
import type { CoverageVerdict } from "@/lib/texas-insurance";

const inputCls =
  "w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-lg font-bold text-blue-950 outline-none transition focus:border-blue-800";
const labelCls = "mb-1.5 block text-sm font-bold text-slate-600";

type Cause =
  | "sudden-burst"
  | "frozen-pipe"
  | "slow-seepage"
  | "sewer-backup"
  | "unknown";
type PolicyType = "HO-B" | "HO-3" | "dont-know";

const CAUSE_LABELS: Record<Cause, string> = {
  "sudden-burst": "Sudden burst (pipe, hose, or appliance failed suddenly)",
  "frozen-pipe": "Frozen pipe that burst",
  "slow-seepage": "Slow seepage / gradual leak",
  "sewer-backup": "Sewer / drain backup",
  unknown: "I don't know the cause yet",
};

const POLICY_LABELS: Record<PolicyType, string> = {
  "HO-B": "HO-B (Texas Broad Form)",
  "HO-3": "HO-3 (Special Form)",
  "dont-know": "I don't know my policy type",
};

const AREA_LABELS: Array<{ key: string; label: string }> = [
  { key: "flooring", label: "Flooring" },
  { key: "drywall", label: "Drywall / walls" },
  { key: "cabinets", label: "Cabinets / built-ins" },
  { key: "foundation", label: "Foundation / slab" },
  { key: "personal-property", label: "Personal property (furniture, belongings)" },
];

const BUCKET_LABELS: Record<string, string> = {
  "pipe repair": "Pipe repair",
  "tear-out": "Tear-out (access to reach the leak)",
  "water damage": "Water damage to the home",
  mold: "Mold",
  ale: "Additional living expenses (ALE)",
  "service line": "Service line (underground water / sewer lateral)",
  foundation: "Foundation damage",
  "earth movement": "Earth movement",
  "seepage-14-day": "Seepage wording (the 14-day question)",
  "freeze-burst": "Freeze-burst condition",
};

const VERDICT_COPY: Record<CoverageVerdict, { badge: string; badgeClass: string }> = {
  yes: { badge: "Usually covered", badgeClass: "bg-green-100 text-green-800" },
  sometimes: {
    badge: "Sometimes — depends on your form",
    badgeClass: "bg-amber-100 text-amber-800",
  },
  no: { badge: "Usually not covered", badgeClass: "bg-red-100 text-red-800" },
};

function fmtMoney(n: number): string {
  return `$${Math.round(n).toLocaleString()}`;
}

interface Inputs {
  cause: Cause;
  days: number | null;
  areas: string[];
  deductible: number;
  damageEstimate: number;
  policy: PolicyType;
}

interface PackResult extends Inputs {
  letterDate: string;
  /** Loss-date line, computed once in the generate handler. */
  lossDateLine: string;
}

/** Pure letter builder — no date reads here. The dates are computed once
 * in the generate handler and stored in the result, so the letter stays
 * in sync with the checklist ticks without ever reading a date during
 * render. */
function buildLetter(r: PackResult, checked: boolean[]): string {
  const areaList = r.areas
    .map((a) => AREA_LABELS.find((x) => x.key === a)?.label ?? a)
    .join(", ");
  const docs = CLAIM_CHECKLIST.map((c, i) =>
    checked[i] ? `  [x] ${c.item}` : `  [ ] ${c.item}`
  ).join("\n");

  return [
    r.letterDate,
    "",
    `Re: Water damage claim — ${CAUSE_LABELS[r.cause]}`,
    `Policy type: ${POLICY_LABELS[r.policy]}`,
    `Date of loss: ${r.lossDateLine}`,
    `Deductible (per my declarations page): ${fmtMoney(r.deductible)}`,
    `Estimated cost of the covered damage (my estimate): ${fmtMoney(r.damageEstimate)}`,
    "",
    "Dear Claims Department,",
    "",
    "I am writing to report water damage at my home and to open a claim. The facts as I know them are:",
    "",
    `- Cause: ${CAUSE_LABELS[r.cause]}.`,
    `- Damage areas: ${areaList}.`,
    `- Date the damage was first noticed: ${r.lossDateLine}.`,
    "",
    "I have taken photos and video of the damage before cleanup, and I have kept damaged items for inspection. I have not made permanent repairs before the adjuster has seen the damage.",
    "",
    "Documents I have gathered or am gathering:",
    docs,
    "",
    "Please provide a claim number and the name and contact details of the assigned adjuster, and confirm the next steps in writing.",
    "",
    "Thank you,",
    "[Your full name]",
    "[Policy number]",
    "[Phone number and email address]",
  ].join("\n");
}

/**
 * How the user's own answers change each verified bucket. Every note below
 * comes from the HO-B facts in lib/texas-insurance (TDI / ISO HO-3
 * summaries) — nothing invented, and no coverage promise is made.
 */
function bucketNote(bucket: string, inputs: Inputs): string | null {
  const { cause, days, areas } = inputs;
  if (bucket === "water damage") {
    if (cause === "sudden-burst")
      return "Your cause is the sudden and accidental kind TDI says most Texas policies cover — if the loss really was sudden.";
    if (cause === "frozen-pipe")
      return "A burst pipe is TDI's textbook example of sudden and accidental damage — but see the freeze-burst bucket below about protecting pipes.";
    if (cause === "slow-seepage")
      return "TDI: policies usually won't cover damage from gradual leaks. This is the hardest fact for a slow leak.";
    if (cause === "sewer-backup")
      return "Sewer / drain backup is not one of the verified buckets in this tool — TDI lists it as an optional endorsement, so check whether your policy includes it.";
    return "Coverage turns on whether the loss was sudden or gradual — the detection report's finding on cause and start date matters most.";
  }
  if (bucket === "seepage-14-day") {
    if (days === null)
      return "You did not give a start date — the seepage wording turns on how long the leak ran, so the detection report's start-date finding matters.";
    if (days >= 14)
      return `Your leak ran about ${days} days. Many Texas forms exclude seepage lasting 14 days or more — but the ISO HO-3 base form has no 14-day clause, and Texas forms also use "weeks, months, or years" or result-based wording. Only your policy's wording decides.`;
    return "Under 14 days — but some Texas forms use “weeks, months, or years” or result-based wording instead, so the number of days alone does not decide it.";
  }
  if (bucket === "freeze-burst") {
    if (cause === "frozen-pipe")
      return "TDI warns: “Home and renters policies might not pay for damages caused by frozen pipes if you didn't take steps to protect your pipes, such as keeping the heater on in your house.”";
    return "This bucket applies only when a frozen pipe caused the loss.";
  }
  if (bucket === "foundation" && areas.includes("foundation")) {
    return "You listed foundation damage. The old HO-B position (TDI Bulletin B-0032-97, 1997) was that foundation damage from an accidental plumbing discharge was covered — but that was the old HO-B form, and modern forms may word it differently. Expect the insurer to investigate the cause.";
  }
  if (bucket === "earth movement" && areas.includes("foundation")) {
    return "Foundation damage from soil movement alone is excluded. The question for the insurer is whether a plumbing discharge moved the slab — or clay movement broke the pipe.";
  }
  if (bucket === "mold") {
    if (cause === "slow-seepage")
      return "Mold from gradual leaks or seepage is not covered (TDI) — even though mold can start within a day of a leak.";
    if (days !== null && days >= 1)
      return "TDI: mold can start within a day of a leak. Mold on an item damaged by a covered sudden loss is covered — subject to the sub-limit on your policy.";
    return null;
  }
  if (bucket === "tear-out") {
    if (cause === "slow-seepage" || areas.includes("foundation"))
      return "Many Texas company forms narrow tear-out for lines in or below the slab, or for slow leaks — check the wording on your own form.";
    return null;
  }
  if (bucket === "service line" && cause === "sewer-backup") {
    return "A sewer backup is a different question from the lateral itself — check whether your policy has a sewer / drain backup endorsement.";
  }
  return null;
}

/**
 * Insurance Claim Pack Generator — lead-gen tool #5.
 * Leak facts in (cause, start date, damage areas, deductible, policy
 * type); coverage likelihood per verified HO-B bucket, deductible math,
 * a document checklist, and a filled claim-letter draft out. Every
 * coverage fact comes from HO_B_FACTS in lib/texas-insurance (TDI /
 * ISO HO-3 summaries). Guidance only — never insurance advice, never
 * a coverage promise, never a filing recommendation.
 */
export default function InsuranceClaimPack() {
  const [cause, setCause] = useState<Cause>("sudden-burst");
  const [daysAgo, setDaysAgo] = useState("");
  const [areas, setAreas] = useState<string[]>(["flooring"]);
  const [deductible, setDeductible] = useState("");
  const [damageEstimate, setDamageEstimate] = useState("");
  const [policy, setPolicy] = useState<PolicyType>("dont-know");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PackResult | null>(null);
  const [checked, setChecked] = useState<boolean[]>(
    () => CLAIM_CHECKLIST.map(() => false)
  );
  const [copiedLetter, setCopiedLetter] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  const toggleArea = (key: string) => {
    setAreas((prev) =>
      prev.includes(key) ? prev.filter((a) => a !== key) : [...prev, key]
    );
  };

  const generate = () => {
    setError(null);
    setCopiedLetter(false);
    setCopiedSummary(false);
    const ded = parseFloat(deductible);
    const dmg = parseFloat(damageEstimate);
    const days =
      daysAgo.trim() === "" ? null : parseFloat(daysAgo);
    if (isNaN(ded) || ded < 0 || ded > 100000) {
      setError("Enter your deductible in dollars (0 to 100,000). Find it on your declarations page.");
      return;
    }
    if (isNaN(dmg) || dmg <= 0 || dmg > 1000000) {
      setError("Enter your estimated cost of the covered damage in dollars — your own estimate, more than $0.");
      return;
    }
    if (days !== null && (isNaN(days) || days < 0 || days > 365)) {
      setError("Days since the leak started should be between 0 and 365 — or leave it blank if you don't know.");
      return;
    }
    if (areas.length === 0) {
      setError("Tick at least one damaged area.");
      return;
    }

    // Date reads happen here (event handler), never during render:
    // Next.js blocks `new Date()` reads while prerendering a Client Component.
    const now = new Date();
    const letterDate = now.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const lossDate =
      days === null
        ? "date unknown — I first noticed the damage recently"
        : new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toLocaleDateString(
            "en-US",
            { month: "long", day: "numeric", year: "numeric" }
          );
    const lossDateLine =
      days === null
        ? lossDate
        : `${lossDate} (${days} day${days === 1 ? "" : "s"} ago)`;

    setResult({
      cause,
      days,
      areas,
      deductible: ded,
      damageEstimate: dmg,
      policy,
      letterDate,
      lossDateLine,
    });
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setCopiedLetter(false);
    setCopiedSummary(false);
  };

  const copyLetter = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(buildLetter(result, checked));
      setCopiedLetter(true);
    } catch {
      setError("Copy did not work in this browser — select the letter text and copy it by hand.");
    }
  };

  const copySummary = async () => {
    if (!result) return;
    const lines: string[] = [
      "Insurance claim pack — summary (guidance, not insurance advice)",
      `Generated: ${result.letterDate}`,
      `Cause: ${CAUSE_LABELS[result.cause]}`,
      `Policy type: ${POLICY_LABELS[result.policy]}`,
      `Deductible: ${fmtMoney(result.deductible)}`,
      `Estimated covered damage: ${fmtMoney(result.damageEstimate)}`,
      `Insurer pays (estimate): ${fmtMoney(Math.max(0, result.damageEstimate - result.deductible))}`,
      `You pay (estimate): ${fmtMoney(Math.min(result.damageEstimate, result.deductible))}`,
      "",
      "Coverage likelihood per bucket (standard Texas HO-B / HO-3 rules — confirm with your insurer):",
      ...HO_B_FACTS.map(
        (b) => `- ${BUCKET_LABELS[b.bucket] ?? b.bucket}: ${VERDICT_COPY[b.covered].badge}`
      ),
      "",
      "Document checklist:",
      ...CLAIM_CHECKLIST.map((c, i) => `- [${checked[i] ? "x" : " "}] ${c.item}`),
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopiedSummary(true);
    } catch {
      setError("Copy did not work in this browser — select the summary text and copy it by hand.");
    }
  };

  const checkedCount = checked.filter(Boolean).length;
  const insurerPays = result
    ? Math.max(0, result.damageEstimate - result.deductible)
    : 0;
  const youPay = result
    ? Math.min(result.damageEstimate, result.deductible)
    : 0;

  return (
    <section id="insurance-claim-pack" className="scroll-mt-20 bg-blue-950" aria-label="Insurance claim pack generator">
      <div className="mx-auto max-w-3xl px-4 py-14">
        <div className="rounded-3xl border border-blue-800 bg-white p-6 shadow-xl md:p-10">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
            Free tool · no signup
          </p>
          <h2 className="mt-3 text-center text-3xl font-extrabold tracking-tight text-blue-950">
            Build your insurance claim pack
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-slate-600">
            Enter the facts of your leak. We&apos;ll show the coverage
            likelihood for each cost bucket under Texas HO-B / HO-3 rules,
            do the deductible math, and draft your claim letter — with a
            document checklist you can tick off.
          </p>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm font-semibold text-amber-700">
            Guidance, not insurance advice, and not a coverage promise —
            confirm everything with your insurer or agent.
          </p>

          {!result ? (
            <div className="mx-auto mt-8 grid max-w-xl gap-5">
              <div>
                <label className={labelCls} htmlFor="ic-cause">What caused the leak?</label>
                <select
                  id="ic-cause"
                  className={inputCls}
                  value={cause}
                  onChange={(e) => setCause(e.target.value as Cause)}
                >
                  {(Object.keys(CAUSE_LABELS) as Cause[]).map((c) => (
                    <option key={c} value={c}>{CAUSE_LABELS[c]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls} htmlFor="ic-days">
                  When did it start? (days ago — leave blank if you don&apos;t know)
                </label>
                <input
                  id="ic-days"
                  inputMode="numeric"
                  className={inputCls}
                  placeholder="e.g. 3"
                  value={daysAgo}
                  onChange={(e) => setDaysAgo(e.target.value)}
                />
                <p className="mt-1.5 text-xs text-slate-400">
                  The start date matters: many Texas forms exclude seepage that ran 14 days or more — but the wording is form-specific.
                </p>
              </div>

              <div>
                <span className={labelCls}>What was damaged? (tick all that apply)</span>
                <div className="grid gap-2">
                  {AREA_LABELS.map((a) => (
                    <label
                      key={a.key}
                      className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700"
                    >
                      <input
                        type="checkbox"
                        className="mt-0.5 h-5 w-5 shrink-0 accent-blue-800"
                        checked={areas.includes(a.key)}
                        onChange={() => toggleArea(a.key)}
                      />
                      {a.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls} htmlFor="ic-deductible">Your deductible ($)</label>
                  <input
                    id="ic-deductible"
                    inputMode="decimal"
                    className={inputCls}
                    placeholder="e.g. 1000"
                    value={deductible}
                    onChange={(e) => setDeductible(e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls} htmlFor="ic-damage">Estimated covered damage ($)</label>
                  <input
                    id="ic-damage"
                    inputMode="decimal"
                    className={inputCls}
                    placeholder="e.g. 12000"
                    value={damageEstimate}
                    onChange={(e) => setDamageEstimate(e.target.value)}
                  />
                </div>
              </div>
              <p className="-mt-2 text-xs text-slate-400">
                The damage figure is your own estimate (from a quote or your own tally) — the tool only does the arithmetic on it.
              </p>

              <div>
                <label className={labelCls} htmlFor="ic-policy">Your policy type</label>
                <select
                  id="ic-policy"
                  className={inputCls}
                  value={policy}
                  onChange={(e) => setPolicy(e.target.value as PolicyType)}
                >
                  {(Object.keys(POLICY_LABELS) as PolicyType[]).map((p) => (
                    <option key={p} value={p}>{POLICY_LABELS[p]}</option>
                  ))}
                </select>
                <p className="mt-1.5 text-xs text-slate-400">
                  Find it on your declarations page. Since 2003 Texas insurers file their own forms, so many homeowners hold a company form rather than a strict HO-B.
                </p>
              </div>

              {error && (
                <p className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>
              )}

              <button
                onClick={generate}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-800 px-7 py-4 text-lg font-extrabold text-white transition hover:bg-blue-700"
              >
                Generate my claim pack →
              </button>
            </div>
          ) : (
            <div className="mt-8">
              {result.policy === "dont-know" && (
                <p className="mx-auto max-w-xl rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">
                  You said you don&apos;t know your policy type — the buckets
                  below use the standard HO-B / HO-3 rules. Your own form
                  may differ, so read your declarations page before you file.
                </p>
              )}
              {result.cause === "sewer-backup" && (
                <p className="mx-auto mt-4 max-w-xl rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">
                  Sewer / drain backup is not one of the verified coverage
                  buckets in this tool. TDI lists sewer / drain backup as an
                  optional endorsement — check whether your policy includes
                  it before you assume it is covered.
                </p>
              )}

              <h3 className="mt-8 text-2xl font-extrabold text-blue-950">
                Coverage likelihood per bucket
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Standard Texas HO-B / HO-3 rules, from TDI and ISO HO-3
                summaries. &ldquo;Sometimes&rdquo; means it depends on your
                policy form and endorsements — check your declarations page.
              </p>
              <div className="mt-5 space-y-4">
                {HO_B_FACTS.map((b) => {
                  const note = bucketNote(b.bucket, result);
                  return (
                    <div key={b.bucket} className="rounded-2xl bg-slate-50 p-5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-extrabold text-blue-950">
                          {BUCKET_LABELS[b.bucket] ?? b.bucket}
                        </p>
                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-extrabold ${VERDICT_COPY[b.covered].badgeClass}`}>
                          {VERDICT_COPY[b.covered].badge}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{b.condition}</p>
                      {note && (
                        <p className="mt-2 rounded-xl bg-white p-3 text-sm font-semibold text-slate-700">
                          Your answers: {note}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-slate-400">
                        Source:{" "}
                        <a href={b.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-blue-800 hover:underline">
                          {b.sourceUrl.replace("https://", "")}
                        </a>
                      </p>
                    </div>
                  );
                })}
              </div>

              <h3 className="mt-10 text-2xl font-extrabold text-blue-950">
                Deductible math — file or pay it yourself?
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                The arithmetic only — this tool never tells you whether to
                file. Compare the numbers yourself, with your agent if you
                want a second view.
              </p>
              <div className="mt-5 rounded-2xl bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-600">
                  Insurer pays = covered damage − deductible
                </p>
                <p className="mt-2 text-2xl font-extrabold text-blue-950">
                  {fmtMoney(result.damageEstimate)} − {fmtMoney(result.deductible)} = {fmtMoney(insurerPays)}
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                    <p className="text-3xl font-extrabold text-blue-950">{fmtMoney(insurerPays)}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-600">insurer pays (estimate, up to policy / sub-limits)</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                    <p className="text-3xl font-extrabold text-blue-950">{fmtMoney(youPay)}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-600">you pay (your deductible, up to the damage cost)</p>
                  </div>
                </div>
                {insurerPays === 0 && (
                  <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-800">
                    On these numbers, filing would pay $0 — the covered
                    damage is at or below your deductible.
                  </p>
                )}
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  {DEDUCTIBLE_MATH.filter((d) =>
                    ["how-it-works", "file-or-pay-yourself", "depreciation-holdback", "claims-history-cost", "insurer-deadlines"].includes(d.topic)
                  ).map((d) => (
                    <li key={d.topic} className="list-disc pl-1 ml-4">{d.note}</li>
                  ))}
                </ul>
              </div>

              <h3 className="mt-10 text-2xl font-extrabold text-blue-950">
                Document checklist — {checkedCount} of {CLAIM_CHECKLIST.length} gathered
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Tick each item as you gather it. The ticked items appear in
                your claim letter below.
              </p>
              <div className="mt-5 space-y-3">
                {CLAIM_CHECKLIST.map((c, i) => (
                  <label
                    key={c.item}
                    className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700"
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5 h-5 w-5 shrink-0 accent-blue-800"
                      checked={checked[i]}
                      onChange={() =>
                        setChecked((prev) =>
                          prev.map((v, j) => (j === i ? !v : v))
                        )
                      }
                    />
                    <span>
                      <span className="font-semibold">{c.item}</span>
                      <span className="block text-xs text-slate-500">{c.why}</span>
                    </span>
                  </label>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={copySummary}
                  className="rounded-full bg-blue-800 px-6 py-3 text-base font-extrabold text-white transition hover:bg-blue-700"
                >
                  {copiedSummary ? "Summary copied ✓" : "Copy pack summary"}
                </button>
                <button
                  onClick={() => window.print()}
                  className="rounded-full bg-white px-6 py-3 text-base font-extrabold text-blue-800 ring-2 ring-blue-800 transition hover:bg-blue-50"
                >
                  Print this pack
                </button>
              </div>

              <h3 className="mt-10 text-2xl font-extrabold text-blue-950">
                Your claim-letter draft
              </h3>
              <p className="mt-2 rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">
                Review before sending — this is a draft, not legal advice.
                Check every fact against your own records, fill in the
                bracketed lines, and confirm the wording with your agent
                before you send it.
              </p>
              <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-slate-50 p-5 text-sm text-slate-700 ring-1 ring-slate-200">
                {buildLetter(result, checked)}
              </pre>
              <button
                onClick={copyLetter}
                className="mt-4 rounded-full bg-blue-800 px-6 py-3 text-base font-extrabold text-white transition hover:bg-blue-700"
              >
                {copiedLetter ? "Letter copied ✓" : "Copy claim letter"}
              </button>

              <div className="mt-10 rounded-2xl bg-blue-50 p-6 text-center">
                <p className="font-extrabold text-blue-950">
                  A detection report is the evidence your insurer asks for
                </p>
                <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
                  Adjusters ask for a written report stating the leak&apos;s
                  location, cause, and how long it ran. Book a detection
                  visit that produces an insurance-ready report — it is the
                  document your claim rests on.
                </p>
                <a
                  href={`tel:${PHONE_TEL}`}
                  className="mt-6 inline-flex items-center gap-3 rounded-full bg-amber-500 px-8 py-4 text-lg font-extrabold text-blue-950 shadow-lg transition hover:bg-amber-400"
                >
                  Call {PHONE_DISPLAY}
                </a>
                <p className="mt-3 text-sm text-slate-500">
                  Non-invasive detection pinpoints the leak — without exploratory digging.
                </p>
              </div>

              {error && (
                <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>
              )}
              <button onClick={reset} className="mt-6 text-sm font-bold text-blue-800 hover:underline">
                Start over with different facts
              </button>
            </div>
          )}
        </div>
        <p className="mt-4 text-center text-xs text-blue-200">
          Guidance from Texas HO-B / HO-3 rules — not insurance advice, not a coverage promise, and never a filing recommendation. Confirm with your insurer or agent.
        </p>
      </div>
    </section>
  );
}
