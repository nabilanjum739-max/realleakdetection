import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/site";

function PhoneIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  );
}

interface CtaBandProps {
  title?: string;
  subtitle?: string;
}

/** Reusable conversion band — blue panel, amber call CTA. */
export default function CtaBand({
  title = "Suspect a leak? Don't wait for the damage.",
  subtitle = "Water damage gets more expensive every day. Call now for fast, non-invasive leak detection — most leaks pinpointed in a single visit.",
}: CtaBandProps) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14" aria-label="Call to action">
      <div className="relative overflow-hidden rounded-3xl bg-blue-900 px-6 py-12 text-center md:px-12 md:py-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, #f59e0b 0, transparent 35%), radial-gradient(circle at 85% 80%, #38bdf8 0, transparent 40%)",
          }}
          aria-hidden="true"
        />
        <div className="relative">
          <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight text-white md:text-4xl">
            {title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-blue-100">{subtitle}</p>
          <a
            href={`tel:${PHONE_TEL}`}
            className="mt-8 inline-flex items-center gap-3 rounded-full bg-amber-500 px-8 py-4 text-lg font-extrabold text-blue-950 shadow-lg transition hover:bg-amber-400"
          >
            <PhoneIcon />
            Call {PHONE_DISPLAY}
          </a>
          <p className="mt-4 text-sm text-blue-200">Tap to call — speak to a leak detection specialist</p>
        </div>
      </div>
    </section>
  );
}
