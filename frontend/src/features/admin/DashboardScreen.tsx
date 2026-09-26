"use client";

import Link from "next/link";
import { getDb, pendingGroupCount } from "@/domain";
import { useDatabaseVersion } from "@/hooks/useDatabase";
import { Button, Card, CardTitle, EmptyState, Icon, IconBox, PageHeader, StatCard } from "@/components/ui";
import { timeAgo } from "@/lib/format";
import { routes } from "@/lib/routes";
import { useRouter } from "next/navigation";

export function AdminDashboardScreen() {
  useDatabaseVersion();
  const router = useRouter();
  const db = getDb();
  const pending = db.users.filter((u) => u.verified === "pending");
  const approved = (role: "desa" | "univ") => db.users.filter((u) => u.role === role && u.verified === "approved").length;

  return (
    <>
      <PageHeader title="Dashboard Super Admin" subtitle="Pantau aktivitas keseluruhan platform SevaKarsa" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon="home-heart" tone="green" value={approved("desa")} label="Desa terverifikasi" />
        <StatCard icon="building-community" tone="blue" value={approved("univ")} label="Universitas terverifikasi" />
        <Link href={routes.admin.verify}>
          <StatCard icon="user-exclamation" tone="amber" value={pending.length} label="Menunggu verifikasi" />
        </Link>
        <StatCard
          icon="file-text"
          tone="green"
          value={db.problems.filter((p) => ["available", "requested", "connected"].includes(p.status)).length}
          label="Kebutuhan aktif"
        />
        <StatCard
          icon="heart-handshake"
          tone="amber"
          value={db.partnerships.filter((p) => ["requested", "connected"].includes(p.status)).length}
          label="Kerja sama berjalan"
        />
        <StatCard icon="inbox" tone="purple" value={pendingGroupCount(db.partnerships)} label="Kesepakatan menunggu konfirmasi" />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-[17px] font-semibold">Akun menunggu verifikasi</h3>
            <Link href={routes.admin.verify} className="text-[11px] font-semibold text-leaf-500">Lihat semua</Link>
          </div>
          {pending.length ? (
            <div className="flex flex-col gap-2.5">
              {pending.map((u) => (
                <div key={u.id} className="flex items-center gap-3.5 rounded-xl bg-cream-50 px-3.5 py-3">
                  <IconBox icon={u.role === "desa" ? "home-heart" : "building-community"} tone={u.role === "desa" ? "green" : "blue"} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold">{u.name}</div>
                    <div className="text-[11px] text-muted">
                      {u.role === "admin" ? "" : u.profile.city} · {timeAgo(u.createdAt)}
                    </div>
                  </div>
                  <Button size="sm" onClick={() => router.push(`${routes.admin.verify}?u=${u.id}`)}>Tinjau</Button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon="user-check">Tidak ada antrean verifikasi.</EmptyState>
          )}
        </Card>
        <Card>
          <CardTitle>Aktivitas sistem</CardTitle>
          <div className="flex flex-col gap-3">
            {db.log.slice(0, 6).map((l, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <Icon name={l.icon} className="mt-0.5 text-muted" />
                <div>
                  <div className="text-xs font-semibold">{l.text}</div>
                  <div className="text-[11px] text-muted">{timeAgo(l.ts)}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
