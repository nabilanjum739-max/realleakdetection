import Link from "next/link";
import { BRAND, PHONE_DISPLAY, PHONE_TEL } from "@/lib/site";
import { TOWNS } from "@/lib/towns";
import { SERVICES, SUB_NICHES } from "@/lib/services";

const METRO_LABEL: Record<string, string> = {
  houston: "Houston",
  dallas: "Dallas",
  "san-antonio": "San Antonio",
  austin: "Austin",
  "fort-worth": "Fort Worth",
};

/** Homepage — one-time entity: brand + 4 sub-niches + service-area tree. */
export default function Home() {
  const byMetro = (slug: string) => TOWNS.filter((t) => t.metroSlug === slug);
  return (
    <>
      <header className="py-10 text-center">
        <p className="text-sm uppercase tracking-widest text-sky-400">Texas · Leak Detection Guides</p>
        <h1 className="mt-3 text-4xl font-extrabold">{BRAND}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
          Every town gets its own researched leak-detection guide — real soil,
          housing and climate data, published pricing, no guesswork.
        </p>
        <a
          href={`tel:${PHONE_TEL}`}
          className="mt-6 inline-block rounded-lg bg-sky-600 px-8 py-3 text-lg font-bold text-white"
        >
          📞 Call {PHONE_DISPLAY}
        </a>
      </header>

      <section className="mt-8">
        <h2 className="text-2xl font-bold">What we cover</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {SUB_NICHES.map((niche) => (
            <div key={niche} className="rounded-xl border border-slate-700 bg-slate-900 p-5">
              <h3 className="text-lg font-bold text-sky-300">{niche}</h3>
              <ul className="mt-2 space-y-1 text-slate-300">
                {SERVICES.filter((s) => s.subNiche === niche).map((s) => (
                  <li key={s.slug}>
                    <Link href={`/services/${s.slug}/`} className="underline decoration-sky-600 underline-offset-4 hover:text-white">
                      {s.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold">Service areas</h2>
        <p className="mt-2 text-slate-400">Texas — pick your metro, then your town.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {Object.entries(METRO_LABEL).map(([slug, label]) => (
            <div key={slug} className="rounded-xl border border-slate-700 bg-slate-900 p-5">
              <h3 className="text-lg font-bold">
                <Link href={`/tx/${slug}/`} className="text-sky-300 hover:text-white">
                  {label} →
                </Link>
              </h3>
              <p className="mt-2 text-sm leading-7 text-slate-400">
                {byMetro(slug).map((t, i) => (
                  <span key={t.townSlug}>
                    <Link href={`/tx/${slug}/${t.townSlug}/`} className="hover:text-sky-300 hover:underline">
                      {t.town}
                    </Link>
                    {i < byMetro(slug).length - 1 ? " · " : ""}
                  </span>
                ))}
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-16 border-t border-slate-800 pt-6 text-sm text-slate-500">
        <p>Detection-only guides. We find the leak — you choose who fixes it. Written from verified public data, never invented.</p>
      </footer>
    </>
  );
}
