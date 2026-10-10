import Link from "next/link";
import { BRAND, PHONE_DISPLAY, PHONE_TEL } from "@/lib/site";

function DropletIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2s6.5 7.1 6.5 12.3c0 3.6-2.9 6.5-6.5 6.5s-6.5-2.9-6.5-6.5C5.5 9.1 12 2 12 2zm0 17.6c2 0 3.6-1.6 3.6-3.6 0-1.5-1.2-3.3-3.6-6-2.4 2.7-3.6 4.5-3.6 6 0 2 1.6 3.6 3.6 3.6z" />
    </svg>
  );
}

function PhoneIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  );
}

/** Sticky site header — brand left, nav center, call CTA right. */
export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2.5" aria-label={`${BRAND} home`}>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-800 text-amber-400">
            <DropletIcon />
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-extrabold tracking-tight text-blue-950">{BRAND}</span>
            <span className="block text-[11px] font-semibold uppercase tracking-widest text-slate-500">
              Nationwide Leak Detection
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 md:flex" aria-label="Primary">
          <Link href="/#areas" className="hover:text-blue-800">Service Areas</Link>
          <Link href="/#services" className="hover:text-blue-800">Services</Link>
          <Link href="/#how" className="hover:text-blue-800">How It Works</Link>
        </nav>

        <a
          href={`tel:${PHONE_TEL}`}
          className="flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2.5 text-sm font-extrabold text-blue-950 shadow-sm transition hover:bg-amber-400 md:px-5"
        >
          <PhoneIcon className="h-4 w-4" />
          <span className="hidden sm:inline">{PHONE_DISPLAY}</span>
          <span className="sm:hidden">Call Now</span>
        </a>
      </div>
    </header>
  );
}
