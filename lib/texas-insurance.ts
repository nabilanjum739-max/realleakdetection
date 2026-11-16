// DO NOT EDIT BY HAND.
// Texas HO-B / HO-3 homeowners insurance facts for the Insurance Claim Pack
// Generator (Tool 5) and the Texas insurance keyword page.
// Researched Nov 16, 2026 from TDI (Texas Department of Insurance) and
// ISO HO-3 form summaries (LegalClarity / Insurance Information Institute).
// Every fact below was verified against a citable source on that date; see
// files/texas-ho-b-sewer-lateral-2026-11-16.md for full citations and the
// UNVERIFIED list. General information only — not legal or insurance advice.
// Always show "confirm with your insurer/agent" alongside these facts.

export type CoverageVerdict = 'yes' | 'no' | 'sometimes';

export interface HoBFactsBucket {
  /** Short label for the cost bucket, e.g. 'tear-out'. */
  bucket: string;
  /** 'yes' | 'no' | 'sometimes' — whether a standard Texas policy usually covers it. */
  covered: CoverageVerdict;
  /** Plain-language condition, including the key caveat. */
  condition: string;
  /** Citable source URL for this fact. */
  sourceUrl: string;
}

/**
 * Coverage buckets for a Texas leak claim. 10 verified facts.
 * "sometimes" means: depends on the policy form / endorsements — the
 * homeowner must check their own declarations page.
 */
export const HO_B_FACTS: HoBFactsBucket[] = [
  {
    bucket: 'pipe repair',
    covered: 'no',
    condition:
      'The failed pipe itself is almost never covered. The ISO HO-3 form states: "We do not cover loss to the system or appliance from which this water or steam escaped." The pipe is treated as maintenance / wear and tear.',
    sourceUrl: 'https://legalclarity.org/does-homeowners-insurance-cover-slab-leak-repairs/',
  },
  {
    bucket: 'tear-out',
    covered: 'sometimes',
    condition:
      'The standard HO-3 covers "the cost to tear out and replace any part of a building, or other structure, on the residence premises, but only when necessary to repair the system or appliance" — so jackhammering a slab to reach a sudden leak can be covered. Many Texas company forms narrow tear-out for lines in or below the slab, so check the form.',
    sourceUrl: 'https://legalclarity.org/what-is-tear-out-and-replacement-coverage-in-home-insurance/',
  },
  {
    bucket: 'water damage',
    covered: 'sometimes',
    condition:
      'Sudden and accidental water damage (burst pipe, toilet overflow, broken washer hose) is covered by most Texas policies, per TDI. Damage from gradual leaks or continuous seepage is usually NOT covered. Many Texas forms exclude seepage lasting 14 days or more; others use "weeks, months, or years" or result-based wording — the exact clause is form-specific.',
    sourceUrl: 'https://www.tdi.texas.gov/tips/when-are-water-damage-and-mold-covered-by-insurance.html',
  },
  {
    bucket: 'mold',
    covered: 'sometimes',
    condition:
      'Mold on an item damaged by a covered sudden loss is covered (TDI). Mold from gradual leaks, seepage, or flooding is not. Even when covered, most policies cap mold cleanup with a sub-limit — published national examples run $2,500–$15,000, commonly $1,000–$10,000. Most policies do NOT include mold cleanup and testing after the damaged item is removed, though an endorsement may add it. Check the declarations page.',
    sourceUrl: 'https://www.tdi.texas.gov/tips/when-are-water-damage-and-mold-covered-by-insurance.html',
  },
  {
    bucket: 'ale',
    covered: 'sometimes',
    condition:
      'Additional living expenses (ALE / loss of use) pay rent, food, and other extra costs if a COVERED loss forces you to move out while the home is repaired. TDI notes ALE "might be limited to 10 to 20% of the amount of the dwelling coverage." ALE pays only the increase over normal living costs, up to the policy limit. If the loss itself is not covered (e.g. a gradual leak), ALE is not paid.',
    sourceUrl: 'https://www.tdi.texas.gov/pubs/consumer/cb025.html',
  },
  {
    bucket: 'service line',
    covered: 'no',
    condition:
      'A standard policy almost never covers the underground water/sewer lateral from house to street. A service-line endorsement (optional add-on) covers it: typically $20–$50/year (national published range), limits typically $10,000–$25,000 per occurrence, with a separate $250–$500 deductible. It must be bought BEFORE the failure; it does not cover pre-existing damage.',
    sourceUrl: 'https://legalclarity.org/what-is-service-line-coverage-on-homeowners-insurance/',
  },
  {
    bucket: 'foundation',
    covered: 'sometimes',
    condition:
      'Foundation damage from soil movement alone is excluded. TDI Bulletin B-0032-97 (1997) took the position that the old standard HO-B form DID cover foundation damage caused by an accidental plumbing discharge — but that bulletin concerns the old HO-B form; since 2003 Texas insurers file their own forms, so a modern policy may word this differently. TDI lists "damage to foundations or slabs" as an optional endorsement. Expect the insurer to investigate cause (leak-moved-slab vs clay-moved-and-broke-pipe).',
    sourceUrl: 'https://www.tdi.texas.gov/bulletins/1997/b-0032-7.html',
  },
  {
    bucket: 'earth movement',
    covered: 'no',
    condition:
      'TDI lists "earthquakes or earth movement" among damages most Texas policies do not cover. Settling, shrinking, bulging, or expansion of foundations is a standard exclusion, including damage from expansive-clay shrink/swell on its own.',
    sourceUrl: 'https://www.tdi.texas.gov/pubs/consumer/cb025.html',
  },
  {
    bucket: 'seepage-14-day',
    covered: 'sometimes',
    condition:
      'The ISO HO-3 base form has NO 14-day seepage clause. Many insurers\' own Texas forms add one: TDI\'s 2018 comparison found three wordings in use in Texas — seepage "over a period of 14 or more days", over "weeks, months, or years", or seepage that "results in deterioration, corrosion, rust, or wet or dry rot". Some companies sell a continuous-leakage add-on. The wording on the homeowner\'s own policy decides.',
    sourceUrl: 'https://www.4homeownersinsurance.com/guides/sudden-vs-gradual-water-damage/',
  },
  {
    bucket: 'freeze-burst',
    covered: 'sometimes',
    condition:
      'A burst pipe is TDI\'s textbook example of sudden and accidental damage, and sudden/accidental coverage "pays for damage from burst pipes." BUT TDI (winter tips, last updated Apr 29, 2025) warns: "Home and renters policies might not pay for damages caused by frozen pipes if you didn\'t take steps to protect your pipes, such as keeping the heater on in your house." Flood insurance does NOT pay for burst-pipe damage.',
    sourceUrl: 'https://www.tdi.texas.gov/tips/winter-safety.html',
  },
];

