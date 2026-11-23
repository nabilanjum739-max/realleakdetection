import Link from "next/link";
import { TOWN_PRICES } from "@/lib/town-prices";
import Eyebrow from "@/components/Eyebrow";

/**
 * Homepage cost chart — hand-built SVG range bars showing the typical
 * leak-detection price range per metro, aggregated live from
 * lib/town-prices.ts (researched metro-typical ranges: plumber-published
 * prices, local guides, Angi local data). No chart library, no invented
 * numbers: each bar is the min–max of that metro's researched range.
 */

const METRO_ORDER: Array<{ slug: string; label: string }> = [
  { slug: "houston", label: "Houston" },
  { slug: "dallas", label: "Dallas" },
  { slug: "san-antonio", label: "San Antonio" },
  { slug: "austin", label: "Austin" },
  { slug: "fort-worth", label: "Fort Worth" },
  { slug: "el-paso", label: "El Paso" },
  { slug: "mcallen", label: "McAllen" },
  { slug: "corpus-christi", label: "Corpus Christi" },
  { slug: "lubbock", label: "Lubbock" },
  { slug: "amarillo", label: "Amarillo" },
];

const MAX_DOLLARS = 800;
const CHART_LEFT = 118;
const CHART_RIGHT = 742;
const ROW_H = 34;
const TOP = 26;

export default function CostChart() {
  const rows = METRO_ORDER.map((m) => {
    const prices = TOWN_PRICES.filter((p) => p.metroSlug === m.slug);
    return {
      ...m,
      low: Math.min(...prices.map((p) => p.leakLow)),
      high: Math.max(...prices.map((p) => p.leakHigh)),
    };
  });
  const x = (dollars: number) =>
    CHART_LEFT + (dollars / MAX_DOLLARS) * (CHART_RIGHT - CHART_LEFT);
  const height = TOP + rows.length * ROW_H + 34;
  const ticks = [0, 200, 400, 600, 800];

  return (
    <section aria-label="Leak detection costs by metro" className="mx-auto max-w-6xl px-4 py-16">
      <Eyebrow center>Plan before you call</Eyebrow>
      <h2 className="mt-3 text-center text-3xl font-extrabold tracking-tight text-blue-950">
        What leak detection costs in Texas
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">
        The researched price range for a leak detection visit in each metro —
        from our town-by-town price research, not a national average.
      </p>

      <figure className="mt-10 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">
        <svg
          viewBox={`0 0 780 ${height}`}
          role="img"
          aria-label="Bar chart of leak detection price ranges by Texas metro"
          className="mx-auto w-full min-w-[620px] max-w-3xl"
        >
          {/* gridlines + axis labels */}
          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={x(t)}
                y1={TOP - 8}
                x2={x(t)}
                y2={TOP + rows.length * ROW_H}
                stroke="#e2e8f0"
                strokeWidth={1}
              />
              <text
                x={x(t)}
                y={TOP + rows.length * ROW_H + 22}
                textAnchor="middle"
                fontSize="12"
                fill="#64748b"
                fontWeight={600}
              >
                ${t}
              </text>
            </g>
          ))}
          {rows.map((r, i) => {
            const y = TOP + i * ROW_H;
            return (
              <g key={r.slug}>
                <text
                  x={CHART_LEFT - 10}
                  y={y + ROW_H / 2 + 4}
                  textAnchor="end"
                  fontSize="13"
                  fontWeight={700}
                  fill="#172554"
                >
                  {r.label}
                </text>
                <rect
                  x={x(r.low)}
                  y={y + 6}
                  width={Math.max(6, x(r.high) - x(r.low))}
                  height={ROW_H - 12}
                  rx={6}
                  fill="#1d4ed8"
                />
                <rect
                  x={x(r.low)}
                  y={y + 6}
                  width={Math.max(6, x(r.high) - x(r.low))}
                  height={ROW_H - 12}
                  rx={6}
                  fill="url(#costBarShade)"
                  opacity={0.25}
                />
                <text
                  x={x(r.high) + 10}
                  y={y + ROW_H / 2 + 4}
                  fontSize="13"
                  fontWeight={800}
                  fill="#1e3a8a"
                >
                  ${r.low}–${r.high}
                </text>
              </g>
            );
          })}
          <defs>
            <linearGradient id="costBarShade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
        <figcaption className="mx-auto mt-4 max-w-2xl text-center text-xs leading-5 text-slate-500">
          Typical range for a leak detection visit per metro, aggregated from
          the researched prices in our 100 town guides (plumber-published
          prices, local guides and local market data). Your home&apos;s price
          depends on access, pipe material and equipment needed — these are
          researched ranges, not quotes.
        </figcaption>
      </figure>

      <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Link
          href="/tools/leak-cost-estimator/"
          className="inline-flex items-center rounded-full bg-blue-800 px-6 py-3 text-sm font-extrabold text-white transition hover:bg-blue-700"
        >
          Estimate your town&apos;s cost →
        </Link>
        <Link
          href="/guides/leak-detection-cost/"
          className="inline-flex items-center rounded-full border-2 border-blue-800 px-6 py-3 text-sm font-extrabold text-blue-800 transition hover:bg-blue-50"
        >
          Full Texas cost guide
        </Link>
      </div>
    </section>
  );
}
