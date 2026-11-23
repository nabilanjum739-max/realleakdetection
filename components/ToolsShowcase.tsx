import Link from "next/link";

/**
 * Homepage tools showcase — all 12 free tools. Names, paths and
 * descriptions are the same ones used on the /tools/ hub (condensed
 * from each tool's own page) — nothing is claimed here that the tool
 * pages do not state.
 */

interface Tool {
  name: string;
  path: string;
  desc: string;
  icon: string;
  pro?: boolean;
}

const TOOLS: Tool[] = [
  {
    name: "Water Bill Spike Splitter",
    path: "/tools/water-bill-spike/",
    desc: "Splits a bill jump into the leak part and the rate part, and names the most likely leak type.",
    icon: "M6 2.5h12V21l-3-1.8L12 21l-3-1.8L6 21V2.5zM9 13l1.8-3 1.7 2 2.5-4.5",
  },
  {
    name: "Freeze-Burst Risk Tonight",
    path: "/tools/freeze-risk-tonight/",
    desc: "Tonight's pipe freeze-burst risk for your Texas town — forecast low, hours below freezing, what to do before bed.",
    icon: "M12 2v20M4 6l16 12M20 6L4 18M12 2l-2 3m2-3l2 3M12 22l-2-3m2 3l2-3",
  },
  {
    name: "Freeze-Burst Damage Estimator",
    path: "/tools/freeze-damage-estimator/",
    desc: "Estimates gallons released and damage dollars by room after a burst pipe, and what insurance typically covers.",
    icon: "M12 2.5s6.3 6.9 6.3 11.9c0 3.5-2.8 6.1-6.3 6.1s-6.3-2.6-6.3-6.1C5.7 9.4 12 2.5 12 2.5zM12 9l-2 4 3 2-1.8 4",
  },
  {
    name: "Leak Cost Estimator",
    path: "/tools/leak-cost-estimator/",
    desc: "Estimates detection and repair costs for your Texas town from researched per-town prices — and flags unfair quotes.",
    icon: "M12 2.5v19M16.8 6.3c-.7-1-2.2-1.6-4.8-1.6-2.9 0-4.9 1.3-4.9 3.1 0 4.4 9.8 2.3 9.8 5.9 0 1.9-2 3.1-4.9 3.1-2.6 0-4.1-.6-4.8-1.6",
  },
  {
    name: "Home-Buyer Leak Risk Report",
    path: "/tools/home-buyer-leak-risk/",
    desc: "Six facts about a house give slab and sewer risk bands, local inspection costs, and an option-period checklist.",
    icon: "M3.5 10.8L12 3.5l8.5 7.3M5.5 9.3V21h13V9.3M12 12.2l.9 1.9 2.1.3-1.5 1.5.3 2.1-1.8-1-1.8 1 .3-2.1-1.5-1.5 2.1-.3.9-1.9",
  },
  {
    name: "Insurance Claim Pack",
    path: "/tools/insurance-claim-pack/",
    desc: "Coverage likelihood for each cost bucket under Texas HO-B / HO-3 rules, the deductible math, and a draft claim letter.",
    icon: "M7 3h7l4 4v14H7V3zM14 3v4h4M9.5 12h5M9.5 15.5h5M9.5 8.5h2",
  },
  {
    name: "Leak Adjustment Checker",
    path: "/tools/leak-adjustment-checker/",
    desc: "Finds your utility's published leak-adjustment rule, judges your eligibility, estimates the credit, drafts the pack.",
    icon: "M4 7h10M18 7h2M4 12h4M12 12h8M4 17h11M19 17h1M14 4.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM8 9.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM15 14.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z",
  },
  {
    name: "Sewer Winter-Averaging Calculator",
    path: "/tools/sewer-winter-averaging/",
    desc: "Shows the 12-month sewer-bill tail a winter leak causes, and whether your utility can correct the average.",
    icon: "M5 5h14v15H5V5zM5 9.5h14M8.5 3v4M15.5 3v4M8.5 16.5l2.3-2.3 2 1.6 2.7-3.3",
  },
  {
    name: "Who Pays? Finder",
    path: "/tools/who-pays/",
    desc: "Who is responsible for a leak — city, MUD, homeowner, or HOA — who to call first, and when to call 811.",
    icon: "M15.5 19.5a3.5 3.5 0 00-7 0M12 11a3.3 3.3 0 100-6.6A3.3 3.3 0 0012 11zM18.5 11.5a3 3 0 10-2.4-5.2M20.8 19.3a3.2 3.2 0 00-2.7-2.9",
  },
  {
    name: "Cost of Waiting Calculator",
    path: "/tools/cost-of-waiting/",
    desc: "What your leak wastes every day, week, month and year — and what each month of waiting adds to the damage.",
    icon: "M12 21a9 9 0 119-9 9 9 0 01-9 9zM12 7v5.2l3.2 2",
  },
  {
    name: "Sewer Lateral Replacement Estimator",
    path: "/tools/sewer-lateral-estimator/",
    desc: "Sewer lateral replacement cost in Texas by method, length and depth, from Texas-published contractor prices.",
    icon: "M3 6h7a5 5 0 015 5v10M3 6v4m12 11h6M3 13.5h2.5M18.5 21h2.5",
  },
  {
    name: "Plumber Job-Price Estimator",
    path: "/tools/plumber-price-estimator/",
    desc: "Prices leak jobs from researched Texas town rates: flat-rate sell price, labor/material split, margin check.",
    icon: "M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z",
    pro: true,
  },
];

export default function ToolsShowcase() {
  return (
    <section aria-label="Free leak detection tools" className="bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <p className="text-center text-xs font-bold uppercase tracking-[0.25em] text-blue-700">
          Free homeowner tools
        </p>
        <h2 className="mt-3 text-center text-3xl font-extrabold tracking-tight text-blue-950">
          12 free tools, zero signup
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-slate-600">
          Built from the same researched data as our town guides. Every result
          is an estimate — and every tool says so.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((t) => (
            <Link
              key={t.path}
              href={t.path}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
            >
              <span className="flex items-start justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-800">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d={t.icon} />
                  </svg>
                </span>
                {t.pro ? (
                  <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[11px] font-extrabold text-white">
                    FOR PROS
                  </span>
                ) : (
                  <span className="rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-extrabold text-green-800">
                    FREE
                  </span>
                )}
              </span>
              <h3 className="mt-4 font-bold text-blue-950 group-hover:text-blue-700 group-hover:underline">
                {t.name}
              </h3>
              <p className="mt-1.5 text-sm leading-6 text-slate-600">{t.desc}</p>
            </Link>
          ))}
        </div>
        <p className="mt-8 text-center">
          <Link href="/tools/" className="text-sm font-bold text-blue-800 hover:underline">
            How the tools work — our methodology →
          </Link>
        </p>
      </div>
    </section>
  );
}
