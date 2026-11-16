// DO NOT EDIT BY HAND.
// Generated from utility-adjustment-rules research Nov 16, 2026.
// Source report: goals/usa-leak-detection-programmatic-seo-site/files/utility-adjustment-rules-2026-11-16.md
// Only VERIFIED rules are included here. Anything marked UNVERIFIED in the report is
// omitted from this file entirely. A null sub-field means the utility does not publish
// that item (a verified absence), NOT that it is unknown — see `notes` per entry.
// Re-check every rule against its sourceUrl before relying on a deadline or percentage;
// rules change, and the checkedDate below is the last verification date.

export interface UtilityAdjustment {
  exists: boolean;
  /** What kind of leak qualifies, in the utility's own terms. */
  qualifies: string;
  /** Credit as a percent of excess usage, when the utility publishes a flat %. */
  creditPct: number | null;
  /** Credit formula in words (tiered %, lowest-rate reprice, or "not published"). */
  formula: string | null;
  /** Days after the repair date by which the request must be filed; null = not published. */
  deadlineDays: number | null;
  /** e.g. "One adjustment per 12-month period"; null = not published. */
  frequencyLimit: string | null;
  /** Max billing months/bills one adjustment can cover; null = not published. */
  maxMonths: number | null;
  proofRequired: string;
  /** Official form / apply page. */
  formUrl: string;
}

export interface WinterAveraging {
  /** True when sewer charges are set from winter water use. */
  used: boolean;
  /** Averaging months, e.g. ["December", "January", "February"]. Empty when not used. */
  months: string[];
  /**
   * What happens when a leak falls in the averaging months, and whether the
   * utility's adjustment corrects the inflated sewer average.
   * Starts with "UNVERIFIED" when no official source states it.
   */
  leakMonthEffect: string;
}

export interface UtilityRule {
  utility: string;
  metro: string;
  /** Slugs of OUR towns verified to be served by this utility. Empty means the rule
   *  covers the anchor city only — none of our towns in that metro is served by it. */
  townSlugs: string[];
  /** Null when the utility has no published leak-adjustment policy. */
  adjustment: UtilityAdjustment | null;
  /** Null when winter-averaging behaviour could not be verified. */
  winterAveraging: WinterAveraging | null;
  sourceUrl: string;
  checkedDate: string;
  verified: boolean;
  /** Caveats, discrepancies and scope notes for tool builders. */
  notes?: string;
}

