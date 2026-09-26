import type { ReactNode } from "react";
import { RoleOnly } from "@/components/layout/RoleOnly";

export default function UnivLayout({ children }: { children: ReactNode }) {
  return <RoleOnly roles={["univ"]}>{children}</RoleOnly>;
}
