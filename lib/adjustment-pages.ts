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
}

function ruleForMetro(metro: string): UtilityRule {
  const rule = UTILITY_RULES.find((r) => r.metro === metro && r.adjustment);
  if (!rule || !rule.adjustment) {
    throw new Error(`No verified leak-adjustment rule for metro: ${metro}`);
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
      "The rule rests on a copy of the city's March 2021 application form, corroborated by the City of Denton's official Aug 2025 benchmark.",
      "The adjustment applies to water only, not sewer — a winter leak still inflates the winter quarter average.",
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
    status: "competitor",
    statusLabel: "Covered by WaterShortcut",
    note: "Verified rule exists (100/75/50% tiered credit, 6-month deadline, up to 3 months) but no guide in this wave — WaterShortcut owns Houston. Apply on the city's official page.",
    pagePath: null,
    officialUrl: "https://www.houstonwaterbills.houstontx.gov/ProdDP/Billing/AccountBasedServiceRequest/UniversalAdjustmentRequest",
    officialLabel: "Houston Universal Adjustment Request",
    phone: null,
  },
  {
    metro: "Dallas",
    utility: "City of Dallas Water Utilities",
    status: "competitor",
    statusLabel: "Covered by WaterShortcut",
    note: "Verified rule exists (lowest-rate reprice of excess use, 90-day deadline on the city form, once per 12 months, up to 3 months) but no guide in this wave — WaterShortcut owns Dallas. Apply on the city's official page.",
    pagePath: null,
    officialUrl: "https://dallascityhall.com/departments/waterutilities/Pages/Request-a-Leak-Adjustment.aspx",
    officialLabel: "Dallas leak adjustment page",
    phone: null,
  },
  {
    metro: "McAllen",
    utility: "McAllen Public Utility (MPU)",
    status: "unverified",
    statusLabel: "No verified policy yet",
    note: "No published leak-adjustment policy, form, deadline, or formula was found. MPU's site tells customers with a high bill to check for leaks first, then request a recheck read. Ask MPU directly whether case-by-case credits are reviewed.",
    pagePath: null,
    officialUrl: null,
    officialLabel: null,
    phone: "956-681-1600",
  },
  {
    metro: "Corpus Christi",
    utility: "Corpus Christi Water",
    status: "unverified",
    statusLabel: "No water-side policy yet",
    note: "No published water-side leak-adjustment policy was found. One verified relief does exist: under Code Sec. 55-100(e)(4), the director may adjust the wastewater bill for a hidden leak during the Dec–Feb winter quarter, with proof of repairs.",
    pagePath: null,
    officialUrl: "https://legistar.granicus.com/CorpusChristi/attachments/92320581-a173-4e3d-98ef-0ce4c3ba7ce4.pdf",
    officialLabel: "Corpus Christi Code Sec. 55-100 (wastewater relief)",
    phone: "(361) 826-3100",
  },
  {
    metro: "Lubbock",
    utility: "City of Lubbock Water Utilities",
    status: "unverified",
    statusLabel: "No verified policy yet",
    note: "No written leak-adjustment policy was found on the city site; the code covers billing-error adjustments only. That does not rule out a case-by-case credit — ask the city directly.",
    pagePath: null,
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