export interface ClaimChecklistItem {
  /** What to collect / do. */
  item: string;
  /** Why it matters, in one line. */
  why: string;
  /** TDI or other citable source. */
  sourceUrl: string;
}

/** Documents and steps TDI says a Texas homeowner needs for a water-damage claim. */
export const CLAIM_CHECKLIST: ClaimChecklistItem[] = [
  {
    item: 'Report the loss to your insurer as soon as possible; hidden water damage usually must be reported within days after you first see it.',
    why: 'Most policies have filing deadlines; some have a one-year deadline unless good cause for delay is shown.',
    sourceUrl: 'https://www.tdi.texas.gov/pubs/consumer/cb025.html',
  },
  {
    item: 'Dated photos and video of all damage, taken BEFORE cleanup or repair; do not throw damaged items away until the adjuster has seen them.',
    why: 'Photos/video are the core evidence of what the loss looked like; adjusters decide payment from them.',
    sourceUrl: 'https://www.tdi.texas.gov/tips/when-are-water-damage-and-mold-covered-by-insurance.html',
  },
  {
    item: 'Written list of damaged property, with purchase dates, values, and serial numbers for expensive items.',
    why: 'TDI recommends a home inventory; the insurer may ask for a signed, notarized proof-of-loss form listing items and amounts.',
    sourceUrl: 'https://www.tdi.texas.gov/pubs/consumer/cb025.html',
  },
  {
    item: 'Licensed plumber detection report: leak location, cause/origin, and how long the leak appears to have run.',
    why: 'Adjusters ask for a detection report; for slab/foundation claims an engineer\'s report on cause is typically also needed.',
    sourceUrl: 'https://www.4homeownersinsurance.com/guides/slab-leaks-and-tear-out-coverage/',
  },
  {
    item: 'Itemized repair invoices with detection, access/tear-out, repair, and restoration as separate lines.',
    why: 'The insurer treats pipe repair, tear-out, and resulting damage differently; separate lines let each bucket be judged on its own.',
    sourceUrl: 'https://legalclarity.org/does-homeowners-insurance-cover-slab-leak-repairs/',
  },
  {
    item: 'Water bills and meter readings from when symptoms were first noticed.',
    why: 'Shows when the leak started — the key fact for the seepage / 14-day exclusion question.',
    sourceUrl: 'https://www.4homeownersinsurance.com/guides/sudden-vs-gradual-water-damage/',
  },
  {
    item: 'Receipts for temporary repairs and materials (tarps, covers, drying) — temporary repairs only, no permanent repairs before the insurer sees the damage.',
    why: 'TDI: make only temporary repairs to protect the house; permanent repairs before inspection can lead to denial. Receipts prove mitigation costs.',
    sourceUrl: 'https://www.tdi.texas.gov/pubs/consumer/cb025.html',
  },
  {
    item: 'Receipts for additional living expenses (hotel, rental, meals) if you had to move out.',
    why: 'ALE is paid from receipts for the increase in living costs, up to the policy limit (often 10–20% of dwelling coverage per TDI).',
    sourceUrl: 'https://www.tdi.texas.gov/pubs/consumer/cb025.html',
  },
  {
    item: 'Claim log: date, time, name, and what was said on every call; get the adjuster\'s name, phone, and email.',
    why: 'TDI recommends keeping notes on every call; the log makes Texas prompt-payment deadlines usable.',
    sourceUrl: 'https://www.tdi.texas.gov/pubs/consumer/cb025.html',
  },
  {
    item: 'Be present for the adjuster inspection, ideally with your contractor; keep your policy number, claim number, and declarations page at hand.',
    why: 'TDI advises being there when the adjuster looks at the damage; your contractor can discuss estimates. If damage is worse than first thought, ask for a revised estimate.',
    sourceUrl: 'https://www.tdi.texas.gov/pubs/consumer/cb025.html',
  },
];

