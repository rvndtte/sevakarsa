import type { ReactNode } from "react";
import { RoleOnly } from "@/components/layout/RoleOnly";

export default function DesaLayout({ children }: { children: ReactNode }) {
  return <RoleOnly roles={["desa"]}>{children}</RoleOnly>;
}
