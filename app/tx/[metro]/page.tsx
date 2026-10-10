import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TOWNS } from "@/lib/towns";
import { PHONE_DISPLAY, PHONE_TEL, SITE_URL } from "@/lib/site";
import CtaBand from "@/components/CtaBand";

const METRO_LABEL: Record<string, string> = {
  houston: "Houston",
  dallas: "Dallas",
  "san-antonio": "San Antonio",
  austin: "Austin",
  "fort-worth": "Fort Worth",
};

const METRO_BLURB: Record<string, string> = {
  houston: "Expansive clay soils and slab foundations make Houston the slab-leak capital of Texas — every town guide below is researched for its own soil, housing and pricing.",
  dallas: "Shifting clay and big temperature swings punish Dallas-area pipes. Each town guide covers the local soil, home ages and what detection really costs.",
  "san-antonio": "Limestone, clay pockets and hard water shape San Antonio-area leaks. Pick your town for soil-specific guidance and honest local pricing.",
  austin: "Hill Country limestone meets expansive clay across Austin's suburbs — plus freeze risk most winters. Every guide is built on verified local data.",
  "fort-worth": "Western clay soils and older housing stock drive Fort Worth-area leaks. Choose your town for the full researched guide.",
};

/** Prerender the 5 city hubs at build time. */
export function generateStaticParams() {
  return Object.keys(METRO_LABEL).map((metro) => ({ metro }));
}

export async function generateMetadata({ params }: { params: Promise<{ metro: string }> }): Promise<Metadata> {
  const { metro } = await params;
  const label = METRO_LABEL[metro] ?? metro;
  const title = `Leak Detection in ${label}, TX | 10 Town Guides`;
  const description = `Hyper-local leak detection guides for 10 ${label}-area towns — slab, sewer, gas & pool. Real soil, housing and pricing data.`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/tx/${metro}/` },
  };
}

function PhoneIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  );
}

/** City hub — metro overview linking down to its 10 town guides. */
export default async function CityHub({ params }: { params: Promise<{ metro: string }> }) {
  const { metro } = await params;
  const label = METRO_LABEL[metro];
  if (!label) notFound();
  const towns = TOWNS.filter((t) => t.metroSlug === metro);
  return (
    <>
      <section className="relative overflow-hidden bg-blue-950">
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 25%, #38bdf8 0, transparent 35%), radial-gradient(circle at 85% 70%, #f59e0b 0, transparent 30%)",
          }}
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-14 md:py-20">
          <nav className="text-sm font-medium text-blue-200" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white hover:underline">Home</Link>
            <span className="mx-2 text-blue-400">›</span>
            <span className="text-white">{label}</span>
          </nav>
          <h1 className="mt-5 max-w-3xl text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            Leak Detection in {label}, TX
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-blue-100">{METRO_BLURB[metro]}</p>
          <a
            href={`tel:${PHONE_TEL}`}
            className="mt-8 inline-flex items-center gap-3 rounded-full bg-amber-500 px-8 py-4 text-lg font-extrabold text-blue-950 shadow-xl transition hover:bg-amber-400"
          >
            <PhoneIcon />
            Call {PHONE_DISPLAY}
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-2xl font-extrabold text-blue-950">{label}-area town guides</h2>
        <p className="mt-2 text-slate-600">Pick your town — each guide covers all 10 leak detection services with local data.</p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {towns.map((t) => (
            <Link
              key={t.townSlug}
              href={`/tx/${metro}/${t.townSlug}/`}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-600 hover:shadow-md"
            >
              <h3 className="text-lg font-extrabold text-blue-950 group-hover:text-blue-700">{t.town}</h3>
              <p className="mt-1 text-sm text-slate-500">Leak detection guide · {label}, TX</p>
              <span className="mt-4 inline-block text-sm font-bold text-blue-800">
                Read the guide <span aria-hidden="true">→</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <CtaBand
        title={`${label} leak? Pinpoint it before it spreads.`}
        subtitle="Water damage compounds daily. One call connects you with detection specialists — most leaks found in a single visit."
      />
    </>
  );
}
