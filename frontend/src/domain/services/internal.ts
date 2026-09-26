/* Helper internal antar-service: notifikasi, log aktivitas, pencarian wajib. */
import { getDb, now } from "../database";
import { fail } from "../errors";
import { uid } from "../ids";
import { getPartnership, getProblem, getUser } from "../queries";
import type {
  NotificationType,
  Partnership,
  Problem,
  User,
} from "../types";

export function notify(
  userId: string,
  type: NotificationType,
  text: string,
  link: string,
): void {
  getDb().notifs.push({
    id: uid("n"),
    userId,
    type,
    text,
    link,
    ts: now(),
    read: false,
  });
}

export function logActivity(icon: string, text: string): void {
  getDb().log.unshift({ ts: now(), icon, text });
}

/** Catat kejadian pada riwayat sebuah kerja sama. */
export function stamp(ps: Partnership, text: string): void {
  ps.log.push({ ts: now(), text });
}

export const nameOf = (id: string): string => getUser(id)?.name ?? "?";

export function requireProblem(id: string): Problem {
  return getProblem(id) ?? fail("Kebutuhan tidak ditemukan.");
}

export function requirePartnership(id: string): Partnership {
  return getPartnership(id) ?? fail("Kerja sama tidak ditemukan.");
}

export function requireUser(id: string): User {
  return getUser(id) ?? fail("Akun tidak ditemukan.");
}

/** Buka kembali kebutuhan yang tadinya terkunci. */
export function unlockProblem(problem: Problem, reason: string): void {
  problem.status = "available";
  problem.partnershipId = null;
  logActivity("lock-open", `Kebutuhan terbuka kembali: ${problem.title} (${reason})`);
}
