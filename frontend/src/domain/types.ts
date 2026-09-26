/* Model data domain SevaKarsa. Tidak bergantung pada React/DOM. */

export type Role = "desa" | "univ" | "admin";
export type VerificationStatus = "pending" | "approved" | "rejected";

export interface LogEntry {
  ts: number;
  text: string;
}

/* ------------------------------------------------------------ pengguna */

interface BaseProfile {
  city: string;
  province: string;
  about: string;
  contactName: string;
  phone: string;
  email: string;
}

export interface DesaProfile extends BaseProfile {
  kecamatan: string;
  population: number | string;
  area: string;
  umkm: number | string;
  potentials: string[];
  facilities: string[];
}

export interface ProgramHistory {
  id: string;
  title: string;
  year: string;
  desa: string;
  result: string;
}

export interface UnivProfile extends BaseProfile {
  fields: string[];
  programs: string[];
  history: ProgramHistory[];
}

interface BaseUser {
  id: string;
  email: string;
  password: string;
  name: string;
  verified: VerificationStatus;
  createdAt: number;
  docs: string[];
  vlog: LogEntry[];
}

export interface Desa extends BaseUser {
  role: "desa";
  profile: DesaProfile;
}
export interface Univ extends BaseUser {
  role: "univ";
  profile: UnivProfile;
  saved: string[];
}
export interface Admin extends BaseUser {
  role: "admin";
  profile: Record<string, never>;
}
export type User = Desa | Univ | Admin;

/* ------------------------------------------------------------ kebutuhan */

export type ProblemStatus =
  | "draft"
  | "available"
  | "requested"
  | "connected"
  | "matched"
  | "expired";

export interface Problem {
  id: string;
  desaId: string;
  title: string;
  category: string;
  city: string;
  province: string;
  skills: string[];
  duration: number;
  teamMin: number;
  teamMax: number;
  status: ProblemStatus;
  createdAt: number;
  deadline: number;
  partnershipId: string | null;
  desc: string;
  condition: string;
  need: string;
  target: string;
}

/** Isian form kebutuhan (wizard) sebelum disimpan. */
export interface ProblemDraft {
  title: string;
  category: string;
  desc: string;
  condition: string;
  need: string;
  target: string;
  skills: string[];
  deadline: string;
  duration?: number;
  teamMin?: number;
  teamMax?: number;
}

/* ------------------------------------------------------------ kerja sama */

export type PartnershipStatus =
  | "requested"
  | "connected"
  | "matched"
  | "rejected"
  | "expired"
  | "declined";

export type GroupStatus =
  | "draft"
  | "submitted"
  | "revision"
  | "confirmed"
  | "closed";

export type GroupDecision = "confirm" | "revision" | "close";

export interface Coordinator {
  id: string;
  name: string;
  phone: string;
  email: string;
  token: string;
  ts: number;
}

export interface Group {
  id: string;
  coordinatorId: string;
  name: string;
  dpl: string;
  students: number | string;
  start: string;
  end: string;
  program: string;
  note: string;
  status: GroupStatus;
  submittedAt: number | null;
  reviewNote: string;
  revisions: number;
}

export type GroupInput = Pick<
  Group,
  "name" | "dpl" | "students" | "start" | "end" | "program" | "note"
>;

export interface PartnershipDoc {
  id: string;
  name: string;
  by: string;
  ts: number;
  kind: "pdf" | "report" | "photo";
}

export interface PartnershipPlan {
  period: string;
  students: number | "";
}

export interface Partnership {
  id: string;
  problemId: string;
  univId: string;
  desaId: string;
  status: PartnershipStatus;
  createdAt: number;
  responseEnds?: number;
  approvedAt?: number;
  activeAt?: number;
  completed?: boolean;
  message: string;
  quota: number;
  plan?: PartnershipPlan;
  rejectNote?: string;
  coordinators: Coordinator[];
  groups: Group[];
  docs: PartnershipDoc[];
  log: LogEntry[];
  /* penanda internal agar pengingat hanya dikirim sekali */
  _warn?: boolean;
  _nudge?: boolean;
}

export interface RequestOptions {
  message?: string;
  quota?: number | string;
  period?: string;
  students?: number | string;
}

/* ------------------------------------------------------------ lain-lain */

export type NotificationType =
  | "partnership"
  | "agreement"
  | "deadline"
  | "status"
  | "reject"
  | "expire"
  | "system";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  text: string;
  link: string;
  ts: number;
  read: boolean;
}

export interface ActivityLog {
  ts: number;
  icon: string;
  text: string;
}

export interface Database {
  v: number;
  clock: number;
  session: string | null;
  users: User[];
  problems: Problem[];
  partnerships: Partnership[];
  notifs: Notification[];
  log: ActivityLog[];
}
