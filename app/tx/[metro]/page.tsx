import Link from "next/link";
import { notFound } from "next/navigation";
import { TOWNS } from "@/lib/towns";

const METRO_LABEL: Record<string, string> = {
  houston: "Houston",
  dallas: "Dallas",
  "san-antonio": "San Antonio",
  austin: "Austin",
  "fort-worth": "Fort Worth",
};

/** Prerender the 5 city hubs at build time. */
export function generateStaticParams() {
  return Object.keys(METRO_LABEL).map((metro) => ({ metro }));
}

/** City hub placeholder — links down to its 10 towns. Full hub content later. */
export default async function CityHub({ params }: { params: Promise<{ metro: string }> }) {
  const { metro } = await params;
  const label = METRO_LABEL[metro];
  if (!label) notFound();
  const towns = TOWNS.filter((t) => t.metroSlug === metro);
  return (
    <>
      <nav className="text-sm text-slate-400">
        <Link href="/" className="hover:text-sky-300">Home</Link> › Texas › {label}
      </nav>
      <h1 className="mt-4 text-3xl font-extrabold">Leak Detection in {label}, TX — Metro Hub</h1>
      <p className="mt-3 text-slate-300">
        Pick your town for a fully researched, hyper-local leak detection guide.
        (Full metro-hub content ships after the 5 pilot town pages pass QA.)
      </p>
      <ul className="mt-6 grid gap-3 md:grid-cols-2">
        {towns.map((t) => (
          <li key={t.townSlug} className="rounded-lg border border-slate-700 bg-slate-900 p-4">
            <Link href={`/tx/${metro}/${t.townSlug}/`} className="font-bold text-sky-300 hover:text-white">
              {t.town} →
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
