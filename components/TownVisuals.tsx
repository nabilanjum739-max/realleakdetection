import type { TownRow } from "@/lib/supabase";

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

function CalendarIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path strokeLinecap="round" d="M3 10h18M8 3v4m8-4v4" />
    </svg>
  );
}

interface Figure {
  key: string;
  icon: React.ReactNode;
  value: string;
  label: string;
  hint: string;
  /** 0–100 fill for the bar */
  fill: number;
  barClass: string;
}

// Build-time constant (calling new Date() during prerender is blocked in Next 16).
const THIS_YEAR = new Date().getFullYear();

/**
 * Graphical API figures — rendered ONLY from the enrichment columns.
 * If enrichment hasn't run (all NULL), renders nothing: no fake graphics.
 * Sources: Open-Meteo (climate), US Census ACS (housing).
 */
export default function TownVisuals({ row }: { row: TownRow }) {
  const figs: Figure[] = [];

  if (row.rainfall_annual_in != null) {
    figs.push({
      key: "rain",
      icon: <DropletIcon />,
      value: `${row.rainfall_annual_in}"`,
      label: "Annual rainfall",
      hint: "Trailing 12 months · Open-Meteo",
      fill: Math.min(100, (row.rainfall_annual_in / 60) * 100),
      barClass: "bg-sky-500",
    });
  }
  if (row.freeze_days_per_year != null) {
    figs.push({
      key: "freeze",
      icon: <SnowIcon />,
      value: String(row.freeze_days_per_year),
      label: "Freeze days / year",
      hint: "Nights below 32°F · Open-Meteo",
      fill: Math.min(100, (row.freeze_days_per_year / 60) * 100),
      barClass: "bg-blue-600",
    });
  }
  if (row.days_over_100f != null) {
    figs.push({
      key: "heat",
      icon: <SunIcon />,
      value: String(row.days_over_100f),
      label: "Days over 100°F / year",
      hint: "Extreme heat days · Open-Meteo",
      fill: Math.min(100, (row.days_over_100f / 120) * 100),
      barClass: "bg-amber-500",
    });
  }
  if (row.census_median_year_built != null) {
    const age = THIS_YEAR - row.census_median_year_built;
    figs.push({
      key: "built",
      icon: <HomeIcon />,
      value: String(row.census_median_year_built),
      label: "Median home built",
      hint: `~${age} years old · US Census ACS`,
      fill: Math.min(100, (age / 100) * 100),
      barClass: "bg-indigo-500",
    });
  }
  if (row.census_homes_pre1980_pct != null) {
    figs.push({
      key: "pre1980",
      icon: <CalendarIcon />,
      value: `${row.census_homes_pre1980_pct}%`,
      label: "Homes built before 1980",
      hint: "Older pipes = higher leak risk · US Census ACS",
      fill: Math.min(100, row.census_homes_pre1980_pct),
      barClass: "bg-rose-500",
    });
  }

  if (figs.length === 0) return null;

  return (
    <section className="bg-white" aria-label={`${row.town} true figures`}>
      <div className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-2xl font-extrabold tracking-tight text-blue-950 md:text-3xl">
          {row.town} by the numbers
        </h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          True figures from public APIs — not estimates, not guesses. This is
          the data behind {row.town}'s leak risk.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {figs.map((f) => (
            <div key={f.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-800 text-amber-400">
                  {f.icon}
                </span>
              </div>
              <p className="mt-4 text-4xl font-extrabold tracking-tight text-blue-950">{f.value}</p>
              <p className="mt-1 text-sm font-bold text-slate-700">{f.label}</p>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200" role="img" aria-label={`${f.label}: ${f.value}`}>
                <div className={`h-full rounded-full ${f.barClass}`} style={{ width: `${Math.round(f.fill)}%` }} />
              </div>
              <p className="mt-2 text-xs text-slate-500">{f.hint}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
