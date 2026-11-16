// DO NOT EDIT BY HAND.
// Generated from lib/utility-rules.ts + the Nov 16, 2026 utility-adjustment
// research (goals/usa-leak-detection-programmatic-seo-site/files/
// utility-adjustment-rules-2026-11-16.md).
//
// Two layers in this file:
//  1. RULES — pulled live from UTILITY_RULES by metro. The page components
//     render deadlines, percentages, frequency limits and proof lists from
//     these objects, never from hand-typed copies, so a rule can never drift
//     from the verified data file. Only VERIFIED rules are included here;
//     anything marked UNVERIFIED in the research is omitted entirely.
//  2. PAGE COPY — hand-written from the same research report: intros,
//     deadline warnings, checklists, apply steps, scope notes, caveats and
//     FAQs (50–80 words each). No invented rules, deadlines, prices or
//     reviews. A null deadline / formula in the rule means the utility does
//     not publish it (a verified absence), and the copy says so plainly.
//
// Re-check every rule against its sourceUrl before relying on a deadline or
// percentage; rules change, and the checkedDate on each rule is the last
// verification date (Nov 16, 2026 for this wave).

import { UTILITY_RULES, type UtilityRule } from "@/lib/utility-rules";

export interface AdjustmentFaq {
  q: string;
  a: string;
}

export interface AdjustmentStep {
  title: string;
  text: string;
}

export interface AdjustmentWorkedExample {
  intro: string;
  lines: string[];
  note: string;
}

export interface AdjustmentMudRow {
  name: string;
  area: string;
  terms: string;
  statusLabel: string;
  sourceUrl: string | null;
  sourceLabel: string | null;
}

export interface AdjustmentRelatedTown {
  label: string;
  path: string;
}

export interface AdjustmentCityPage {
  slug: string;
  city: string;
  utility: string;
  metro: string;
  /** Metadata title, ≤60 chars. */
  title: string;
  /** Metadata description, ≤155 chars. */
  description: string;
  intro: string;
  deadlineWarning: string;
  checklist: string[];
  steps: AdjustmentStep[];
  faqs: AdjustmentFaq[];
  /** Anchor-city scope limit: the rule covers the city itself, not the metro towns. */
  scopeNote: string;
  caveats: string[];
  /** Label for the official form / apply link. */
  formLabel: string;
  rule: UtilityRule;
  /** Town-guide route when the anchor city is one of our researched towns, else null. */
  townGuidePath: string | null;
  /** True when no written policy was found: the page leads with that
   *  honestly instead of a rule table. */
  noPolicy?: boolean;
  /** Phone to call when no published policy exists (from research notes). */
  phone?: string | null;
  /** 40-word answer box (beat-page spec point 1). */
  answerBox?: string;
  /** Worked dollar example, labelled as an example (spec point 4). */
  workedExample?: AdjustmentWorkedExample;
  /** Deadline countdown as a timeline (spec point 5). */
  deadlineTimeline?: string[];
  /** "City vs MUD" table rows — Houston only (spec point 6). Terms not
   *  in lib/utility-rules.ts are marked UNVERIFIED in the terms text. */
  mudTable?: AdjustmentMudRow[];
  /** Document pack (spec point 8). */
  documentPack?: string[];
  /** "What to do this week" checklist (spec point 9). */
  weekChecklist?: string[];
  /** Researched local context (spec point 10). */
  localContext?: string[];
  /** Ask-the-utility script — no-policy pages only. */
  askScript?: string[];
  /** Sources checked for a no-policy page (what was looked at, what
   *  was not found). */
  sourcesChecked?: string[];
  /** Related town-guide routes for internal links (spec point 14). */
  relatedTowns?: AdjustmentRelatedTown[];
}

function ruleForMetro(metro: string): UtilityRule {
  const rule = UTILITY_RULES.find((r) => r.metro === metro && r.adjustment);
  if (!rule || !rule.adjustment) {
    throw new Error(`No verified leak-adjustment rule for metro: ${metro}`);
  }
  return rule;
}

/** Like ruleForMetro, but also returns rules with adjustment === null
 *  (McAllen, Corpus Christi, Lubbock — no published water-side policy).
 *  The page renders those as "no written policy found" guides. */
function ruleForMetroOrNull(metro: string): UtilityRule {
  const rule = UTILITY_RULES.find((r) => r.metro === metro);
  if (!rule) {
    throw new Error(`No utility rule at all for metro: ${metro}`);
  }
  return rule;
}

