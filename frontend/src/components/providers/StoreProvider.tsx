"use client";

import { useEffect, type ReactNode } from "react";
import { initDatabase, scheduler } from "@/domain";

const TICK_MS = 5000;

/**
 * Memuat data dari localStorage setelah hydration (agar render pertama sama
 * dengan server) dan menjalankan tugas terjadwal secara berkala.
 */
export function StoreProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    initDatabase();
    scheduler.tick();
    const id = window.setInterval(() => scheduler.tick(), TICK_MS);
    return () => window.clearInterval(id);
  }, []);
  return <>{children}</>;
}
