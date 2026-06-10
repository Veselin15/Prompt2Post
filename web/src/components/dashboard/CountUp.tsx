"use client";

import { useEffect, useRef, useState } from "react";

/** Animates a stat number from 0 to its value on mount (ease-out, ~0.8s). */
export default function CountUp({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    if (value <= 0) {
      setDisplay(value);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }
    const DURATION = 800;
    const start = performance.now();
    function tick(now: number) {
      const t = Math.min(1, (now - start) / DURATION);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(value * eased));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    }
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [value]);

  return <>{display.toLocaleString()}</>;
}
