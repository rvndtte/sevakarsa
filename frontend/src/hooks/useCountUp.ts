"use client";

import { useEffect, useState } from "react";
import { formatNumber } from "@/lib/format";
import { useReducedMotion } from "./useReducedMotion";

const DURATION_MS = 1400;

/** Angka yang naik dari 0 ke `target` setiap `active` berubah menjadi true. */
export function useCountUp(target: number, decimals = 0, active = true): string {
  const reduced = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    if (reduced) {
      const id = requestAnimationFrame(() => setValue(target));
      return () => cancelAnimationFrame(id);
    }
    let frameId = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / DURATION_MS);
      setValue(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [target, active, reduced]);

  return formatNumber(active ? value : 0, decimals);
}