export const ADJUSTMENT_CITIES: AdjustmentCityPage[] = [
  {
    slug: "san-antonio",
    city: "San Antonio",
    utility: "San Antonio Water System (SAWS)",
    metro: "San Antonio",
    title: "San Antonio Leak Adjustment — SAWS Rules",
    description:
      "SAWS leak adjustment in San Antonio, TX: what qualifies, the once-a-year limit, what proof to send, and where to apply. Checked Nov 16, 2026.",
    intro:
      "If a leak on your San Antonio property sent your SAWS bill soaring, SAWS may adjust a portion of the usage caused by the leak — but it publishes no percentage, no deadline, and no guarantee. It states plainly that it has no legal obligation to grant an adjustment, and will work with you only if certain conditions are met. This guide sets out exactly what SAWS does publish: what qualifies, how often you can ask, what proof to send, and where to apply — and flags the one number other sites quote that SAWS itself has not confirmed.",
    deadlineWarning:
      "SAWS publishes no application deadline. Do not treat that as unlimited time: apply as soon as the repair is complete, while the leak, the repair date, and the high bills are all fresh. Two secondary summaries mention a 60-day deadline, but that figure does not appear on SAWS's own page, so we do not present it as a rule — the safe move is to apply immediately.",
    checklist: [
      "The type and location of the leak, and a description of the repair",
      "The date the leak was repaired",
      "A licensed plumber's receipt, a receipt for plumbing supplies if you repaired it yourself, or a detailed written description of the repair — receipts are optional, but keep one anyway",
      "Your SAWS account number and the property address",
      "The bills showing the high usage, so SAWS can see the spike and the return to normal",
      "Note: SAWS does not reimburse repair costs — the adjustment covers usage only",
    ],
    steps: [
      {
        title: "Repair the leak and keep the invoice",
        text: "Fix the leak first — SAWS adjusts usage only after the repair, and only when usage drops back to normal. Keep the plumber's receipt or the receipt for the parts you bought, even though SAWS lists receipts as optional.",
      },
      {
        title: "Log in to SAWS My Account",
        text: "Go to Other Services in your SAWS My Account and open the leak adjustment request. That is the only application route SAWS publishes on its official page.",
      },
      {
        title: "Describe the leak and the repair",
        text: "Enter the type and location of the leak, what was repaired, and the date it was repaired. Attach the receipt if you have one, or write a detailed description of the repair instead.",
      },
      {
        title: "Wait for the review",
        text: "The review can take up to 30 days, and SAWS places your account on hold while it reviews the request. If you prefer to talk first, SAWS customer service is at 210-704-SAWS (7297).",
      },
      {
        title: "Check the next bills",
        text: "Confirm the credit appears and that usage has returned to normal. The adjustment covers up to two months of leak usage, once every 12 months.",
      },
    ],
    faqs: [
      {
        q: "Does SAWS give a leak adjustment for a high water bill?",
        a: "Yes. SAWS will consider a reasonable adjustment when a leak on your property has been repaired, even though it says it has no legal obligation to grant one. Eligible leaks include broken pipes, toilet and faucet leaks, shower heads, irrigation main-line breaks, pressure-reducing valves, and pool supply-line leaks. Irrigation problems caused by controller settings or watering too often do not qualify. The adjustment covers up to two months of leak usage, and only once every 12 months.",
      },
      {
        q: "How much of my SAWS bill will the leak adjustment cover?",
        a: "SAWS does not publish a percentage or a formula. Its page says only that it will adjust a portion of the usage caused by the leak, so the credit is decided case by case. What is published is the scope: up to two months of leak usage, once every 12 months, and only after usage has dropped back to normal following the repair. Keep your repair receipt anyway.",
      },
      {
        q: "Is there a deadline to apply for a SAWS leak adjustment?",
        a: "SAWS does not state a deadline on its official leak-adjustment page, so there is no published number of days to count from the repair date. Two secondary summaries mention 60 days from the repair, but SAWS itself has not confirmed that figure, so we do not treat it as a rule. The safe approach is to apply as soon as the repair is finished, through SAWS My Account, while the repair date and the high bills are easy to document.",
      },
      {
        q: "How often can I get a SAWS leak adjustment?",
        a: "Once every 12 months, according to SAWS's leak-source page. Each adjustment covers up to two months of leak usage, and SAWS requires usage to fall back to normal after the repair before it will adjust anything. Because the limit is once a year, it is worth claiming the full two months in one request rather than asking for one month now and hoping for a second request later.",
      },
      {
        q: "What proof does SAWS need for a leak adjustment?",
        a: "SAWS asks for the type and location of the leak, a description of the repair, and the date it was repaired. Receipts are optional: a licensed plumber's receipt, a receipt for plumbing supplies if you fixed it yourself, or a detailed written description of the repair are all accepted. SAWS does not reimburse the cost of the repair itself — the adjustment covers water usage only, not what you paid the plumber.",
      },
      {
        q: "How do I apply for a SAWS leak adjustment?",
        a: "Log in to SAWS My Account, go to Other Services, and submit the leak adjustment request there. The review can take up to 30 days, and SAWS places your account on hold while it reviews the request. If you prefer to talk first, SAWS customer service is at 210-704-SAWS (7297). Apply soon after the repair — SAWS publishes no deadline, so an early application is the only safe timing.",
      },
    ],
    scopeNote:
      "SAWS serves San Antonio itself. The ten towns in our San Antonio metro — New Braunfels, Boerne, Schertz, Cibolo, Converse, Universal City, Live Oak, Leon Valley, Alamo Heights, and Selma — run their own water systems, so this rule does not cover them. If your bill names a different utility, that utility's rule applies, not SAWS's.",
    caveats: [
      "SAWS states it has no legal obligation to grant an adjustment.",
      "No deadline is published on the official page — a 60-day deadline reported by secondary summaries is unverified.",
      "Whether the adjustment corrects the winter sewer average is unverified.",
    ],
    formLabel: "SAWS leak adjustment request (My Account)",
    rule: ruleForMetro("San Antonio"),
    townGuidePath: null,
  },
  {
    slug: "austin",
    city: "Austin",
    utility: "Austin Water",
    metro: "Austin",
    title: "Austin Leak Adjustment — Austin Water Rules",
    description:
      "Austin Water leak adjustment: 50% of excess usage, 90-day deadline, once a year. What proof to send, and how to apply. Checked Nov 16, 2026.",
    intro:
      "Austin Water will adjust a water bill hit by a hidden or uncontrollable leak — 50% of the usage above your normal use, under a 2011 City Council resolution. The catch is that the current city page states the 90-day deadline and the proof list, but does not restate the 50% figure, the once-a-year limit, or the two-billing-cycle cap. This guide gives you the full rule from the resolution and the current page, so you can apply with the right documents inside the deadline.",
    deadlineWarning:
      "Apply within 90 days of the leak repair. That deadline is stated on the city's high-water-bill options page under City Code 15-9-141 — count from the repair date, not the bill date. Gather the repair receipt, your account number, the property address, and the date range of the high-bill charges, and send them in as soon as the repair is done.",
    checklist: [
      "A copy of the leak repair receipt or paid invoice describing the repair",
      "Your Austin Water account number and the property address",
      "The date range of the high-bill charges",
      "The date the repair was completed and a description of what was repaired",
      "Evidence the leak was hidden or outside your control — a broken pipe or an underground break qualifies; a dripping faucet or broken sprinkler head does not",
    ],
    steps: [
      {
        title: "Repair the leak and get the invoice",
        text: "Fix the leak first and get a paid invoice that describes the repair. The invoice is the core document Austin Water asks for — a verbal account of the repair is not a substitute.",
      },
      {
        title: "Gather the five items",
        text: "Collect the repair receipt or paid invoice, your account number, the property address, the date range of the high-bill charges, and the repair date and description. Missing any one of these slows the review.",
      },
      {
        title: "Email or fax the documents",
        text: "Send everything to customercare@coautilities.com or fax it to 512-505-4035. Keep a copy of what you sent, including the email or fax confirmation.",
      },
      {
        title: "Wait for the decision",
        text: "Austin Water reviews the request against City Code 15-9-141 and the 2011 resolution. The credit, if granted, is 50% of the excess usage for up to two billing cycles.",
      },
      {
        title: "Know the trade-off",
        text: "Customers who receive a leak adjustment may not request an administrative hearing under Chapter 15, Article 12 for the same billing period. That is the city's stated condition — read it before you accept the credit.",
      },
    ],
    faqs: [
      {
        q: "What leaks qualify for an Austin Water bill adjustment?",
        a: "Indoor plumbing leaks that are not within your control — such as a broken water pipe or a leak you could not see — and hidden outdoor leaks, for example an underground break in the main water line to the house. Visible leaks do not qualify: a dripping faucet, a broken sprinkler head, a pool crack, or a malfunctioning pool autofiller. Austin Water staff can grant an exception, but the starting rule is that visible leaks are excluded.",
      },
      {
        q: "How much will Austin Water credit for a leak?",
        a: "Fifty percent of the excess usage — the water used above your normal usage — under City Council Resolution No. 20110512-003 from 2011. You pay the remaining 50% at the lower of the regular rate or an established discounted rate. One caution: the current city high-bill page does not restate the 50% figure, so the percentage rests on the resolution, not on the page you apply from. The credit covers up to two billing cycles.",
      },
      {
        q: "How long do I have to apply for an Austin leak adjustment?",
        a: "Within 90 days of the leak repair. That deadline is stated on the city's high-water-bill options page under City Code 15-9-141, so it is the firmest number in the Austin rule. Do not wait for the next bill to arrive before starting: gather the repair receipt, your account number, the property address, and the date range of the high-bill charges, and send them in as soon as the repair is done.",
      },
      {
        q: "How often can I get an Austin Water leak adjustment?",
        a: "One leak adjustment in a 12-month period, under the 2011 resolution — and you are not eligible again until 12 months after the prior credit was applied. The adjustment covers up to two billing cycles affected by the leak. If a second leak hits inside that year, the resolution gives no second credit, so the timing of the first request matters: claim every billing cycle the leak touched.",
      },
      {
        q: "What documents does Austin Water need?",
        a: "A copy of the leak repair receipt or paid invoice that describes the repair, your account number, the property address, the date range of the high-bill charges, and the date and description of the repair. Send the documents by email to customercare@coautilities.com or by fax to 512-505-4035. Keep a copy of everything you send, including the email or fax confirmation, in case the city asks for it again.",
      },
      {
        q: "Does an Austin leak adjustment fix my sewer average too?",
        a: "That is not confirmed. Austin sets your wastewater charge from a winter average — three consecutive billing periods between mid-November and mid-March — and the average then fixes your monthly wastewater fee for the next 12 months. No city page we read says whether a leak adjustment corrects that average. If your leak fell in the averaging months, ask Austin Water directly whether the wastewater average will be corrected.",
      },
    ],
    scopeNote:
      "Austin Water serves Austin itself. The ten towns in our Austin metro — Round Rock, Cedar Park, Pflugerville, Georgetown, Leander, Kyle, Buda, San Marcos, and Dripping Springs — run their own systems, and Lakeway is served by Lakeway MUD. This rule does not cover them. Brushy Creek MUD, in the Round Rock area, has its own wastewater-average adjustment — see the MUD explainer.",
    caveats: [
      "The 50% credit, once-per-12-months limit, and two-billing-cycle cap come from Council Resolution No. 20110512-003 (2011) — the current city page does not restate them.",
      "Whether the adjustment corrects the wastewater average is unverified.",
      "Customers who receive a leak adjustment may not request an administrative hearing under Chapter 15, Article 12 for the same billing period.",
    ],
    answerBox:
      "Austin Water credits 50% of the usage above your normal use for a hidden leak, under a 2011 City Council resolution. File within 90 days of the repair — that deadline is stated on the city's high-water-bill page.",
    workedExample: {
      intro:
        "Example only — a sample bill run through the real rule. Normal month 8,000 gallons; leak month 35,000 gallons; excess 27,000 gallons. The dollar figures assume an illustrative rate of $5.00 per 1,000 gallons — not Austin Water's actual rate — so the excess water charge is 27 × $5.00 = $135.00. Your bill's rate will differ; the checker above uses your real numbers.",
      lines: [
        "Credit at 50% of the excess usage: 50% × $135.00 = $67.50.",
        "You pay the remaining 50% — $67.50 — at the lower of the regular rate or an established discounted rate.",
        "Covers up to two billing cycles, once per 12 months.",
      ],
      note: "The 50% figure comes from Council Resolution No. 20110512-003 (2011); the current city high-bill page does not restate it.",
    },
    deadlineTimeline: [
      "Day 0 — the leak is repaired. The 90-day clock starts now, not on the bill date.",
      "Within 90 days — file with the repair receipt, account number, address, and the date range of the high-bill charges.",
      "Credit — 50% of the excess usage, up to two billing cycles.",
      "Once per 12 months — you are not eligible again until 12 months after the prior credit was applied.",
    ],
    formLabel: "Austin high-water-bill options page (City Code 15-9-141)",
    rule: ruleForMetro("Austin"),
    townGuidePath: null,
  },
  {
    slug: "fort-worth",
    city: "Fort Worth",
    utility: "City of Fort Worth Water",
    metro: "Fort Worth",
    title: "Fort Worth Leak Adjustment | Real Leak Detection",
    description:
      "Fort Worth Water leak adjustment: 50% of excess use, 60-day deadline, once a year. Rule rests on a 2021 form copy — re-verify first. Checked Nov 16, 2026.",
    intro:
      "The City of Fort Worth Water will credit 50% of the water use above your average when a residential leak is repaired and usage returns to normal — but read the caveat first: no live city page for this program was found. The rule below rests on a copy of the city's March 2021 application form, corroborated by the City of Denton's official benchmarking review, and all three sources agree on every term. Re-verify the rule on a live city page before you apply.",
    deadlineWarning:
      "Submit the signed application within 60 days of the repairs being completed. That deadline comes from the city's March 2021 application form, corroborated by the City of Denton's official benchmarking review — and all sources agree on it. Because no live city page was found, check the current form before you count on the 60 days. The clock runs from the completion of the repairs, not from the bill date.",
    checklist: [
      "The signed Water Leak Repair Adjustment Application",
      "Copies of repair receipts or a paid-in-full invoice",
      "Your water account number and the property address",
      "Expect the city to check that usage returned to normal — it can take up to two billing cycles to confirm all leaks are repaired",
    ],
    steps: [
      {
        title: "Re-verify the rule first",
        text: "No live fortworthtexas.gov leak-adjustment page was found in our research, so check the city's current site or call 817-392-4477 before you rely on the terms below. The rule rests on a March 2021 form copy plus the City of Denton's official benchmark.",
      },
      {
        title: "Repair the leak and keep the receipts",
        text: "Fix the leak and keep the repair receipts or a paid-in-full invoice. Without a receipt, the city has nothing to tie the repair date and cost to your account.",
      },
      {
        title: "Fill in and sign the application",
        text: "Complete the Water Leak Repair Adjustment Application and sign it. The signed application plus the receipts are the whole proof list on the city's form.",
      },
      {
        title: "Email or mail it within 60 days",
        text: "Send the signed application and receipts to MyWaterAccount@FortWorthTexas.gov, or mail them to Fort Worth Water Utility. The 60-day clock runs from the completion of the repairs.",
      },
      {
        title: "Allow up to two billing cycles",
        text: "It may take up to two billing cycles after the repair for the city to determine whether all leaks are repaired, so do not expect an instant decision.",
      },
    ],
    faqs: [
      {
        q: "Does Fort Worth Water offer a leak adjustment?",
        a: "Yes, for single-family residential accountholders whose leak is repaired and whose usage returns to normal afterward. City guidance indicates a hidden leak beneath a foundation or inside a wall may qualify. The credit is 50% of the difference above your average water use, worked out from the six months before the leak. One warning: no live city page for this program was found, so re-verify the rule on a live city page before you apply.",
      },
      {
        q: "How much is the Fort Worth leak adjustment worth?",
        a: "Fifty percent of the water use above your average — the average being set from the six months of usage before the leak, or from prior years' usage for the same period where the season matters. The adjustment covers up to two consecutive billing periods and applies to water only, not sewer. It is a credit against the excess usage, not a refund of the repair: you still pay the plumber, and the city credits part of the water charge.",
      },
      {
        q: "What is the deadline for a Fort Worth leak adjustment?",
        a: "Submit the signed application within 60 days of the repairs being completed. That deadline comes from the city's March 2021 application form, corroborated by the City of Denton's official benchmarking review, and all sources agree on it. Because no live city page was found, check the current form before you count on the 60 days — and do not wait: the clock runs from the completion of the repairs, not from the bill date.",
      },
      {
        q: "How often can I claim a Fort Worth leak adjustment?",
        a: "One adjustment per rolling 12-month period. The limit is stated on the city's application form and confirmed by the City of Denton's official benchmark, which describes it as one adjustment per year. Each adjustment covers up to two consecutive billing periods. If a second leak happens inside the same 12 months, there is no second credit under this rule, so claim both billing periods the leak touched in a single application.",
      },
      {
        q: "What proof does Fort Worth Water require?",
        a: "A signed application plus copies of your repair receipts or a paid-in-full invoice. That is the whole proof list on the city's form: no plumber's statement template, no sworn declaration, just the signed application and the receipts. Keep the paid-in-full invoice even if the work was small — without a receipt, the city has nothing to tie the repair date and cost to your account. Expect the city to check that usage returned to normal.",
      },
      {
        q: "How do I apply for a Fort Worth leak adjustment?",
        a: "Email the signed application and your receipts to MyWaterAccount@FortWorthTexas.gov, or mail them to Fort Worth Water Utility. You can also call 817-392-4477 with questions. It may take up to two billing cycles after the repair for the city to determine whether all leaks are repaired, so do not expect an instant decision. And before you send anything, re-verify the rule on a live city page — this guide's rule rests on a 2021 form copy.",
      },
    ],
    scopeNote:
      "Fort Worth Water serves Fort Worth itself. The ten towns in our Fort Worth metro — Arlington, Mansfield, Grand Prairie, North Richland Hills, Keller, Southlake, Grapevine, Bedford, Euless, and Burleson — run their own systems. Burleson buys treated water wholesale from Fort Worth, but its retail provider is the City of Burleson. This rule does not cover them.",
    caveats: [
      "No live fortworthtexas.gov leak-adjustment page was found — re-verify against a live city page before applying.",
      "Re-checked Nov 16, 2026: a search of fortworthtexas.gov still surfaced no live leak-adjustment page — only a SmartRepair program for minor visible leaks, which is a different program.",
      "The rule rests on a copy of the city's March 2021 application form, corroborated by the City of Denton's official Aug 2025 benchmark.",
      "The adjustment applies to water only, not sewer — a winter leak still inflates the winter quarter average.",
    ],
    answerBox:
      "Fort Worth Water credits 50% of the water use above your six-month average for a repaired residential leak. File the signed application within 60 days of the repair — but re-verify the rule first: it rests on a 2021 form copy.",
    workedExample: {
      intro:
        "Example only — a sample bill run through the real rule. Normal month 8,000 gallons; leak month 35,000 gallons; excess 27,000 gallons. The dollar figures assume an illustrative rate of $5.00 per 1,000 gallons — not Fort Worth Water's actual rate — so the excess water charge is 27 × $5.00 = $135.00. Your bill's rate will differ; the checker above uses your real numbers.",
      lines: [
        "Credit at 50% of the difference above your average: 50% × $135.00 = $67.50.",
        "Covers up to two consecutive billing periods, once per rolling 12 months.",
        "Water only — not sewer. A December–February leak still inflates the winter quarter average.",
      ],
      note: "Rule rests on a copy of the city's March 2021 application form — re-verify on a live city page before you apply (re-checked Nov 16, 2026: no live fortworthtexas.gov leak-adjustment page was found).",
    },
    deadlineTimeline: [
      "Day 0 — repairs completed. The 60-day clock starts now, not on the bill date.",
      "Within 60 days — send the signed application plus repair receipts to MyWaterAccount@FortWorthTexas.gov.",
      "Allow up to two billing cycles for the city to confirm usage returned to normal.",
      "Once per rolling 12 months — one adjustment per year, up to two consecutive billing periods.",
      "Re-verify first — no live city page was found; this rule rests on a March 2021 form copy (re-checked Nov 16, 2026).",
    ],
    formLabel: "Fort Worth Water Leak Repair Adjustment Application (form copy, Mar 2021)",
    rule: ruleForMetro("Fort Worth"),
    townGuidePath: null,
  },
  {
    slug: "el-paso",
    city: "El Paso",
    utility: "El Paso Water",
    metro: "El Paso",
    title: "El Paso Leak Adjustment — El Paso Water Rules",
    description:
      "El Paso Water leak adjustment: 50% of excess use, 60-day deadline, once every 24 months, plus the ServLine program up to $2,500. Checked Nov 16, 2026.",
    intro:
      "El Paso Water credits 50% of the excess water use from a hidden leak — and its ServLine Leak Protection Program can cover the two highest bills in a three-month span up to $2,500. The trade-off is the strictest frequency limit in Texas: one adjustment in a rolling 24 months. This guide covers both routes, the 60-day deadline, the 10 CCF threshold, and what disqualifies you.",
    deadlineWarning:
      "Submit your email request within 60 days of the repair. That deadline is stated on EPWater's own leak-adjustment page — count from the repair date, not the bill date. The utility also verifies that your consumption has dropped back to normal in the month after the repair, so keep the repair receipt and watch the next meter reading.",
    checklist: [
      "Receipts for the repair, or a written statement of the repairs made",
      "Your EPWater account number and the property address",
      "The repair date — the 60-day clock runs from it",
      "Evidence that usage dropped back to normal in the month after the repair — the utility checks this",
      "Your ServLine enrolment status, if you are claiming through the ServLine program (auto-enrolled; $1.59 a month residential)",
    ],
    steps: [
      {
        title: "Repair the leak and watch the next reading",
        text: "Fix the hidden leak, keep the receipts or a written statement of the repairs, and confirm your consumption drops back to normal in the month after the repair — EPWater verifies that before it credits anything.",
      },
      {
        title: "Check the disqualifiers",
        text: "You do not qualify if you filled a swimming pool or established new landscaping during the high-volume period, or if you received a leak adjustment in the previous 24 months.",
      },
      {
        title: "Call ServLine or use the form",
        text: "Call ServLine at 915-273-3999 or fill out the leak adjustment request form linked from the EPWater leak-adjustment page. ServLine covers the two highest bills in a three-month span up to $2,500.",
      },
      {
        title: "Send the repair evidence",
        text: "Provide the receipts or the statement of repairs, plus your account number and the repair date. Customers with meters larger than 2 inches are eligible for a direct 50% utility adjustment instead of the ServLine route.",
      },
      {
        title: "Wait for the credit",
        text: "The credit is typically applied within 5 to 15 business days of approval. It covers the water portion of the bill only — not wastewater, stormwater, or environmental services fees.",
      },
    ],
    faqs: [
      {
        q: "What qualifies for an El Paso Water leak adjustment?",
        a: "A hidden leak — behind a wall, underground, or under the foundation — that pushes your consumption more than 10 CCF above normal. It does not qualify if you filled a swimming pool or established new landscaping during the high-volume period, or if you received a leak adjustment in the previous 24 months. The adjustment covers the water portion of the bill only, not wastewater, stormwater, or environmental services fees.",
      },
      {
        q: "How much will El Paso Water credit for a hidden leak?",
        a: "Fifty percent of the excess above your baseline. Under Rules and Regulations No. 5, the excess is the two highest consecutive months affected, less the average water charges billed over the previous 12 months. Through the ServLine program, the two highest bills in a three-month span are covered up to $2,500, and if the excess goes beyond $2,500 the utility may credit 50% of the remaining balance.",
      },
      {
        q: "How long do I have to request an El Paso leak adjustment?",
        a: "Submit your email request within 60 days of the repair. That deadline is stated on EPWater's own leak-adjustment page, so count from the repair date, not the bill date. The utility also verifies that your consumption has dropped back to normal in the month after the repair, so keep the repair receipt and watch the next meter reading. Credits are typically applied within five to 15 business days of approval.",
      },
      {
        q: "How often can I get an El Paso leak adjustment?",
        a: "One adjustment in a rolling 24-month period — the strictest frequency limit of any Texas utility we verified. If you had a leak adjustment in the previous 24 months, a new leak does not qualify at all, and a pool fill or new landscaping in the high-volume period also disqualifies you. The adjustment covers a maximum of two consecutive monthly bills, or the two highest bills in a three-month span under ServLine.",
      },
      {
        q: "What is the ServLine Leak Protection Program?",
        a: "ServLine is EPWater's leak protection program: residential customers are auto-enrolled and pay $1.59 a month, or $2.31 a month for non-residential single-occupancy accounts, and can opt out through HomeServe. It covers the two highest-consumption bills in a three-month span up to $2,500. To claim, call ServLine at 915-273-3999 or fill out the leak adjustment request form linked from the EPWater leak-adjustment page.",
      },
      {
        q: "Does the El Paso adjustment cover my sewer bill?",
        a: "No. EPWater states the adjustment applies to the water portion only and does not impact wastewater. That matters in winter: El Paso sets sewer charges from the Average Winter Consumption for December, January, and February, with sewer charged at 90% of that average above a five CCF allowance. A leak in those months inflates the average, and the leak adjustment will not correct it.",
      },
    ],
    scopeNote:
      "El Paso Water serves the City of El Paso itself — and El Paso is one of our researched towns. The other El Paso-metro towns have their own providers: Socorro, San Elizario, Clint, and Fabens are served by the Lower Valley Water District, Horizon City has its own MUD, and Anthony has its own district. This rule covers El Paso addresses on EPWater only.",
    caveats: [
      "EPWater's own pages describe the 50% baseline differently — the FAQ says “same months last year”, the program page says the average over the previous twelve months; Rules and Regulations No. 5 uses the 12-month average.",
      "The adjustment covers the water portion only — not wastewater, stormwater, or environmental services fees.",
      "A December–February leak inflates the Average Winter Consumption, because the adjustment does not touch wastewater.",
    ],
    answerBox:
      "El Paso Water credits 50% of the excess water use from a hidden leak, and the ServLine program can cover the two highest bills up to $2,500. File within 60 days of the repair; only one adjustment per 24 months.",
    workedExample: {
      intro:
        "Example only — a sample bill run through the real rule. Normal month 8,000 gallons; leak month 35,000 gallons; excess 27,000 gallons. The dollar figures assume an illustrative rate of $5.00 per 1,000 gallons — not El Paso Water's actual rate — so the excess water charge is 27 × $5.00 = $135.00. Your bill's rate will differ; the checker above uses your real numbers.",
      lines: [
        "Threshold check: excess 27,000 gallons is more than 10 CCF (7,480 gallons), so the leak clears El Paso's threshold.",
        "Credit at 50% of the excess above baseline: 50% × $135.00 = $67.50.",
        "ServLine alternative: the two highest bills in a three-month span are covered up to $2,500; beyond $2,500 the utility may credit 50% of the remaining balance.",
      ],
      note: "Applies to the water portion only — not wastewater, stormwater, or environmental services fees.",
    },
    deadlineTimeline: [
      "Day 0 — the hidden leak is repaired. The 60-day clock starts now, not on the bill date.",
      "Within 60 days — send the email request with receipts or a statement of repairs.",
      "The utility verifies consumption dropped back to normal in the month after the repair.",
      "Credit — 50% of the excess above baseline; typically applied within 5 to 15 business days of approval.",
      "Once per rolling 24 months — the strictest limit of any Texas utility we verified.",
    ],
    formLabel: "EPWater leak adjustment page",
    rule: ruleForMetro("El Paso"),
    townGuidePath: "/tx/el-paso/el-paso/",
  },
  {
    slug: "amarillo",
    city: "Amarillo",
    utility: "City of Amarillo Water",
    metro: "Amarillo",
    title: "Amarillo Leak Adjustment — City Water Rules",
    description:
      "Amarillo Water leak adjustment: 50,000-gallon threshold, two highest bills, once every two years. No % or deadline published. Checked Nov 16, 2026.",
    intro:
      "The City of Amarillo Water grants a leak adjustment when a leak pushes your use more than 50,000 gallons above your 12-month average — but it publishes no percentage and no deadline. The credit, the timing, and the one-every-two-years limit are set out below from the city's own utility billing page, along with the high-consumption adjustment you can ask about if a full leak adjustment is not available.",
    deadlineWarning:
      "No deadline is published on the city's utility billing page, so there is no official number of days to count from the repair. Do not treat that as unlimited time: apply as soon as the repair is complete and the high bills are in hand. Apply through a General Customer Service Request in the PayAMA portal, or by calling Utility Billing at 806-378-3030.",
    checklist: [
      "Documentation of the leak repair — a plumber's receipt, or the receipt for the part you bought to repair the leak",
      "Your Amarillo utility billing account number and the property address",
      "The bills showing use more than 50,000 gallons above your 12-month average",
      "If you had an adjustment in the past two years, ask instead about the high-consumption adjustment (once per year, up to two billing periods)",
    ],
    steps: [
      {
        title: "Repair the leak and keep the receipt",
        text: "Fix the leak and keep the plumber's receipt, or the receipt for the part you bought to repair it. That receipt is the full proof list on the city's page — without it, the city cannot tie the repair to the high usage.",
      },
      {
        title: "Check the threshold",
        text: "The leak must have pushed your consumption more than 50,000 gallons above your 12-month average. That is the qualifying test on the city's page, and the adjustment may be allowed for the two highest bills.",
      },
      {
        title: "Submit a General Customer Service Request",
        text: "Apply through the PayAMA online portal, or contact Utility Billing at 806-378-3030 or waterbill@amarillo.gov. There is no separate leak-adjustment form published — the request goes through the general customer service route.",
      },
      {
        title: "Ask about the fallback if you do not qualify",
        text: "If a full leak adjustment cannot be applied — because you had one in the past two years, or the criteria are not met — a high-consumption adjustment may be considered instead, once per year, for up to two billing periods.",
      },
    ],
    faqs: [
      {
        q: "Does Amarillo Water offer a leak adjustment?",
        a: "Yes, for residential and commercial customers. The leak must push your consumption more than 50,000 gallons above your 12-month average — that threshold is the whole qualifying test on the city's utility billing page. Commercial customers use the same 50,000-gallon threshold, but commercial adjustments are sewer only. The adjustment may be allowed for the two highest bills, and only one adjustment is allowed every two years.",
      },
      {
        q: "How much will Amarillo credit for a leak?",
        a: "The city does not publish a percentage or a formula, so there is no number to calculate in advance — that is a verified absence on the official page, not a gap in this guide. What the page does publish is the threshold of more than 50,000 gallons above your 12-month average, the two-highest-bills scope, and the one-every-two-years limit. Apply with the repair documentation and let the city determine the credit.",
      },
      {
        q: "Is there a deadline to apply in Amarillo?",
        a: "No deadline is published on the city's utility billing page, so there is no official number of days to count from the repair. Because no deadline is stated, the safe move is to apply as soon as the repair is complete and the high bills are in hand — through a General Customer Service Request in the PayAMA portal, or by calling Utility Billing at 806-378-3030. Do not wait for the next billing cycle.",
      },
      {
        q: "How often can I get an Amarillo leak adjustment?",
        a: "Only one adjustment every two years. That is the longest gap of any Texas utility we verified, alongside El Paso's 24-month limit. If a full leak adjustment cannot be applied — because you had one in the past two years, or the criteria are not met — a high-consumption adjustment may be considered instead, once per year, for up to two billing periods. Ask Utility Billing about that fallback when you apply.",
      },
      {
        q: "What proof does Amarillo Water need?",
        a: "Documentation of the leak repair: a plumber's receipt, or the receipt for the part you bought to repair the leak. That is the full proof list on the city's page — keep whichever receipt you have, because without it the city cannot tie the repair to the high usage. Submit it with a General Customer Service Request through the PayAMA online portal, or contact Utility Billing at 806-378-3030 or waterbill@amarillo.gov.",
      },
      {
        q: "Does an Amarillo leak adjustment fix my winter sewer average?",
        a: "That is not confirmed. Amarillo sets sewer charges from a winter average of December, January, and February usage, recalculated each March, with a citywide average of 8,000 gallons and new accounts temporarily set at the same figure. The utility billing page does not say whether a leak adjustment corrects that average. If your leak fell in December, January, or February, ask Utility Billing directly whether the sewer average will be corrected.",
      },
    ],
    scopeNote:
      "City of Amarillo Water serves Amarillo itself — and Amarillo is one of our researched towns. The other Amarillo-metro towns — Canyon, Hereford, Dumas, Borger, Pampa, Dalhart, Perryton, Tulia, and Fritch — run their own municipal systems. This rule covers Amarillo addresses only.",
    caveats: [
      "No percentage, formula, or deadline is published on the official page — those are verified absences, not unknowns.",
      "Whether a leak adjustment corrects the winter average is unverified.",
      "Commercial adjustments use the same 50,000-gallon threshold but are sewer only.",
    ],
    formLabel: "City of Amarillo Utility Billing page",
    rule: ruleForMetro("Amarillo"),
    townGuidePath: "/tx/amarillo/amarillo/",
  },
  {
    slug: "houston",
    city: "Houston",
    utility: "City of Houston Water (Houston Public Works)",
    metro: "Houston",
    title: "Houston Leak Adjustment — Houston Water Rules",
    description:
      "Houston leak adjustment: 100/75/50% credit tiers, 6-month deadline, up to 3 months — plus MUD rules, worked example, and checker. Checked Nov 16, 2026.",
    intro:
      "A hidden leak in Houston can earn the most generous credit in Texas — 100% of the water charge on the usage above your average, if the leak is repaired within 30 days. The tiers fall fast after that (75% within 60 days, 50% after), and the application must reach the city within 6 months of the repair. This guide gives you the full rule from the city's own form, a worked dollar example, the deadline timeline, and — the part no other guide covers — the MUD rules that apply instead if your home is on MUD water.",
    deadlineWarning:
      "Apply within 6 months of the repair date — and repair fast: 100% of the excess water charge is credited if the repair is made within 30 days of the leak start, 75% within 60 days, 50% after 60 days. The tiers count from the leak start date or the leak notification date, not the bill date. File through the city's Universal Adjustment Request form as soon as the repair is done.",
    checklist: [
      "Documentation of the repair date, address, type of repair, and cost — a plumber's statement or bill, a receipt for parts, or a signed written statement",
      "Your Houston water account number and the property address",
      "The high bill date and the bills showing the spike and the return to normal",
      "Before-and-after meter photos, if you have them — the repair date is what the tiers turn on",
      "Note: submit the request only after the leak is repaired — the form says so plainly",
    ],
    steps: [
      {
        title: "Repair the leak and note the start date",
        text: "Fix the leak and write down when it started — or when you were notified about it. The 100/75/50% tiers count from the leak start date or the leak notification date, so the start date decides your tier.",
      },
      {
        title: "Gather the repair documentation",
        text: "Collect the plumber's statement or bill, a receipt for parts, or a signed written statement — any of the three is accepted — showing the repair date, the address, the type of repair, and the cost.",
      },
      {
        title: "Open the Universal Adjustment Request form",
        text: "Choose the leak-adjustment path on the city's Universal Adjustment Request page and enter the billing account holder name, account number, street number, ZIP code, phone, and email.",
      },
      {
        title: "Upload the repair document and file",
        text: "Attach the repair document (JPG, GIF, or PNG up to 4MB, or a Word or PDF file) and submit within 6 months of the repair date. Keep a copy of everything you submit, including the confirmation.",
      },
      {
        title: "Keep paying your typical bill during the review",
        text: "The city's form page states no processing time, so no number is promised here. Keep paying at least your typical bill amount while the request is reviewed, and check that the credit appears on a later bill.",
      },
    ],
    faqs: [
      {
        q: "Do toilet or faucet leaks qualify for a Houston leak adjustment?",
        a: "No. Houston's rule covers loss through an “excusable defect” — rupture or leakage caused by weather, settlement, corrosion, wear, or accident. Visible leaks such as faucet and hose leaks are ineligible, and toilets are not named as qualifying. If your high bill came from a running toilet or dripping faucet, the adjustment will not cover it — fix the fixture, then check the Unusually Large Bill program instead.",
      },
      {
        q: "How much will Houston credit for a leak?",
        a: "It depends on repair speed: 100% of the water charge on usage above your average if repaired within 30 days of the leak start or notification date, 75% within 60 days, 50% after 60 days. The credit covers water and wastewater for up to three consecutive months within a 12-month period. The worked example below runs a sample bill through all three tiers so you can see the dollars.",
      },
      {
        q: "What is the deadline to apply in Houston?",
        a: "Within 6 months of the repair date, under Code Sec. 47-74. The clock runs from the repair, not the bill — and the repair-speed tiers make early repair worth real money: repairing within 30 days doubles the credit versus repairing after 60 days. File through the city's Universal Adjustment Request form as soon as the repair is done and the high bill is in hand.",
      },
      {
        q: "How long does a Houston leak adjustment take?",
        a: "The city's form page does not state a processing time, so we cannot give you a number — that is unverified, not a gap in this guide. File promptly, keep paying your typical bill amount during the review, and keep the repair documentation until the credit appears. If the wait stretches on, call Houston Public Works with your request reference and ask for a status update.",
      },
      {
        q: "Can I get a second Houston leak adjustment?",
        a: "The leak-adjustment rule allows up to three consecutive months within a 12-month period, but no frequency limit for repeat adjustments is published on the form page — so we do not state one. If your case was not a leak but unexplained high use, two fallback programs exist: the Unusually Large Bill credit (one month, once a year, use over 200% of average) and the Exceptional Circumstance Adjustment (up to two bills in 24 months, capped at $10,000).",
      },
      {
        q: "Does the Houston adjustment cover my sewer bill?",
        a: "Yes — the leak adjustment under Sec. 47-74 is a water/wastewater credit, so the sewer portion of the leaked usage is credited too. That is better than Dallas, Austin, or Fort Worth, where the adjustment is water-only. And because Houston bills wastewater on monthly metered water with no winter averaging, a leak cannot inflate a future sewer average — there is no 12-month sewer tail to worry about here.",
      },
      {
        q: "What if my home is on MUD water, not City of Houston water?",
        a: "Then the City of Houston's rules do not apply to you at all — your MUD's board sets its own rule, deadline, and proof list. Check your bill for the district name, then read its policy: Harris County MUD 71 credits excess usage at half rate with a 3-month deadline, and MUD 501 requires Eye On Water registration with a 6-month deadline. The MUD table below and the MUD directory list what is verified for each district.",
      },
      {
        q: "What proof does Houston ask for?",
        a: "Documentation of the repair date, address, type of repair, and cost. Houston accepts a plumber's statement or bill, a receipt for parts, or a signed written statement — upload it with the Universal Adjustment Request form (JPG, GIF, or PNG up to 4MB, or a Word or PDF document). Keep a copy of everything you submit, including the confirmation, until the credit shows on your bill.",
      },
    ],
    scopeNote:
      "City of Houston Water serves Houston itself. The ten towns in our Houston metro — Katy, Sugar Land, The Woodlands, Pearland, Cypress, Spring, Pasadena, League City, Conroe, and Humble — run their own city systems or MUDs, so this rule does not cover them. If your bill names a MUD, that district's rule applies, not the city's.",
    caveats: [
      "Processing time is not stated on the city's form page — UNVERIFIED. Do not plan around a number no official source gives.",
      "The 100/75/50% tiers count from the leak start date or the leak notification date — not from the bill date or the repair date.",
      "No frequency limit for repeat leak adjustments is published on the form page — the rule states up to three consecutive months within a 12-month period.",
      "The Unusually Large Bill and Exceptional Circumstance programs on the same form have their own limits (one month per year; up to two bills in 24 months capped at $10,000).",
    ],
    formLabel: "Houston Universal Adjustment Request (official form)",
    rule: ruleForMetro("Houston"),
    townGuidePath: null,
    answerBox:
      "Houston Public Works credits up to 100% of the water charge on usage above your average when a leak is repaired within 30 days — 75% within 60 days, 50% after. You must apply within 6 months of the repair date.",
    workedExample: {
      intro:
        "Example only — a sample bill run through the real rule. Normal month 8,000 gallons; leak month 35,000 gallons; excess 27,000 gallons. The dollar figures assume an illustrative rate of $5.00 per 1,000 gallons — not Houston's actual rate, which changes — so the excess water charge is 27 × $5.00 = $135.00. Your bill's rate will differ; the checker above uses your real numbers.",
      lines: [
        "Repaired within 30 days of the leak start: 100% tier — $135.00 credited on the water charge.",
        "Repaired within 60 days: 75% tier — $101.25 credited.",
        "Repaired after 60 days: 50% tier — $67.50 credited.",
        "The credit covers water and wastewater under Sec. 47-74, for up to three consecutive months within a 12-month period — the wastewater portion is not computed here because it depends on your sewer rate.",
      ],
      note: "Repair speed is worth real money here: repairing within 30 days instead of after 60 days doubles the credit on the same leak.",
    },
    deadlineTimeline: [
      "Day 0 — the leak starts (or you are notified). The repair-speed clock starts now.",
      "Repair within 30 days — 100% of the water charge on usage above average.",
      "Repair within 60 days — 75%. Repair after 60 days — 50%.",
      "Within 6 months of the repair date — file the Universal Adjustment Request.",
      "Up to three consecutive months within a 12-month period; water and wastewater both credited.",
      "Processing time — not stated on the city's form page (UNVERIFIED).",
    ],
    mudTable: [
      {
        name: "Harris County MUD 71",
        area: "Cypress / Katy area — about 17,000 people (Mason Lakes, Bridgewater, Cypress Glen)",
        terms:
          "Excess usage above the customer's average charged at one-half of the normal rate. Apply within 3 months of the repair date; max 2 credits per 12 months; max 2 consecutive billing cycles. Eye On Water account with the smart meter registered is required, and the applicant needs at least 12 billing cycles of usage history. West Harris County Regional Water Authority fees and the flat-rate sewer portion are not adjustable.",
        statusLabel: "Verified — amended resolution, Aug 28, 2023",
        sourceUrl:
          "https://mail.regionalwater.net/images/documents/HC%2071%20Leak%20Adjustment%20Amended%20Resolution%20Adopting%20Policy%20and%20Procedures_8.28.23.pdf",
        sourceLabel: "MUD 71 amended resolution (Aug 28, 2023)",
      },
      {
        name: "Harris County MUD 501",
        area: "Towne Lake community, Cypress area",
        terms:
          "Apply within 6 months of the repair date (verified — MUD 501 policy update page). Eye On Water account with the smart meter registered is REQUIRED for a credit. What qualifies is verified: loss from an “excusable defect”, generally a non-obvious leak such as an underground irrigation line leak. Credit percentage, maximum months, and frequency limit are NOT verified — the updated policy PDF would not render.",
        statusLabel: "Partial — deadline + Eye On Water verified; credit % unverified",
        sourceUrl: "https://www.hcmud501.org/water/update-to-mud-501-policy-for-leak-adjustment-credits/",
        sourceLabel: "MUD 501 policy update page",
      },
      {
        name: "Harris County MUD 365",
        area: "Houston area — district boundaries not verified",
        terms:
          "UNVERIFIED — the Nov 16, 2026 build plan lists terms for MUD 365 (max 3 months; request within 6 months; max 2 credits per 12 months; half-rate credit), but no verified rule for this district exists in our research file (lib/utility-rules.ts). Do not rely on those figures — confirm with the district or its operator first.",
        statusLabel: "Not verified — confirm with the district",
        sourceUrl: null,
        sourceLabel: null,
      },
    ],
    documentPack: [
      "Filled letter draft — use the Leak-Adjustment Eligibility Checker above: enter your bills and repair facts and it drafts the letter with your numbers, the deadline, and the credit estimate.",
      "Photo and receipt checklist — repair date, service address, type of repair, cost; plumber's statement or bill, or a receipt for parts, or a signed written statement; before-and-after meter photos.",
      "Official form — City of Houston Universal Adjustment Request (linked in the rule table above). Uploads: JPG, GIF, or PNG up to 4MB, or Word/PDF documents.",
      "Keep paying your typical bill amount while the request is reviewed, and keep a copy of everything you submit until the credit appears.",
    ],
    weekChecklist: [
      "Repair the leak — the 30-day tier is worth double the 60-day-plus tier.",
      "Photograph the meter before and after the repair, and keep the plumber's statement or parts receipt.",
      "Pull the normal-month and leak-month bills (gallons and dollars).",
      "Run the checker above for your eligibility verdict and letter draft.",
      "File the Universal Adjustment Request within 6 months of the repair — sooner is better.",
      "If your bill names a MUD, stop — use the MUD table below instead of the city form.",
    ],
    localContext: [
      "Houston's Gulf Coast climate makes irrigation the usual suspect after storms: a sprinkler main that breaks in saturated soil can run for weeks before the bill arrives, and the city's own form treats that kind of hidden loss as the program's core case — while visible faucet and hose leaks are excluded. Compare gallons per day, not just the bill total, because missed reads can stretch a billing period.",
      "Older bungalows and pier-and-beam homes across Houston's inner neighbourhoods are prone to slab and under-floor leaks that never surface — the water disappears into the soil instead of pooling where you can see it. That is also why the meter test matters: a spinning meter with everything off is often the only sign.",
      "Hurricane and flood disruption can delay reads and repairs alike, but the repair-speed tiers still count from the leak start date — so document the start date early, with a photo of the meter and the date you first noticed the spike.",
      "Two fallback programs sit on the same city form: the Unusually Large Bill credit (Sec. 47-75 — one month, once a year, for unexplained use over 200% of average) and the Exceptional Circumstance Adjustment (Sec. 47-75.1 — up to two bills in 24 months, capped at $10,000). If your case is not a leak, one of those may fit.",
    ],
    relatedTowns: [
      { label: "Leak detection in Katy, TX", path: "/tx/houston/katy/" },
      { label: "Leak detection in Cypress, TX", path: "/tx/houston/cypress/" },
      { label: "Leak detection in Sugar Land, TX", path: "/tx/houston/sugar-land/" },
      { label: "Leak detection in The Woodlands, TX", path: "/tx/houston/the-woodlands/" },
    ],
  },
  {
    slug: "dallas",
    city: "Dallas",
    utility: "City of Dallas Water Utilities",
    metro: "Dallas",
    title: "Dallas Leak Adjustment — Dallas Water Rules",
    description:
      "Dallas leak adjustment: excess usage repriced at the lowest rate, max 3 months, once a year. Deadline unverified — see the form. Checked Nov 16, 2026.",
    intro:
      "Dallas Water Utilities does not credit a percentage of your leak — it reprices the water used above your average at the lowest rate on the scale, for up to three months, once a year. The catch is the filing deadline: the city's current page does not state one, and the 90-day figure comes from the request form alone. This guide gives you the full rule from the official page, a worked dollar example, the deadline timeline, and the winter-averaging warning the adjustment will not fix.",
    deadlineWarning:
      "The filing deadline is UNVERIFIED on the city's current page. The Leak Adjustment Request form (DWU-FRM-004-RB, rev. 4, eff. Feb 1, 2019) states 90 days from the completed repair — treat that as the working deadline, confirm it on the form, and file as soon as the repair is done. Processing takes up to 60 days once filed.",
    checklist: [
      "The date the repairs were completed",
      "A detailed description of the repairs",
      "The address where the repairs were made and the account number",
      "The meter number, for multi-metered accounts",
      "The plumber's invoice or receipt — the form asks for the repair facts, and the invoice is what proves them",
    ],
    steps: [
      {
        title: "Repair the hidden leak and get the invoice",
        text: "Fix the leak and get an invoice that describes the repair and gives the completion date. The program covers a hidden or concealed leak that caused a substantial increase in use — not a visible drip, and not a sewer leak.",
      },
      {
        title: "Confirm the filing deadline on the form",
        text: "The city's current web page does not state a filing deadline. The Leak Adjustment Request form (DWU-FRM-004-RB, rev. 4, eff. Feb 1, 2019) states 90 days from the completed repair — read the form yourself and treat 90 days as the working deadline.",
      },
      {
        title: "Fill in the Leak Adjustment Request form",
        text: "Enter the repair completion date, a detailed description of the repairs, the address, the account number, and the meter number for multi-metered accounts. Attach the invoice or receipt.",
      },
      {
        title: "Submit it online, by mail, fax, email, or in person",
        text: "Requests using the form may be submitted online, mailed, faxed, emailed, or dropped off at Dallas City Hall. Keep a copy of what you sent and the confirmation.",
      },
      {
        title: "Keep paying during the review",
        text: "A temporary hold is placed on the account during the review so no late charges are assessed — but keep making monthly payments equal to or higher than your typical bill amount, as the city asks, so service is not disrupted. Processing takes up to 60 days.",
      },
    ],
    faqs: [
      {
        q: "Do toilet or faucet leaks qualify in Dallas?",
        a: "Dallas covers a hidden or concealed water leak that causes a substantial increase in consumption — not a visible drip. A running toilet or dripping faucet is the kind of visible leak the program is not built for, and wastewater or sewer leaks are explicitly excluded. If your spike came from a fixture you could see, fix it and ask Dallas Water Utilities whether any other billing review applies — the leak program almost certainly will not.",
      },
      {
        q: "How much will Dallas credit for a leak?",
        a: "There is no percentage credit. Dallas recalculates the cost per unit of water above your average at the lowest rate on the rate scale — you still pay for all the water used, just at the cheapest tier for the excess. The worked example below shows the arithmetic with clearly labelled illustrative rates, because Dallas does not publish its rate scale on the adjustment page. The real figure comes from Dallas Water Utilities.",
      },
      {
        q: "What is the filing deadline for a Dallas leak adjustment?",
        a: "It is unverified. The city's Leak Adjustment Request form (DWU-FRM-004-RB, rev. 4, effective Feb 1, 2019) states 90 days from the completed repair — but the current dallascityhall.com page does not restate any deadline. Treat the 90 days as the working deadline, confirm it on the form itself, and file as soon as the repair is done rather than testing the limit.",
      },
      {
        q: "How long does a Dallas leak adjustment take?",
        a: "Up to 60 days, according to the city's official page (checked Nov 16, 2026). The city reviews usage once the last affected billing cycle has been recorded, and puts a temporary hold on the account during the review so no late charges are assessed. Keep paying at least your typical bill amount during the review so service is not disrupted.",
      },
      {
        q: "How often can I get a Dallas leak adjustment?",
        a: "Once per 12-month period, for a maximum of three months. That limit is stated on the city's official page, so it is firm: if a second leak hits inside the same year, there is no second credit under this program. Claim every month the leak touched — up to three — in a single request rather than filing for one month and hoping for another.",
      },
      {
        q: "Does the Dallas adjustment cover my sewer bill?",
        a: "No. The program explicitly does not cover or apply to wastewater or sewer leaks, and Dallas sets sewer charges from your December–March winter average. A leak in those months inflates the average and the sewer charges that follow for a year. Run the Sewer Winter-Averaging Calculator linked below to see the size of that tail before you file.",
      },
      {
        q: "What if my Dallas suburb is not served by Dallas Water?",
        a: "Then this rule does not apply to you. Plano, Frisco, Irving, Garland, McKinney, Allen, Richardson, Carrollton, Lewisville, and Denton all run their own water systems, and many Dallas-area subdivisions are on MUDs. Check the utility name on your bill first — if it is not Dallas Water Utilities, ask that provider for its own leak-adjustment rule.",
      },
    ],
    scopeNote:
      "Dallas Water Utilities serves Dallas itself. The ten towns in our Dallas metro — Plano, Frisco, Irving, Garland, McKinney, Allen, Richardson, Carrollton, Lewisville, and Denton — run their own systems. This rule does not cover them.",
    caveats: [
      "The filing deadline is UNVERIFIED on the current official page — the 90-day figure comes from the city's form DWU-FRM-004-RB (rev. 4, eff. Feb 1, 2019). Confirm it on the form before you count on it.",
      "Processing takes up to 60 days per the official page (checked Nov 16, 2026). An earlier summary quoted 60–90 days; the official page is the authority.",
      "The adjustment does not cover wastewater or sewer leaks, and does not correct an inflated winter sewer average.",
      "A temporary hold is placed on the account during review — keep paying at least your typical bill amount.",
    ],
    formLabel: "Dallas leak adjustment page (official form)",
    rule: ruleForMetro("Dallas"),
    townGuidePath: null,
    answerBox:
      "Dallas Water Utilities reprices water used above your average at the lowest rate on the scale, for up to 3 months, once a year. The filing deadline is not stated on the city's current page — confirm it on the form.",
    workedExample: {
      intro:
        "Example only — a sample bill run through the real rule. Normal month 8,000 gallons; leak month 35,000 gallons; excess 27,000 gallons. Dallas publishes the mechanism, not the rates: the excess is repriced at the lowest rate on the scale. The dollars below assume an illustrative normal rate of $5.00 and an illustrative lowest-tier rate of $3.00 per 1,000 gallons — not Dallas's published rates. Your real figure comes from Dallas Water Utilities.",
      lines: [
        "Excess water charge at the illustrative normal rate: 27 × $5.00 = $135.00.",
        "Excess repriced at the illustrative lowest tier: 27 × $3.00 = $81.00.",
        "Illustrative saving from the repricing: $135.00 − $81.00 = $54.00 — you still pay for all the water used, at the cheapest tier for the excess.",
        "Covers up to 3 months, once per 12 months; wastewater is not covered.",
      ],
      note: "Without Dallas's rate scale no exact dollar figure is possible from the published rule — ask Dallas Water Utilities for the repriced figure on your account.",
    },
    deadlineTimeline: [
      "Day 0 — the leak is repaired. Confirm the filing deadline on the official form — see below.",
      "Filing deadline — UNVERIFIED on the current city page. The city's form (DWU-FRM-004-RB, rev. 4, eff. Feb 1, 2019) states 90 days from the completed repair; the current dallascityhall.com page does not restate a deadline.",
      "Once per 12 months, maximum three months — stated on the official page.",
      "Processing — up to 60 days, per the official page (checked Nov 16, 2026). The city reviews usage once the last affected billing cycle is recorded.",
      "During review — a temporary hold is placed on the account; keep paying at least your typical bill amount.",
    ],
    documentPack: [
      "Filled letter draft — use the Leak-Adjustment Eligibility Checker above: enter your bills and repair facts and it drafts the letter with your numbers, the deadline, and the credit estimate.",
      "Photo and receipt checklist — repair completion date, detailed description of the repairs, address, account number, meter number for multi-metered accounts; plumber's invoice or receipt; before-and-after meter photos.",
      "Official form — Dallas Leak Adjustment Request form (linked in the rule table above). Submit online, by mail, fax, email, or drop-off at Dallas City Hall.",
      "Keep paying at least your typical bill amount during the review — the city asks for this on its official page — and keep a copy of everything you submit until the credit appears.",
    ],
    weekChecklist: [
      "Repair the hidden leak and get an invoice describing the repair.",
      "Photograph the meter before and after; note the repair date.",
      "Pull the normal and leak-month bills and your account (and meter) number.",
      "Run the checker above for your verdict and letter draft.",
      "File the Leak Adjustment Request form — and confirm the 90-day deadline on the form itself.",
      "Keep paying at least your typical bill amount during the review.",
    ],
    localContext: [
      "Dallas Water Utilities bills on tiered rates across 21 billing areas, so the same leak costs a different amount depending on where you live and which tier the excess falls in — that is exactly why the adjustment reprices the excess at the lowest rate instead of crediting a percentage.",
      "Dallas Water Utilities' June 2026 water-loss audit reported 10.36 billion gallons of real water losses — the city's own system loses water too. A high bill is worth checking against your meter before assuming the leak is yours.",
      "Dallas sets sewer charges from the December–March winter average, so a leak in those four months does double damage: the high water bill now, and inflated sewer charges for the following year. The adjustment does not touch wastewater, so run the winter-averaging calculator below before you file.",
      "Dallas serves the city itself. Plano, Frisco, Irving, Garland, McKinney, Allen, Richardson, Carrollton, Lewisville, and Denton each run their own water systems — if your bill names one of those, this rule does not cover you.",
    ],
    relatedTowns: [
      { label: "Leak detection in Plano, TX", path: "/tx/dallas/plano/" },
      { label: "Leak detection in Frisco, TX", path: "/tx/dallas/frisco/" },
      { label: "Leak detection in Irving, TX", path: "/tx/dallas/irving/" },
      { label: "Leak detection in McKinney, TX", path: "/tx/dallas/mckinney/" },
    ],
  },
  {
    slug: "mcallen",
    city: "McAllen",
    utility: "McAllen Public Utility (MPU)",
    metro: "McAllen",
    title: "McAllen Leak Adjustment — No Policy Found",
    description:
      "No written leak-adjustment policy was found for McAllen Public Utility (Nov 16, 2026). What to ask, what proof to keep, and the meter recheck.",
    intro:
      "No written leak-adjustment policy was found for McAllen Public Utility as of Nov 16, 2026 — no percentage, no deadline, no form, and no eligibility rule. That is the honest starting point, and it is also the opportunity: this guide tells you exactly what was checked, what MPU does publish instead (a meter recheck read), the four questions to ask the utility, and the proof file to keep so a case-by-case review has something to work with.",
    deadlineWarning:
      "No deadline is published — because no policy exists. Do not treat that as unlimited time: ask McAllen Public Utility for the deadline in writing as soon as the repair is complete, and keep the answer with the date and the name of the person you spoke to.",
    checklist: [
      "The plumber's invoice with the repair date, type of repair, address, and cost",
      "Photos of the leak and the repair, if you have them",
      "Meter photos before and after the repair",
      "The normal-month and leak-month bills showing the spike in gallons and dollars",
      "Your MPU account number and the property address, exactly as printed on your bill",
    ],
    steps: [
      {
        title: "Repair the leak and keep the invoice",
        text: "Fix the leak first and keep the plumber's invoice with the repair date, the type of repair, the address, and the cost. Even with no published policy, the invoice is the document any case-by-case review will ask for.",
      },
      {
        title: "Ask MPU the four questions",
        text: "Use the ask-the-utility script below — do you offer a leak adjustment, what is the deadline, what proof do you need, and does any credit apply to sewer? Ask in writing if you can, and write down the answer with the date and the name of the person you spoke to.",
      },
      {
        title: "Request a recheck read if no leak is found",
        text: "MPU's published step for a high bill is to check for leaks first and, if no leak is found, request a recheck read of the meter. A re-read is a meter check, not a credit — but it is the route MPU itself publishes, so use it when the cause of the spike is unclear.",
      },
      {
        title: "Keep the written answer",
        text: "If MPU offers a credit, ask for the deadline and the proof list in writing too. If it does not, the written answer is still useful: it tells you the only route is the meter recheck and the repair itself.",
      },
    ],
    faqs: [
      {
        q: "Does McAllen Public Utility offer a leak adjustment?",
        a: "No written policy was found as of Nov 16, 2026 — no percentage, deadline, form, or eligibility rule appears on McAllen Public Utility's site or in the city code provisions checked. What MPU does publish is a first step: check for leaks, and if none is found, request a recheck read of the meter. A re-read is not a credit, so ask MPU directly whether a repaired leak can earn one.",
      },
      {
        q: "What should I ask McAllen Public Utility?",
        a: "Four questions, in writing: do you offer a leak adjustment for a repaired hidden leak; what is the filing deadline from the repair date; what proof do you need; and does any credit apply to the sewer portion? Write down the answer with the date and the name of the person you spoke to. A written answer is the closest thing to a policy when no published rule exists.",
      },
      {
        q: "Is there a McAllen leak-adjustment form?",
        a: "None was found. McAllen Public Utility's Service Application (revised September 19, 2025) references Chapter 106 of the McAllen Code of Ordinances for charges but contains no leak-adjustment terms. Do not use a form you find through a general search unless it is linked from an official McAllen page — one widely indexed ordinance text about leak credits belongs to Cleburne, Texas, not McAllen.",
      },
      {
        q: "What proof should I keep for a McAllen leak?",
        a: "The plumber's invoice with the repair date, type of repair, address, and cost; photos of the leak and the repair; meter photos before and after the repair; and the normal and leak-month bills showing the spike. Keep all of it even though no policy asks for it yet — if MPU reviews credits case by case, this file is your whole argument.",
      },
      {
        q: "Will a McAllen leak raise my sewer bill for a year?",
        a: "No — McAllen does not use winter averaging. Residential sewer is billed on 100% of monthly water volume, so a high-water month raises that month's sewer charge only, with no 12-month tail. That is one piece of good news: the damage from a McAllen leak is confined to the months the water actually ran.",
      },
      {
        q: "Who do I call at McAllen Public Utility?",
        a: "McAllen Public Utility customer service at 956-681-1600. Ask for the leak-adjustment question in writing if you can — email creates a record — and keep the reply. If the answer is that no credit exists, that written answer is still useful: it tells you the only route is the meter recheck and the repair itself.",
      },
    ],
    scopeNote:
      "McAllen Public Utility serves McAllen itself. The other McAllen-metro towns — Edinburg, Mission, Pharr, Weslaco, Donna, Alamo, San Juan, Mercedes, and Hidalgo — run their own systems. This page covers McAllen addresses on MPU only.",
    caveats: [
      "No written policy, form, deadline, or formula was found — this page states what was checked, not a rule.",
      "A widely indexed ordinance text about leak credits (40% of the increased billing, three-year average, one adjustment per 12 months) belongs to Cleburne, Texas (Sec. 51.023) — not McAllen. Do not use it for McAllen.",
      "A different McAllen customer-service number (956-681-1003) quoted by a third-party guide is UNVERIFIED as the official number; the number in this guide (956-681-1600) is the one in our research file.",
    ],
    formLabel: "No official form published",
    rule: ruleForMetroOrNull("McAllen"),
    townGuidePath: null,
    noPolicy: true,
    phone: "956-681-1600",
    askScript: [
      "“Do you offer a leak adjustment for a repaired hidden leak — and if so, under what rule?”",
      "“What is the filing deadline from the repair date?”",
      "“What proof do you need — invoice, photos, meter reads?”",
      "“Does any credit apply to the sewer portion of the bill?”",
      "Write down the answer with the date and the name of the person you spoke to — and ask for it in writing if you can.",
    ],
    sourcesChecked: [
      "McAllen Public Utility — Meter Reading page (smart meters “have the ability to detect leaks”; no adjustment policy stated).",
      "McAllen Public Utility — Service Application PDF, rev. 9-19-2025 (references Chapter 106 of the McAllen Code of Ordinances for charges; no leak-adjustment terms).",
      "mcallen.net — Stage 2 water-restrictions notice (“fix all water leaks”; no adjustment policy) and backflow presentation (no adjustment policy).",
      "General web search for a McAllen leak-adjustment policy, form, deadline, or formula — none found.",
    ],
  },
  {
    slug: "corpus-christi",
    city: "Corpus Christi",
    utility: "Corpus Christi Water",
    metro: "Corpus Christi",
    title: "Corpus Christi Leak Adjustment — No Water Policy",
    description:
      "No water-side leak-adjustment policy was found for Corpus Christi (Nov 16, 2026). The winter-quarter wastewater relief, ask script, and proof list.",
    intro:
      "No published water-side leak-adjustment policy was found for Corpus Christi Water as of Nov 16, 2026 — no percentage, deadline, form, or eligibility rule for the water portion of the bill. One verified relief does exist, on the sewer side: a hidden leak in the December–February winter quarter can earn a wastewater-bill adjustment under Code Sec. 55-100(e)(4). This guide covers that relief, what was checked, and the four questions to ask the city.",
    deadlineWarning:
      "No water-side deadline is published — because no water-side policy exists. For the verified wastewater relief, the adjusted sewer rate applies to service on or after May 1, so ask Utility Billing early in the year how a December–February leak is handled. Ask for every deadline in writing.",
    checklist: [
      "The plumber's invoice with the repair date, type of repair, address, and cost",
      "Photos of the leak and the repair, if you have them",
      "Meter photos before and after the repair",
      "The normal-month and leak-month bills showing the spike in gallons and dollars",
      "For the winter-quarter wastewater relief, the proof of repairs is what the code asks for — keep the invoice even if the repair was small",
    ],
    steps: [
      {
        title: "Repair the leak and keep the invoice",
        text: "Fix the leak first and keep the plumber's invoice with the repair date, the type of repair, the address, and the cost. The invoice is the proof the winter-quarter wastewater relief asks for, and the document any water-side review would need too.",
      },
      {
        title: "Ask Utility Billing the four questions",
        text: "Use the ask-the-utility script below — do you adjust the water portion, what is the deadline, what proof do you need, and for a December–February leak, will the wastewater average be corrected under Sec. 55-100(e)(4)? Ask in writing if you can.",
      },
      {
        title: "For a December–February leak, cite the wastewater relief",
        text: "Under Code Sec. 55-100(e)(4), if a hidden water leak caused a substantial increase during the winter quarter averaging period, the director of water utilities or designee may adjust the wastewater bill with proof of repairs. The adjusted sewer rate applies to service on or after May 1.",
      },
      {
        title: "Keep the written answer",
        text: "Write down every answer with the date and the name of the person you spoke to. If the water portion cannot be adjusted, the written answer should still confirm whether the Sec. 55-100(e)(4) wastewater relief applies to your leak.",
      },
    ],
    faqs: [
      {
        q: "Does Corpus Christi Water offer a leak adjustment?",
        a: "No published water-side policy was found as of Nov 16, 2026 — no percentage, deadline, form, or eligibility rule for the water portion of the bill. That is a verified absence, not a gap in this guide: the city site, utility guides, and local plumber pages were all checked. What does exist is a verified wastewater-side relief for hidden leaks in the winter quarter — see the next question.",
      },
      {
        q: "What is the Corpus Christi winter-quarter wastewater relief?",
        a: "Under Code Sec. 55-100(e)(4), if a hidden water leak causes a substantial increase during the December–February winter quarter, the director of water utilities may adjust the wastewater bill with proof of repairs. The adjusted sewer rate applies to service on or after May 1. This corrects the sewer average — it is not a credit on the water used by the leak itself.",
      },
      {
        q: "Is there a Corpus Christi leak-adjustment form online?",
        a: "An online Leak Adjustment Request Form exists, but its owner city is unverified — it carries no city name or branding — so we do not link it as Corpus Christi's form or quote its terms here. Do not submit personal account details to a form you cannot trace to an official city page. Use the phone number below and ask Utility Billing where the city's own form lives.",
      },
      {
        q: "What should I ask Corpus Christi Water?",
        a: "Four questions, in writing: do you adjust the water portion of a bill after a repaired hidden leak; what is the filing deadline; what proof do you need; and for a December–February leak, will the wastewater average be corrected under Sec. 55-100(e)(4)? Write down the answer with the date and the name of the person you spoke to.",
      },
      {
        q: "What proof should I keep for a Corpus Christi leak?",
        a: "The plumber's invoice with the repair date, type of repair, address, and cost; photos of the leak and the repair; meter photos before and after; and the normal and leak-month bills. For the winter-quarter wastewater relief, the proof of repairs is what the code asks for — keep the invoice even if the repair was small.",
      },
      {
        q: "Who do I call about a Corpus Christi leak adjustment?",
        a: "Corpus Christi Water customer service at (361) 826-3100, or 311. Ask in writing where possible and keep the reply. If the water portion cannot be adjusted, ask specifically about the Sec. 55-100(e)(4) wastewater relief for a winter-quarter hidden leak — it is the one verified mechanism the city publishes for a leak like yours.",
      },
    ],
    scopeNote:
      "Corpus Christi Water serves Corpus Christi itself. The San Patricio Municipal Water District is a wholesale provider only — it buys its water from the City of Corpus Christi and serves retail systems in Portland, Aransas Pass, Ingleside, and Rockport, plus industry. Homeowners do not apply to the wholesale district.",
    caveats: [
      "No published water-side leak-adjustment policy, form, deadline, or formula was found — this page states what was checked, not a rule.",
      "An online Leak Adjustment Request Form exists, but its owner city is UNVERIFIED (no city name or branding) — it is not linked here as Corpus Christi's form.",
      "The verified wastewater relief (Code Sec. 55-100(e)(4)) corrects the sewer average for a winter-quarter hidden leak — it is not a credit on the water used by the leak.",
    ],
    formLabel: "No official water-side form published",
    rule: ruleForMetroOrNull("Corpus Christi"),
    townGuidePath: null,
    noPolicy: true,
    phone: "(361) 826-3100",
    askScript: [
      "“Do you adjust the water portion of a bill after a repaired hidden leak — and if so, under what rule?”",
      "“What is the filing deadline from the repair date?”",
      "“What proof do you need — invoice, photos, meter reads?”",
      "“For a December–February leak, will the wastewater average be corrected under Code Sec. 55-100(e)(4)?”",
      "Write down the answer with the date and the name of the person you spoke to — and ask for it in writing if you can.",
    ],
    sourcesChecked: [
      "cctexas.com site search — returned only Development Services documents (zoning, easements, floodplain permits); no utilities leak-adjustment page.",
      "Utility-bill guides for Corpus Christi — no policy, only “ask about adjustment rules” advice.",
      "Local plumber leak-detection pages — “ask the utility about current leak adjustment policies once the leak is repaired” (the plumber could not find one either).",
      "Corpus Christi Code Sec. 55-100(e)(4) — verified wastewater relief for a hidden leak in the winter quarter (see the winter section below).",
    ],
  },
  {
    slug: "lubbock",
    city: "Lubbock",
    utility: "City of Lubbock Water Utilities",
    metro: "Lubbock",
    title: "Lubbock Leak Adjustment — No Written Policy",
    description:
      "No written leak-adjustment policy was found for Lubbock (Nov 16, 2026). What to ask the city, what proof to keep, and the winter-average warning.",
    intro:
      "No written leak-adjustment policy was found for the City of Lubbock as of Nov 16, 2026 — confirmed twice, by our check and by WaterShortcut's November 6 check. The city code covers billing errors only, not leak credits. That does not rule out a credit: some utilities review leak requests case by case. This guide tells you what was checked, the four questions to ask, and the proof file to keep.",
    deadlineWarning:
      "No deadline is published — because no policy exists. Do not treat that as unlimited time: ask the City of Lubbock for the deadline in writing as soon as the repair is complete. If a winter leak inflated your November–February sewer average, ask about that too — no policy exists to correct it.",
    checklist: [
      "The plumber's invoice with the repair date, type of repair, address, and cost",
      "Photos of the leak and the repair, if you have them",
      "Meter photos before and after the repair",
      "The normal-month and leak-month bills showing the spike in gallons and dollars",
      "Your Lubbock utilities account number and the property address, exactly as printed on your bill",
    ],
    steps: [
      {
        title: "Repair the leak and keep the invoice",
        text: "Fix the leak first and keep the plumber's invoice with the repair date, the type of repair, the address, and the cost. Even with no published policy, the invoice is the document any case-by-case review will ask for.",
      },
      {
        title: "Ask the city the four questions",
        text: "Use the ask-the-utility script below — do you review leak credits case by case, what is the filing deadline, what proof do you need, and does any credit correct the winter sewer average? Ask in writing if you can, and write down the answer with the date and the name of the person you spoke to.",
      },
      {
        title: "Ask whether a meter test or billing review applies",
        text: "The Water Conservation Plan mentions meter testing for customers “involved in the water credit or appeals process” — so ask whether a meter test or a billing review applies to your account, even if no leak credit exists.",
      },
      {
        title: "Keep the written answer",
        text: "If the city offers a case-by-case credit, ask for the deadline and the proof list in writing too. If it does not, the written answer is still useful: it tells you the only routes are the meter test, the billing review, and the repair itself.",
      },
    ],
    faqs: [
      {
        q: "Does the City of Lubbock offer a leak adjustment?",
        a: "No written policy was found as of Nov 16, 2026 — confirmed twice, by our November 16 check and by WaterShortcut's November 6 check. The Lubbock Code of Ordinances covers billing-error adjustments only, not leak credits. That does not rule out a credit: some utilities review leak requests case by case, so ask the city directly once the leak is fixed.",
      },
      {
        q: "What should I ask the City of Lubbock?",
        a: "Four questions, in writing: do you review leak credits case by case; what is the filing deadline from the repair date; what proof do you need; and does any credit correct the winter sewer average? Write down the answer with the date and the name of the person you spoke to. A written answer is the closest thing to a policy when no published rule exists.",
      },
      {
        q: "Does Lubbock's code cover leak credits at all?",
        a: "No. Article 22.01 of the Lubbock Code of Ordinances covers billing errors — charges that differ from the approved rates — for up to six months back. A leak is not a billing error: the meter read correctly, the water really ran. The Water Conservation Plan mentions meter testing for customers “involved in the water credit or appeals process,” but publishes no leak-credit terms.",
      },
      {
        q: "What proof should I keep for a Lubbock leak?",
        a: "The plumber's invoice with the repair date, type of repair, address, and cost; photos of the leak and the repair; meter photos before and after the repair; and the normal and leak-month bills showing the spike. Keep all of it even though no policy asks for it yet — if the city reviews your request case by case, this file is your whole argument.",
      },
      {
        q: "Will a Lubbock leak raise my sewer bill for a year?",
        a: "Possibly. Lubbock sets wastewater volume from the November–February average, updated each March, and no leak-adjustment policy exists to correct an inflated average. A leak in those months can raise sewer charges for the following year. Run the Sewer Winter-Averaging Calculator linked below to see the size of that tail before you call the city.",
      },
      {
        q: "Who do I call about a Lubbock leak adjustment?",
        a: "City of Lubbock Utilities at 806-775-2509. Ask in writing where possible and keep the reply, with a note of the date and the name of the person you spoke to. If no credit is available, ask whether a meter test or a billing review applies to your account — the Water Conservation Plan mentions meter testing for customers in the credit or appeals process.",
      },
    ],
    scopeNote:
      "City of Lubbock Water Utilities serves Lubbock itself. The other Lubbock-metro towns — Wolfforth, Shallowater, Slaton, Idalou, Levelland, Littlefield, Plainview, Abernathy, and Ralls — run their own systems. This page covers Lubbock addresses only.",
    caveats: [
      "No written leak-adjustment policy was found — confirmed twice (WaterShortcut, Nov 6, 2026; this site, Nov 16, 2026).",
      "The Lubbock Code covers billing-error adjustments only (Art. 22.01, up to 6 months back) — a leak is not a billing error.",
      "No leak-adjustment policy exists to correct an inflated November–February sewer average — a winter leak can raise sewer charges for the following year.",
    ],
    formLabel: "No official form published",
    rule: ruleForMetroOrNull("Lubbock"),
    townGuidePath: null,
    noPolicy: true,
    phone: "806-775-2509",
    askScript: [
      "“Do you review leak credits case by case — and if so, under what process?”",
      "“What is the filing deadline from the repair date?”",
      "“What proof do you need — invoice, photos, meter reads?”",
      "“Does any credit correct the winter sewer average if the leak fell in November–February?”",
      "Write down the answer with the date and the name of the person you spoke to — and ask for it in writing if you can.",
    ],
    sourcesChecked: [
      "City of Lubbock Water Utilities site (via WaterShortcut's Nov 6, 2026 check: “we didn't find a written leak adjustment policy”) — re-checked Nov 16, 2026, same result.",
      "Lubbock Code of Ordinances, Article 22.01 — covers billing-error adjustments only (over/under billing vs approved rates, up to 6 months back), not leak credits.",
      "Lubbock Water Conservation Plan, Division 2 — mentions meter testing for customers “involved in the water credit or appeals process” but publishes no leak-credit terms.",
      "Utility-bill guides for Lubbock — no policy, only “ask about adjustment” advice.",
    ],
  },
];

