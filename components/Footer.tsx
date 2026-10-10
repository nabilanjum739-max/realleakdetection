import Link from "next/link";
import { BRAND, PHONE_DISPLAY, PHONE_TEL } from "@/lib/site";
import { TOWNS } from "@/lib/towns";
import { SERVICES } from "@/lib/services";

const METROS = [
  { slug: "houston", label: "Houston" },
  { slug: "dallas", label: "Dallas" },
  { slug: "san-antonio", label: "San Antonio" },
  { slug: "austin", label: "Austin" },
  { slug: "fort-worth", label: "Fort Worth" },
];

// Build-time constant (calling new Date() during prerender is blocked in Next 16).
const YEAR = new Date().getFullYear();

/** Site footer — dark blue, metro link tree, honesty note. */
export default function Footer() {
  return (
    <footer className="bg-blue-950 text-blue-100">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex flex-col justify-between gap-8 md:flex-row">
          <div className="max-w-sm">
            <p className="text-xl font-extrabold text-white">{BRAND}</p>
            <p className="mt-3 text-sm leading-6 text-blue-200">
              Hyper-local leak detection guides for Texas towns — slab, sewer,
              gas, pool and more. Every guide is written from verified local
              data: real soil, housing, climate and pricing figures. Never
              invented.
            </p>
            <a
              href={`tel:${PHONE_TEL}`}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-2.5 text-sm font-extrabold text-blue-950 transition hover:bg-amber-400"
            >
              Call {PHONE_DISPLAY}
            </a>
          </div>

          <nav className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6" aria-label="Footer">
            {METROS.map((m) => (
              <div key={m.slug}>
                <p className="text-sm font-bold uppercase tracking-wider text-amber-400">
                  <Link href={`/tx/${m.slug}/`} className="hover:text-amber-300">{m.label}</Link>
                </p>
                <ul className="mt-3 space-y-2 text-sm">
                  {TOWNS.filter((t) => t.metroSlug === m.slug).slice(0, 5).map((t) => (
                    <li key={t.townSlug}>
                      <Link href={`/tx/${m.slug}/${t.townSlug}/`} className="text-blue-200 hover:text-white hover:underline">
                        {t.town}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link href={`/tx/${m.slug}/`} className="font-semibold text-blue-300 hover:text-white">
                      All 10 towns →
                    </Link>
                  </li>
                </ul>
              </div>
            ))}
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-amber-400">Services</p>
              <ul className="mt-3 space-y-2 text-sm">
                {SERVICES.slice(0, 5).map((s) => (
                  <li key={s.slug}>
                    <Link href={`/services/${s.slug}/`} className="text-blue-200 hover:text-white hover:underline">
                      {s.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/#services" className="font-semibold text-blue-300 hover:text-white">
                    All 10 services →
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        <div className="mt-12 border-t border-blue-900 pt-6 text-xs leading-5 text-blue-300">
          <p>
            Detection-only guides. We document how leaks are found — you choose
            who fixes them. Pricing shown is typical for the metro area, not a
            quote. If you smell gas, leave the building and call 911 first.
          </p>
          <p className="mt-2">© {YEAR} {BRAND}. All rights reserved.</p>
        </div>
      </div>
      {/* spacer so the sticky mobile call bar never covers footer content */}
      <div className="h-16 md:hidden" aria-hidden="true" />
    </footer>
  );
}
