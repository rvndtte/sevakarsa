"use client";

import { useSyncExternalStore } from "react";
import {
  getSessionUser,
  getVersion,
  isDatabaseReady,
  subscribe,
  type User,
} from "@/domain";

/**
 * Berlangganan perubahan data. Komponen yang memanggil hook ini dirender ulang
 * setiap kali service melakukan `commit()`, lalu membaca data terbaru lewat query.
 */
export function useDatabaseVersion(): number {
  return useSyncExternalStore(subscribe, getVersion, () => 0);
}

export interface Session {
  /** false selama data belum dimuat dari storage (render pertama di klien). */
  ready: boolean;
  me: User | null;
}

export function useSession(): Session {
  useDatabaseVersion();
  const ready = isDatabaseReady();
  return { ready, me: ready ? getSessionUser() : null };
}