export function getAdjustmentCity(slug: string): AdjustmentCityPage | undefined {
  return ADJUSTMENT_CITIES.find((c) => c.slug === slug);
}

/* ------------------------------------------------------------------ */
/* Index page: status of all 10 metros                                */
/* ------------------------------------------------------------------ */

export type MetroAdjustmentStatus = "guide" | "competitor" | "unverified";

export interface MetroAdjustmentRow {
  metro: string;
  utility: string;
  status: MetroAdjustmentStatus;
  /** Short status label shown in the table. */
  statusLabel: string;
  note: string;
  /** City-guide route when this wave built one, else null. */
  pagePath: string | null;
  /** Official utility page (form / billing page) for the "apply here" link. */
  officialUrl: string | null;
  officialLabel: string | null;
  /** Phone to call when no published policy exists. */
  phone: string | null;
}

export const METRO_ADJUSTMENT_ROWS: MetroAdjustmentRow[] = [
  {
    metro: "San Antonio",
    utility: "San Antonio Water System (SAWS)",
    status: "guide",
    statusLabel: "Verified guide",
    note: "Adjustment covers a portion of leak usage, up to 2 months, once every 12 months. No percentage or deadline published.",
    pagePath: "/guides/leak-adjustment/san-antonio/",
    officialUrl: "https://dev.saws.sawsapp.com/customer-self-service-options/leak-adjustment-request/",
    officialLabel: "SAWS leak adjustment request",
    phone: null,
  },
  {
    metro: "Austin",
    utility: "Austin Water",
    status: "guide",
    statusLabel: "Verified guide",
    note: "50% of excess usage (2011 resolution), 90-day deadline, once per 12 months, up to 2 billing cycles.",
    pagePath: "/guides/leak-adjustment/austin/",
    officialUrl: "https://www.austintexas.gov/department/high-water-bill-options",
    officialLabel: "Austin high-water-bill options",
    phone: null,
  },
  {
    metro: "Fort Worth",
    utility: "City of Fort Worth Water",
    status: "guide",
    statusLabel: "Verified guide — re-verify",
    note: "50% of excess use, 60-day deadline, once per rolling 12 months. No live city page found — rule rests on a 2021 form copy.",
    pagePath: "/guides/leak-adjustment/fort-worth/",
    officialUrl: "https://data.templateroller.com/pdf_docs/2445/24453/2445393/main_water-leak-repair-adjustment-application-city-of-fort-worth-texas.pdf?take=binary&c1e7237df5772578d7e850fa3787aa0d",
    officialLabel: "Fort Worth application (form copy, Mar 2021)",
    phone: "817-392-4477",
  },
  {
    metro: "El Paso",
    utility: "El Paso Water",
    status: "guide",
    statusLabel: "Verified guide",
    note: "50% of excess use, 60-day deadline, once per rolling 24 months, plus the ServLine program (up to $2,500).",
    pagePath: "/guides/leak-adjustment/el-paso/",
    officialUrl: "https://www.epwater.org/residential/services-and-information/leaks-and-property-protection/water-leak-adjustment",
    officialLabel: "EPWater leak adjustment page",
    phone: null,
  },
  {
    metro: "Amarillo",
    utility: "City of Amarillo Water",
    status: "guide",
    statusLabel: "Verified guide",
    note: "50,000-gallon threshold, two highest bills, once every two years. No percentage or deadline published.",
    pagePath: "/guides/leak-adjustment/amarillo/",
    officialUrl: "https://www.amarillo.gov/utility-billing/",
    officialLabel: "Amarillo Utility Billing page",
    phone: null,
  },
  {
    metro: "Houston",
    utility: "City of Houston Water (Houston Public Works)",
    status: "guide",
    statusLabel: "Verified guide",
    note: "100/75/50% tiered credit by repair speed, 6-month deadline, up to 3 months — plus the MUD rules, a worked example, and the eligibility checker. Processing time unverified.",
    pagePath: "/guides/leak-adjustment/houston/",
    officialUrl: "https://www.houstonwaterbills.houstontx.gov/ProdDP/Billing/AccountBasedServiceRequest/UniversalAdjustmentRequest",
    officialLabel: "Houston Universal Adjustment Request",
    phone: null,
  },
  {
    metro: "Dallas",
    utility: "City of Dallas Water Utilities",
    status: "guide",
    statusLabel: "Verified guide — deadline unverified",
    note: "Excess usage repriced at the lowest rate, once per 12 months, up to 3 months, up to 60 days to process. Filing deadline is not stated on the city's current page — confirm it on the form.",
    pagePath: "/guides/leak-adjustment/dallas/",
    officialUrl: "https://dallascityhall.com/departments/waterutilities/Pages/Request-a-Leak-Adjustment.aspx",
    officialLabel: "Dallas leak adjustment page",
    phone: null,
  },
  {
    metro: "McAllen",
    utility: "McAllen Public Utility (MPU)",
    status: "unverified",
    statusLabel: "No written policy — guide",
    note: "No published leak-adjustment policy, form, deadline, or formula was found (Nov 16, 2026). MPU's site tells customers with a high bill to check for leaks first, then request a recheck read. The guide has the ask script and proof checklist.",
    pagePath: "/guides/leak-adjustment/mcallen/",
    officialUrl: null,
    officialLabel: null,
    phone: "956-681-1600",
  },
  {
    metro: "Corpus Christi",
    utility: "Corpus Christi Water",
    status: "unverified",
    statusLabel: "No water-side policy — guide",
    note: "No published water-side leak-adjustment policy was found. One verified relief does exist: under Code Sec. 55-100(e)(4), the director may adjust the wastewater bill for a hidden leak during the Dec–Feb winter quarter, with proof of repairs.",
    pagePath: "/guides/leak-adjustment/corpus-christi/",
    officialUrl: "https://legistar.granicus.com/CorpusChristi/attachments/92320581-a173-4e3d-98ef-0ce4c3ba7ce4.pdf",
    officialLabel: "Corpus Christi Code Sec. 55-100 (wastewater relief)",
    phone: "(361) 826-3100",
  },
  {
    metro: "Lubbock",
    utility: "City of Lubbock Water Utilities",
    status: "unverified",
    statusLabel: "No written policy — guide",
    note: "No written leak-adjustment policy was found on the city site (confirmed twice: Nov 6 and Nov 16, 2026); the code covers billing-error adjustments only. That does not rule out a case-by-case credit — the guide has the ask script and proof checklist.",
    pagePath: "/guides/leak-adjustment/lubbock/",
    officialUrl: null,
    officialLabel: null,
    phone: "806-775-2509",
  },
];

