import { TOWNS } from "@/lib/towns";

/**
 * Homepage town marquee — a slow CSS scroll of all covered town names.
 * Animation lives in globals.css (.town-marquee-track): pauses on
 * hover and is disabled under prefers-reduced-motion. Plain text —
 * every town is already linked from the Service Areas section above.
 */
export default function TownMarquee() {
  const names = TOWNS.map((t) => `${t.town}, TX`);
  const strip = (hidden: boolean) => (
    <div aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {names.map((n) => (
        <span key={n} className="flex items-center whitespace-nowrap">
          <span className="text-sm font-semibold text-blue-200">{n}</span>
          <span className="mx-5 h-1.5 w-1.5 rounded-full bg-amber-500" />
        </span>
      ))}
    </div>
  );

  return (
    <section
      aria-label="Towns covered by our leak detection guides"
      className="town-marquee overflow-hidden bg-blue-950 py-5 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
    >
      <div className="town-marquee-track flex w-max">
        {strip(false)}
        {strip(true)}
      </div>
    </section>
  );
}
