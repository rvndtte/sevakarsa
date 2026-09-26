/**
 * Aturan kerja sama (payung) antara desa dan universitas:
 * Diajukan → Disetujui → Aktif, dengan kelompok KKN yang dikonfirmasi satu per satu.
 */
import { DAY, LIMITS } from "../constants";
import { commit, getDb, now } from "../database";
import { fail } from "../errors";
import { token, uid } from "../ids";
import { getUniv, usedSlots } from "../queries";
import type {
  Coordinator,
  Group,
  GroupDecision,
  GroupInput,
  Partnership,
  RequestOptions,
} from "../types";
import {
  logActivity,
  nameOf,
  notify,
  requirePartnership,
  requireProblem,
  stamp,
  unlockProblem,
} from "./internal";

const partnershipLink = (id: string) => `/partnerships/${id}`;

/* ------------------------------------------------------------ pengajuan */

export function requestPartnership(
  problemId: string,
  univId: string,
  opts: RequestOptions = {},
): Partnership {
  const problem = requireProblem(problemId);
  const univ = getUniv(univId);
  if (problem.status !== "available") {
    fail(
      ["requested", "connected", "matched"].includes(problem.status)
        ? "Kebutuhan ini sedang diajukan/berjalan bersama universitas lain."
        : "Kebutuhan ini sudah tidak tersedia.",
    );
  }
  if (univ.verified !== "approved") fail("Akun belum terverifikasi.");

  const quota = Math.max(1, Math.min(LIMITS.MAX_QUOTA, Number(opts.quota) || 1));
  const students = opts.students ? Math.max(1, Number(opts.students) || 0) : "";
  const ps: Partnership = {
    id: uid("pt"),
    problemId,
    univId,
    desaId: problem.desaId,
    status: "requested",
    createdAt: now(),
    responseEnds: now() + LIMITS.RESPONSE_DAYS * DAY,
    message: opts.message ?? "",
    quota,
    plan: { period: (opts.period ?? "").trim(), students },
    coordinators: [],
    groups: [],
    docs: [],
    log: [],
  };
  stamp(ps, `Kerja sama diajukan oleh ${univ.name} (kuota ${quota} kelompok) — menunggu persetujuan desa`);
  getDb().partnerships.push(ps);

  problem.status = "requested"; // terkunci sampai desa merespons
  problem.partnershipId = ps.id;
  notify(problem.desaId, "partnership", `${univ.name} mengajukan kerja sama untuk ${problem.title} (${quota} kelompok) — menunggu persetujuan Anda`, partnershipLink(ps.id));
  logActivity("heart-handshake", `Kerja sama diajukan: ${univ.name} × ${problem.title}`);
  commit();
  return ps;
}

/** Univ hanya boleh membatalkan sebelum desa menyetujui. */
export function cancelRequest(id: string): void {
  const ps = requirePartnership(id);
  if (ps.status !== "requested")
    fail("Kerja sama yang sudah disetujui desa tidak bisa dibatalkan sepihak oleh universitas.");
  const problem = requireProblem(ps.problemId);
  ps.status = "declined";
  stamp(ps, "Universitas membatalkan kerja sama");
  unlockProblem(problem, "universitas mundur");
  notify(ps.desaId, "reject", `${nameOf(ps.univId)} membatalkan kerja sama ${problem.title}`, `/desa/problems/${problem.id}`);
  commit();
}

/** Keputusan desa atas pengajuan, dilakukan sekali. */
export function respondRequest(
  id: string,
  decision: "approve" | "reject",
  note = "",
): void {
  const ps = requirePartnership(id);
  const problem = requireProblem(ps.problemId);
  if (ps.status !== "requested") fail("Pengajuan ini sudah direspons.");

  if (decision === "approve") {
    ps.status = "connected";
    ps.approvedAt = now();
    problem.status = "connected";
    stamp(ps, "Desa menyetujui kerja sama — kontak kedua pihak terbuka");
    notify(ps.univId, "status", `${nameOf(ps.desaId)} menyetujui kerja sama ${problem.title}. Kontak terbuka, lanjutkan diskusi via WhatsApp`, partnershipLink(id));
    logActivity("circle-check", `Kerja sama disetujui: ${nameOf(ps.univId)} × ${problem.title}`);
  } else {
    ps.status = "rejected";
    ps.rejectNote = note;
    unlockProblem(problem, "ditolak desa");
    stamp(ps, "Desa menolak kerja sama" + (note ? ": " + note : ""));
    notify(ps.univId, "reject", `${nameOf(ps.desaId)} menolak kerja sama ${problem.title}`, partnershipLink(id));
    logActivity("circle-x", `Kerja sama ditolak: ${nameOf(ps.univId)} × ${problem.title}`);
  }
  commit();
}