/* ------------------------------------------------------------------ */
/* MUD explainer page                                                 */
/* ------------------------------------------------------------------ */

export interface MudRuleEntry {
  name: string;
  area: string;
  statusLabel: string;
  /** What is verified about this MUD's leak-adjustment rule. */
  summary: string;
  /** What is NOT verified / what does not exist — stated plainly. */
  notVerified: string | null;
  deadline: string | null;
  proof: string | null;
  sourceUrl: string;
  sourceLabel: string;
}

export const MUD_RULES: MudRuleEntry[] = [
  {
    name: "Harris County MUD 71",
    area: "Cypress / Katy area — about 17,000 people (neighbourhoods include Mason Lakes, Bridgewater, Cypress Glen)",
    statusLabel: "Verified rule",
    summary:
      "Loss of water from an “excusable defect” in the customer's water line earns a credit: excess usage above the customer's average is charged at one-half of the normal rate. Visible leaks are excluded, including defective or out-of-repair faucets and hose leaks. West Harris County Regional Water Authority pumpage and surface-water fees are not adjustable, and the sewer portion — charged at a flat rate — is not adjustable either.",
    notVerified: null,
    deadline: "File a sworn written application within 3 months of the repair date (about 90 days). No more than 2 credits in any 12-month period, covering at most 2 consecutive billing cycles.",
    proof: "Sworn written application plus certification of an Eye On Water account with the smart meter registered — no credit is granted until the district confirms the registration. The applicant must have at least 12 billing cycles of usage history at the address.",
    sourceUrl:
      "https://mail.regionalwater.net/images/documents/HC%2071%20Leak%20Adjustment%20Amended%20Resolution%20Adopting%20Policy%20and%20Procedures_8.28.23.pdf",
    sourceLabel: "MUD 71 amended resolution (Aug 28, 2023)",
  },
  {
    name: "Harris County MUD 501",
    area: "Towne Lake community, Cypress area",
    statusLabel: "Partial — some terms verified",
    summary:
      "A leak-adjustment policy has been in place since 2016. What qualifies is verified: loss of water from an “excusable defect”, generally a non-obvious or non-visible leak such as an underground irrigation line leak. The district requires the customer to create an Eye On Water account and register their smart meter in order to be eligible for a credit.",
    notVerified:
      "Credit percentage, maximum months covered, and frequency limit are NOT verified — the updated policy PDF lives on Google Drive and its text would not render in this research pass. Do not copy the 50% figure from other MUDs.",
    deadline: "Apply within 6 months of the date of repair (verified).",
    proof: "Completed leak adjustment form plus the required repair documentation, and Eye On Water registration. Operator: Inframark, 832-467-1599.",
    sourceUrl: "https://www.hcmud501.org/water/update-to-mud-501-policy-for-leak-adjustment-credits/",
    sourceLabel: "MUD 501 policy update page",
  },
  {
    name: "Harris County MUD 82",
    area: "Cypress / northwest Harris County",
    statusLabel: "Partial — precondition only",
    summary:
      "One precondition is verified: the board will only consider leak adjustments if you are actively signed up for EyeOnWater before the leak occurs (July 2026 resident newsletter; the board required EyeOnWater enrolment for payment plans and leak-adjustment consideration in Jan 2025 minutes).",
    notVerified:
      "Credit percentage, deadline, frequency limit, and maximum months are ALL unverified. The October 27, 2025 board minutes record that the operator presented a proposed leak adjustment policy and the board requested additional time to consider it. The Rate Order text was not retrievable. Do not publish numbers for MUD 82 until the Rate Order is read.",
    deadline: null,
    proof: "EyeOnWater enrolment before the leak occurs. Operator as of 2026: MMIA.",
    sourceUrl: "https://hcmud82.com",
    sourceLabel: "MUD 82 district site",
  },
  {
    name: "Brushy Creek MUD",
    area: "Brushy Creek community, Round Rock / Cedar Park area (Williamson County)",
    statusLabel: "Verified — sewer-average adjustment",
    summary:
      "No water-side leak credit was found for Brushy Creek MUD. What exists is a wastewater (sewer-average) adjustment: customers who experience a leak — or fill a pool — during the averaging months can submit a Wastewater (Sewer) Adjustment Request form with proof of leak repairs. No credits for bills prior to the approved request. Winter averaging runs November–February at $3.20 per 1,000 gallons; new customers default to 7,000 gallons.",
    notVerified: null,
    deadline: "No adjustments approved after April 30 of each year under the 2025 order; the 2026 order moved the deadline to May 31.",
    proof: "Wastewater (Sewer) Adjustment Request form plus proof of leak repairs. Customer service: 512-255-7871.",
    sourceUrl: "https://www.bcmudtx.gov/content/13126/13244/13369.aspx",
    sourceLabel: "Brushy Creek MUD bill explainer",
  },
  {
    name: "Baker Road MUD",
    area: "Houston area (operator: H2O Innovation)",
    statusLabel: "No standing policy",
    summary:
      "No published leak-adjustment policy, formula, deadline, or form was found. The board grants credits case by case, by vote, on the operator's recommendation. Homeowners should write to the operator or the board; there is no published rule to cite, and single-case outcomes are not a policy.",
    notVerified:
      "Everything a guide would normally state — percentage, deadline, frequency, proof list — is unpublished for this district.",
    deadline: null,
    proof: "Write to the operator or board with the repair details. Operator: H2O Innovation.",
    sourceUrl: "https://h2ocustomers.com/wp-content/uploads/2025/10/Minutes-2025-08-25-Baker-Road-MUD-1.pdf",
    sourceLabel: "Baker Road MUD board minutes (Aug 25, 2025)",
  },
  {
    name: "Woodlands Water (The Woodlands Water Agency)",
    area: "The Woodlands — 10 MUDs (The Woodlands MUD No. 1; Montgomery County MUDs 6, 7, 36, 39, 46, 47, 60, 67; The Woodlands Metro Center MUD). Creekside Park is separate (Harris-Montgomery Counties MUD 386).",
    statusLabel: "Partial — adjustment exists, terms unpublished",
    summary:
      "A one-time leak adjustment can be granted under certain circumstances — that is all the published FAQ says. Leaks after the meter are the homeowner's responsibility. No formula, deadline, or eligibility list is published.",
    notVerified:
      "Formula, deadline, and eligibility are unpublished. Winter averaging (December–February) is verified, but no published correction mechanism for a leak in those months was found.",
    deadline: null,
    proof: "Call a Customer Service Representative at 281-367-1271 for more information.",
    sourceUrl: "https://woodlandswater.org/water-and-sewer-service-faqs/",
    sourceLabel: "Woodlands Water FAQs",
  },
];

