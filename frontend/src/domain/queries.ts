/* Pembacaan data (selector). Tidak mengubah state. */
import { LOCKED_PROBLEM_STATUSES } from "./constants";
import { getDb } from "./database";
import type {
  Desa,
  Notification,
  Partnership,
  Problem,
  Univ,
  User,
} from "./types";

export const isDesa = (u: User | undefined | null): u is Desa =>
  u?.role === "desa";
export const isUniv = (u: User | undefined | null): u is Univ =>
  u?.role === "univ";

export const getUser = (id: string): User | undefined =>
  getDb().users.find((u) => u.id === id);

export const getDesa = (id: string): Desa => {
  const u = getUser(id);
  if (!isDesa(u)) throw new Error(`Desa ${id} tidak ditemukan`);
  return u;
};

export const getUniv = (id: string): Univ => {
  const u = getUser(id);
  if (!isUniv(u)) throw new Error(`Universitas ${id} tidak ditemukan`);
  return u;
};

export const getSessionUser = (): User | null => {
  const { session } = getDb();
  return session ? (getUser(session) ?? null) : null;
};

export const getProblem = (id: string): Problem | undefined =>
  getDb().problems.find((p) => p.id === id);

export const getPartnership = (id: string): Partnership | undefined =>
  getDb().partnerships.find((p) => p.id === id);

export const problemsOf = (desaId: string): Problem[] =>
  getDb().problems.filter((p) => p.desaId === desaId);

export const partnershipsOf = (user: User): Partnership[] =>
  getDb().partnerships.filter((p) =>
    user.role === "desa" ? p.desaId === user.id : p.univId === user.id,
  );

export const otherParty = (ps: Partnership, me: User): User => {
  const other = getUser(me.role === "desa" ? ps.univId : ps.desaId);
  if (!other) throw new Error("Pihak lain tidak ditemukan");
  return other;
};

export const isLocked = (p: Problem): boolean =>
  LOCKED_PROBLEM_STATUSES.includes(p.status);

/** Kerja sama berjalan milik univ tertentu pada kebutuhan tertentu. */
export const activePartnership = (
  problemId: string,
  univId: string,
): Partnership | undefined =>
  getDb().partnerships.find(
    (p) =>
      p.problemId === problemId &&
      p.univId === univId &&
      ["requested", "connected", "matched"].includes(p.status),
  );

export const lastPartnership = (
  problemId: string,
  univId: string,
): Partnership | undefined =>
  getDb()
    .partnerships.filter(
      (p) => p.problemId === problemId && p.univId === univId,
    )
    .sort((a, b) => b.createdAt - a.createdAt)[0];

/** Pengajuan yang menunggu keputusan desa untuk suatu kebutuhan. */
export const pendingRequestsFor = (problemId: string): Partnership[] =>
  getDb().partnerships.filter(
    (p) => p.problemId === problemId && p.status === "requested",
  );

/** Jumlah kebutuhan desa yang masih "memakai" kuota aktif. */
export const activeProblemCount = (desaId: string, exceptId?: string): number =>
  getDb().problems.filter(
    (p) =>
      p.desaId === desaId &&
      p.id !== exceptId &&
      ["available", "requested", "connected"].includes(p.status),
  ).length;

/** Kelompok yang masih memakai kuota (kelompok ditutup melepas kuota). */
export const usedSlots = (ps: Partnership): number =>
  ps.groups.filter((g) => g.status !== "closed").length;

export const pendingGroupCount = (list: Partnership[]): number =>
  list.reduce(
    (n, ps) => n + ps.groups.filter((g) => g.status === "submitted").length,
    0,
  );

export const findCoordinator = (token: string) => {
  for (const ps of getDb().partnerships) {
    const coordinator = ps.coordinators.find((c) => c.token === token);
    if (coordinator) return { partnership: ps, coordinator };
  }
  return null;
};

export const notificationsOf = (userId: string): Notification[] =>
  getDb()
    .notifs.filter((n) => n.userId === userId)
    .sort((a, b) => b.ts - a.ts);

export const unreadCount = (userId: string): number =>
  getDb().notifs.filter((n) => n.userId === userId && !n.read).length;
