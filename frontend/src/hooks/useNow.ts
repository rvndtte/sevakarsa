"use client";

import { useEffect, useState } from "react";
import { now } from "@/domain";

/** Waktu aplikasi (termasuk simulasi waktu) yang diperbarui berkala. */
export function useNow(intervalMs = 1000): number {
  const [time, setTime] = useState<number>(() => now());
  useEffect(() => {
    const update = () => setTime(now());
    const id = window.setInterval(update, intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return time;
}
