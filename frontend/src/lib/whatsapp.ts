import type { Partnership } from "@/domain";
import { getDesa, getProblem, getUniv } from "@/domain";

/** Nomor lokal (08…) → format internasional untuk wa.me. */
export function toWaNumber(phone: string): string {
  const digits = String(phone || "").replace(/\D/g, "");
  return digits.startsWith("0") ? "62" + digits.slice(1) : digits;
}

export function waLink(phone: string, text?: string): string {
  const base = `https://wa.me/${toWaNumber(phone)}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/**
 * Pesan pembuka otomatis. `toDesa` = pesan dari univ/koordinator ke desa;
 * sebaliknya pesan dari desa ke univ/koordinator.
 */
export function openingMessage(ps: Partnership, toDesa: boolean): string {
  const problem = getProblem(ps.problemId);
  const desa = getDesa(ps.desaId);
  const univ = getUniv(ps.univId);
  const title = problem?.title ?? "";
  return toDesa
    ? `Halo ${desa.profile.contactName || desa.name}, kami dari ${univ.name} terkait kerja sama "${title}" yang disetujui lewat SevaKarsa. Boleh kami diskusi jadwal dan kebutuhan teknisnya?`
    : `Halo, kami dari ${desa.name} terkait kerja sama "${title}" di SevaKarsa. Kapan bisa kita diskusikan jadwal dan kebutuhannya?`;
}
