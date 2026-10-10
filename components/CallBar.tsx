"use client";

import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/site";

/** Sticky mobile call bar — above-the-fold conversion on every page. */
export default function CallBar() {
  return (
    <a
      href={`tel:${PHONE_TEL}`}
      className="fixed bottom-0 left-0 right-0 z-50 bg-sky-600 py-3 text-center text-lg font-bold text-white md:hidden"
      aria-label={`Call ${PHONE_DISPLAY}`}
    >
      📞 Call {PHONE_DISPLAY}
    </a>
  );
}
