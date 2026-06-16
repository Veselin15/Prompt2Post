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
    <div className="text-3xl sm:text-4xl font-black gradient-text">
      {stat.to === null
        ? stat.display
        : `${stat.prefix ?? ""}${val}${stat.suffix ?? ""}`}
    </div>
  );
}

export default function StatsBand() {
  const { ref, seen } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className="max-w-4xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center"
    >
      {STATS.map((s) => (
        <div key={s.label}>
          <Counter stat={s} run={seen} />
          <div className="text-white/40 text-xs mt-1.5 leading-snug">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