/* ------------------------------------------------------------ koordinator */

export function inviteCoordinator(
  id: string,
  input: { name: string; phone: string; email?: string },
): Coordinator {
  const ps = requirePartnership(id);
  if (!["requested", "connected", "matched"].includes(ps.status))
    fail("Koordinator hanya bisa diundang pada kerja sama yang masih berjalan.");
  const name = input.name.trim();
  const phone = input.phone.trim();
  if (!name) fail("Isi nama koordinator.");
  if (!phone) fail("Isi nomor WhatsApp koordinator agar desa bisa menghubungi.");
  if (ps.coordinators.some((c) => c.phone === phone)) fail("Nomor ini sudah diundang.");

  const coordinator: Coordinator = {
    id: uid("k"),
    name,
    phone,
    email: (input.email ?? "").trim(),
    token: token(),
    ts: now(),
  };
  ps.coordinators.push(coordinator);
  stamp(ps, `Koordinator diundang: ${name}`);
  commit();
  return coordinator;
}

export function removeCoordinator(id: string, coordinatorId: string): void {
  const ps = requirePartnership(id);
  if (ps.groups.some((g) => g.coordinatorId === coordinatorId))
    fail("Koordinator ini sudah memiliki kelompok.");
  ps.coordinators = ps.coordinators.filter((c) => c.id !== coordinatorId);
  commit();
}

/* ------------------------------------------------------------ kelompok */

function assertGroupComplete(g: GroupInput): void {
  if (!String(g.name).trim()) fail("Isi nama kelompok.");
  if (!String(g.dpl).trim()) fail("Isi nama dosen pembimbing (DPL).");
  if (!(Number(g.students) >= 1)) fail("Isi jumlah mahasiswa.");
  if (!g.start || !g.end) fail("Isi tanggal mulai dan selesai.");
  if (g.end < g.start) fail("Tanggal selesai harus setelah tanggal mulai.");
  if (!String(g.program).trim()) fail("Isi program utama.");
}

const findGroup = (ps: Partnership, groupId: string): Group =>
  ps.groups.find((g) => g.id === groupId) ?? fail("Kelompok tidak ditemukan.");

/** Simpan draft kelompok (baru atau yang sedang draft/revisi). */
export function saveGroup(
  id: string,
  coordinatorId: string,
  data: GroupInput,
  groupId?: string,
): Group {
  const ps = requirePartnership(id);
  if (!["connected", "matched"].includes(ps.status))
    fail("Kesepakatan hanya bisa diisi setelah desa menyetujui kerja sama.");
  if (!ps.coordinators.some((c) => c.id === coordinatorId))
    fail("Koordinator tidak dikenali.");

  const fields: GroupInput = {
    name: data.name,
    dpl: data.dpl,
    students: data.students,
    start: data.start,
    end: data.end,
    program: data.program,
    note: data.note ?? "",
  };
  const existing = groupId ? ps.groups.find((g) => g.id === groupId) : undefined;
  if (existing) {
    if (!["draft", "revision"].includes(existing.status))
      fail("Kesepakatan sudah dikirim ke desa.");
    Object.assign(existing, fields);
    commit();
    return existing;
  }
  if (usedSlots(ps) >= ps.quota) fail(`Kuota ${ps.quota} kelompok sudah penuh.`);
  const group: Group = {
    id: uid("g"),
    coordinatorId,
    status: "draft",
    submittedAt: null,
    reviewNote: "",
    revisions: 0,
    ...fields,
  };
  ps.groups.push(group);
  commit();
  return group;
}

export function validateGroup(id: string, groupId: string): void {
  assertGroupComplete(findGroup(requirePartnership(id), groupId));
}

export function deleteGroup(id: string, groupId: string): void {
  const ps = requirePartnership(id);
  if (findGroup(ps, groupId).status !== "draft") fail("Hanya draft yang bisa dihapus.");
  ps.groups = ps.groups.filter((g) => g.id !== groupId);
  commit();
}

