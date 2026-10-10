import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { cacheLife } from "next/cache";

let client: SupabaseClient | null | undefined;

/**
 * Server-side Supabase client. Returns null when env vars are missing
 * (e.g. local build before the project exists) so `npm run build`
 * succeeds and pages render placeholders.
 */
export function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    client = null;
    return null;
  }
  client = createClient(url, key);
  return client;
}

export interface TownRow {
  town: string;
  parent_metro: string;
  state: string;
  town_slug: string;
  metro_slug: string;
  zip_codes: string | null;
  soil_type: string | null;
  soil_leak_note: string | null;
  foundation_types: string | null;
  housing_era: string | null;
  common_pipe_materials: string | null;
  neighborhoods: string | null;
  price_leak_detection: string | null;
  price_slab_detection: string | null;
  price_sewer_camera: string | null;
  permit_note: string | null;
  water_utility: string | null;
  climate_note: string | null;
  seasonal_angle: string | null;
  competitor_gap: string | null;
  census_median_year_built: number | null;
  census_homes_pre1980_pct: number | null;
  rainfall_annual_in: number | null;
  freeze_days_per_year: number | null;
  days_over_100f: number | null;
  soil_clay_pct: number | null;
  water_system_epa: string | null;
  page_html: string | null;
  page_status: string | null;
  omission_log: Record<string, unknown> | null;
}

export async function getTown(metroSlug: string, townSlug: string): Promise<TownRow | null> {
  "use cache";
  cacheLife({ revalidate: 3600 }); // town rows refresh hourly (ISR-style)
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb
    .from("towns")
    .select("*")
    .eq("metro_slug", metroSlug)
    .eq("town_slug", townSlug)
    .limit(1)
    .maybeSingle();
  return (data as TownRow | null) ?? null;
}

export async function getSiblings(metroSlug: string, townSlug: string): Promise<TownRow[]> {
  "use cache";
  cacheLife({ revalidate: 3600 }); // sibling lists refresh hourly (ISR-style)
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb
    .from("towns")
    .select("town, town_slug, metro_slug")
    .eq("metro_slug", metroSlug)
    .neq("town_slug", townSlug)
    .limit(4);
  return (data as TownRow[]) ?? [];
}
