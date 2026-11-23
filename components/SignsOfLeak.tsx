import Link from "next/link";
import Eyebrow from "@/components/Eyebrow";

/**
 * Homepage "signs of a leak" infographic — six common signs, each with a
 * simple inline SVG icon and a one-line explanation of what it usually
 * means. General homeowner knowledge, stated as likelihoods ("usually",
 * "often", "can") — no diagnosis claims.
 */

const SIGNS: Array<{ title: string; means: string; icon: string }> = [
  {
    title: "Water bill jumped",
    means: "A spike with no change in use usually means water is escaping somewhere — often a slab or yard-line leak.",
    icon: "M7 3h10v18l-2-1.6L13 21l-2-1.6L9 21l-2-1.6V3zM10 8h4M10 12h4",
  },
  {
    title: "Warm spot on the floor",
    means: "A warm patch on tile or wood can be a hot-water line leaking under the slab, heating the floor from below.",
    icon: "M3 20h18M8 16c-1.2-2.2 1.2-3.3 0-5.5M12 16c-1.2-2.2 1.2-3.3 0-5.5M16 16c-1.2-2.2 1.2-3.3 0-5.5",
  },
  {
    title: "Musty, damp smell",
    means: "A persistent musty odor often points to a slow leak feeding moisture inside a wall or under flooring.",
    icon: "M3 8h9.5a2.75 2.75 0 10-2.75-2.75M2 12h14.5a2.75 2.75 0 11-2.75 2.75M3 16h6",
  },
  {
    title: "Meter keeps moving",
    means: "If every tap is off and the meter dial still turns, water is leaving the system somewhere — the classic leak test.",
    icon: "M12 20a8 8 0 118-8M12 12l4.5-4.5M12 4v1.5M5.5 7l1 1M18.5 7l-1 1",
  },
  {
    title: "Water pressure dropped",
    means: "A sudden drop can mean a supply line is leaking before the water ever reaches your fixtures.",
    icon: "M12 3s5.5 6 5.5 10.3c0 3-2.5 5.2-5.5 5.2s-5.5-2.2-5.5-5.2C6.5 9 12 3 12 3zM12 11v5m0 0l-2.5-2.5M12 16l2.5-2.5",
  },
  {
    title: "Soggy patch in the yard",
    means: "A wet, spongy, or extra-green patch in dry weather often sits right above a leaking yard or main line.",
    icon: "M2 19c2.5 0 2.5 1.3 5 1.3S9.5 19 12 19s2.5 1.3 5 1.3S19.5 19 22 19M7 15.5V9m0 0L5.4 6.4M7 9l1.6-2.6M17 15.5V9m0 0l-1.6-2.6M17 9l1.6-2.6",
  },
];

export default function SignsOfLeak() {
  return (
    <section aria-label="Signs you may have a hidden leak" className="mx-auto max-w-6xl px-4 py-16">
      <Eyebrow center>Know the clues</Eyebrow>
      <h2 className="mt-3 text-center text-3xl font-extrabold tracking-tight text-blue-950">
        6 signs you may have a hidden leak
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-center text-slate-600">
        Most leaks announce themselves weeks before the damage bill arrives.
        Here is what each sign usually means.
      </p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SIGNS.map((s) => (
          <div
            key={s.title}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-7 w-7" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
              </svg>
            </span>
            <h3 className="mt-4 font-bold text-blue-950">{s.title}</h3>
            <p className="mt-1.5 text-sm leading-6 text-slate-600">{s.means}</p>
          </div>
        ))}
      </div>
      <p className="mt-10 text-center text-[15px] text-slate-600">
        Recognize one of these?{" "}
        <Link href="/tools/water-bill-spike/" className="font-bold text-blue-800 hover:underline">
          Split your bill spike
        </Link>{" "}
        to see how much of it looks like a leak — or{" "}
        <Link href="/tools/" className="font-bold text-blue-800 hover:underline">
          browse all 12 free tools →
        </Link>
      </p>
    </section>
  );
}
