import type { Role } from "@/domain";

/** Semua path aplikasi di satu tempat agar tidak tersebar sebagai string. */
export const routes = {
  home: "/",
  login: "/login",
  register: "/register",
  registered: "/registered",

  partnerships: "/partnerships",
  partnership: (id: string) => `/partnerships/${id}`,
  status: "/status",
  notifications: "/notifications",
  coordinator: (token: string) => `/koordinator/${token}`,

  desa: {
    dashboard: "/desa",
    problems: "/desa/problems",
    newProblem: "/desa/problems/new",
    problem: (id: string) => `/desa/problems/${id}`,
    editProblem: (id: string) => `/desa/problems/${id}/edit`,
    history: "/desa/history",
    profile: "/desa/profile",
  },
  univ: {
    dashboard: "/univ",
    discover: "/univ/discover",
    problem: (id: string) => `/univ/problems/${id}`,
    profile: "/univ/profile",
  },
  admin: {
    dashboard: "/admin",
    verify: "/admin/verify",
    data: "/admin/data",
    log: "/admin/log",
  },
} as const;

export const homeFor = (role: Role | undefined): string =>
  role === "desa"
    ? routes.desa.dashboard
    : role === "univ"
      ? routes.univ.dashboard
      : role === "admin"
        ? routes.admin.dashboard
        : routes.login;
