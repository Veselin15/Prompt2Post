"use client";

import { useEffect, useRef, useState } from "react";

type Stat = {
  /** numeric target, or null for a non-numeric value shown as-is */
  to: number | null;
  prefix?: string;
  suffix?: string;
  display?: string; // used when `to` is null
  label: string;
};

const STATS: Stat[] = [
  { to: 60, prefix: "<", suffix: "s", label: "topic → finished carousel" },
  { to: 13, label: "copy languages" },
  { to: null, display: "ZIP/PDF", label: "one-click export" },
  { to: 100, suffix: "%", label: "on-brand, every time" },
];

function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen]);
  return { ref, seen };
}

function Counter({ stat, run }: { stat: Stat; run: boolean }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!run || stat.to === null) return;
    const target = stat.to;
    const dur = 1100;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, stat.to]);

  return (
    <div className="font-display text-3xl font-black gradient-text sm:text-4xl">
      {stat.to === null
        ? stat.display
        : `${stat.prefix ?? ""}${val}${stat.suffix ?? ""}`}
    </div>
  );
}

export default function StatsBand() {
  const { ref, seen } = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className="mx-auto max-w-4xl px-6">
      <div className="panel grid grid-cols-2 gap-y-8 px-6 py-8 text-center sm:grid-cols-4 sm:divide-x sm:divide-white/[0.07]">
        {STATS.map((s) => (
          <div key={s.label} className="px-2">
            <Counter stat={s} run={seen} />
            <div className="mt-2 text-xs leading-snug text-white/40">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
