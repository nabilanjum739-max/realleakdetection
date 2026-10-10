import Link from "next/link";
import { notFound } from "next/navigation";
import { SERVICES } from "@/lib/services";

/** Prerender all 10 service pillars at build time. */
export function generateStaticParams() {
  return SERVICES.map((s) => ({ service: s.slug }));
}

/** Sub-niche/service pillar placeholder — national scope, no city. */
export default async function ServicePillar({ params }: { params: Promise<{ service: string }> }) {
  const { service } = await params;
  const s = SERVICES.find((x) => x.slug === service);
  if (!s) notFound();
  return (
    <>
      <nav className="text-sm text-slate-400">
        <Link href="/" className="hover:text-sky-300">Home</Link> › Services › {s.name}
      </nav>
      <h1 className="mt-4 text-3xl font-extrabold">{s.name} — USA Guide</h1>
      <p className="mt-2 text-sky-300">{s.subNiche}</p>
      <p className="mt-4 text-slate-300">{s.blurb}</p>
      <p className="mt-4 text-slate-400">
        The full national pillar page ships after the 5 pilot town pages pass QA.
        Meanwhile, pick a Texas town for the complete local guide:
      </p>
      <p className="mt-4">
        <Link href="/tx/houston/katy/" className="text-sky-300 hover:underline">Katy →</Link>
        {" · "}
        <Link href="/tx/dallas/plano/" className="text-sky-300 hover:underline">Plano →</Link>
        {" · "}
        <Link href="/tx/austin/round-rock/" className="text-sky-300 hover:underline">Round Rock →</Link>
      </p>
    </>
  );
}