/* ------------------------------------------------------------------ */
/* MUD directory — Harris County MUD 501 / 71 / 365 (first three)     */
/* ------------------------------------------------------------------ */

export interface MudDirectoryEntry {
  name: string;
  area: string;
  statusLabel: string;
  /** Filing deadline / frequency limits (verified terms only). */
  deadline: string;
  /** Credit terms (verified terms only). */
  credit: string;
  /** Proof / how to apply (verified terms only). */
  proof: string;
  /** Official source link, or null when no verified source exists. */
  sourceUrl: string | null;
  sourceLabel: string | null;
  /** False when any term is unverified — the row then says so plainly. */
  verified: boolean;
}

/**
 * Directory table for the MUD explainer page. Terms come only from
 * lib/utility-rules.ts (MUD 71) and the verified MUD research
 * (MUD_RULES above). MUD 365 has NO verified terms in our research
 * file, so its row states that plainly and lists no figures — a second
 * research pass is needed before any MUD 365 term can be published.
 */
export const MUD_DIRECTORY: MudDirectoryEntry[] = [
  {
    name: "Harris County MUD 71",
    area: "Cypress / Katy area — about 17,000 people (Mason Lakes, Bridgewater, Cypress Glen)",
    statusLabel: "Verified rule",
    deadline:
      "File a sworn written application within 3 months of the repair date (about 90 days). No more than 2 credits in any 12-month period, covering at most 2 consecutive billing cycles.",
    credit:
      "Excess usage above the customer's average charged at one-half of the normal rate. Visible leaks excluded. West Harris County Regional Water Authority pumpage and surface-water fees and the flat-rate sewer portion are not adjustable.",
    proof:
      "Sworn written application plus certification of an Eye On Water account with the smart meter registered — no credit until the district confirms the registration. At least 12 billing cycles of usage history at the address.",
    sourceUrl:
      "https://mail.regionalwater.net/images/documents/HC%2071%20Leak%20Adjustment%20Amended%20Resolution%20Adopting%20Policy%20and%20Procedures_8.28.23.pdf",
    sourceLabel: "MUD 71 amended resolution (Aug 28, 2023)",
    verified: true,
  },
  {
    name: "Harris County MUD 501",
    area: "Towne Lake community, Cypress area",
    statusLabel: "Partial — deadline + Eye On Water verified",
    deadline: "Apply within 6 months of the date of repair (verified).",
    credit:
      "NOT verified — credit percentage, maximum months covered, and frequency limit are not published here. The updated policy PDF lives on Google Drive and its text would not render in the research pass. Do not copy the 50% figure from other MUDs.",
    proof:
      "Completed leak adjustment form plus the required repair documentation, and Eye On Water registration (required for a credit). Operator: Inframark, 832-467-1599.",
    sourceUrl: "https://www.hcmud501.org/water/update-to-mud-501-policy-for-leak-adjustment-credits/",
    sourceLabel: "MUD 501 policy update page",
    verified: false,
  },
  {
    name: "Harris County MUD 365",
    area: "Houston area — district boundaries not verified",
    statusLabel: "Not verified — second research pass needed",
    deadline:
      "NOT verified — no deadline in our research file. Do not rely on any figure until the district's rate order or policy is read.",
    credit:
      "NOT verified — no credit terms in our research file. Do not rely on any figure until the district's rate order or policy is read.",
    proof:
      "NOT verified — confirm with the district or its operator what proof is needed and where to file.",
    sourceUrl: null,
    sourceLabel: null,
    verified: false,
  },
];

