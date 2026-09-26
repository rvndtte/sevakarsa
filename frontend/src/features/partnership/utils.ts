import { getProblem, type Partnership } from "@/domain";

export const STAGES = ["Diajukan", "Disetujui", "Kesepakatan", "Aktif"] as const;

/** Persentase kemajuan untuk bilah progres. */
export function progressOf(ps: Partnership): number {
  switch (ps.status) {
    case "matched":
      return 100;
    case "connected":
      return ps.groups.some((g) => g.status === "submitted") ? 75 : 50;
    case "requested":
      return 20;
    default:
      return 0;
  }
}

/** Indeks tahap pada Stepper (0–3). */
export function stageIndex(ps: Partnership): number {
  switch (ps.status) {
    case "matched":
      return 3;
    case "connected":
      return ps.groups.some((g) => g.status === "submitted") ? 2 : 1;
    case "rejected":
      return 1;
    default:
      return 0;
  }
}

/** Tenggat yang ditampilkan sebagai hitung mundur (hanya saat menunggu desa). */
export function deadlineOf(ps: Partnership): { end: number; label: string } | null {
  return ps.status === "requested" && ps.responseEnds
    ? { end: ps.responseEnds, label: "Sisa waktu respons desa" }
    : null;
}

export const problemTitleOf = (ps: Partnership): string =>
  getProblem(ps.problemId)?.title ?? "-";
