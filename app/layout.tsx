import type { Metadata } from "next";
import "./globals.css";
import CallBar from "@/components/CallBar";
import { BRAND, NO_INDEX } from "@/lib/site";

export const metadata: Metadata = {
  title: `${BRAND} — Leak Detection Across Texas`,
  description:
    "Hyper-local leak detection guides for Texas towns: slab, sewer, gas, pool and more. Verified local data, published pricing, no guesswork.",
  // Staging-first: noindex on the vercel.app subdomain so Google never
  // indexes staging URLs. Flip NEXT_PUBLIC_NO_INDEX=false for launch.
  robots: NO_INDEX ? { index: false, follow: false } : { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased">
        <main className="mx-auto max-w-4xl px-4 pb-24 pt-8 md:pb-12">{children}</main>
        <CallBar />
      </body>
    </html>
  );
}