export interface DeductibleMathNote {
  /** Short label, e.g. 'how-it-works'. */
  topic: string;
  /** Plain-language note. */
  note: string;
  sourceUrl: string;
}

/** Deductible math and "file or pay yourself" logic, per TDI. */
export const DEDUCTIBLE_MATH: DeductibleMathNote[] = [
  {
    topic: 'how-it-works',
    note: 'A deductible is the amount of a claim you pay yourself. TDI example: a $1,000 claim with a $300 deductible means the insurer deducts $300 and pays $700. Different deductibles can apply per coverage type; check the declarations page.',
    sourceUrl: 'https://www.tdi.texas.gov/pubs/consumer/cb025.html',
  },
  {
    topic: 'file-or-pay-yourself',
    note: 'Insurer pays (covered loss) minus (deductible), up to policy/sublimits. If the covered repair cost is at or below the deductible, filing pays $0 — pay it yourself and avoid a claim on your record. Compare the estimated repair cost to the deductible before reporting.',
    sourceUrl: 'https://www.tdi.texas.gov/pubs/consumer/cb025.html',
  },
  {
    topic: 'depreciation-holdback',
    note: 'On a replacement-cost policy the insurer usually pays in two checks: first the estimated cost minus depreciation and the deductible; then the withheld depreciation after repairs are completed and the bill is submitted. You only recover the holdback by finishing the work.',
    sourceUrl: 'https://www.tdi.texas.gov/pubs/consumer/cb025.html',
  },
  {
    topic: 'claims-history-cost',
    note: 'Most insurers report claims to CLUE (Comprehensive Loss Underwriting Exchange), which shows 7 years of claims history for the person and the house; a company can charge more or refuse coverage based on it. TDI: a company may nonrenew after 3+ nonweather-related claims in 3 years (it must warn you after 2). Small claims can cost more in future premiums than they pay out.',
    sourceUrl: 'https://www.tdi.texas.gov/pubs/consumer/cb025.html',
  },
  {
    topic: 'insurer-deadlines',
    note: 'Texas law: the insurer must acknowledge the claim within 15 days, accept or deny within 15 business days of getting all the information it needs (denial in writing with reasons), and pay within 5 business days after agreeing to pay. A company needing more time can take 45 days to decide if it tells you why.',
    sourceUrl: 'https://www.tdi.texas.gov/pubs/consumer/cb025.html',
  },
  {
    topic: 'confirm-with-agent',
    note: 'Coverages vary by company. Read your policy or talk to your agent to be sure of your exact coverages, deductibles, and limits. This data is general information, not legal or insurance advice.',
    sourceUrl: 'https://www.tdi.texas.gov/pubs/consumer/cb025.html',
  },
];
