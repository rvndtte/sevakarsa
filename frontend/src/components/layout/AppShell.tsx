"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { auth, unreadCount, type Role, type User } from "@/domain";
import { useDatabaseVersion } from "@/hooks/useDatabase";
import { Avatar, Icon } from "@/components/ui";
import { useToast } from "@/components/providers/ToastProvider";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";

interface NavItem {
  href: string;
  icon: string;
  label: string;
  /** Awalan path lain yang juga menandai item ini aktif. */
  alsoActiveFor?: string[];
}

const NAV: Record<Role, NavItem[]> = {
  desa: [
    { href: routes.desa.dashboard, icon: "home", label: "Beranda" },
    { href: routes.desa.problems, icon: "file-text", label: "Kebutuhan Saya" },
    { href: routes.partnerships, icon: "heart-handshake", label: "Kerja Sama" },
    { href: routes.status, icon: "timeline-event", label: "Status" },
    { href: routes.notifications, icon: "bell", label: "Notifikasi" },
    { href: routes.desa.history, icon: "history", label: "Riwayat & Dokumentasi" },
    { href: routes.desa.profile, icon: "user", label: "Profil Desa" },
  ],
  univ: [
    { href: routes.univ.dashboard, icon: "home", label: "Beranda" },
    { href: routes.univ.discover, icon: "compass", label: "Jelajahi Desa", alsoActiveFor: ["/univ/problems"] },
    { href: routes.partnerships, icon: "heart-handshake", label: "Kerja Sama" },
    { href: routes.status, icon: "timeline-event", label: "Status" },
    { href: routes.notifications, icon: "bell", label: "Notifikasi" },
    { href: routes.univ.profile, icon: "user", label: "Profil Tim" },
  ],
  admin: [
    { href: routes.admin.dashboard, icon: "layout-dashboard", label: "Dashboard" },
    { href: routes.admin.verify, icon: "user-check", label: "Verifikasi Akun" },
    { href: routes.admin.data, icon: "database", label: "Data Platform" },
    { href: routes.admin.log, icon: "activity", label: "Log Aktivitas" },
  ],
};

const ROLE_LABEL: Record<Role, string> = {
  desa: "Desa",
  univ: "Universitas",
  admin: "Super Admin",
};

const ROOTS = new Set<string>([routes.desa.dashboard, routes.univ.dashboard, routes.admin.dashboard]);

function isActive(item: NavItem, path: string): boolean {
  if (ROOTS.has(item.href)) return path === item.href;
  const prefixes = [item.href, ...(item.alsoActiveFor ?? [])];
  return prefixes.some((p) => path === p || path.startsWith(p + "/"));
}

export function AppShell({ me, children }: { me: User; children: ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const toast = useToast();
  useDatabaseVersion();
  const unread = unreadCount(me.id);
  const admin = me.role === "admin";

  const logout = () => {
    auth.logout();
    toast.success("Anda telah keluar.");
    router.push(routes.home);
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside
        className={cn(
          "flex flex-none flex-row flex-wrap items-center gap-1 p-3 lg:sticky lg:top-0 lg:h-screen lg:w-[248px] lg:flex-col lg:items-stretch lg:overflow-auto lg:px-4 lg:py-6",
          admin ? "bg-forest-900" : "border-r border-line bg-cream-50",
        )}
      >
        <Link
          href={routes.home}
          className={cn(
            "flex items-center gap-2 px-2 font-display text-xl font-semibold lg:pb-5",
            admin ? "text-ondark" : "text-forest-900",
          )}
        >
          <Icon name="leaf" className={cn("text-[22px]", admin ? "text-lime" : "text-forest-600")} />
          {admin ? "Admin" : "SevaKarsa"}
        </Link>

        {NAV[me.role].map((item) => {
          const active = isActive(item, path);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium transition",
                admin
                  ? active
                    ? "bg-lime text-forest-950"
                    : "text-[#9fb2a6] hover:bg-forest-800 hover:text-ondark"
                  : active
                    ? "bg-forest-900 text-ondark"
                    : "text-muted hover:bg-cream-200 hover:text-ink",
              )}
            >
              <Icon name={item.icon} className={cn("text-[19px]", active && !admin && "text-lime")} />
              <span>{item.label}</span>
              {item.href === routes.notifications && unread > 0 && (
                <span className="ml-auto rounded-full bg-brick-500 px-[7px] py-px text-[10px] font-bold text-white">
                  {unread}
                </span>
              )}
            </Link>
          );
        })}

        <div className="hidden flex-1 lg:block" />
        <div
          className={cn(
            "hidden items-center gap-2.5 border-t px-2 pt-3 lg:flex",
            admin ? "border-forest-800 text-ondark" : "border-line",
          )}
        >
          <Avatar name={me.name} variant={me.role === "univ" ? "univ" : "desa"} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] leading-tight font-semibold">{me.name}</div>
            <div className="text-[11px] text-muted">{ROLE_LABEL[me.role]}</div>
          </div>
          <button
            type="button"
            onClick={logout}
            title="Keluar"
            className="flex size-[34px] items-center justify-center rounded-full border border-line bg-white text-lg text-ink"
          >
            <Icon name="logout" />
          </button>
        </div>
      </aside>

      <main className="mx-auto w-full max-w-[1240px] min-w-0 flex-1 px-4 pt-5 pb-[90px] lg:px-10 lg:pt-7 lg:pb-20">
        {children}
      </main>
    </div>
  );
}
