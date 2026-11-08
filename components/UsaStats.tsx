import Link from "next/link";
import { cacheLife } from "next/cache";
import { getSupabase } from "@/lib/supabase";

function PinIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function DropletIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2s6.5 7.1 6.5 12.3c0 3.6-2.9 6.5-6.5 6.5s-6.5-2.9-6.5-6.5C5.5 9.1 12 2 12 2z" />
    </svg>
  );
}

function SnowIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <path strokeLinecap="round" d="M12 2v20M4 6l16 12M20 6L4 18M12 2l-2 3m2-3l2 3M12 22l-2-3m2 3l2-3" />
    </svg>
  );
}

function SunIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path strokeLinecap="round" d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4l1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function HomeIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5L12 3l9 7.5M5 9.5V21h14V9.5" />
    </svg>
  );
}

interface Extreme {
  town: string;
  town_slug: string;
  metro_slug: string;
  value: string;
}

interface Stats {
  towns: number;
  metros: number;
  avgRain: number | null;
  avgFreeze: number | null;
  avgHeat: number | null;
  avgPre1980: number | null;
  wettest: Extreme | null;
  iciest: Extreme | null;
  oldest: Extreme | null;
}

async function getStats(): Promise<Stats | null> {
  "use cache";
  cacheLife({ revalidate: 3600 });
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb
    .from("towns")
    .select("town, town_slug, metro_slug, parent_metro, rainfall_annual_in, freeze_days_per_year, days_over_100f, census_homes_pre1980_pct");
  if (!data || data.length === 0) return null;

  const avg = (vals: (number | null)[]) => {
    const v = vals.filter((x): x is number => x != null);
    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
  };
  const maxBy = (key: string) => {
    let best: any = null;
    for (const r of data) {
      const v = (r as any)[key];
      if (v != null && (best == null || v > (best as any)[key])) best = r;
    }
    return best;
  };

  const wet = maxBy("rainfall_annual_in");
  const ice = maxBy("freeze_days_per_year");
  const old = maxBy("census_homes_pre1980_pct");
  const ex = (r: any, value: string): Extreme | null =>
    r ? { town: r.town, town_slug: r.town_slug, metro_slug: r.metro_slug, value } : null;

  return {
    towns: data.length,
    metros: new Set(data.map((r: any) => r.parent_metro)).size,
    avgRain: avg(data.map((r: any) => r.rainfall_annual_in)),
    avgFreeze: avg(data.map((r: any) => r.freeze_days_per_year)),
    avgHeat: avg(data.map((r: any) => r.days_over_100f)),
    avgPre1980: avg(data.map((r: any) => r.census_homes_pre1980_pct),
    ) as number | null,
    wettest: ex(wet, wet ? `${wet.rainfall_annual_in}" rain/yr` : ""),
    iciest: ex(ice, ice ? `${ice.freeze_days_per_year} freeze days/yr` : ""),
    oldest: ex(old, old ? `${old.census_homes_pre1980_pct}% pre-1980 homes` : ""),
  };
}

function Card({ icon, value, label, hint, fill, barClass }: {
  icon: React.ReactNode; value: string; label: string; hint: string; fill: number; barClass: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-800 text-amber-400">
        {icon}
      </span>
      <p className="mt-4 text-4xl font-extrabold tracking-tight text-blue-950">{value}</p>
      <p className="mt-1 text-sm font-bold text-slate-700">{label}</p>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200" role="img" aria-label={`${label}: ${value}`}>
        <div className={`h-full rounded-full ${barClass}`} style={{ width: `${Math.round(fill)}%` }} />
      </div>
      <p className="mt-2 text-xs text-slate-500">{hint}</p>
    </div>
  );
}

/**
 * Homepage USA data section — aggregates computed live from the towns
 * table. Honest labeling: Phase 1 is Texas; USA coverage grows as we expand.
 * Renders nothing until at least the town rows exist.
 */
export default async function UsaStats() {
  const s = await getStats();
  if (!s) return null;

  const cards: React.ReactNode[] = [];
  cards.push(
    <Card key="towns" icon={<PinIcon />} value={String(s.towns)} label="Towns researched"
      hint="Hyper-local guides, 10 services each" fill={Math.min(100, (s.towns / 50) * 100)} barClass="bg-blue-800" />
  );
  if (s.avgRain != null) cards.push(
    <Card key="rain" icon={<DropletIcon />} value={`${s.avgRain.toFixed(1)}"`} label="Avg annual rainfall"
      hint="Across covered towns · Open-Meteo" fill={Math.min(100, (s.avgRain / 60) * 100)} barClass="bg-sky-500" />
  );
  if (s.avgFreeze != null) cards.push(
    <Card key="freeze" icon={<SnowIcon />} value={String(Math.round(s.avgFreeze))} label="Avg freeze days / year"
      hint="Nights below 32°F · Open-Meteo" fill={Math.min(100, (s.avgFreeze / 60) * 100)} barClass="bg-blue-600" />
  );
  if (s.avgHeat != null) cards.push(
    <Card key="heat" icon={<SunIcon />} value={String(Math.round(s.avgHeat))} label="Avg days over 100°F / year"
      hint="Extreme heat days · Open-Meteo" fill={Math.min(100, (s.avgHeat / 120) * 100)} barClass="bg-amber-500" />
  );
  if (s.avgPre1980 != null) cards.push(
    <Card key="pre1980" icon={<HomeIcon />} value={`${s.avgPre1980.toFixed(1)}%`} label="Avg homes built before 1980"
      hint="Older pipes = higher leak risk · US Census ACS" fill={Math.min(100, s.avgPre1980)} barClass="bg-rose-500" />
  );
  cards.push(
    <Card key="metros" icon={<PinIcon />} value={String(s.metros)} label="Metro hubs live"
      hint="More states as guides meet our bar" fill={Math.min(100, (s.metros / 5) * 100)} barClass="bg-indigo-500" />
  );

  const extremes = [
    s.wettest && { label: "Wettest town", ...s.wettest },
    s.iciest && { label: "Most freeze days", ...s.iciest },
    s.oldest && { label: "Oldest housing stock", ...s.oldest },
  ].filter(Boolean) as ({ label: string } & Extreme)[];

  return (
    <section className="bg-slate-50" aria-label="Coverage data">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <p className="text-center text-xs font-bold uppercase tracking-[0.25em] text-blue-700">
          Phase 1 · Texas — expanding nationwide
        </p>
        <h2 className="mt-3 text-center text-3xl font-extrabold tracking-tight text-blue-950">
          The USA by the numbers
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">
          Live figures computed from our researched towns — true public-API
          data, not estimates. This is the dataset behind every guide.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards}
        </div>
        {extremes.length > 0 && (
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {extremes.map((e) => (
              <Link
                key={e.label}
                href={`/tx/${e.metro_slug}/${e.town_slug}/`}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{e.label}</p>
                <p className="mt-1 text-lg font-extrabold text-blue-950 group-hover:underline">{e.town}</p>
                <p className="mt-1 text-sm text-slate-600">{e.value} →</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
