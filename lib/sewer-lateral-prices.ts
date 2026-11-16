// DO NOT EDIT BY HAND.
// Texas sewer lateral replacement prices + sewer camera inspection tiers for
// the Texas Sewer Lateral Replacement Estimator (Tool 9).
// Researched Nov 16, 2026 from Texas contractor/plumber-published prices
// (NuFlow DFW, Plano Sewer Line, Allen Sewer Line, Angi Dallas, Texas
// Plumbing Directory, Sewer Repair Houston) and national cost guides where
// no Texas price exists. Ranges are planning ranges, NOT quotes — a camera
// inspection is the only way to price a specific house.
// See files/texas-ho-b-sewer-lateral-2026-11-16.md for full citations,
// assumptions, and the UNVERIFIED list.

export interface SewerLateralMethod {
  /** Method key: 'open-cut' | 'cipp-lining' | 'pipe-bursting' | 'spot-repair'. */
  method: string;
  /** Display name. */
  label: string;
  /** Low end of published per-foot range, USD. null for per-job pricing (spot repair). */
  pricePerFootLow: number | null;
  /** High end of published per-foot range, USD. null for per-job pricing. */
  pricePerFootHigh: number | null;
  /** Low end of published typical total-project range, USD. */
  totalLow: number;
  /** High end of published typical total-project range, USD. */
  totalHigh: number;
  /** Length/depth/surface assumptions behind the range. */
  assumptions: string;
  /** Citable source URL for this row. */
  sourceUrl: string;
  /** true only when the price comes from a Texas-published source. */
  texasVerified: boolean;
}

/**
 * Sewer lateral replacement methods. All four methods have Texas-published
 * prices (DFW + Houston sources). No San Antonio / Austin / El Paso metro
 * specific prices were found — these are DFW/Houston Texas figures.
 */
export const SEWER_LATERAL_METHODS: SewerLateralMethod[] = [
  {
    method: 'open-cut',
    label: 'Open-cut / trench replacement',
    pricePerFootLow: 50,
    pricePerFootHigh: 250,
    totalLow: 4000,
    totalHigh: 15000,
    assumptions:
      'Typical DFW residential lateral 30–40 ft. $50–$250/ft is the consensus Texas band (Angi Dallas, Allen, Texas Plumbing Directory); NuFlow DFW lists $150–$450/ft for complex/deep jobs, with totals to $30,000+. Cheapest per foot but highest surface-restoration cost (driveway, patio, landscaping). Only option for collapsed, bellied, or grade-loss lines. Totals exclude restoration unless stated.',
    sourceUrl: 'https://nuflowdfw.com/sewer-line-replacement-vs-pipe-lining/',
    texasVerified: true,
  },
  {
    method: 'cipp-lining',
    label: 'Pipe lining (CIPP)',
    pricePerFootLow: 80,
    pricePerFootHigh: 250,
    totalLow: 5000,
    totalHigh: 15000,
    assumptions:
      'Resin liner cured inside the existing pipe; two small access points, typically 1–2 days, ~50-year design life (ASTM F1216). Requires a host pipe that still holds shape — cracks, corrosion, and root intrusion qualify; collapse or belly does not. NuFlow DFW lining starts at $3,500+ (Q2 2026). Plano lists $70–$150/ft at the low end.',
    sourceUrl: 'https://nuflowdfw.com/sewer-line-replacement-vs-pipe-lining/',
    texasVerified: true,
  },
  {
    method: 'pipe-bursting',
    label: 'Pipe bursting (trenchless replacement)',
    pricePerFootLow: 60,
    pricePerFootHigh: 250,
    totalLow: 6000,
    totalHigh: 18000,
    assumptions:
      'Bursting head fractures the old pipe outward while pulling new HDPE through; two access pits, typically 1–2 days. Pricier per foot than open-cut, often comparable once driveway/yard restoration is counted. Texas band $60–$250/ft across Allen, Plano, Angi Dallas, Texas Plumbing Directory, and NuFlow DFW ($150–$250/ft).',
    sourceUrl: 'https://www.allensewerline.com/',
    texasVerified: true,
  },
  {
    method: 'spot-repair',
    label: 'Spot repair (single section)',
    pricePerFootLow: null,
    pricePerFootHigh: null,
    totalLow: 1500,
    totalHigh: 4000,
    assumptions:
      'Priced per job, not per foot. One bad section only — the camera must confirm the rest of the line is sound. Texas Plumbing Directory and the Houston guide both publish $1,500–$4,000 for Texas.',
    sourceUrl: 'https://www.thetexasplumbingdirectory.com/resources/sewer-line-repair-cost-texas',
    texasVerified: true,
  },
];