/** Verified routes for finding which MUD serves a home (TCEQ, “Water: Who Provides Water to My Property?”). */
export const MUD_FIND_STEPS: string[] = [
  "Check the water bill — the district or utility name is printed on it. This is the fastest route in practice.",
  "Use the Association of Water Board Directors' “Find My District” address search (awbd-tx.org).",
  "Use the TCEQ Water District Map Viewer to search or map water districts by address.",
  "Use the Texas Water Development Board's Water Service Boundary Viewer — an interactive map of retail water service boundaries statewide.",
  "Use the PUCT CCN Viewer for Certificate of Convenience and Necessity service areas.",
  "Try the operator's district search — for example, Regional Water Corporation lets you search by neighbourhood for the MUDs it operates, and Woodlands Water has a “Find Your MUD” address lookup.",
  "Or search the TCEQ Drinking Water Viewer by public water system name or county.",
];

export const MUD_FIND_TCEQ_URL =
  "https://www.tceq.texas.gov/drinkingwater/whatsmysource.html";

/** Verified Brushy Creek example (board agenda, Aug 14, 2025). */
export const BRUSHY_CREEK_EXAMPLE = {
  address: "3106 Monument Drive",
  before: "$423.40",
  after: "$40.04",
  note: "The leak started in May 2024 and was fixed on July 7, 2025; the request arrived after the April 30 deadline and went to the board for consideration. Two more cases on the same agenda: 16533 Avaranche Way, $62.40 → $32.64; 16802 Pocono Drive, $41.60 → $12.80.",
  sourceUrl:
    "https://brushycreekmud.civicweb.net/document/385831/_p_Discussion%20and%20possible%20action%20concerning%20Se.pdf?handle=9AE7679E5C3E4522862CF2CF25FD85E6",
};

