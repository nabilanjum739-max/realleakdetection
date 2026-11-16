"use client";

import { useState } from "react";
import Link from "next/link";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/site";
import { UTILITY_RULES } from "@/lib/utility-rules";
import type { UtilityRule } from "@/lib/utility-rules";
import { TOWNS } from "@/lib/towns";

// 1 CCF (100 cubic feet) = 748 gallons — the unit most US water bills use.
const GAL_PER_CCF = 748;
// El Paso Water: consumption must increase by more than 10 CCF.
const EL_PASO_MIN_EXCESS_GAL = 10 * GAL_PER_CCF;
// Amarillo: consumption must exceed the 12-month average by 50,000 gallons.
const AMARILLO_MIN_EXCESS_GAL = 50000;

const inputCls =
  "w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-lg font-bold text-blue-950 outline-none transition focus:border-blue-800";
const labelCls = "mb-1.5 block text-sm font-bold text-slate-600";

type LeakKind =
  | "hidden"
  | "visible-fixture"
  | "toilet"
  | "irrigation"
  | "pool"
  | "unknown";

const LEAK_KINDS: Array<{ value: LeakKind; label: string }> = [
  { value: "hidden", label: "Hidden — underground, behind a wall, or under the slab / foundation" },
  { value: "visible-fixture", label: "Visible — dripping faucet, hose, or fixture" },
  { value: "toilet", label: "Toilet — supply line, tank, or running toilet" },
  { value: "irrigation", label: "Irrigation / sprinkler — main-line break or broken nozzle" },
  { value: "pool", label: "Pool — supply line, refill mechanism, or lining" },
  { value: "unknown", label: "I don't know where the leak was" },
];

type Verdict = "likely" | "likely-not" | "cannot-tell";

const VERDICT_COPY: Record<Verdict, { badge: string; badgeClass: string; headline: string }> = {
  likely: {
    badge: "Likely eligible — on the facts you entered",
    badgeClass: "bg-green-100 text-green-800",
    headline: "On your utility's published rule, this looks eligible.",
  },
  "likely-not": {
    badge: "Likely not eligible — on the facts you entered",
    badgeClass: "bg-red-100 text-red-800",
    headline: "On your utility's published rule, this likely does not qualify.",
  },
  "cannot-tell": {
    badge: "Cannot tell from the published rule",
    badgeClass: "bg-amber-100 text-amber-800",
    headline: "The published rule does not settle this — ask your utility.",
  },
};

/** Anchor cities whose own utility rule is verified. They are NOT in the
 *  100-town list (the list holds the surrounding towns), so they are
 *  offered as separate choices — "Houston (city itself)". */
const ANCHOR_CITIES: Array<{ metroSlug: string; label: string }> = [
  { metroSlug: "houston", label: "Houston (city itself)" },
  { metroSlug: "dallas", label: "Dallas (city itself)" },
  { metroSlug: "san-antonio", label: "San Antonio (city itself)" },
  { metroSlug: "austin", label: "Austin (city itself)" },
  { metroSlug: "fort-worth", label: "Fort Worth (city itself)" },
];

const VERIFIED_RULES = UTILITY_RULES.filter((r) => r.verified);

function fmtGal(n: number): string {
  return Math.round(n).toLocaleString();
}

function fmtMoney(n: number): string {
  return `$${Math.round(n).toLocaleString()}`;
}

