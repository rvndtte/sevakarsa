"use client";

import Link from "next/link";
import { getDb, getDesa, partnershipsOf, pendingGroupCount } from "@/domain";
import { useUniv } from "@/components/layout/RoleOnly";
import { useDatabaseVersion } from "@/hooks/useDatabase";
import { RecentNotifications } from "@/features/notifications/RecentNotifications";
import { deadlineOf, problemTitleOf, progressOf } from "@/features/partnership/utils";
import {
  ButtonLink,
  Card,
  CardTitle,
  Countdown,
  EmptyState,
  Icon,
  PageHeader,
  Photo,
  ProgressBar,
  StatCard,
  StatusTag,
  Tag,
} from "@/components/ui";
import { routes } from "@/lib/routes";

export function UnivDashboardScreen() {
  useDatabaseVersion();
  const me = useUniv();
  const list = partnershipsOf(me);
  const running = list.filter((x) => ["requested", "connected"].includes(x.status)).sort((a, b) => b.createdAt - a.createdAt);
  const available = getDb().problems.filter((p) => p.status === "available").sort((a, b) => b.createdAt - a.createdAt);
  const pr = me.profile;
  const completeness = Math.min(
    100,
    (pr.about ? 25 : 0) + (pr.fields.length ? 20 : 0) + (pr.programs.length ? 15 : 0) + (pr.history.length ? 25 : 0) + (pr.contactName && pr.phone ? 15 : 0),
  );

  return (
    <>
      <PageHeader
        title={`Halo, ${pr.contactName || me.name}`}
        subtitle={`Ringkasan aktivitas KKN ${me.name}`}
        actions={
          <ButtonLink href={routes.univ.discover}>
            <Icon name="compass" /> Jelajahi desa
          </ButtonLink>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon="heart-handshake" tone="amber" value={running.length} label="Kerja sama berjalan" />
        <StatCard icon="file-check" tone="blue" value={pendingGroupCount(list)} label="Menunggu konfirmasi desa" />
        <StatCard icon="circle-check" tone="purple" value={list.filter((x) => x.status === "matched").length} label="Aktif" />
        <StatCard icon="compass" tone="green" value={available.length} label="Kebutuhan tersedia" />
      </div>

      <div className="mt-4 grid items-start gap-4 lg:grid-cols-[3fr_2fr]">
        <div className="flex flex-col gap-3">
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-[17px] font-semibold">Kebutuhan desa terbaru</h3>
              <Link href={routes.univ.discover} className="text-[11px] font-semibold text-leaf-500">Lihat semua</Link>
            </div>
            {available.length ? (
              <div className="flex flex-col gap-2.5">
                {available.slice(0, 3).map((p) => (
                  <Link
                    key={p.id}
                    href={routes.univ.problem(p.id)}
                    className="flex items-center gap-3.5 rounded-xl border border-transparent bg-cream-50 px-3.5 py-3 hover:border-line hover:bg-white"
                  >
                    <Photo seed={p.id} className="h-20 w-[110px]" />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold">{p.title}</div>
                      <div className="text-[11px] text-muted">{getDesa(p.desaId).name} · {p.city}</div>
                      <div className="mt-2"><Tag tone="blue">{p.category}</Tag></div>
                    </div>
                    <Icon name="chevron-right" className="text-muted" />
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState icon="compass">Belum ada kebutuhan tersedia.</EmptyState>
            )}
          </Card>

          <Card>
            <CardTitle>Kerja sama & kesepakatan</CardTitle>
            {running.length ? (
              <div className="flex flex-col gap-2.5">
                {running.map((r) => {
                  const d = deadlineOf(r);
                  return (
                    <Link
                      key={r.id}
                      href={routes.partnership(r.id)}
                      className="flex items-center gap-3.5 rounded-xl border border-transparent bg-cream-50 px-3.5 py-3 hover:border-line hover:bg-white"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold">{problemTitleOf(r)}</div>
                        <div className="text-[11px] text-muted">{getDesa(r.desaId).name}</div>
                        <ProgressBar value={progressOf(r)} thin className="mt-2" />
                      </div>
                      <div className="text-center">
                        <StatusTag status={r.status} />
                        <div className="mt-1 text-[11px] text-muted">
                          {d ? (
                            <>
                              <Icon name="clock" /> <Countdown end={d.end} />
                            </>
                          ) : (
                            `${r.groups.filter((g) => g.status !== "closed").length}/${r.quota} kelompok`
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <EmptyState icon="heart-handshake">Belum ada kerja sama berjalan.</EmptyState>
            )}
          </Card>
        </div>

        <div className="flex flex-col gap-3">
          <Card>
            <RecentNotifications userId={me.id} />
          </Card>
          <Card variant="soft">
            <CardTitle>Kelengkapan profil</CardTitle>
            <p className="text-xs text-muted">Profil yang lengkap membantu desa mengenal institusi Anda.</p>
            <ProgressBar value={completeness} className="mt-2" />
            <div className="mt-1 text-[11px] text-muted">{completeness}% lengkap</div>
            <ButtonLink href={routes.univ.profile} size="sm" variant="outline" className="mt-3">
              Lengkapi profil
            </ButtonLink>
          </Card>
        </div>
      </div>
    </>
  );
}
