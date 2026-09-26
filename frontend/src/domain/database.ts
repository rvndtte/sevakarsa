/**
 * Penyimpanan data prototipe: satu objek `Database` di memori yang disimpan
 * ke localStorage. Semua service memakai modul ini, sehingga saat backend ada
 * cukup lapisan ini (dan services) yang diganti dengan pemanggil API.
 */
import { seedDatabase } from "./seed";
import type { Database } from "./types";

const STORAGE_KEY = "sevakarsa.db";
const SCHEMA_VERSION = 1;

export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

let db: Database | null = null;
let storage: KeyValueStorage | null = null;
let version = 0;
const listeners = new Set<() => void>();

function browserStorage(): KeyValueStorage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null; // mode privat / akses diblokir
  }
}

function persist() {
  if (!db || !storage) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // penyimpanan penuh: data tetap ada di memori untuk sesi ini
  }
}

function notifyListeners() {
  version += 1;
  listeners.forEach((listener) => listener());
}

/** Memuat data dari storage, atau membuat data demo baru. Aman dipanggil ulang. */
export function initDatabase(
  target: KeyValueStorage | null = browserStorage(),
): Database {
  storage = target;
  if (db) return db;

  const raw = storage?.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Database;
      if (parsed.v === SCHEMA_VERSION) {
        db = parsed;
        notifyListeners();
        return db;
      }
    } catch {
      // data rusak: jatuh ke seed
    }
  }
  db = seedDatabase(Date.now());
  persist();
  notifyListeners();
  return db;
}

export function isDatabaseReady(): boolean {
  return db !== null;
}

export function getDb(): Database {
  if (!db) throw new Error("Database belum diinisialisasi (initDatabase).");
  return db;
}

/** Waktu "sekarang" aplikasi, termasuk geseran dari simulasi waktu. */
export function now(): number {
  return Date.now() + (db?.clock ?? 0);
}

/** Simpan perubahan dan beri tahu semua pendengar (komponen React). */
export function commit(): void {
  persist();
  notifyListeners();
}

/** Ganti seluruh data dengan data demo awal. */
export function resetDatabase(): void {
  db = seedDatabase(Date.now());
  commit();
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getVersion(): number {
  return version;
}

/** Khusus tes: kosongkan singleton. */
export function __resetForTests(): void {
  db = null;
  storage = null;
  version = 0;
  listeners.clear();
}