export interface CameraTier {
  /** Access situation: 'cleanout' | 'home-inspection-addon' | 'toilet-pull' | 'new-cleanout'. */
  accessType: string;
  /** Display label. */
  label: string;
  /** Low end of the published range, USD. */
  low: number;
  /** High end of the published range, USD. */
  high: number;
  /** What the price covers / assumes. */
  notes: string;
  /** Citable source URL. */
  sourceUrl: string;
  /** true only when the price comes from a Texas-published source. */
  texasVerified: boolean;
}

/**
 * Sewer camera inspection cost by access type. The cleanout tier is
 * Texas-verified; the other three tiers are NATIONAL ranges — no
 * Texas-specific price was found for them (see notes + report §B4).
 */
export const CAMERA_TIERS: CameraTier[] = [
  {
    accessType: 'cleanout',
    label: 'Existing exterior cleanout',
    low: 150,
    high: 500,
    notes:
      'Texas cluster is $250–$400 (S.W.A.T. Fort Worth/Aledo $250–$400 flat incl. report + video; Dodd\'s Houston $200–$400; James Armstrong Richardson $150–$400; Houston guide $250–$500; NuFlow DFW starts at $250+). Some DFW/Houston plumbers include the camera free with a cleaning or repair job. Ask for the recording + a written report with defect depth/location marked.',
    sourceUrl: 'https://www.swatplumbing.com/plumbing/sewer-camera-inspections/',
    texasVerified: true,
  },
  {
    accessType: 'home-inspection-addon',
    label: 'Add-on to a home inspection (pre-purchase)',
    low: 100,
    high: 250,
    notes:
      'NATIONAL range (NuFlow DFW page labels its table "2026 national ranges"). No Texas-specific add-on price found.',
    sourceUrl: 'https://nuflowdfw.com/sewer-scope-inspection-cost/',
    texasVerified: false,
  },
  {
    accessType: 'toilet-pull',
    label: 'No cleanout — toilet pulled for access',
    low: 175,
    high: 750,
    notes:
      'NATIONAL range (NuFlow DFW table). Adds roughly $50–$220 in labour to pull the toilet and reset it with a new wax ring. No Texas-specific price found.',
    sourceUrl: 'https://nuflowdfw.com/sewer-scope-inspection-cost/',
    texasVerified: false,
  },
  {
    accessType: 'new-cleanout',
    label: 'No cleanout — new cleanout must be installed',
    low: 700,
    high: 2000,
    notes:
      'NATIONAL range (NuFlow DFW $700–$2,000+; SewerLineLab $600–$2,000). The cleanout install alone runs $500–$1,500 before the inspection cost. No Texas-specific price found.',
    sourceUrl: 'https://nuflowdfw.com/sewer-scope-inspection-cost/',
    texasVerified: false,
  },
];

export interface SewerPermitNote {
  /** City / scope the note applies to. */
  city: string;
  /** Verified permit fact. */
  note: string;
  sourceUrl: string;
}

/** Permit facts verified per Texas city. Other Texas cities: UNVERIFIED. */
export const SEWER_PERMIT_NOTES: SewerPermitNote[] = [
  {
    city: 'Statewide (Texas)',
    note: 'Sewer lateral work is permitted plumbing work in every Texas jurisdiction and must be done under a licensed plumber. The issuing office varies: the city inside city limits, the county or a MUD in unincorporated suburbs. The contractor normally pulls the permit and schedules inspections.',
    sourceUrl: 'https://www.cpc-trenchless.com/faq/',
  },
  {
    city: 'Dallas',
    note: 'Repairing or replacing a building sewer usually requires a plumbing permit from the City of Dallas Development Services Department; a Texas-licensed master plumber must pull it, and a city inspector checks the work before it is covered. Under Dallas City Code Sec. 49-24, the city maintains the service connection only from the main to the property line; the private building sewer beyond that is the owner\'s responsibility.',
    sourceUrl: 'https://www.mrrooter.com/dallas/residential-services/sewer-line-repair/',
  },
  {
    city: 'Plano',
    note: 'City of Plano permits add $400–$1,600 to a sewer line replacement project.',
    sourceUrl: 'https://www.planosewerline.com/',
  },
];

/** Cost drivers verified across Texas sources — shown with every estimate. */
export const SEWER_COST_DRIVERS: string[] = [
  'Length — most DFW homes need 30–40 ft of lateral; totals scale almost linearly per foot.',
  'Depth — deeper digs cost more (excavation, shoring); deep clay or cast-iron lines price very differently from shallow 2000s PVC.',
  'Surface above — driveway, patio, mature landscaping, and irrigation/sprinkler restoration; trenchless often nets out comparable once restoration is counted.',
  'Pipe condition and material — collapsed, bellied, or grade-loss lines rule out lining; cast iron / clay / Orangeburg cost more to handle than PVC.',
  'Cleanout access — no cleanout means a toilet-pull or a new cleanout install before work can start.',
  'Soil — Blackland Prairie / Houston Black expansive clay; limestone in Central Texas.',
  'Permits and inspection — required in Texas jurisdictions; the plumber usually pulls the permit.',
];
