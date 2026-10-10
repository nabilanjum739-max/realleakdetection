// The 10 services (mirrors supabase/services table). Fixed list.
export interface Service {
  slug: string;
  name: string;
  subNiche: string;
  blurb: string;
}

export const SERVICES: Service[] = [
  { slug: "slab-leak-detection", name: "Slab leak detection", subNiche: "Slab & Underground", blurb: "Pinpoint leaks under concrete slabs with acoustic and thermal equipment — no guesswork cutting." },
  { slug: "underground-yard-line-leak-detection", name: "Underground / yard line leak detection", subNiche: "Slab & Underground", blurb: "Find leaks in buried yard lines between the meter and the house, then map the repair." },
  { slug: "water-main-leak-detection", name: "Water main leak detection", subNiche: "Slab & Underground", blurb: "Locate breaks in the main supply line before excavation — pressure testing plus acoustic pinpointing." },
  { slug: "sewer-line-leak-detection", name: "Sewer line leak detection", subNiche: "Sewer & Drain", blurb: "Track down sewer line leaks and separations caused by shifting soil and root intrusion." },
  { slug: "sewer-camera-inspection", name: "Sewer camera inspection & diagnosis", subNiche: "Sewer & Drain", blurb: "See inside the line: HD camera inspection with video you keep and a written diagnosis." },
  { slug: "septic-tank-leak-detection", name: "Septic tank leak detection", subNiche: "Sewer & Drain", blurb: "Dye testing and inspection for septic tanks, lids, baffles and drain fields." },
  { slug: "gas-line-leak-detection", name: "Natural gas line leak detection", subNiche: "Gas Line", blurb: "Electronic gas leak surveys. Safety first: smell gas — leave, call 911, then your utility." },
  { slug: "pool-leak-detection", name: "Pool leak detection", subNiche: "Pool, Water Heater & Yard", blurb: "Pressure testing, dye testing and acoustic methods to find pool and plumbing leaks fast." },
  { slug: "tankless-water-heater-leak-detection", name: "Tankless water heater leak detection", subNiche: "Pool, Water Heater & Yard", blurb: "Diagnose leaks at tankless units, valves, condensate and venting connections." },
  { slug: "irrigation-sprinkler-leak-detection", name: "Irrigation / sprinkler leak detection", subNiche: "Pool, Water Heater & Yard", blurb: "Zone-by-zone pressure tests to find sprinkler line and valve leaks without digging up the lawn." },
];

export const SUB_NICHES = [...new Set(SERVICES.map((s) => s.subNiche))]; // 4
