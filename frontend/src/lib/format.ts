import { DAY, now } from "@/domain";

const HOUR = 3_600_000;
const MIN = 60_000;

export const formatDate = (ts: number | string): string =>
  new Date(ts).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export const formatDateTime = (ts: number): string =>
  new Date(ts).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

/** "3 jam lalu", "2 hari lalu", dst. relatif terhadap waktu aplikasi. */
export function timeAgo(ts: number): string {
  const diff = now() - ts;
  if (diff < MIN) return "baru saja";
  if (diff < HOUR) return `${Math.floor(diff / MIN)} mnt lalu`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)} jam lalu`;
  if (diff < 30 * DAY) return `${Math.floor(diff / DAY)} hari lalu`;
  return formatDate(ts);
}

/** Sisa waktu untuk hitung mundur. */
export function formatRemaining(ms: number): string {
  if (ms <= 0) return "Waktu habis";
  const d = Math.floor(ms / DAY);
  const h = Math.floor((ms % DAY) / HOUR);
  const m = Math.floor((ms % HOUR) / MIN);
  const s = Math.floor((ms % MIN) / 1000);
  if (d > 0) return `${d} hari ${h} jam`;
  if (h > 0) return `${h} jam ${m} mnt`;
  return `${m} mnt ${s} dtk`;
}

export const formatNumber = (value: number, decimals = 0): string =>
  value.toLocaleString("id-ID", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

export const initials = (name: string): string =>
  String(name || "?")
    .replace(/^(Desa|Universitas|Tim)\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
