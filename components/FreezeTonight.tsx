import Link from "next/link";
import freezeData from "@/public/data/freeze-risk.json";
import { TOWNS } from "@/lib/towns";

/**
 * Homepage freeze-risk widget — tonight's coldest / highest-risk towns,
 * read at BUILD TIME from public/data/freeze-risk.json. The nightly
 * workflow commits a fresh JSON and Vercel redeploys on that commit,
 * so the build-time snapshot is tonight's data. The night label comes
 * from the JSON itself, never from a clock. Bands match
 * scripts/fetch-freeze-risk.py: low / watch / high.
 */

interface FreezeTown {
  town: string;
  metro: string;
  low_f: number;
  freeze_hours: number;
  hard_freeze_hours: number;
  hard_freeze: boolean;
  band: string;
}

interface FreezeFile {
  generated_at_utc: string;
  forecast_night: string;
  source: string;
  towns: Record<string, FreezeTown>;
}

const BAND_RANK: Record<string, number> = { high: 0, watch: 1, low: 2 };

const BAND_BADGE: Record<string, { label: string; cls: string }> = {
  high: { label: "High risk", cls: "bg-red-100 text-red-800" },
  watch: { label: "Watch", cls: "bg-amber-100 text-amber-800" },
  low: { label: "Low risk", cls: "bg-green-100 text-green-800" },
};

function SnowIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <path strokeLinecap="round" d="M12 2v20M4 6l16 12M20 6L4 18M12 2l-2 3m2-3l2 3M12 22l-2-3m2 3l2-3" />
    </svg>
  );
}

export default function FreezeTonight() {
  const data = freezeData as FreezeFile;
  const entries = Object.entries(data.towns).map(([slug, t]) => ({ slug, ...t }));
  const top = entries
    .sort(
      (a, b) =>
        (BAND_RANK[a.band] ?? 3) - (BAND_RANK[b.band] ?? 3) ||
        b.freeze_hours - a.freeze_hours ||
        a.low_f - b.low_f
    )
    .slice(0, 8);
  const anyRisk = top.some((t) => t.band !== "low");
  const ref = (slug: string) => TOWNS.find((t) => t.townSlug === slug);

  return (
    <section aria-label="Freeze-burst risk tonight" className="bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="overflow-hidden rounded-3xl bg-blue-950 shadow-xl">
          <div className="grid md:grid-cols-[1fr_1.4fr]">
            <div className="p-8 md:p-10">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-sky-300">
                <SnowIcon className="h-5 w-5" /> Live forecast data
              </p>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white">
                Freeze-burst risk tonight
              </h2>
              <p className="mt-3 text-[15px] leading-6 text-blue-100">
                {data.forecast_night}. A pipe only needs a few hours below
                32°F to freeze and split — these are the Texas towns in our
                guides facing the coldest night.
              </p>
              <p className="mt-4 text-sm text-blue-300">
                {anyRisk
                  ? "Some towns face freezing hours tonight — drip taps on exterior walls and open sink cabinets before bed."
                  : "No freezing hours are forecast in these towns tonight — no freeze precautions needed."}
              </p>
              <Link
                href="/tools/freeze-risk-tonight/"
                className="mt-6 inline-flex items-center rounded-full bg-white px-6 py-3 text-sm font-extrabold text-blue-950 transition hover:bg-sky-100"
              >
                Check your town&apos;s risk →
              </Link>
              <p className="mt-4 text-xs text-blue-400">
                Forecast: Open-Meteo, refreshed nightly. Risk bands are
                guidance, not a guarantee.
              </p>
            </div>
            <ul className="grid content-center gap-2.5 bg-blue-900/40 p-6 sm:grid-cols-2 md:p-8">
              {top.map((t) => {
                const badge = BAND_BADGE[t.band] ?? BAND_BADGE.low;
                const r = ref(t.slug);
                const inner = (
                  <>
                    <span className="min-w-0">
                      <span className="block truncate font-bold text-white">
                        {t.town}
                        <span className="ml-2 text-xs font-semibold text-blue-300">
                          {t.metro} metro
                        </span>
                      </span>
                      <span className="mt-0.5 block text-xs text-blue-200">
                        Low {Math.round(t.low_f)}°F · {t.freeze_hours}h below
                        freezing
                      </span>
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-extrabold ${badge.cls}`}
                    >
                      {badge.label}
                    </span>
                  </>
                );
                const cls =
                  "flex items-center justify-between gap-3 rounded-xl border border-blue-800 bg-blue-950/70 px-4 py-3";
                return (
                  <li key={t.slug}>
                    {r ? (
                      <Link href={`/tx/${r.metroSlug}/${r.townSlug}/`} className={`${cls} transition hover:border-sky-400`}>
                        {inner}
                      </Link>
                    ) : (
                      <div className={cls}>{inner}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
