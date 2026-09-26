"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Desa, Role, Univ, User } from "@/domain";
import { useRequireRole } from "@/hooks/useRequireRole";

const UserContext = createContext<User | null>(null);

/**
 * Hanya merender anak jika pengguna masuk dengan salah satu `roles`;
 * selain itu pengguna diarahkan (lihat useRequireRole). Menyediakan user
 * yang sudah pasti ada lewat useUser/useDesa/useUniv.
 */
export function RoleOnly({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const user = useRequireRole(roles);
  if (!user) return null;
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser(): User {
  const user = useContext(UserContext);
  if (!user) throw new Error("useUser harus dipakai di dalam <RoleOnly>");
  return user;
}

export function useDesa(): Desa {
  const user = useUser();
  if (user.role !== "desa") throw new Error("Halaman ini khusus akun desa");
  return user;
}

export function useUniv(): Univ {
  const user = useUser();
  if (user.role !== "univ") throw new Error("Halaman ini khusus akun universitas");
  return user;
}
