"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { Role, User } from "@/domain";
import { homeFor, routes } from "@/lib/routes";
import { useSession } from "./useDatabase";

/**
 * Guard halaman: mengarahkan ke /login bila belum masuk, atau ke dasbor sendiri
 * bila peran tidak diizinkan. Mengembalikan user hanya jika boleh mengakses.
 */
export function useRequireRole(roles: Role[]): User | null {
  const { ready, me } = useSession();
  const router = useRouter();
  const allowed = !!me && roles.includes(me.role);

  useEffect(() => {
    if (!ready) return;
    if (!me) router.replace(routes.login);
    else if (!allowed) router.replace(homeFor(me.role));
  }, [ready, me, allowed, router]);

  return allowed ? me : null;
}