export function submitGroup(id: string, groupId: string): void {
  const ps = requirePartnership(id);
  const problem = requireProblem(ps.problemId);
  const group = findGroup(ps, groupId);
  if (!["draft", "revision"].includes(group.status)) fail("Kesepakatan sudah dikirim.");
  assertGroupComplete(group);

  group.status = "submitted";
  group.submittedAt = now();
  group.reviewNote = "";
  stamp(ps, `Koordinator mengirim konfirmasi kesepakatan: ${group.name}`);
  notify(ps.desaId, "agreement", `${nameOf(ps.univId)} mengirim konfirmasi kesepakatan ${group.name} (${problem.title}) — mohon dikonfirmasi`, partnershipLink(id));
  logActivity("file-check", `Konfirmasi kesepakatan dikirim: ${group.name} · ${problem.title}`);
  commit();
}

export function reviewGroup(
  id: string,
  groupId: string,
  decision: GroupDecision,
  note = "",
): void {
  const ps = requirePartnership(id);
  const problem = requireProblem(ps.problemId);
  const group = findGroup(ps, groupId);
  if (group.status !== "submitted") fail("Tidak ada kesepakatan yang menunggu konfirmasi.");

  if (decision === "confirm") {
    group.status = "confirmed";
    group.reviewNote = "";
    stamp(ps, `Desa menyatakan sesuai: ${group.name}`);
    if (ps.status === "connected") {
      ps.status = "matched";
      ps.activeAt = now();
      problem.status = "matched";
      stamp(ps, "Kerja sama aktif");
      logActivity("circle-check", `Kerja sama aktif: ${nameOf(ps.univId)} × ${problem.title}`);
    }
    notify(ps.univId, "status", `Desa menyatakan sesuai untuk ${group.name} (${problem.title}). Kerja sama aktif`, partnershipLink(id));
  } else if (decision === "close") {
    if (group.revisions < LIMITS.MAX_REVISIONS)
      fail(`Kelompok hanya bisa ditutup setelah ${LIMITS.MAX_REVISIONS} kali revisi.`);
    if (!note) fail("Isi alasan menutup kelompok.");
    group.status = "closed";
    group.reviewNote = note;
    stamp(ps, `Desa menutup kelompok ${group.name}: ${note}`);
    notify(ps.univId, "reject", `Desa menutup kelompok ${group.name} (${problem.title}): ${note}`, partnershipLink(id));
  } else {
    if (group.revisions >= LIMITS.MAX_REVISIONS)
      fail(`Batas revisi (${LIMITS.MAX_REVISIONS}x) tercapai. Diskusikan via WhatsApp lalu pilih Sesuai atau tutup kelompok.`);
    if (!note) fail("Isi catatan revisi untuk koordinator.");
    group.revisions += 1;
    group.status = "revision";
    group.reviewNote = note;
    stamp(ps, `Desa meminta revisi (${group.revisions}/${LIMITS.MAX_REVISIONS}): ${group.name}`);
    notify(ps.univId, "agreement", `Desa meminta revisi kesepakatan ${group.name} (${group.revisions}/${LIMITS.MAX_REVISIONS}). Sampaikan detailnya via WhatsApp`, partnershipLink(id));
  }
  commit();
}

/* ------------------------------------------------------------ dokumen & selesai */

export function addDocument(
  id: string,
  userId: string,
  name: string | undefined,
  kind: "pdf" | "report" | "photo" = "pdf",
): void {
  if (!name) fail("Pilih berkas terlebih dulu.");
  const ps = requirePartnership(id);
  ps.docs.push({ id: uid("x"), name, by: userId, ts: now(), kind });
  stamp(ps, `${nameOf(userId)} menambahkan dokumen: ${name}`);
  commit();
}

export function completePartnership(id: string): void {
  const ps = requirePartnership(id);
  if (ps.status !== "matched") fail("Hanya kerja sama Aktif yang bisa diselesaikan.");
  if (!ps.docs.some((d) => d.kind === "report" || /laporan/i.test(d.name)))
    fail("Unggah laporan akhir sebelum menandai selesai.");
  ps.completed = true;
  stamp(ps, "KKN selesai dan didokumentasikan");
  notify(ps.desaId, "status", "KKN ditandai selesai", partnershipLink(id));
  notify(ps.univId, "status", "KKN ditandai selesai", partnershipLink(id));
  commit();
}
