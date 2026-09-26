"use client";

import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { RoleOnly, useUser } from "@/components/layout/RoleOnly";

function Frame({ children }: { children: ReactNode }) {
  return <AppShell me={useUser()}>{children}</AppShell>;
}

/** Semua halaman setelah login memakai sidebar; akses per peran dijaga layout turunan. */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <RoleOnly roles={["desa", "univ", "admin"]}>
      <Frame>{children}</Frame>
    </RoleOnly>
  );
}
