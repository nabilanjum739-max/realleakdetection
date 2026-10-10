import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CallBar from "@/components/CallBar";
import { BRAND, NO_INDEX } from "@/lib/site";

export const metadata: Metadata = {
  title: `${BRAND} — Leak Detection Guides Across the USA`,
  description:
    "Hyper-local leak detection guides for American towns: slab, sewer, gas, pool and more. Verified local data, published pricing, no guesswork. Now live in Texas.",
  // Staging-first: noindex on the vercel.app subdomain so Google never
  // indexes staging URLs. Flip NEXT_PUBLIC_NO_INDEX=false for launch.
  robots: NO_INDEX ? { index: false, follow: false } : { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white font-sans text-slate-900 antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
        <CallBar />
      </body>
    </html>
  );
}