export const MUD_FAQS: AdjustmentFaq[] = [
  {
    q: "What is a MUD, and why does it set my leak rules?",
    a: "A Municipal Utility District is a local government district that provides water and sewer service to a specific community or subdivision — very common in Houston-area suburbs, where the city does not serve the neighbourhood. Your bill names the district, and the district's own board sets its leak-adjustment rule in a rate order or resolution. There is no statewide MUD rule, so your neighbour across the district line can have a completely different policy.",
  },
  {
    q: "How do I find out which MUD serves my home?",
    a: "Check your water bill first — the district name is printed on it, and that is the fastest route. You can also use the Association of Water Board Directors' Find My District address search, the TCEQ Water District Map Viewer, the Texas Water Development Board's service-boundary viewer, or the PUCT's certificate-of-convenience viewer. Your MUD's operator — the company that runs the system — usually has a district search by neighbourhood too.",
  },
  {
    q: "Does my MUD have to give me a leak adjustment?",
    a: "No. A MUD sets its own policy, and some MUDs have no standing policy at all — their boards vote on credits case by case. Harris County MUD 71 has a published rule with a 50% credit on excess usage, while Baker Road MUD has no published rule and decides each request by board vote. Before you assume anything, find your district, then read its rate order or ask its operator whether a written leak-adjustment policy exists.",
  },
  {
    q: "What is Eye On Water, and why do some MUDs require it?",
    a: "Eye On Water is the customer portal for smart water meters: it shows your usage and leak alerts. Some MUDs have written it into their leak-adjustment policy as a precondition. Harris County MUD 501 requires an Eye On Water account with the smart meter registered for a credit, and MUD 82's board will only consider an adjustment if you were signed up before the leak happened. It is a condition of some districts, not a statewide rule.",
  },
  {
    q: "My MUD has no published leak-adjustment policy. What can I do?",
    a: "Write to the district's operator or board and ask whether credits are considered case by case — that is how districts without a standing policy handle it. Baker Road MUD, for example, has granted credits by board vote on the operator's recommendation, with no published formula, deadline, or form. Keep the repair invoice, note the repair date, and ask in writing what the board needs. A written request creates a record the board can act on.",
  },
  {
    q: "What proof do MUDs usually ask for?",
    a: "A repair invoice from a plumber is the document every verified MUD rule asks for, showing the repair date, address, type of repair, and cost. Harris County MUD 71 goes further: it requires a sworn written application, proof of an Eye On Water account with the smart meter registered, and at least 12 billing cycles of usage history at the address. Visible leaks, such as a dripping faucet or a hose leak, are excluded under its rule.",
  },
];