export const UTILITY_RULES: UtilityRule[] = [
  {
    utility: 'City of Houston Water (Houston Public Works)',
    metro: 'Houston',
    townSlugs: [],
    adjustment: {
      exists: true,
      qualifies:
        'Loss of water through an "excusable defect" in the customer\'s water line (rupture/leakage caused by weather, settlement, corrosion, wear or accident). Visible leaks such as faucet and hose leaks are ineligible.',
      creditPct: null,
      formula:
        '100% of the water charge on usage above average if repaired within 30 days, 75% within 60 days, 50% after 60 days (from leak start date or leak notification date).',
      deadlineDays: 180,
      frequencyLimit: null,
      maxMonths: 3,
      proofRequired:
        'Documentation of repair date, address, type of repair and cost. Acceptable: plumber\'s statement/bill, receipt for parts, or a signed written statement.',
      formUrl:
        'https://www.houstonwaterbills.houstontx.gov/ProdDP/Billing/AccountBasedServiceRequest/UniversalAdjustmentRequest',
    },
    winterAveraging: {
      used: false,
      months: [],
      leakMonthEffect:
        'No winter averaging — wastewater is billed on monthly metered water with no cap, so a leak cannot inflate a future sewer average. The leak adjustment itself covers water AND wastewater (Code Sec. 47-74).',
    },
    sourceUrl:
      'https://www.houstonwaterbills.houstontx.gov/ProdDP/Billing/AccountBasedServiceRequest/UniversalAdjustmentRequest',
    checkedDate: '2026-11-16',
    verified: true,
    notes:
      'Anchor city only: none of our 10 Houston-metro towns is served by City of Houston Water (own city systems or MUDs). Frequency limit not stated on the current page; the city\'s 2010 paper form said max 2 per 12 months (stale — do not use). Related programs on the same page: Unusually Large Bill (Sec. 47-75, 1 month, 1 per 12 months, usage over 200% of average) and Exceptional Circumstance Adjustment (Sec. 47-75.1, up to 2 bills in 24 months, credit capped at $10,000).',
  },
  {
    utility: 'City of Dallas Water Utilities',
    metro: 'Dallas',
    townSlugs: [],
    adjustment: {
      exists: true,
      qualifies:
        'Hidden or concealed water leak on the customer\'s property causing a substantial increase in water consumption. Does NOT cover wastewater or sewer leaks.',
      creditPct: null,
      formula:
        'No % credit: the cost per unit of water above the average is recalculated at the lowest rate on the rate scale.',
      deadlineDays: 90,
      frequencyLimit: 'One adjustment per 12-month period',
      maxMonths: 3,
      proofRequired:
        'Date repairs completed; detailed description of repairs; address; account number; meter number for multi-metered accounts.',
      formUrl:
        'https://dallascityhall.com/departments/waterutilities/Pages/Request-a-Leak-Adjustment.aspx',
    },
    winterAveraging: {
      used: true,
      months: ['December', 'January', 'February', 'March'],
      leakMonthEffect:
        'NOT corrected: the Dallas leak adjustment "does not cover or apply to wastewater or sewer leaks", so a leak in Dec–Mar inflates the winter average and the sewer charges that follow. (Inference from two official DWU facts.) Sewer is the Dec–Mar average or the current month\'s use, whichever is less, capped at 40,000 gal/month.',
    },
    sourceUrl:
      'https://dallascityhall.com/departments/waterutilities/Pages/Request-a-Leak-Adjustment.aspx',
    checkedDate: '2026-11-16',
    verified: true,
    notes:
      'Anchor city only: none of our 10 Dallas-metro towns is served by Dallas Water Utilities. Deadline (90 days) is from the city\'s Leak Adjustment Request form DWU-FRM-004-RB rev. 4 (eff. 2019-02-01); the current web page does not restate a deadline.',
  },
  {
    utility: 'San Antonio Water System (SAWS)',
    metro: 'San Antonio',
    townSlugs: [],
    adjustment: {
      exists: true,
      qualifies:
        'Repaired leak on your property. Eligible types listed by SAWS: faucet; toilet (supply line or tank); shower head; broken pipe (in wall, foundation, yard); irrigation main-line break or non-working nozzles; PRV; flex supply line; water heater/softener; swimming pool (supply line, faulty refill, cracked lining/wall). NOT eligible: irrigation problems from controller settings or over-watering.',
      creditPct: null,
      formula: 'A portion of the usage caused by the leak (no % published by SAWS).',
      deadlineDays: null,
      frequencyLimit: 'Once every 12 months',
      maxMonths: 2,
      proofRequired:
        'Type and location of leak, description of repair, date repaired. Receipts optional: licensed plumber receipt, DIY plumbing-supplies receipt, or a detailed description of the repair. SAWS does not reimburse repair costs.',
      formUrl:
        'https://dev.saws.sawsapp.com/customer-self-service-options/leak-adjustment-request/',
    },
    winterAveraging: {
      used: true,
      months: ['November', 'December', 'January', 'February', 'March'],
      leakMonthEffect:
        'UNVERIFIED whether the leak adjustment corrects the winter average. SAWS averages water use over 3 consecutive billing periods between mid-November and mid-March; sewer charges for the following 12 months are based on that average (default 5,985 gal). SARA sewer customers: Dec–Feb, updated in July.',
    },
    sourceUrl:
      'https://dev.saws.sawsapp.com/customer-self-service-options/leak-adjustment-request/',
    checkedDate: '2026-11-16',
    verified: true,
    notes:
      'Anchor city only: none of our 10 San Antonio-metro towns is served by SAWS. Deadline is NOT stated on the official page; secondary summaries report 60 days from repair (UNVERIFIED). SAWS states it has no legal obligation to grant an adjustment. Winter-averaging months are billing-period based (mid-Nov to mid-Mar), not calendar months.',
  },
  {
    utility: 'Austin Water',
    metro: 'Austin',
    townSlugs: [],
    adjustment: {
      exists: true,
      qualifies:
        'Indoor plumbing leaks not within the customer\'s control (broken water pipe, unapparent leaks) and hidden outdoor leaks (e.g. underground break in the main water line to the house). Visible leaks do NOT qualify: dripping faucet, broken sprinkler head, pool cracks, malfunctioning pool autofillers (unless staff grants an exception).',
      creditPct: 50,
      formula:
        '50% of the excess usage (usage over and above normal usage); the customer pays the remaining 50% at the lower of the regular rate or an established discounted rate.',
      deadlineDays: 90,
      frequencyLimit: 'One adjustment per 12-month period',
      maxMonths: 2,
      proofRequired:
        'Copy of the leak repair receipt or paid invoice describing the repair; account number; property address; date range of high-bill charges; date and description of repair.',
      formUrl: 'https://www.austintexas.gov/department/high-water-bill-options',
    },
    winterAveraging: {
      used: true,
      months: ['November', 'December', 'January', 'February', 'March'],
      leakMonthEffect:
        'UNVERIFIED whether the leak adjustment corrects the wastewater average. Wastewater averaging runs over 3 consecutive billing periods mid-Nov to mid-Mar and sets a fixed monthly wastewater fee for the next 12 months (residential default 5,000 gal).',
    },
    sourceUrl: 'https://www.austintexas.gov/department/high-water-bill-options',
    checkedDate: '2026-11-16',
    verified: true,
    notes:
      'Anchor city only: none of our 10 Austin-metro towns is served by Austin Water (Lakeway is Lakeway MUD; Brushy Creek MUD is a separate entry). The 50% credit, 1-per-12-months limit and 2-billing-cycle cap come from Council Resolution No. 20110512-003 (2011); the current high-bill page (Code 15-9-141) states the 90-day deadline and proof list but does not restate the % / frequency / max months.',
  },
  {
    utility: 'City of Fort Worth Water',
    metro: 'Fort Worth',
    townSlugs: [],
    adjustment: {
      exists: true,
      qualifies:
        'Single-family residential leak where usage returns to normal after repair; city guidance indicates a hidden leak beneath a foundation or inside a wall may qualify.',
      creditPct: 50,
      formula:
        '50% of the difference above average water use, determined from the six months\' usage prior to the leak (or prior years\' relevant use for seasonality).',
      deadlineDays: 60,
      frequencyLimit: 'One adjustment per rolling 12-month period',
      maxMonths: 2,
      proofRequired:
        'Signed application plus copies of repair receipts or a paid-in-full invoice.',
      formUrl:
        'https://data.templateroller.com/pdf_docs/2445/24453/2445393/main_water-leak-repair-adjustment-application-city-of-fort-worth-texas.pdf?take=binary&c1e7237df5772578d7e850fa3787aa0d',
    },
    winterAveraging: {
      used: true,
      months: ['December', 'January', 'February'],
      leakMonthEffect:
        'NOT corrected: the Fort Worth leak adjustment applies to water only, not sewer, so a Dec–Feb leak inflates the winter quarter average. (Per the City of Denton official benchmark.) Updated average begins on the April water bill; no-history default 9 CCF/month; single-family cap 3,000 cu ft.',
    },
    sourceUrl:
      'https://data.templateroller.com/pdf_docs/2445/24453/2445393/main_water-leak-repair-adjustment-application-city-of-fort-worth-texas.pdf?take=binary&c1e7237df5772578d7e850fa3787aa0d',
    checkedDate: '2026-11-16',
    verified: true,
    notes:
      'Anchor city only: none of our 10 Fort Worth-metro towns is served by Fort Worth Water. CAVEAT: no live fortworthtexas.gov leak-adjustment page was found; the rule rests on a copy of the city\'s March 2021 application form, corroborated by the City of Denton\'s official Aug 2025 Credit & Collections Review benchmark and a PuroClean summary — all three agree on every term. Re-verify against a live city page before the tool goes live. Apply via MyWaterAccount@FortWorthTexas.gov; phone 817-392-4477.',
  },
  {
    utility: 'El Paso Water',
    metro: 'El Paso',
    townSlugs: ['el-paso'],
    adjustment: {
      exists: true,
      qualifies:
        'Hidden leak (behind a wall, underground, or under foundation) increasing consumption by more than 10 CCF. Does NOT qualify if you filled a swimming pool, established new landscaping during the high-volume period, or received a leak adjustment in the previous 24 months.',
      creditPct: 50,
      formula:
        '50% of the excess above baseline (Rules & Regs No. 5: two highest consecutive months affected less the average water charges billed over the previous 12 months). ServLine program: covers the two highest bills in a 3-month span up to $2,500; beyond $2,500 the utility may credit 50% of the remaining balance.',
      deadlineDays: 60,
      frequencyLimit: 'One adjustment per rolling 24-month period',
      maxMonths: 2,
      proofRequired:
        'Receipts or a statement of repairs welcomed; the utility verifies consumption returned to normal after the repair. Adjustment applies to the water portion ONLY — not wastewater, stormwater or environmental services fees.',
      formUrl:
        'https://www.epwater.org/residential/services-and-information/leaks-and-property-protection/water-leak-adjustment',
    },
    winterAveraging: {
      used: true,
      months: ['December', 'January', 'February'],
      leakMonthEffect:
        'NOT corrected: the leak adjustment applies to the water portion only and does not impact wastewater, so a Dec–Feb leak inflates the Average Winter Consumption (AWC). Sewer commodity is charged at 90% of AWC for CCF above the 5 CCF allowance, set through the next February billing cycle.',
    },
    sourceUrl:
      'https://www.epwater.org/residential/services-and-information/leaks-and-property-protection/water-leak-adjustment',
    checkedDate: '2026-11-16',
    verified: true,
    notes:
      'Serves El Paso itself; other El Paso-metro towns (Socorro, Horizon City, Clint, Fabens, San Elizario, Anthony, Canutillo, Vinton, Westway) have their own systems. ServLine Leak Protection Program: auto-enrolled, $1.59/mo residential / $2.31/mo non-residential single-occupancy, opt out via HomeServe; call ServLine 915-273-3999. Baseline wording differs between EPWater\'s FAQ ("same months last year") and program page ("average standard usage over the previous twelve months") — flag in the tool. Meters larger than 2" are eligible for a direct 50% utility adjustment.',
  },
  {
    utility: 'City of Amarillo Water',
    metro: 'Amarillo',
    townSlugs: ['amarillo'],
    adjustment: {
      exists: true,
      qualifies:
        'Leak resulting in consumption of more than 50,000 gallons over the customer\'s 12-month average. (Commercial: same 50,000-gallon threshold; commercial adjustments are sewer only.)',
      creditPct: null,
      formula: null,
      deadlineDays: null,
      frequencyLimit: 'One adjustment every two years',
      maxMonths: 2,
      proofRequired:
        'Documentation of leak repair — plumber receipt, or receipt for the part bought to repair the leak.',
      formUrl: 'https://www.amarillo.gov/utility-billing/',
    },
    winterAveraging: {
      used: true,
      months: ['December', 'January', 'February'],
      leakMonthEffect:
        'UNVERIFIED whether a leak adjustment corrects the winter average. Winter average is calculated from Dec–Feb usage, sets sewer charges for the following year, and is recalculated each March (citywide average 8,000 gal; new accounts temporarily set at 8,000 gal).',
    },
    sourceUrl: 'https://www.amarillo.gov/utility-billing/',
    checkedDate: '2026-11-16',
    verified: true,
    notes:
      'Credit %/formula and deadline are NOT published on the official page (verified absences, not unknowns). Fallback: if a full leak adjustment cannot be applied, a high-consumption adjustment may be considered once per year for up to two billing periods. Apply via a General Customer Service Request in the PayAMA portal or 806-378-3030 / waterbill@amarillo.gov. Other Amarillo-metro towns (Canyon, Hereford, Dumas, Borger, Pampa, Dalhart, Perryton, Tulia, Fritch) have their own municipal systems.',
  },
  {
    utility: 'City of Corpus Christi Water',
    metro: 'Corpus Christi',
    townSlugs: ['corpus-christi'],
    adjustment: null,
    winterAveraging: {
      used: true,
      months: ['December', 'January', 'February'],
      leakMonthEffect:
        'YES — corrected. Code Sec. 55-100(e)(4): for a substantial increase from a hidden water leak during the winter quarter averaging period, with proof of repairs, the director of water utilities or designee may adjust the wastewater bill. Adjusted sewer rate applies to service on/after May 1.',
    },
    sourceUrl:
      'https://legistar.granicus.com/CorpusChristi/attachments/92320581-a173-4e3d-98ef-0ce4c3ba7ce4.pdf',
    checkedDate: '2026-11-16',
    verified: true,
    notes:
      'No published WATER-side leak-adjustment policy, form, deadline or formula was found — adjustment is null for that reason, not because no credit exists. Customer service: (361) 826-3100 / 311. San Patricio Municipal Water District is a WHOLESALE provider only (buys 100% of its water from the City of Corpus Christi; serves Portland, Aransas Pass, Ingleside, Rockport retail systems + industry) — homeowners do not apply to SPMWD. Other Corpus Christi-metro towns have their own systems.',
  },
  {
    utility: 'City of Lubbock Water Utilities',
    metro: 'Lubbock',
    townSlugs: ['lubbock'],
    adjustment: null,
    winterAveraging: {
      used: true,
      months: ['November', 'December', 'January', 'February'],
      leakMonthEffect:
        'UNVERIFIED — no leak-adjustment policy exists to correct an inflated winter average. Wastewater volume is the "history based consumption" (HBC): average water volume for Nov–Feb, updated for billing in March each year; no-history default 7,000 gal/month (Lubbock Code, Ord. 2024-O0128).',
    },
    sourceUrl: 'https://ecode360.com/38871259',
    checkedDate: '2026-11-16',
    verified: true,
    notes:
      'No written leak-adjustment policy was found on the city site (also checked Nov 6, 2026 by WaterShortcut); the code covers billing-error adjustments only. Adjustment is null for that reason. Ask City of Lubbock Utilities (806-775-2509) whether case-by-case credits are reviewed. Other Lubbock-metro towns (Wolfforth, Shallowater, Slaton, Idalou, Levelland, Littlefield, Plainview, Abernathy, Ralls) have their own systems.',
  },
  {
    utility: 'McAllen Public Utility (MPU)',
    metro: 'McAllen',
    townSlugs: ['mcallen'],
    adjustment: null,
    winterAveraging: {
      used: false,
      months: [],
      leakMonthEffect:
        'No winter averaging — residential sewer is billed on 100% of monthly water volume, so there is no 12-month sewer tail from a winter leak. (City of Denton wastewater audit, May 2022, peer-city table.)',
    },
    sourceUrl:
      'https://www.cityofdenton.com/DocumentCenter/View/5427/Audit-of-Wastewater-System-Operations-Reclamation-PDF?bidId=',
    checkedDate: '2026-11-16',
    verified: true,
    notes:
      'No published leak-adjustment policy, form, deadline or formula was found for MPU — adjustment is null for that reason. CAUGHT MISATTRIBUTION: the widely indexed "Special Services" PDF ("25% increase in a 3 billing period average… $1.60 per unit") belongs to Metro Water (metrobwater.com), NOT McAllen — do not use those figures for McAllen. MPU phone: 956-681-1600. Other McAllen-metro towns (Edinburg, Mission, Pharr, Weslaco, Donna, Alamo, San Juan, Mercedes, Hidalgo) have their own systems.',
  },
  {
    utility: 'Harris County MUD 71',
    metro: 'Houston',
    townSlugs: ['cypress'],
    adjustment: {
      exists: true,
      qualifies:
        'Loss of water attributable to an "excusable defect" in the customer\'s water line. Visible leaks excluded, including defective/out-of-repair faucets and hose leaks.',
      creditPct: 50,
      formula:
        'Excess usage above the customer\'s average usage charged at one-half of the normal rate for the customer\'s user classification. West Harris County Regional Water Authority pumpage/surface-water fees and the sewer portion (flat rate) are NOT adjustable.',
      deadlineDays: 90,
      frequencyLimit: 'Max 2 Leak Adjustment Credits per 12-month period',
      maxMonths: 2,
      proofRequired:
        'Sworn written application plus certification of an Eye On Water account with the smart meter registered (no credit until the district confirms registration). Applicant must have at least 12 billing cycles of usage history at the address.',
      formUrl: 'https://regionalwater.net/districts',
    },
    winterAveraging: {
      used: false,
      months: [],
      leakMonthEffect:
        'No winter averaging — sewer is charged at a flat rate (per the 2023 resolution), so a winter leak cannot inflate a sewer average.',
    },
    sourceUrl:
      'https://mail.regionalwater.net/images/documents/HC%2071%20Leak%20Adjustment%20Amended%20Resolution%20Adopting%20Policy%20and%20Procedures_8.28.23.pdf',
    checkedDate: '2026-11-16',
    verified: true,
    notes:
      'Amended Resolution Adopting Policy and Procedures for Leak Adjustment Credits, passed Aug 28, 2023. Serves ~17,000 people in the Cypress/Katy area (neighbourhoods include Mason Lakes, Bridgewater, Cypress Glen). Operator: Regional Water Corporation. Apply via the operator; the resolution PDF is the source, not a form. townSlugs is cypress only — coverage is neighbourhood-level, verify by address.',
  },
  {
    utility: 'Brushy Creek MUD',
    metro: 'Austin',
    townSlugs: ['round-rock'],
    adjustment: null,
    winterAveraging: {
      used: true,
      months: ['November', 'December', 'January', 'February'],
      leakMonthEffect:
        'YES — corrected. Customers who experience a leak during the averaging months submit a Wastewater (Sewer) Adjustment Request form with proof of leak repairs. No credits for bills prior to the approved request. Deadline: no adjustments approved after Apr 30 (2025 order) / May 31 (2026 order). VERIFIED example (board agenda Aug 14, 2025, 3106 Monument Dr): sewer average $423.40 → $40.04 if approved.',
    },
    sourceUrl: 'https://www.bcmudtx.gov/content/13126/13244/13369.aspx',
    checkedDate: '2026-11-16',
    verified: true,
    notes:
      'No WATER-side leak credit was found for Brushy Creek MUD — adjustment is null for that reason; the verified mechanism is the wastewater-average correction. Sewer volumetric rate $3.20 per 1,000 gallons; new customers default 7,000 gal. Serves the Brushy Creek community in the Round Rock/Cedar Park area; townSlugs is round-rock only — verify by address. Customer service: 512-255-7871.',
  },
  {
    utility: 'Woodlands Water (The Woodlands Water Agency)',
    metro: 'Houston',
    townSlugs: ['the-woodlands'],
    adjustment: null,
    winterAveraging: {
      used: true,
      months: ['December', 'January', 'February'],
      leakMonthEffect:
        'UNVERIFIED — no published correction mechanism found. The Dec–Feb average sets the maximum monthly sewer charge for the following 12 months.',
    },
    sourceUrl:
      'https://myemail.constantcontact.com/Winter-Sewer-Averaging-continues-through-February-.html?soid=1102106620511&aid=aGAXBaMI_3M',
    checkedDate: '2026-11-16',
    verified: true,
    notes:
      'A one-time leak adjustment exists ("Under certain circumstances, a one-time leak adjustment can be granted. Call 281-367-1271") but no formula, deadline or eligibility list is published — adjustment is null for that reason. Serves 10 MUDs in The Woodlands (The Woodlands MUD No. 1; Montgomery County MUDs 6, 7, 36, 39, 46, 47, 60, 67; The Woodlands Metro Center MUD). Creekside Park is separate (Harris-Montgomery Counties MUD 386).',
  },
];
