/**
 * Tugas berbasis waktu (kedaluwarsa dan pengingat). Di backend nanti ini
 * dijalankan sebagai job terjadwal; di prototipe dipanggil berkala oleh UI.
 */
import { DAY, LIMITS } from "../constants";
import { commit, getDb, now } from "../database";
import { getProblem } from "../queries";
import { logActivity, notify, stamp, unlockProblem } from "./internal";

/** @returns true bila ada data yang berubah. */
export function tick(): boolean {
  const db = getDb();
  const time = now();
  let changed = false;

  for (const ps of db.partnerships) {
    const problem = getProblem(ps.problemId);
    if (!problem) continue;
    const link = `/partnerships/${ps.id}`;

    if (ps.status === "requested" && ps.responseEnds) {
      if (time > ps.responseEnds) {
        const why = `Desa tidak merespons dalam ${LIMITS.RESPONSE_DAYS} hari (Kedaluwarsa)`;
        ps.status = "expired";
        stamp(ps, why);
        unlockProblem(problem, why);
        logActivity("hourglass-empty", `Kedaluwarsa: ${problem.title}`);
        notify(ps.desaId, "expire", `Pengajuan kerja sama ${problem.title} kedaluwarsa, kebutuhan terbuka kembali`, link);
        notify(ps.univId, "expire", `${why}: ${problem.title}`, link);
        changed = true;
      } else if (!ps._warn && ps.responseEnds - time < DAY) {
        ps._warn = true;
        const text = `Pengajuan kerja sama ${problem.title} menunggu respons desa, sisa kurang dari 24 jam`;
        notify(ps.desaId, "deadline", text, link);
        notify(ps.univId, "deadline", text, link);
        changed = true;
      }
    } else if (
      ps.status === "connected" &&
      !ps._nudge &&
      ps.approvedAt &&
      time - ps.approvedAt > LIMITS.NUDGE_DAYS * DAY &&
      !ps.groups.some((g) => g.status !== "draft")
    ) {
      ps._nudge = true;
      notify(ps.univId, "deadline", `Pengingat: konfirmasi kesepakatan ${problem.title} belum diisi (${LIMITS.NUDGE_DAYS} hari sejak disetujui)`, link);
      changed = true;
    }
  }

  for (const problem of db.problems) {
    if (problem.status === "available" && problem.deadline < time) {
      problem.status = "expired";
      changed = true;
    }
  }

  if (changed) commit();
  return changed;
}

/** Simulasi waktu untuk panel demo. */
export function advanceClock(days: number): boolean {
  getDb().clock += days * DAY;
  commit();
  return tick();
}

export function resetClock(): void {
  getDb().clock = 0;
  commit();
}
