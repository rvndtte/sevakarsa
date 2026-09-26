import { DAY, LIMITS } from "../constants";
import { commit, getDb, now } from "../database";
import { fail } from "../errors";
import { uid } from "../ids";
import { activeProblemCount, getDesa } from "../queries";
import type { Problem, ProblemDraft } from "../types";
import { logActivity, notify, requireProblem } from "./internal";

const EDITABLE: Problem["status"][] = ["draft", "available", "expired"];

/** Buat draft kosong untuk wizard kebutuhan. */
export function blankProblemDraft(): ProblemDraft {
  return {
    title: "",
    category: "Teknologi",
    desc: "",
    condition: "",
    need: "",
    target: "",
    skills: [],
    deadline: new Date(now() + 30 * DAY).toISOString().slice(0, 10),
  };
}

/**
 * Simpan kebutuhan sebagai draft atau publikasikan.
 * @param id jika diisi, memperbarui kebutuhan yang ada.
 */
export function saveProblem(
  desaId: string,
  data: ProblemDraft,
  publish: boolean,
  id?: string | null,
): Problem {
  if (publish) {
    const required: (keyof ProblemDraft)[] = ["title", "category", "desc", "condition", "need", "target"];
    if (required.some((k) => !String(data[k] ?? "").trim()))
      fail("Lengkapi semua bagian wajib sebelum mempublikasikan.");
    if (!data.skills.length) fail("Pilih minimal satu kompetensi yang dibutuhkan.");
    if (activeProblemCount(desaId, id ?? undefined) >= LIMITS.MAX_ACTIVE_PROBLEMS)
      fail(`Maksimal ${LIMITS.MAX_ACTIVE_PROBLEMS} kebutuhan aktif per desa. Selesaikan atau hapus salah satu terlebih dulu.`);
  } else if (!data.title.trim()) {
    fail("Isi judul kebutuhan terlebih dulu.");
  }

  const desa = getDesa(desaId);
  const fields = {
    title: data.title,
    category: data.category || "Teknologi",
    desc: data.desc,
    condition: data.condition,
    need: data.need,
    target: data.target,
    duration: data.duration ?? 2,
    skills: data.skills,
    teamMin: data.teamMin ?? 3,
    teamMax: data.teamMax ?? 5,
    city: desa.profile.city,
    province: desa.profile.province,
    deadline: data.deadline ? new Date(data.deadline).getTime() : now() + 30 * DAY,
  };

  let problem = id ? getDb().problems.find((p) => p.id === id) : undefined;
  if (problem) {
    if (!EDITABLE.includes(problem.status))
      fail("Kebutuhan yang sedang diajukan atau berjalan tidak bisa diubah.");
    Object.assign(problem, fields);
  } else {
    problem = {
      id: uid("p"),
      desaId,
      createdAt: now(),
      partnershipId: null,
      status: "draft",
      ...fields,
    };
    getDb().problems.push(problem);
  }

  if (publish) {
    problem.status = "available";
    logActivity("plus", `Kebutuhan dipublikasikan: ${problem.title}`);
    notify(desaId, "status", `Kebutuhan "${problem.title}" dipublikasikan`, `/desa/problems/${problem.id}`);
    const published = problem;
    getDb()
      .users.filter((u) => u.role === "univ" && u.verified === "approved")
      .forEach((u) =>
        notify(u.id, "status", `Kebutuhan baru dipublikasikan: ${published.title} (${desa.name})`, `/univ/problems/${published.id}`),
      );
  } else if (problem.status !== "available") {
    problem.status = "draft";
  }
  commit();
  return problem;
}

export function deleteProblem(id: string): void {
  const problem = requireProblem(id);
  if (!EDITABLE.includes(problem.status))
    fail("Kebutuhan yang diajukan atau berjalan tidak bisa dihapus.");
  getDb().problems = getDb().problems.filter((p) => p.id !== id);
  commit();
}

export function republishProblem(id: string): void {
  const problem = requireProblem(id);
  if (problem.status !== "expired")
    fail("Hanya kebutuhan kedaluwarsa yang bisa dipublikasikan ulang.");
  problem.status = "available";
  problem.partnershipId = null;
  problem.deadline = now() + 30 * DAY;
  logActivity("refresh", `Kebutuhan dipublikasikan ulang: ${problem.title}`);
  commit();
}

export const isProblemEditable = (p: Problem): boolean => EDITABLE.includes(p.status);
