import type {
  GroupStatus,
  PartnershipStatus,
  ProblemStatus,
  VerificationStatus,
} from "./types";

export const DAY = 86_400_000;

/** Aturan bisnis yang dipakai bersama oleh service dan UI. */
export const LIMITS = {
  /** Hari desa untuk merespons pengajuan sebelum kedaluwarsa. */
  RESPONSE_DAYS: 7,
  /** Hari sejak disetujui sebelum univ diingatkan mengisi kesepakatan. */
  NUDGE_DAYS: 5,
  /** Batas permintaan revisi per kelompok. */
  MAX_REVISIONS: 2,
  /** Kebutuhan aktif maksimal per desa. */
  MAX_ACTIVE_PROBLEMS: 5,
  MAX_QUOTA: 20,
} as const;

export const CATEGORIES = [
  "Teknologi",
  "Pertanian",
  "Lingkungan",
  "UMKM",
  "Kesehatan",
  "Pendidikan",
] as const;

export const CATEGORY_ICONS: Record<string, string> = {
  Teknologi: "device-laptop",
  Pertanian: "plant-2",
  Lingkungan: "recycle",
  UMKM: "building-store",
  Kesehatan: "heartbeat",
  Pendidikan: "school",
};

export const SKILLS = [
  "Web Development",
  "UI/UX Design",
  "Data Analysis",
  "Bisnis",
  "IoT",
  "Bioteknologi",
  "Agribisnis",
  "Pendidikan",
  "Kesehatan Masyarakat",
  "Desain Grafis",
  "Manajemen Proyek",
  "Pemasaran Digital",
] as const;

export const CITIES: Record<string, string> = {
  "Kab. Malang": "Jawa Timur",
  "Kota Malang": "Jawa Timur",
  "Kab. Pasuruan": "Jawa Timur",
  "Kab. Blitar": "Jawa Timur",
  "Kab. Sleman": "DI Yogyakarta",
  "Kab. Bandung": "Jawa Barat",
};

/* ------------------------------------------------------------ status */

export type Tone = "green" | "amber" | "blue" | "purple" | "gray" | "red";

export interface StatusMeta {
  label: string;
  tone: Tone;
}

export type AnyStatus =
  | ProblemStatus
  | PartnershipStatus
  | GroupStatus
  | VerificationStatus
  | "done";

export const STATUS_META: Record<AnyStatus, StatusMeta> = {
  available: { label: "Available", tone: "green" },
  requested: { label: "Diajukan", tone: "blue" },
  connected: { label: "Disetujui", tone: "amber" },
  matched: { label: "Aktif", tone: "purple" },
  rejected: { label: "Ditolak", tone: "red" },
  expired: { label: "Kedaluwarsa", tone: "gray" },
  declined: { label: "Dibatalkan", tone: "gray" },
  draft: { label: "Draft", tone: "gray" },
  pending: { label: "Menunggu verifikasi", tone: "amber" },
  approved: { label: "Terverifikasi", tone: "green" },
  submitted: { label: "Menunggu konfirmasi desa", tone: "blue" },
  revision: { label: "Perlu revisi", tone: "amber" },
  confirmed: { label: "Sesuai", tone: "green" },
  closed: { label: "Ditutup", tone: "gray" },
  done: { label: "Selesai", tone: "purple" },
};

/* status kerja sama yang dikelompokkan untuk filter & guard */
export const OPEN_STATUSES: PartnershipStatus[] = ["connected", "matched"];
export const LIVE_STATUSES: PartnershipStatus[] = [
  "requested",
  "connected",
  "matched",
];
export const CLOSED_STATUSES: PartnershipStatus[] = [
  "rejected",
  "expired",
  "declined",
];

/** Status kebutuhan yang mengunci kebutuhan bagi universitas lain. */
export const LOCKED_PROBLEM_STATUSES: ProblemStatus[] = [
  "requested",
  "connected",
  "matched",
];
