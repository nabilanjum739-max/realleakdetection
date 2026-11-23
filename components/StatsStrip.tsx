"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Homepage stats strip — animated count-up numbers (towns, metros,
 * services, tools). Counts are passed in from the server page, computed
 * from the real data files (lib/towns.ts, lib/services.ts) — nothing
 * is hardcoded here. Respects prefers-reduced-motion.
 */

interface Stat {
  value: number;
  label: string;
  sub: string;
}

function useCountUp(target: number, start: boolean, duration = 1200) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!start) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(target);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, target, duration]);
  return n;
}

function StatItem({ stat, start }: { stat: Stat; start: boolean }) {
  const n = useCountUp(stat.value, start);
  return (
    <div className="px-4 py-6 text-center">
      <p className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
        {n}
      </p>
      <p className="mt-1 text-sm font-bold uppercase tracking-wider text-blue-100">
        {stat.label}
      </p>
      <p className="mt-1 text-xs text-blue-300">{stat.sub}</p>
    </div>
  );
}

export default function StatsStrip({ stats }: { stats: Stat[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section aria-label="Coverage in numbers" className="bg-blue-900">
      <div
        ref={ref}
        className="mx-auto grid max-w-6xl grid-cols-2 divide-blue-800 px-4 md:grid-cols-4 md:divide-x"
      >
        {stats.map((s) => (
          <StatItem key={s.label} stat={s} start={visible} />
        ))}
      </div>
    </section>
  );
}
