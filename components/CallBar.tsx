"use client";

import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/site";

function PhoneIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  );
}

/** Sticky mobile call bar — always-visible conversion on small screens. */
export default function CallBar() {
  return (
    <a
      href={`tel:${PHONE_TEL}`}
      className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-center gap-3 bg-amber-500 px-4 py-3.5 text-blue-950 shadow-[0_-4px_20px_rgba(0,0,0,0.25)] md:hidden"
      aria-label={`Call ${PHONE_DISPLAY} now`}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-950 text-amber-400">
        <PhoneIcon className="h-4 w-4" />
      </span>
      <span className="text-left leading-tight">
        <span className="block text-base font-extrabold">Tap to Call Now</span>
        <span className="block text-xs font-semibold opacity-80">{PHONE_DISPLAY} · Free assessment</span>
      </span>
    </a>
  );
}
