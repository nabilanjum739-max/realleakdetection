import Link from "next/link";
import { BRAND, PHONE_DISPLAY, PHONE_TEL } from "@/lib/site";
import { TOWNS } from "@/lib/towns";
import { SERVICES, SUB_NICHES } from "@/lib/services";
import CtaBand from "@/components/CtaBand";

const METROS = [
  { slug: "houston", label: "Houston" },
  { slug: "dallas", label: "Dallas" },
  { slug: "san-antonio", label: "San Antonio" },
  { slug: "austin", label: "Austin" },
  { slug: "fort-worth", label: "Fort Worth" },
];

const NICHE_ICONS: Record<string, string> = {
  "Slab & Underground": "M12 2s6.5 7.1 6.5 12.3c0 3.6-2.9 6.5-6.5 6.5s-6.5-2.9-6.5-6.5C5.5 9.1 12 2 12 2z",
  "Sewer & Drain": "M4 6h16M4 12h16M4 18h16",
  "Gas Line": "M13 2L3 14h7l-1 8 10-12h-7l1-8z",
  "Pool, Water Heater & Yard": "M2 16c2 0 2-1.5 4-1.5S8 16 10 16s2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5M7 11V6a2 2 0 014 0M2 20h20",
};

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-5 w-5 text-amber-500" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function PhoneIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  );
}

/** Homepage — brand hero, how it works, services, service areas. */
export default function Home() {
  const byMetro = (slug: string) => TOWNS.filter((t) => t.metroSlug === slug);
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-blue-950">
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 25%, #38bdf8 0, transparent 35%), radial-gradient(circle at 85% 70%, #f59e0b 0, transparent 30%)",
          }}
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-center md:py-28">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400">
            Texas · Hyper-Local Leak Detection Guides
          </p>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold tracking-tight text-white md:text-6xl">
            Find the Leak. <span className="text-amber-400">Fix It Right.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-100">
            Every Texas town gets its own researched guide — real soil, housing
            and climate data, published pricing, and all 10 leak detection
            services. No guesswork, no generic advice.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href={`tel:${PHONE_TEL}`}
              className="inline-flex items-center gap-3 rounded-full bg-amber-500 px-8 py-4 text-lg font-extrabold text-blue-950 shadow-xl transition hover:bg-amber-400"
            >
              <PhoneIcon />
              Call {PHONE_DISPLAY}
            </a>
            <a
              href="#areas"
              className="inline-flex items-center rounded-full border-2 border-blue-300 px-8 py-4 text-lg font-bold text-white transition hover:border-white hover:bg-white/10"
            >
              Find Your Town
            </a>
          </div>
          <ul className="mx-auto mt-12 flex max-w-2xl flex-col items-center justify-center gap-3 text-sm font-semibold text-blue-100 sm:flex-row sm:gap-8">
            {["50 towns researched", "Real local data", "Published pricing"].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <CheckIcon /> {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-blue-950">How it works</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-slate-600">
          Three steps between you and a found leak — no destructive digging to "see what's wrong."
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { n: "1", t: "Pick your town", d: "Open your town's guide — written for its soil, housing stock and water systems, not generic Texas advice." },
            { n: "2", t: "Know your leak", d: "Match your symptoms to the guide: slab, sewer, gas, pool or yard line. See typical local prices before you call anyone." },
            { n: "3", t: "Call for detection", d: "One call connects you with detection specialists using acoustic, thermal and camera equipment — pinpoint, not guesswork." },
          ].map((s) => (
            <div key={s.n} className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-800 text-lg font-extrabold text-amber-400">
                {s.n}
              </span>
              <h3 className="mt-4 text-lg font-bold text-blue-950">{s.t}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="scroll-mt-20 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-blue-950">
            10 leak detection services, 4 specialties
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-slate-600">
            Detection only — we find it precisely, you choose who fixes it.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {SUB_NICHES.map((niche) => (
              <div key={niche} className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-800">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d={NICHE_ICONS[niche] ?? NICHE_ICONS["Slab & Underground"]} />
                    </svg>
                  </span>
                  <h3 className="text-lg font-extrabold text-blue-950">{niche}</h3>
                </div>
                <ul className="mt-4 space-y-2.5">
                  {SERVICES.filter((s) => s.subNiche === niche).map((s) => (
                    <li key={s.slug} className="flex items-start gap-2 text-[15px]">
                      <CheckIcon />
                      <Link href={`/services/${s.slug}/`} className="font-semibold text-slate-700 hover:text-blue-800 hover:underline">
                        {s.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICE AREAS */}
      <section id="areas" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-blue-950">Service areas</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-slate-600">
          Five Texas metros, fifty towns — pick yours for the full local guide.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {METROS.map((m) => (
            <div key={m.slug} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <h3 className="text-xl font-extrabold text-blue-950">
                <Link href={`/tx/${m.slug}/`} className="hover:text-blue-700 hover:underline">
                  {m.label}
                </Link>
              </h3>
              <p className="mt-1 text-sm text-slate-500">{byMetro(m.slug).length} town guides</p>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                {byMetro(m.slug).map((t, i) => (
                  <span key={t.townSlug}>
                    <Link href={`/tx/${m.slug}/${t.townSlug}/`} className="hover:text-blue-800 hover:underline">
                      {t.town}
                    </Link>
                    {i < byMetro(m.slug).length - 1 ? <span className="text-slate-300"> · </span> : ""}
                  </span>
                ))}
              </p>
              <Link
                href={`/tx/${m.slug}/`}
                className="mt-4 inline-block text-sm font-bold text-blue-800 hover:underline"
              >
                View {m.label} hub →
              </Link>
            </div>
          ))}
          <div className="flex flex-col justify-center rounded-2xl bg-blue-900 p-6 text-white">
            <h3 className="text-xl font-extrabold">Not in Texas?</h3>
            <p className="mt-2 text-sm leading-6 text-blue-100">
              We're expanding metro by metro. Texas first — more states as each
              guide meets our research bar.
            </p>
            <a
              href={`tel:${PHONE_TEL}`}
              className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-amber-500 px-5 py-2.5 text-sm font-extrabold text-blue-950 transition hover:bg-amber-400"
            >
              <PhoneIcon className="h-4 w-4" /> Ask about your area
            </a>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
