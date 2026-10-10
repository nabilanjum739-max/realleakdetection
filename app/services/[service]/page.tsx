import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SERVICES } from "@/lib/services";
import { TOWNS } from "@/lib/towns";
import { PHONE_DISPLAY, PHONE_TEL, SITE_URL } from "@/lib/site";
import CtaBand from "@/components/CtaBand";

/** Prerender all 10 service pillars at build time. */
export function generateStaticParams() {
  return SERVICES.map((s) => ({ service: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ service: string }> }): Promise<Metadata> {
  const { service } = await params;
  const s = SERVICES.find((x) => x.slug === service);
  const name = s?.name ?? service;
  const title = `${name} — USA Guide | Real Leak Detection`;
  const description = `${name}: how it works, what it costs, and when you need it. Plus hyper-local Texas town guides with real data.`;
  return {
    title: title.slice(0, 60),
    description: description.slice(0, 155),
    alternates: { canonical: `${SITE_URL}/services/${service}/` },
  };
}

function PhoneIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  );
}

/** Sub-niche/service pillar — national scope, links down to town guides. */
export default async function ServicePillar({ params }: { params: Promise<{ service: string }> }) {
  const { service } = await params;
  const s = SERVICES.find((x) => x.slug === service);
  if (!s) notFound();
  const siblings = SERVICES.filter((x) => x.subNiche === s.subNiche && x.slug !== s.slug);
  const featured = TOWNS.filter((t) =>
    ["katy", "plano", "sugar-land", "frisco", "round-rock"].includes(t.townSlug)
  );
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
            <Link href="/#services" className="hover:text-white hover:underline">Services</Link>
            <span className="mx-2 text-blue-400">›</span>
            <span className="text-white">{s.name}</span>
          </nav>
          <p className="mt-5 inline-block rounded-full bg-amber-500/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-400">
            {s.subNiche}
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            {s.name}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-blue-100">{s.blurb}</p>
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
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-extrabold text-blue-950">Related services</h2>
            <ul className="mt-5 space-y-3">
              {siblings.map((x) => (
                <li key={x.slug}>
                  <Link
                    href={`/services/${x.slug}/`}
                    className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-600 hover:shadow-md"
                  >
                    <p className="font-bold text-blue-950">{x.name}</p>
                    <p className="mt-1 text-sm text-slate-600">{x.blurb}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-blue-950">Local guides for this service</h2>
            <p className="mt-2 text-slate-600">
              Every town guide below covers {s.name.toLowerCase()} with verified
              local soil, housing and pricing data.
            </p>
            <ul className="mt-5 space-y-3">
              {featured.map((t) => (
                <li key={t.townSlug}>
                  <Link
                    href={`/tx/${t.metroSlug}/${t.townSlug}/`}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-600 hover:shadow-md"
                  >
                    <span>
                      <span className="block font-bold text-blue-950">{t.town}, TX</span>
                      <span className="block text-sm text-slate-500">{s.name} guide</span>
                    </span>
                    <span className="font-bold text-blue-800" aria-hidden="true">→</span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/#areas" className="mt-5 inline-block text-sm font-bold text-blue-800 hover:underline">
              Browse all 50 towns →
            </Link>
          </div>
        </div>
      </section>

      <CtaBand
        title="Need this service? One call is enough."
        subtitle="Describe your symptoms — a detection specialist will tell you honestly whether you need this service or something else."
      />
    </>
  );
}
