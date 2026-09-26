import { beforeEach, describe, expect, it } from "vitest";
import { LIMITS } from "../constants";
import { __resetForTests, getDb, initDatabase } from "../database";
import { DomainError } from "../errors";
import { getPartnership, getProblem, usedSlots } from "../queries";
import * as partnerships from "../services/partnerships";
import { advanceClock } from "../services/scheduler";
import type { GroupInput } from "../types";

const memoryStorage = () => {
  const data = new Map<string, string>();
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
  };
};

const validGroup = (name = "Kelompok A"): GroupInput => ({
  name,
  dpl: "Dr. A",
  students: 4,
  start: "2025-07-01",
  end: "2025-08-01",
  program: "Program",
  note: "",
});

/** p6 (desa d2) tersedia di data demo; u1 adalah univ terverifikasi. */
function approvedPartnership(quota = 2) {
  const ps = partnerships.requestPartnership("p6", "u1", { quota });
  const coordinator = partnerships.inviteCoordinator(ps.id, { name: "Bu X", phone: "0812" });
  partnerships.respondRequest(ps.id, "approve");
  return { ps, coordinator };
}

beforeEach(() => {
  __resetForTests();
  initDatabase(memoryStorage());
});

describe("pengajuan", () => {
  it("mengunci kebutuhan dan menyimpan kuota serta rencana singkat", () => {
    const ps = partnerships.requestPartnership("p6", "u1", { quota: 3, period: "Jul", students: 12 });
    expect(ps.status).toBe("requested");
    expect(ps.quota).toBe(3);
    expect(ps.plan).toEqual({ period: "Jul", students: 12 });
    expect(getProblem("p6")?.status).toBe("requested");
  });

  it("menolak pengajuan kedua pada kebutuhan yang terkunci", () => {
    partnerships.requestPartnership("p6", "u1");
    expect(() => partnerships.requestPartnership("p6", "u2")).toThrow(DomainError);
  });

  it("boleh dibatalkan univ sebelum disetujui, kebutuhan terbuka lagi", () => {
    const ps = partnerships.requestPartnership("p6", "u1");
    partnerships.cancelRequest(ps.id);
    expect(getPartnership(ps.id)?.status).toBe("declined");
    expect(getProblem("p6")?.status).toBe("available");
  });

  it("tidak boleh dibatalkan univ setelah disetujui desa", () => {
    const { ps } = approvedPartnership();
    expect(() => partnerships.cancelRequest(ps.id)).toThrow(/tidak bisa dibatalkan/);
  });

  it("ditolak desa membuka kembali kebutuhan", () => {
    const ps = partnerships.requestPartnership("p6", "u1");
    partnerships.respondRequest(ps.id, "reject", "jadwal bentrok");
    expect(getPartnership(ps.id)?.status).toBe("rejected");
    expect(getProblem("p6")?.status).toBe("available");
  });

  it("kedaluwarsa jika desa tidak merespons dalam batas hari", () => {
    const ps = partnerships.requestPartnership("p6", "u1");
    advanceClock(LIMITS.RESPONSE_DAYS + 1);
    expect(getPartnership(ps.id)?.status).toBe("expired");
    expect(getProblem("p6")?.status).toBe("available");
  });
});

describe("kelompok & kesepakatan", () => {
  it("kesepakatan belum bisa diisi sebelum desa menyetujui", () => {
    const ps = partnerships.requestPartnership("p6", "u1");
    const k = partnerships.inviteCoordinator(ps.id, { name: "Bu X", phone: "0812" });
    expect(() => partnerships.saveGroup(ps.id, k.id, validGroup())).toThrow(/setelah desa menyetujui/);
  });

  it("kelompok pertama yang Sesuai membuat kerja sama Aktif", () => {
    const { ps, coordinator } = approvedPartnership();
    const g = partnerships.saveGroup(ps.id, coordinator.id, validGroup());
    partnerships.submitGroup(ps.id, g.id);
    partnerships.reviewGroup(ps.id, g.id, "confirm");
    expect(getPartnership(ps.id)?.status).toBe("matched");
    expect(getProblem("p6")?.status).toBe("matched");
  });

  it("membatasi jumlah kelompok sesuai kuota", () => {
    const { ps, coordinator } = approvedPartnership(1);
    partnerships.saveGroup(ps.id, coordinator.id, validGroup("A"));
    expect(() => partnerships.saveGroup(ps.id, coordinator.id, validGroup("B"))).toThrow(/Kuota 1/);
  });

  it("revisi maksimal 2 kali, lalu hanya Sesuai atau Tutup", () => {
    const { ps, coordinator } = approvedPartnership();
    const g = partnerships.saveGroup(ps.id, coordinator.id, validGroup());
    for (let n = 1; n <= LIMITS.MAX_REVISIONS; n++) {
      partnerships.submitGroup(ps.id, g.id);
      partnerships.reviewGroup(ps.id, g.id, "revision", `catatan ${n}`);
    }
    partnerships.submitGroup(ps.id, g.id);
    expect(() => partnerships.reviewGroup(ps.id, g.id, "revision", "lagi")).toThrow(/Batas revisi/);
    expect(() => partnerships.reviewGroup(ps.id, g.id, "close", "")).toThrow(/alasan/);
  });

  it("tutup kelompok hanya setelah batas revisi dan melepas kuota", () => {
    const { ps, coordinator } = approvedPartnership(1);
    const g = partnerships.saveGroup(ps.id, coordinator.id, validGroup());
    partnerships.submitGroup(ps.id, g.id);
    expect(() => partnerships.reviewGroup(ps.id, g.id, "close", "x")).toThrow(/setelah 2 kali revisi/);

    partnerships.reviewGroup(ps.id, g.id, "revision", "1");
    partnerships.submitGroup(ps.id, g.id);
    partnerships.reviewGroup(ps.id, g.id, "revision", "2");
    partnerships.submitGroup(ps.id, g.id);
    partnerships.reviewGroup(ps.id, g.id, "close", "formasi tidak cocok");

    const after = getPartnership(ps.id)!;
    expect(after.groups[0].status).toBe("closed");
    expect(usedSlots(after)).toBe(0);
    expect(() => partnerships.saveGroup(ps.id, coordinator.id, validGroup("B"))).not.toThrow();
  });

  it("tidak bisa menghapus koordinator yang sudah punya kelompok", () => {
    const { ps, coordinator } = approvedPartnership();
    partnerships.saveGroup(ps.id, coordinator.id, validGroup());
    expect(() => partnerships.removeCoordinator(ps.id, coordinator.id)).toThrow();
  });
});

describe("pengingat", () => {
  it("mengingatkan univ jika kesepakatan belum diisi setelah batas hari", () => {
    const { ps } = approvedPartnership();
    const before = getDb().notifs.length;
    advanceClock(LIMITS.NUDGE_DAYS + 1);
    expect(getPartnership(ps.id)?._nudge).toBe(true);
    expect(getDb().notifs.length).toBeGreaterThan(before);
  });
});