function fmtDateLong(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

interface Resolved {
  /** The rule to show, if any. */
  rule: UtilityRule | null;
  /** How the rule was found. */
  scope: "town" | "anchor" | "utility-pick" | "unverified-town" | "none";
  townLabel: string | null;
  metroLabel: string | null;
  /** Anchor-city rule for the town's metro — shown only to explain why it
   *  does NOT apply to the town. Never presented as the town's rule. */
  anchorRule: UtilityRule | null;
}

function resolveRule(townValue: string, utilityValue: string): Resolved {
  const none: Resolved = {
    rule: null,
    scope: "none",
    townLabel: null,
    metroLabel: null,
    anchorRule: null,
  };
  if (utilityValue) {
    const rule = VERIFIED_RULES.find((r) => r.utility === utilityValue) ?? null;
    return { ...none, rule, scope: "utility-pick" };
  }
  if (!townValue) return none;
  if (townValue.startsWith("anchor:")) {
    const metroSlug = townValue.slice("anchor:".length);
    const anchor = ANCHOR_CITIES.find((a) => a.metroSlug === metroSlug);
    const rule =
      VERIFIED_RULES.find(
        (r) =>
          r.metro.toLowerCase().replace(/[^a-z]/g, "") ===
            metroSlug.replace(/-/g, "") && r.townSlugs.length === 0
      ) ?? null;
    // Metro match by slug is fragile across spellings; fall back to the
    // anchor-city rule whose townSlugs is empty and whose metro matches
    // the anchor label's city name.
    const fallback =
      rule ??
      VERIFIED_RULES.find((r) => {
        const city = anchor?.label.split(" (")[0] ?? "";
        return r.townSlugs.length === 0 && r.utility.toLowerCase().includes(city.toLowerCase().split(" ")[0]);
      }) ??
      null;
    return {
      ...none,
      rule: fallback,
      scope: "anchor",
      townLabel: anchor?.label ?? null,
      metroLabel: anchor?.label.split(" (")[0] ?? null,
    };
  }
  if (townValue.startsWith("town:")) {
    const slug = townValue.slice("town:".length);
    const town = TOWNS.find((t) => t.townSlug === slug);
    if (!town) return none;
    const rule = VERIFIED_RULES.find((r) => r.townSlugs.includes(slug)) ?? null;
    if (rule) {
      return { ...none, rule, scope: "town", townLabel: town.town, metroLabel: town.metro };
    }
    // Town's own utility is NOT verified. Find the anchor-city rule for
    // the metro only so we can name it as NOT applying.
    const anchorRule =
      VERIFIED_RULES.find(
        (r) => r.metro === town.metro && r.townSlugs.length === 0
      ) ?? null;
    return {
      ...none,
      scope: "unverified-town",
      townLabel: town.town,
      metroLabel: town.metro,
      anchorRule,
    };
  }
  return none;
}

interface PackResult {
  resolved: Resolved;
  normalGal: number;
  leakGal: number;
  excessGal: number;
  leakKind: LeakKind;
  repaired: boolean;
  repairDateInput: string;
  repairDateLabel: string | null;
  daysToRepair: number | null;
  daysSinceRepair: number | null;
  deadlineDateLabel: string | null;
  daysLeft: number | null;
  deadlineStatus: "inside" | "passed" | "none" | "not-repaired";
  verdict: Verdict | null;
  reasons: string[];
  /** Dollar cost of the excess usage, from the user's own bills/rates. */
  excessCost: number | null;
  excessCostBasis: string | null;
  creditLow: number | null;
  creditHigh: number | null;
  creditNote: string;
  letterDate: string;
  nameInput: string;
  addressInput: string;
  accountInput: string;
  zipInput: string;
  checklist: string[];
}

function buildLetter(r: PackResult, checked: boolean[]): string {
  const rule = r.resolved.rule;
  const lines: string[] = [
    r.letterDate,
    "",
    "[Your full name]",
    r.addressInput ? r.addressInput : "[Your service address]",
    r.accountInput ? `Account number: ${r.accountInput}` : "Account number: [your account number]",
    "",
    `Re: Leak adjustment request — ${rule ? rule.utility : "my water utility"}`,
    r.resolved.townLabel ? `Service address town: ${r.resolved.townLabel}, TX` : "",
    r.zipInput ? `ZIP: ${r.zipInput}` : "",
    "",
    "Dear Customer Service,",
    "",
    "I am writing to request a leak adjustment for excess water use caused by a leak at my home. The facts are:",
    "",
    `- Normal-month usage: ${fmtGal(r.normalGal)} gallons.`,
    `- Leak-month usage: ${fmtGal(r.leakGal)} gallons.`,
    `- Excess usage: ${fmtGal(Math.max(0, r.excessGal))} gallons.`,
    `- Leak type: ${LEAK_KINDS.find((k) => k.value === r.leakKind)?.label ?? r.leakKind}.`,
    r.repaired
      ? `- The leak has been repaired${r.repairDateLabel ? ` on ${r.repairDateLabel}` : ""}.`
      : "- The leak has NOT been repaired yet.",
    r.daysToRepair !== null
      ? `- Days from leak start / notification to repair: ${r.daysToRepair}.`
      : "",
    r.excessCost !== null
      ? `- Extra cost on the leak-month bill (my own bills): ${fmtMoney(r.excessCost)}.`
      : "",
    r.creditLow !== null
      ? `- Estimated credit under your published rule (guidance only): ${fmtMoney(r.creditLow)}${r.creditHigh !== null && r.creditHigh !== r.creditLow ? `–${fmtMoney(r.creditHigh)}` : ""}.`
      : "",
    r.deadlineDateLabel
      ? `- Your published filing deadline for this repair: ${r.deadlineDateLabel}.`
      : "",
    "",
    "Documents enclosed / attached (ticked items below are included with this letter):",
    ...r.checklist.map((c, i) => `  [${checked[i] ? "x" : " "}] ${c}`),
    "",
    "Please confirm in writing that you received this request, whether the adjustment is granted, and the amount credited. If any document is missing, please tell me exactly what you need.",
    "",
    "Thank you,",
    r.nameInput ? r.nameInput : "[Your full name]",
    "[Phone number and email address]",
  ];
  return lines.filter((l) => l !== "").join("\n");
}

/**
 * MUD / Utility Leak-Adjustment Eligibility Checker + Application Pack.
 * Town/ZIP/utility + bill-spike facts in; the user's actual utility (or an
 * honest "not verified yet"), its real published rule, an eligibility
 * verdict with reasons, an estimated credit range, and a generated
 * application pack (filled letter + document checklist + deadline
 * countdown) out. Every rule comes from lib/utility-rules (verified
 * entries only). Guidance, not a guarantee — only the utility decides.
 */
export default function LeakAdjustmentChecker() {
  const [townValue, setTownValue] = useState("");
  const [zip, setZip] = useState("");
  const [utilityValue, setUtilityValue] = useState("");
  const [normalGal, setNormalGal] = useState("");
  const [leakGal, setLeakGal] = useState("");
  const [normalAmt, setNormalAmt] = useState("");
  const [leakAmt, setLeakAmt] = useState("");
  const [ratePer1000, setRatePer1000] = useState("");
  const [leakKind, setLeakKind] = useState<LeakKind>("hidden");
  const [repaired, setRepaired] = useState(true);
  const [repairDate, setRepairDate] = useState("");
  const [daysToRepair, setDaysToRepair] = useState("");
  const [usageNormal, setUsageNormal] = useState(true);
  const [eyeOnWater, setEyeOnWater] = useState(false);
  const [hadRecentAdjustment, setHadRecentAdjustment] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [addressInput, setAddressInput] = useState("");
  const [accountInput, setAccountInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PackResult | null>(null);
  const [checked, setChecked] = useState<boolean[]>([]);
  const [copiedLetter, setCopiedLetter] = useState(false);

  const resolvedPreview = resolveRule(townValue, utilityValue);
  const metros = [...new Set(TOWNS.map((t) => t.metro))];

  const generate = () => {
    setError(null);
    setCopiedLetter(false);
    const resolved = resolveRule(townValue, utilityValue);
    if (!townValue && !utilityValue) {
      setError("Pick your town or your utility first — the rule depends on who bills you for water.");
      return;
    }
    if (zip.trim() !== "" && !/^\d{5}$/.test(zip.trim())) {
      setError("If you enter a ZIP code, enter all 5 digits — or leave it blank.");
      return;
    }
    const ng = parseFloat(normalGal);
    const lg = parseFloat(leakGal);
    if (isNaN(ng) || isNaN(lg) || ng <= 0 || lg <= 0) {
      setError("Enter both months' gallons (more than 0). Your bill shows gallons — or CCF, in which case multiply CCF by 748.");
      return;
    }
    const na = normalAmt.trim() === "" ? null : parseFloat(normalAmt);
    const la = leakAmt.trim() === "" ? null : parseFloat(leakAmt);
    const rate = ratePer1000.trim() === "" ? null : parseFloat(ratePer1000);
    if ((na !== null && (isNaN(na) || na < 0)) || (la !== null && (isNaN(la) || la < 0))) {
      setError("Bill amounts must be $0 or more — or leave them blank and enter your cost per 1,000 gallons instead.");
      return;
    }
    if (rate !== null && (isNaN(rate) || rate <= 0 || rate > 50)) {
      setError("Your cost per 1,000 gallons should be between $1 and $50 — or leave it blank.");
      return;
    }
    const dtr =
      daysToRepair.trim() === "" ? null : parseFloat(daysToRepair);
    if (dtr !== null && (isNaN(dtr) || dtr < 0 || dtr > 365)) {
      setError("Days from leak start to repair should be between 0 and 365 — or leave it blank.");
      return;
    }
    if (repaired && repairDate.trim() !== "" && isNaN(Date.parse(repairDate))) {
      setError("Enter a valid repair date — or leave it blank if you don't know it yet.");
      return;
    }

    const excessGal = lg - ng;

    // Dollar cost of the excess, from the user's own numbers only.
    let excessCost: number | null = null;
    let excessCostBasis: string | null = null;
    if (na !== null && la !== null && la > na) {
      excessCost = la - na;
      excessCostBasis = "Difference between your two bills' dollar amounts.";
    } else if (rate !== null && excessGal > 0) {
      excessCost = (excessGal / 1000) * rate;
      excessCostBasis = "Excess gallons × your cost per 1,000 gallons, from your bill.";
    }

    // All date reads happen here (event handler), never during render:
    // Next.js blocks `new Date()` reads while prerendering a Client Component.
    const now = new Date();
    const letterDate = fmtDateLong(now);
    let repairDateLabel: string | null = null;
    let daysSinceRepair: number | null = null;
    let deadlineDateLabel: string | null = null;
    let daysLeft: number | null = null;
    let deadlineStatus: PackResult["deadlineStatus"] = "none";
    const adj = resolved.rule?.adjustment ?? null;
    if (repaired && repairDate.trim() !== "") {
      const rd = new Date(`${repairDate}T12:00:00`);
      if (!isNaN(rd.getTime())) {
        repairDateLabel = fmtDateLong(rd);
        daysSinceRepair = Math.floor(
          (now.getTime() - rd.getTime()) / (24 * 60 * 60 * 1000)
        );
        if (adj && adj.deadlineDays !== null) {
          const deadline = new Date(
            rd.getTime() + adj.deadlineDays * 24 * 60 * 60 * 1000
          );
          deadlineDateLabel = fmtDateLong(deadline);
          daysLeft = Math.ceil(
            (deadline.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
          );
          deadlineStatus = daysLeft >= 0 ? "inside" : "passed";
        }
      }
    } else if (!repaired) {
      deadlineStatus = "not-repaired";
    }

    // Eligibility verdict, with a reason for every call.
    const reasons: string[] = [];
    let verdict: Verdict | null = null;
    if (resolved.scope === "unverified-town") {
      verdict = null;
    } else if (!resolved.rule) {
      verdict = null;
    } else if (resolved.rule.adjustment === null) {
      verdict = "cannot-tell";
      if (resolved.rule.utility === "City of Corpus Christi Water") {
        reasons.push(
          "No published water-side leak-adjustment policy was found for Corpus Christi Water (checked 2026-11-16). What IS verified is a wastewater-side relief: if a hidden leak hit during the Dec–Feb winter quarter, the director may adjust the wastewater bill with proof of repairs (Code Sec. 55-100(e)(4))."
        );
      } else if (resolved.rule.utility === "Brushy Creek MUD") {
        reasons.push(
          "No water-side leak credit was found for Brushy Creek MUD. What IS verified is a wastewater (sewer-average) adjustment: a leak during the Nov–Feb averaging months can be corrected with a Wastewater Adjustment Request form and proof of repairs — deadline Apr 30 (2025 order) / May 31 (2026 order)."
        );
      } else if (resolved.rule.utility === "Woodlands Water (The Woodlands Water Agency)") {
        reasons.push(
          "A one-time leak adjustment exists for Woodlands Water, but no formula, deadline, or eligibility list is published — the utility says to call your Customer Service Representative (281-367-1271). We cannot judge eligibility from an unpublished rule."
        );
      } else {
        reasons.push(
          `No published leak-adjustment policy, form, deadline, or formula was found for ${resolved.rule.utility} (checked 2026-11-16). That does not rule out a case-by-case credit — call the utility and ask whether one is reviewed.`
        );
      }
    } else {
      const a = resolved.rule.adjustment;
      if (!repaired) {
        verdict = "cannot-tell";
        reasons.push(
          "Most rules require the leak to be repaired first, with proof of the repair — the plumber's invoice is what makes the claim work. File after the repair, with the invoice in hand."
        );
      } else if (excessGal <= 0) {
        verdict = "likely-not";
        reasons.push(
          "Your leak-month usage was not above your normal month, so there is no excess usage for the utility to credit. A leak adjustment credits usage above your average — with no excess, there is nothing to adjust."
        );
      } else {
        // Start from likely eligible; each rule can knock it down.
        verdict = "likely";
        if (resolved.rule.utility === "El Paso Water" && excessGal <= EL_PASO_MIN_EXCESS_GAL) {
          verdict = "likely-not";
          reasons.push(
            `El Paso Water requires the increase to be more than 10 CCF (7,480 gallons). Your excess is ${fmtGal(excessGal)} gallons — below that threshold.`
          );
        }
        if (
          resolved.rule.utility === "City of Amarillo Water" &&
          excessGal <= AMARILLO_MIN_EXCESS_GAL
        ) {
          verdict = "likely-not";
          reasons.push(
            `Amarillo requires the leak to push consumption more than 50,000 gallons over your 12-month average. Your excess over one normal month is ${fmtGal(excessGal)} gallons — below that threshold.`
          );
        }
        if (leakKind === "visible-fixture") {
          if (resolved.rule.utility === "San Antonio Water System (SAWS)") {
            reasons.push(
              "SAWS lists faucet leaks among its eligible types, so a visible faucet leak is not automatically excluded here — unlike Houston, Austin, Dallas, or MUD 71."
            );
          } else {
            verdict = "likely-not";
            reasons.push(
              "Visible leaks such as a dripping faucet or hose are excluded by this utility's rule — it covers hidden leaks (an \"excusable defect\" / hidden or concealed leak), not visible ones."
            );
          }
        }
        if (leakKind === "toilet" && resolved.rule.utility === "San Antonio Water System (SAWS)") {
          reasons.push(
            "SAWS lists toilet supply-line and tank leaks among its eligible types."
          );
        }
        if (leakKind === "irrigation" && resolved.rule.utility === "San Antonio Water System (SAWS)") {
          reasons.push(
            "SAWS covers irrigation main-line breaks and non-working nozzles — but not irrigation problems caused by controller settings or watering too often."
          );
        }
        if (resolved.rule.utility === "Harris County MUD 71" && !eyeOnWater) {
          verdict = "cannot-tell";
          reasons.push(
            "MUD 71 grants no credit until the district confirms your Eye On Water account with the smart meter registered. Register first, then apply — the sworn application must certify the registration."
          );
        }
        if (resolved.rule.utility === "City of Fort Worth Water" && !usageNormal) {
          verdict = "cannot-tell";
          reasons.push(
            "Fort Worth's rule covers leaks where usage returns to normal after repair. Your usage has not returned to normal yet — confirm that on your next bill before filing, or the utility may treat the leak as still running."
          );
        }
        if (hadRecentAdjustment && a.frequencyLimit) {
          verdict = "likely-not";
          reasons.push(
            `You had a leak adjustment recently, and this utility's limit is: ${a.frequencyLimit}.`
          );
        }
        if (deadlineStatus === "passed" && a.deadlineDays !== null) {
          verdict = "likely-not";
          reasons.push(
            `The filing deadline has passed: ${a.deadlineDays} days from the repair date, and your repair was ${daysSinceRepair ?? "?"} days ago. Ask the utility whether a late request is ever accepted — do not assume it is.`
          );
        }
        if (deadlineStatus === "inside" && a.deadlineDays !== null) {
          reasons.push(
            `You are inside the filing window: ${a.deadlineDays} days from the repair date, with ${daysLeft ?? "?"} day${daysLeft === 1 ? "" : "s"} left. File before ${deadlineDateLabel ?? "the deadline"}.`
          );
        }
        if (a.deadlineDays === null) {
          reasons.push(
            "This utility publishes no filing deadline — file promptly anyway, and confirm the deadline with the utility when you file."
          );
        }
        if (resolved.rule.utility === "City of Fort Worth Water") {
          reasons.push(
            "Fort Worth note: no live city leak-adjustment page was found; this rule rests on a copy of the city's March 2021 application form, corroborated by the City of Denton's official benchmark. Re-verify it on the city page before you file."
          );
        }
        if (resolved.rule.utility === "El Paso Water") {
          reasons.push(
            "El Paso Water's own pages word the 50% baseline two ways (same months last year vs. the previous 12 months' average); the Rules & Regulations use the 12-month average. The estimate below uses your normal-month figure as the baseline."
          );
        }
      }
    }

    // Estimated credit, from the rule's formula and the user's own dollars.
    let creditLow: number | null = null;
    let creditHigh: number | null = null;
    let creditNote = "";
    if (resolved.rule?.adjustment && excessCost !== null && excessGal > 0) {
      const u = resolved.rule.utility;
      if (u === "City of Houston Water (Houston Public Works)") {
        if (dtr === null) {
          creditLow = excessCost * 0.5;
          creditHigh = excessCost * 1.0;
          creditNote =
            "Houston credits 100% of the water charge on usage above average if repaired within 30 days, 75% within 60 days, 50% after 60 days — you did not give days from leak start to repair, so the range covers all three tiers.";
        } else {
          const pct = dtr <= 30 ? 1 : dtr <= 60 ? 0.75 : 0.5;
          creditLow = excessCost * pct;
          creditHigh = creditLow;
          creditNote = `Houston tier for a repair ${dtr} days after the leak started: ${Math.round(pct * 100)}% of the water charge on usage above average.`;
        }
      } else if (resolved.rule.adjustment.creditPct !== null) {
        const pct = resolved.rule.adjustment.creditPct / 100;
        creditLow = excessCost * pct;
        creditHigh = creditLow;
        creditNote = `${resolved.rule.utility} credits ${resolved.rule.adjustment.creditPct}% of the excess usage — ${fmtMoney(excessCost)} of excess cost × ${resolved.rule.adjustment.creditPct}%.`;
      } else if (u === "City of Dallas Water Utilities") {
        creditNote =
          "Dallas publishes no % credit: the excess is repriced at the lowest rate on the rate scale. No dollar estimate is possible without that rate scale — ask Dallas Water Utilities for the repriced figure.";
      } else {
        creditNote =
          "This utility publishes no % or formula, so no dollar estimate is possible from the published rule — the utility decides the amount. The excess cost above is still the number to put in your request.";
      }
    } else if (resolved.rule?.adjustment && excessCost === null && excessGal > 0) {
      creditNote =
        "Enter your two bills' dollar amounts or your cost per 1,000 gallons above and the tool will estimate the credit in dollars. Without a dollar figure for the excess, only the gallons can be shown.";
    } else if (resolved.rule?.adjustment) {
      creditNote =
        "No excess usage to credit on the numbers you entered.";
    }

    const checklist: string[] = [
      "Plumber's invoice or paid receipt describing the repair, with the repair date — the invoice is what makes the claim work; most utilities will not grant a credit without it.",
      "Both bills: the normal month and the leak month (gallons and dollars).",
      "Your account number and service address, exactly as printed on your bill.",
      "Photos of the leak and the repair, if you have them.",
    ];
    if (resolved.rule?.adjustment) {
      checklist.push(`Proof this utility asks for: ${resolved.rule.adjustment.proofRequired}`);
    }
    if (resolved.rule?.utility === "Harris County MUD 71") {
      checklist.push(
        "Eye On Water account with your smart meter registered — MUD 71 confirms the registration before granting any credit."
      );
    }
    if (resolved.rule?.utility === "City of Houston Water (Houston Public Works)") {
      checklist.push(
        "Repair date, address, type of repair, and cost documented — Houston accepts a plumber's statement/bill, a receipt for parts, or a signed written statement."
      );
    }

    setChecked(checklist.map(() => false));
    setResult({
      resolved,
      normalGal: ng,
      leakGal: lg,
      excessGal,
      leakKind,
      repaired,
      repairDateInput: repairDate,
      repairDateLabel,
      daysToRepair: dtr,
      daysSinceRepair,
      deadlineDateLabel,
      daysLeft,
      deadlineStatus,
      verdict,
      reasons,
      excessCost,
      excessCostBasis,
      creditLow,
      creditHigh,
      creditNote,
      letterDate,
      nameInput: nameInput.trim(),
      addressInput: addressInput.trim(),
      accountInput: accountInput.trim(),
      zipInput: zip.trim(),
      checklist,
    });
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setCopiedLetter(false);
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

  const checkedCount = checked.filter(Boolean).length;

  return (
    <section id="leak-adjustment-checker" className="scroll-mt-20 bg-blue-950" aria-label="Leak adjustment eligibility checker">
      <div className="mx-auto max-w-3xl px-4 py-14">
        <div className="rounded-3xl border border-blue-800 bg-white p-6 shadow-xl md:p-10">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
            Free tool · no signup
          </p>
          <h2 className="mt-3 text-center text-3xl font-extrabold tracking-tight text-blue-950">
            Check your leak adjustment
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-slate-600">
            Enter your town, your two bills, and the repair facts. We&apos;ll
            find your actual utility&apos;s published rule, judge eligibility
            against it, estimate the credit, and draft your application pack.
          </p>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm font-semibold text-amber-700">
            Guidance, not a guarantee — only your utility decides, and rules
            change. Check the official page before you file.
          </p>

          {!result ? (
            <div className="mx-auto mt-8 grid max-w-xl gap-5">
              <div>
                <label className={labelCls} htmlFor="la-town">Your town</label>
                <select
                  id="la-town"
                  className={inputCls}
                  value={townValue}
                  onChange={(e) => {
                    setTownValue(e.target.value);
                    setUtilityValue("");
                  }}
                >
                  <option value="">Choose your town…</option>
                  {metros.map((metro) => (
                    <optgroup key={metro} label={`${metro} metro`}>
                      {ANCHOR_CITIES.filter((a) => a.metroSlug === metro.toLowerCase().replace(/ /g, "-")).map((a) => (
                        <option key={a.metroSlug} value={`anchor:${a.metroSlug}`}>
                          {a.label}
                        </option>
                      ))}
                      {TOWNS.filter((t) => t.metro === metro).map((t) => (
                        <option key={t.townSlug} value={`town:${t.townSlug}`}>
                          {t.town}, TX
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <p className="mt-1.5 text-xs text-slate-400">
                  The anchor city itself is listed first in its metro — the
                  surrounding towns have their own utilities, not the
                  anchor city&apos;s.
                </p>
              </div>

              <div>
                <label className={labelCls} htmlFor="la-zip">
                  Or your ZIP code (optional)
                </label>
                <input
                  id="la-zip"
                  inputMode="numeric"
                  className={inputCls}
                  placeholder="e.g. 77494"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                />
                <p className="mt-1.5 text-xs text-slate-400">
                  A ZIP alone cannot identify your utility — our data maps
                  towns and utilities, not ZIP codes. Pick your town above;
                  the ZIP is only used in your letter draft.
                </p>
              </div>

              <div>
                <label className={labelCls} htmlFor="la-utility">
                  Or pick your utility directly
                </label>
                <select
                  id="la-utility"
                  className={inputCls}
                  value={utilityValue}
                  onChange={(e) => setUtilityValue(e.target.value)}
                >
                  <option value="">Match it from my town</option>
                  {VERIFIED_RULES.map((r) => (
                    <option key={r.utility} value={r.utility}>
                      {r.utility}
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-xs text-slate-400">
                  Your water bill prints your utility&apos;s name — that is
                  the fastest way to be sure. Only verified rules are
                  listed; HCMUD 501, HCMUD 82, and Baker Road MUD are not
                  here because their full rules are not verified.
                </p>
              </div>

              {resolvedPreview.scope === "unverified-town" && (
                <p className="rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">
                  {resolvedPreview.townLabel} is not served by its metro&apos;s
                  anchor-city utility, and we have not verified{" "}
                  {resolvedPreview.townLabel}&apos;s own utility rule yet.
                  The checker will still run — it will show you how to find
                  your utility instead of showing you the anchor city&apos;s
                  rule as if it were yours.
                </p>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls} htmlFor="la-normal-gal">Normal month — gallons</label>
                  <input id="la-normal-gal" inputMode="decimal" className={inputCls} placeholder="e.g. 8000"
                    value={normalGal} onChange={(e) => setNormalGal(e.target.value)} />
                </div>
                <div>
                  <label className={labelCls} htmlFor="la-leak-gal">Leak month — gallons</label>
                  <input id="la-leak-gal" inputMode="decimal" className={inputCls} placeholder="e.g. 24000"
                    value={leakGal} onChange={(e) => setLeakGal(e.target.value)} />
                </div>
              </div>
              <p className="-mt-2 text-xs text-slate-400">
                Bill shows CCF instead of gallons? 1 CCF = 748 gallons — multiply your CCF by 748.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls} htmlFor="la-normal-amt">Normal month — bill amount ($)</label>
                  <input id="la-normal-amt" inputMode="decimal" className={inputCls} placeholder="e.g. 64"
                    value={normalAmt} onChange={(e) => setNormalAmt(e.target.value)} />
                </div>
                <div>
                  <label className={labelCls} htmlFor="la-leak-amt">Leak month — bill amount ($)</label>
                  <input id="la-leak-amt" inputMode="decimal" className={inputCls} placeholder="e.g. 190"
                    value={leakAmt} onChange={(e) => setLeakAmt(e.target.value)} />
                </div>
              </div>

              <div>
                <label className={labelCls} htmlFor="la-rate">
                  Your cost per 1,000 gallons ($) — optional, if you didn&apos;t enter bill amounts
                </label>
                <input id="la-rate" inputMode="decimal" className={inputCls} placeholder="From your bill: total ÷ gallons × 1,000"
                  value={ratePer1000} onChange={(e) => setRatePer1000(e.target.value)} />
                <p className="mt-1.5 text-xs text-slate-400">
                  We never guess a rate for you — it comes from your own bill, or the dollar estimate is left blank.
                </p>
              </div>

              <div>
                <label className={labelCls} htmlFor="la-kind">What kind of leak was it?</label>
                <select
                  id="la-kind"
                  className={inputCls}
                  value={leakKind}
                  onChange={(e) => setLeakKind(e.target.value as LeakKind)}
                >
                  {LEAK_KINDS.map((k) => (
                    <option key={k.value} value={k.value}>{k.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls} htmlFor="la-repair-date">
                    Repair date (optional)
                  </label>
                  <input
                    id="la-repair-date"
                    type="date"
                    className={inputCls}
                    value={repairDate}
                    onChange={(e) => setRepairDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls} htmlFor="la-days-repair">
                    Days from leak start to repair
                  </label>
                  <input id="la-days-repair" inputMode="numeric" className={inputCls} placeholder="e.g. 12"
                    value={daysToRepair} onChange={(e) => setDaysToRepair(e.target.value)} />
                </div>
              </div>
              <p className="-mt-2 text-xs text-slate-400">
                The repair date starts the filing-deadline clock. Days from
                leak start to repair decides Houston&apos;s credit tier
                (100% / 75% / 50%).
              </p>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  className="mt-0.5 h-5 w-5 shrink-0 accent-blue-800"
                  checked={repaired}
                  onChange={(e) => setRepaired(e.target.checked)}
                />
                The leak has been repaired
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  className="mt-0.5 h-5 w-5 shrink-0 accent-blue-800"
                  checked={usageNormal}
                  onChange={(e) => setUsageNormal(e.target.checked)}
                />
                My water use has returned to normal since the repair
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  className="mt-0.5 h-5 w-5 shrink-0 accent-blue-800"
                  checked={eyeOnWater}
                  onChange={(e) => setEyeOnWater(e.target.checked)}
                />
                I have an Eye On Water account with my smart meter registered (MUD 71 only — ignore otherwise)
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  className="mt-0.5 h-5 w-5 shrink-0 accent-blue-800"
                  checked={hadRecentAdjustment}
                  onChange={(e) => setHadRecentAdjustment(e.target.checked)}
                />
                I already had a leak adjustment in the last 12 months (24 months for El Paso)
              </label>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls} htmlFor="la-name">Your name (for the letter, optional)</label>
                  <input id="la-name" className={inputCls} placeholder="e.g. Jane Smith"
                    value={nameInput} onChange={(e) => setNameInput(e.target.value)} />
                </div>
                <div>
                  <label className={labelCls} htmlFor="la-account">Account number (optional)</label>
                  <input id="la-account" className={inputCls} placeholder="From your bill"
                    value={accountInput} onChange={(e) => setAccountInput(e.target.value)} />
                </div>
              </div>
              <div>
                <label className={labelCls} htmlFor="la-address">Service address (for the letter, optional)</label>
                <input id="la-address" className={inputCls} placeholder="e.g. 123 Main St, Katy, TX"
                  value={addressInput} onChange={(e) => setAddressInput(e.target.value)} />
              </div>

              {error && (
                <p className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>
              )}

              <button
                onClick={generate}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-800 px-7 py-4 text-lg font-extrabold text-white transition hover:bg-blue-700"
              >
                Check my eligibility →
              </button>
            </div>
          ) : (
            <div className="mt-8">
              {result.resolved.scope === "unverified-town" && (
                <div className="text-center">
                  <span className="inline-block rounded-full bg-amber-100 px-4 py-1.5 text-sm font-extrabold text-amber-800">
                    Not verified yet — {result.resolved.townLabel}
                  </span>
                  <h3 className="mt-4 text-2xl font-extrabold text-blue-950">
                    We don&apos;t have {result.resolved.townLabel}&apos;s utility rule verified yet.
                  </h3>
                  <p className="mx-auto mt-3 max-w-xl text-slate-600">
                    {result.resolved.townLabel} is not served by the
                    anchor-city utility
                    {result.resolved.anchorRule
                      ? ` (${result.resolved.anchorRule.utility})`
                      : ""}{" "}
                    — that rule covers {result.resolved.metroLabel} itself,
                    not {result.resolved.townLabel}. We will not show it to
                    you as your rule. Your leak-month excess on the numbers
                    you entered is {fmtGal(Math.max(0, result.excessGal))}{" "}
                    gallons — keep that figure; it is what any utility will
                    ask for.
                  </p>
                  <div className="mx-auto mt-6 max-w-xl rounded-2xl bg-blue-50 p-5 text-left">
                    <p className="font-extrabold text-blue-950">How to find your utility&apos;s rule</p>
                    <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-600">
                      <li>
                        Check your water bill — the utility or district name
                        is printed on it. That name is the fastest answer.
                      </li>
                      <li>
                        Check your city&apos;s water page, or your MUD&apos;s
                        website, for a leak-adjustment policy or form.
                      </li>
                      <li>
                        Still unsure which district serves your address? Use
                        the TCEQ &ldquo;Who Provides Water to My
                        Property?&rdquo; page:{" "}
                        <a
                          href="https://www.tceq.texas.gov/drinkingwater/whatsmysource.html"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-blue-800 hover:underline"
                        >
                          tceq.texas.gov — what&apos;s my source
                        </a>
                        . The Association of Water Board Directors also runs
                        a &ldquo;Find My District&rdquo; address search.
                      </li>
                      <li>
                        Call the utility on the bill and ask: &ldquo;Do you
                        offer a leak adjustment, what is the deadline, and
                        what proof do you need?&rdquo; Write down the answer
                        with the date.
                      </li>
                    </ol>
                  </div>
                  <p className="mx-auto mt-6 max-w-xl text-sm text-slate-600">
                    Until your utility&apos;s rule is verified, no verdict
                    or credit estimate is shown here — a guess would be
                    worse than no answer. The application pack below is
                    still built from your numbers, so you can use it once
                    the utility confirms its rule.
                  </p>
                </div>
              )}

              {result.resolved.rule && (
                <div className="text-center">
                  <span className={`inline-block rounded-full px-4 py-1.5 text-sm font-extrabold ${result.verdict ? VERDICT_COPY[result.verdict].badgeClass : "bg-slate-100 text-slate-700"}`}>
                    {result.verdict ? VERDICT_COPY[result.verdict].badge : "Rule shown — no verdict"}
                  </span>
                  <h3 className="mt-4 text-2xl font-extrabold text-blue-950">
                    {result.verdict ? VERDICT_COPY[result.verdict].headline : "Your utility's published rule"}
                  </h3>
                  <p className="mx-auto mt-3 max-w-xl text-slate-600">
                    Your utility:{" "}
                    <strong className="text-blue-950">{result.resolved.rule.utility}</strong>
                    {result.resolved.scope === "town" &&
                      ` — verified for ${result.resolved.townLabel}, TX`}
                    {result.resolved.scope === "anchor" &&
                      ` — verified for ${result.resolved.townLabel} (the city itself)`}
                    {result.resolved.scope === "utility-pick" &&
                      " — chosen directly by you"}
                    . Checked {result.resolved.rule.checkedDate}.
                  </p>
                </div>
              )}

              {result.resolved.rule?.adjustment && (
                <div className="mx-auto mt-8 max-w-xl rounded-2xl bg-slate-50 p-5 text-left">
                  <p className="font-extrabold text-blue-950">Your utility&apos;s real rule</p>
                  <dl className="mt-3 space-y-2 text-sm text-slate-600">
                    <div>
                      <dt className="font-bold text-slate-700">What qualifies</dt>
                      <dd>{result.resolved.rule.adjustment.qualifies}</dd>
                    </div>
                    <div>
                      <dt className="font-bold text-slate-700">Credit / formula</dt>
                      <dd>{result.resolved.rule.adjustment.formula ?? "No % or formula published."}</dd>
                    </div>
                    <div>
                      <dt className="font-bold text-slate-700">Filing deadline</dt>
                      <dd>
                        {result.resolved.rule.adjustment.deadlineDays !== null
                          ? `${result.resolved.rule.adjustment.deadlineDays} days from the repair date`
                          : "Not published — file promptly and confirm the deadline with the utility."}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-bold text-slate-700">Frequency limit</dt>
                      <dd>{result.resolved.rule.adjustment.frequencyLimit ?? "Not published."}</dd>
                    </div>
                    <div>
                      <dt className="font-bold text-slate-700">Max months covered</dt>
                      <dd>
                        {result.resolved.rule.adjustment.maxMonths !== null
                          ? `Up to ${result.resolved.rule.adjustment.maxMonths} billing month${result.resolved.rule.adjustment.maxMonths === 1 ? "" : "s"}`
                          : "Not published."}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-bold text-slate-700">Proof required</dt>
                      <dd>{result.resolved.rule.adjustment.proofRequired}</dd>
                    </div>
                  </dl>
                  <p className="mt-3 text-xs text-slate-400">
                    Source:{" "}
                    <a href={result.resolved.rule.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-blue-800 hover:underline">
                      {result.resolved.rule.sourceUrl.replace("https://", "")}
                    </a>
                    {result.resolved.rule.notes && (
                      <span className="mt-2 block">{result.resolved.rule.notes}</span>
                    )}
                  </p>
                  {result.resolved.rule.winterAveraging && (
                    <p className="mt-3 rounded-xl bg-white p-3 text-sm font-semibold text-slate-700">
                      Winter averaging:{" "}
                      {result.resolved.rule.winterAveraging.used
                        ? `sewer charges are set from ${result.resolved.rule.winterAveraging.months.join(", ")} water use. `
                        : "not used — sewer is billed on monthly use. "}
                      {result.resolved.rule.winterAveraging.leakMonthEffect}
                    </p>
                  )}
                </div>
              )}

              {result.resolved.rule && !result.resolved.rule.adjustment && (
                <div className="mx-auto mt-8 max-w-xl rounded-2xl bg-slate-50 p-5 text-left">
                  <p className="font-extrabold text-blue-950">No published water-side policy</p>
                  <p className="mt-2 text-sm text-slate-600">
                    {result.resolved.rule.notes}
                  </p>
                  <p className="mt-3 text-xs text-slate-400">
                    Source:{" "}
                    <a href={result.resolved.rule.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-blue-800 hover:underline">
                      {result.resolved.rule.sourceUrl.replace("https://", "")}
                    </a>
                    {" "}· Checked {result.resolved.rule.checkedDate}.
                  </p>
                  {result.resolved.rule.winterAveraging && (
                    <p className="mt-3 rounded-xl bg-white p-3 text-sm font-semibold text-slate-700">
                      Winter averaging:{" "}
                      {result.resolved.rule.winterAveraging.used
                        ? `sewer charges are set from ${result.resolved.rule.winterAveraging.months.join(", ")} water use. `
                        : "not used — sewer is billed on monthly use. "}
                      {result.resolved.rule.winterAveraging.leakMonthEffect}
                    </p>
                  )}
                </div>
              )}

              {result.reasons.length > 0 && (
                <div className="mx-auto mt-6 max-w-xl rounded-2xl bg-blue-50 p-5 text-left">
                  <p className="font-extrabold text-blue-950">Why — the reasons behind the verdict</p>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
                    {result.reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mx-auto mt-6 grid max-w-xl gap-4 text-left sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-3xl font-extrabold text-blue-950">
                    {fmtGal(Math.max(0, result.excessGal))}
                    <span className="text-base font-bold text-slate-500"> gal</span>
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">
                    excess usage ({fmtGal(result.leakGal)} − {fmtGal(result.normalGal)} gal)
                  </p>
                </div>
                <div className="rounded-2xl bg-amber-50 p-5">
                  <p className="text-3xl font-extrabold text-blue-950">
                    {result.creditLow !== null
                      ? result.creditHigh !== null && result.creditHigh !== result.creditLow
                        ? `${fmtMoney(result.creditLow)}–${fmtMoney(result.creditHigh)}`
                        : fmtMoney(result.creditLow)
                      : result.excessCost !== null
                        ? fmtMoney(result.excessCost)
                        : "—"}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">
                    {result.creditLow !== null
                      ? "estimated credit (guidance only)"
                      : result.excessCost !== null
                        ? "excess cost on your bills — no % published to credit against"
                        : "estimated credit — enter bill dollars or a rate to calculate it"}
                  </p>
                </div>
              </div>
              <p className="mx-auto mt-4 max-w-xl text-left text-sm text-slate-600">
                {result.creditNote}
                {result.excessCostBasis && (
                  <span className="block mt-1 text-xs text-slate-400">{result.excessCostBasis}</span>
                )}
              </p>

              {result.deadlineStatus === "inside" && (
                <div className="mx-auto mt-6 max-w-xl rounded-2xl bg-red-50 p-5 text-left">
                  <p className="font-extrabold text-red-800">
                    Deadline countdown: {result.daysLeft} day{result.daysLeft === 1 ? "" : "s"} left
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    File by {result.deadlineDateLabel} (repair date{" "}
                    {result.repairDateLabel ?? "not given"} +{" "}
                    {result.resolved.rule?.adjustment?.deadlineDays ?? "?"} days).
                    The countdown was calculated when you ran the check — it
                    does not update on its own. Re-run the check for a fresh
                    count.
                  </p>
                </div>
              )}
              {result.deadlineStatus === "passed" && (
                <div className="mx-auto mt-6 max-w-xl rounded-2xl bg-red-50 p-5 text-left">
                  <p className="font-extrabold text-red-800">
                    Deadline passed: {result.deadlineDateLabel}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    The filing window ended {result.daysLeft !== null ? Math.abs(result.daysLeft) : "?"} day
                    {result.daysLeft !== null && Math.abs(result.daysLeft) === 1 ? "" : "s"} ago.
                    Ask the utility whether a late request is ever accepted.
                  </p>
                </div>
              )}
              {result.deadlineStatus === "not-repaired" && (
                <p className="mx-auto mt-6 max-w-xl rounded-2xl bg-slate-50 p-5 text-sm font-semibold text-slate-600">
                  The deadline clock starts on the repair date — there is no
                  countdown until the leak is repaired.
                </p>
              )}

              <h3 className="mt-10 text-2xl font-extrabold text-blue-950">
                Your application pack
              </h3>
              <h4 className="mt-6 text-lg font-extrabold text-blue-950">
                Document checklist — {checkedCount} of {result.checklist.length} gathered
              </h4>
              <p className="mt-2 text-sm text-slate-600">
                Tick each item as you gather it. The ticked items appear in
                your letter draft below. The first item is the one that
                matters most — without it, most utilities will not grant a
                credit at all.
              </p>
              <div className="mt-5 space-y-3 text-left">
                {result.checklist.map((c, i) => (
                  <label
                    key={i}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm text-slate-700 ${i === 0 ? "border-amber-400 bg-amber-50" : "border-slate-200 bg-slate-50"}`}
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5 h-5 w-5 shrink-0 accent-blue-800"
                      checked={checked[i] ?? false}
                      onChange={() =>
                        setChecked((prev) =>
                          prev.map((v, j) => (j === i ? !v : v))
                        )
                      }
                    />
                    <span>
                      {i === 0 && (
                        <span className="block text-xs font-extrabold uppercase tracking-wide text-amber-700">
                          Most important — the invoice is what makes the claim work
                        </span>
                      )}
                      <span className="font-semibold">{c}</span>
                    </span>
                  </label>
                ))}
              </div>

              <h4 className="mt-10 text-lg font-extrabold text-blue-950">
                Your letter draft
              </h4>
              <p className="mt-2 rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">
                Review before sending — this is a draft, not legal advice.
                Check every fact against your own bills and invoice, fill in
                the bracketed lines, and confirm the wording with your
                utility before you send it.
              </p>
              <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-slate-50 p-5 text-left text-sm text-slate-700 ring-1 ring-slate-200">
                {buildLetter(result, checked)}
              </pre>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={copyLetter}
                  className="rounded-full bg-blue-800 px-6 py-3 text-base font-extrabold text-white transition hover:bg-blue-700"
                >
                  {copiedLetter ? "Letter copied ✓" : "Copy letter"}
                </button>
                <button
                  onClick={() => window.print()}
                  className="rounded-full bg-white px-6 py-3 text-base font-extrabold text-blue-800 ring-2 ring-blue-800 transition hover:bg-blue-50"
                >
                  Print this pack
                </button>
              </div>

              <div className="mt-10 rounded-2xl bg-blue-50 p-6 text-center">
                <p className="font-extrabold text-blue-950">
                  A detection visit produces the invoice your claim needs
                </p>
                <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
                  The utility asks for a plumber&apos;s invoice describing
                  the repair. Book a detection visit that produces a
                  claim-ready invoice — with the leak location, the repair
                  description, and the date in writing.
                </p>
                <a
                  href={`tel:${PHONE_TEL}`}
                  className="mt-6 inline-flex items-center gap-3 rounded-full bg-amber-500 px-8 py-4 text-lg font-extrabold text-blue-950 shadow-lg transition hover:bg-amber-400"
                >
                  Call {PHONE_DISPLAY}
                </a>
                <p className="mt-3 text-sm text-slate-500">
                  Non-invasive detection pinpoints it — without exploratory digging.
                </p>
              </div>

              <p className="mt-6 text-center text-sm text-slate-500">
                <Link href="/tools/water-bill-spike/" className="font-bold text-blue-800 hover:underline">
                  Not sure the spike was a leak? Split your bill first →
                </Link>
              </p>

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
          Estimates and verdicts from your utility&apos;s published rule and
          your own bills — guidance, not a guarantee. Only your utility
          decides, and only on-site detection can confirm a leak.
        </p>
      </div>
    </section>
  );
}
