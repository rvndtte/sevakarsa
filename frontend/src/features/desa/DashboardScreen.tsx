"use client";

import Link from "next/link";
import { partnershipsOf, problemsOf, getUniv } from "@/domain";
import { useDesa } from "@/components/layout/RoleOnly";
import { useDatabaseVersion } from "@/hooks/useDatabase";
import { ApproveButton, RejectButton } from "@/features/partnership/RequestActions";
import { problemTitleOf, progressOf } from "@/features/partnership/utils";
import { RecentNotifications } from "@/features/notifications/RecentNotifications";
import {
  ButtonLink,
  Card,
  CardTitle,
  Countdown,
  EmptyState,
  Icon,
  IconBox,
  PageHeader,
  Photo,
  ProgressBar,
  StatCard,
  StatusTag,
} from "@/components/ui";
import { timeAgo } from "@/lib/format";
import { routes } from "@/lib/routes";

export function DesaDashboardScreen() {
  useDatabaseVersion();
  const me = useDesa();
  const problems = problemsOf(me.id);
  const list = partnershipsOf(me);

  const requests = list.filter((p) => p.status === "requested");
  const running = list.filter((p) => ["connected", "matched"].includes(p.status) && !p.completed);
  const inbox = list.flatMap((ps) => ps.groups.filter((g) => g.status === "submitted").map((group) => ({ ps, group })));
  const finished = list.filter((p) => p.status === "matched").slice(0, 3);
  const activeProblems = problems.filter((p) => ["available", "requested", "connected"].includes(p.status)).length;

  return (
    <>
      <PageHeader
        title="Dashboard Desa"
        subtitle={`Pantau kebutuhan dan kolaborasi ${me.name}`}
        actions={
          <ButtonLink href={routes.desa.newProblem}>
            <Icon name="plus" /> Ajukan kebutuhan
          </ButtonLink>
        }
      />
      <Card variant="soft" padding="tight" className="mb-3 text-xs">
        <Icon name="brand-whatsapp" /> <b>Alur singkat:</b> universitas mengajukan kerja sama, Anda setujui atau tolak
        sekali, kontak terbuka dan diskusi lewat WhatsApp, lalu koordinator mengirim konfirmasi kesepakatan yang tinggal
        Anda tekan &quot;Sesuai&quot;.
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon="file-text" tone="green" value={activeProblems} label="Kebutuhan aktif" />
        <StatCard icon="building-community" tone="blue" value={requests.length} label="Pengajuan masuk" />
        <StatCard icon="heart-handshake" tone="amber" value={running.length} label="Kerja sama berjalan" />
        <StatCard icon="inbox" tone="purple" value={inbox.length} label="Kesepakatan perlu konfirmasi" />
      </div>

      <div className="mt-4 grid items-start gap-4 lg:grid-cols-[3fr_2fr]">
        <div className="flex flex-col gap-3">
          <Card>
            <CardTitle>Pengajuan kerja sama masuk</CardTitle>
            <div className="-mt-2 mb-2 text-[11px] text-muted">
              Setujui atau tolak sekali di level universitas. Kontak terbuka setelah disetujui.
            </div>
            {requests.length ? (
              <div className="flex flex-col gap-2.5">
                {requests.map((r) => (
                  <div key={r.id} className="flex items-center gap-3.5 rounded-xl bg-cream-50 px-3.5 py-3">
                    <IconBox icon="building-community" tone="blue" size="sm" />
                    <Link href={routes.partnership(r.id)} className="min-w-0 flex-1">
                      <div className="font-semibold">{getUniv(r.univId).name}</div>
                      <div className="text-[11px] text-muted">
                        {problemTitleOf(r)} · {r.quota} kelompok · sisa {r.responseEnds && <Countdown end={r.responseEnds} />}
                      </div>
                    </Link>
                    <ApproveButton id={r.id} size="sm" />
                    <RejectButton id={r.id} size="sm" />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon="inbox">Tidak ada pengajuan yang menunggu keputusan.</EmptyState>
            )}
          </Card>

          <Card>
            <CardTitle>Kesepakatan menunggu konfirmasi</CardTitle>
            {inbox.length ? (
              <div className="flex flex-col gap-2.5">
                {inbox.map(({ ps, group }) => (
                  <Link
                    key={group.id}
                    href={routes.partnership(ps.id)}
                    className="flex items-center gap-3.5 rounded-xl border border-transparent bg-cream-50 px-3.5 py-3 hover:border-line hover:bg-white"
                  >
                    <IconBox icon="file-check" tone="blue" size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold">
                        {group.name} · {problemTitleOf(ps)}
                      </div>
                      <div className="text-[11px] text-muted">
                        {getUniv(ps.univId).name} · dikirim {timeAgo(group.submittedAt ?? 0)}
                      </div>
                    </div>
                    <StatusTag status="submitted" />
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState icon="file-check">Tidak ada kesepakatan yang menunggu konfirmasi.</EmptyState>
            )}
          </Card>

          <Card>
            <CardTitle>Kerja sama berjalan</CardTitle>
            {running.length ? (
              <div className="flex flex-col gap-2.5">
                {running.map((r) => (
                  <Link
                    key={r.id}
                    href={routes.partnership(r.id)}
                    className="flex items-center gap-3.5 rounded-xl border border-transparent bg-cream-50 px-3.5 py-3 hover:border-line hover:bg-white"
                  >
                    <Photo seed={r.problemId} className="h-[54px] w-[74px]" />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold">{problemTitleOf(r)}</div>
                      <div className="text-[11px] text-muted">{getUniv(r.univId).name}</div>
                      <ProgressBar value={progressOf(r)} thin className="mt-2" />
                    </div>
                    <div className="text-center">
                      <StatusTag status={r.status} />
                      <div className="mt-1 text-[11px] text-muted">
                        {r.groups.filter((g) => g.status !== "closed").length}/{r.quota} kelompok
                      </div>
                    </div>
                  </Link>
                ))}
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
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-[17px] font-semibold">Riwayat kerja sama</h3>
              <Link href={routes.desa.history} className="text-[11px] font-semibold text-leaf-500">Semua</Link>
            </div>
            <div className="flex flex-col gap-2.5">
              {finished.length ? (
                finished.map((d) => (
                  <Link
                    key={d.id}
                    href={routes.partnership(d.id)}
                    className="flex items-center gap-3.5 rounded-xl border border-transparent bg-cream-50 px-3.5 py-3 hover:border-line hover:bg-white"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold">{problemTitleOf(d)}</div>
                      <div className="text-[11px] text-muted">{getUniv(d.univId).name}</div>
                    </div>
                    <StatusTag status={d.completed ? "done" : "matched"} />
                  </Link>
                ))
              ) : (
                <span className="text-xs text-muted">Belum ada.</span>
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
