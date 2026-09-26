import type { ReactNode } from "react";
import { RoleOnly } from "@/components/layout/RoleOnly";

/** Halaman kerja sama & status dipakai bersama oleh desa dan universitas. */
export default function CollabLayout({ children }: { children: ReactNode }) {
  return <RoleOnly roles={["desa", "univ"]}>{children}</RoleOnly>;
}
