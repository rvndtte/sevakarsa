import type { ReactNode } from "react";
import { RoleOnly } from "@/components/layout/RoleOnly";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <RoleOnly roles={["admin"]}>{children}</RoleOnly>;
}
