import { CITIES } from "../constants";
import { commit, getDb, now } from "../database";
import { fail } from "../errors";
import { uid } from "../ids";
import { getUniv } from "../queries";
import type {
  DesaProfile,
  Role,
  Univ,
  UnivProfile,
  User,
  VerificationStatus,
} from "../types";
import { logActivity, notify, requireUser } from "./internal";

const ROLE_LABEL: Record<Role, string> = {
  desa: "Desa",
  univ: "Universitas",
  admin: "Super Admin",
};

export function login(email: string, password: string, role?: Role): User {
  const user = getDb().users.find(
    (u) => u.email.toLowerCase() === String(email).toLowerCase(),
  );
  if (!user || user.password !== password) fail("Email atau kata sandi salah.");
  if (role && user.role !== role) {
    fail(
      `Akun ini terdaftar sebagai ${ROLE_LABEL[user.role]}, bukan ${ROLE_LABEL[role]}. Pilih peran yang sesuai.`,
    );
  }
  if (user.verified === "pending")
    fail("Akun Anda masih menunggu verifikasi Super Admin (1–2 hari kerja).");
  if (user.verified === "rejected")
    fail("Verifikasi akun ditolak. Hubungi admin untuk informasi lebih lanjut.");
  getDb().session = user.id;
  commit();
  return user;
}

/** Masuk cepat tanpa verifikasi, khusus panel demo. */
export function demoLogin(email: string): User {
  const user = getDb().users.find((u) => u.email === email);
  if (!user) fail("Akun demo tidak ditemukan.");
  getDb().session = user.id;
  commit();
  return user;
}

export function logout(): void {
  getDb().session = null;
  commit();
}

export interface RegisterInput {
  role: "desa" | "univ";
  name: string;
  email: string;
  password: string;
  city?: string;
  contactName?: string;
  phone?: string;
  docs: string[];
}

export function register(input: RegisterInput): User {
  if (!input.name || !input.email || !input.password)
    fail("Lengkapi nama, email, dan kata sandi.");
  if (input.password.length < 6) fail("Kata sandi minimal 6 karakter.");
  const db = getDb();
  if (db.users.some((u) => u.email.toLowerCase() === input.email.toLowerCase()))
    fail("Email sudah terdaftar.");
  const docs = input.docs.filter(Boolean);
  if (!docs.length)
    fail("Unggah minimal satu dokumen pendukung untuk verifikasi.");

  const prefix = input.role === "desa" ? "Desa " : "Universitas ";
  const name = input.name.startsWith(prefix) ? input.name : prefix + input.name;
  const city = input.city || "Kab. Malang";
  const base = {
    id: uid(input.role === "desa" ? "d" : "u"),
    email: input.email,
    password: input.password,
    name,
    verified: "pending" as VerificationStatus,
    createdAt: now(),
    docs,
    vlog: [
      { ts: now(), text: "Pendaftaran diterima" },
      { ts: now(), text: "Menunggu peninjauan admin" },
    ],
  };
  const contact = {
    city,
    province: CITIES[city] ?? "",
    about: "",
    contactName: input.contactName ?? "",
    phone: input.phone ?? "",
    email: input.email,
  };
  const user: User =
    input.role === "desa"
      ? {
          ...base,
          role: "desa",
          profile: {
            ...contact,
            kecamatan: "",
            population: "",
            area: "",
            umkm: "",
            potentials: [],
            facilities: [],
          },
        }
      : {
          ...base,
          role: "univ",
          saved: [],
          profile: { ...contact, fields: [], programs: [], history: [] },
        };

  db.users.push(user);
  logActivity("user-plus", `Pendaftaran baru: ${name}`);
  db.users
    .filter((u) => u.role === "admin")
    .forEach((admin) =>
      notify(admin.id, "system", `Akun baru menunggu verifikasi: ${name}`, "/admin/verify"),
    );
  commit();
  return user;
}

export function verifyAccount(
  userId: string,
  decision: "approve" | "reject",
  note: string,
): void {
  const user = requireUser(userId);
  if (decision === "reject" && !note) fail("Isi alasan penolakan.");
  user.verified = decision === "approve" ? "approved" : "rejected";
  user.vlog.push({
    ts: now(),
    text:
      decision === "approve" ? "Akun disetujui Super Admin" : "Akun ditolak: " + note,
  });
  logActivity(
    decision === "approve" ? "user-check" : "user-x",
    `${user.name} ${decision === "approve" ? "diverifikasi" : "ditolak verifikasinya"}`,
  );
  commit();
}

export interface ProfilePatch<P> {
  name?: string;
  profile?: Partial<P>;
}

export function updateDesaProfile(
  userId: string,
  patch: ProfilePatch<DesaProfile>,
): void {
  const user = requireUser(userId);
  if (user.role !== "desa") fail("Bukan akun desa.");
  if (patch.name) user.name = patch.name;
  Object.assign(user.profile, patch.profile);
  commit();
}

export function updateUnivProfile(
  userId: string,
  patch: ProfilePatch<UnivProfile>,
): void {
  const user = getUniv(userId);
  if (patch.name) user.name = patch.name;
  Object.assign(user.profile, patch.profile);
  commit();
}

/** @returns true jika kebutuhan kini tersimpan. */
export function toggleSaved(userId: string, problemId: string): boolean {
  const user = getUniv(userId);
  const i = user.saved.indexOf(problemId);
  if (i >= 0) user.saved.splice(i, 1);
  else user.saved.push(problemId);
  commit();
  return i < 0;
}

export function addHistory(
  userId: string,
  entry: { title: string; year?: string; desa?: string; result?: string },
): void {
  if (!entry.title) fail("Judul program wajib diisi.");
  const user: Univ = getUniv(userId);
  user.profile.history.push({
    id: uid("h"),
    title: entry.title,
    year: entry.year || "-",
    desa: entry.desa || "-",
    result: entry.result || "-",
  });
  commit();
}

export function deleteHistory(userId: string, historyId: string): void {
  const user = getUniv(userId);
  user.profile.history = user.profile.history.filter((h) => h.id !== historyId);
  commit();
}

