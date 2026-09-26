"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { getPartnership, getProblem, getUniv, problems as problemService, getDb } from "@/domain";
import { useDesa } from "@/components/layout/RoleOnly";
import { useAction } from "@/hooks/useAction";
import { useDatabaseVersion } from "@/hooks/useDatabase";
import { ProblemBody, ProblemSide } from "@/features/problem/ProblemParts";
import { Avatar, Button, ButtonLink, Card, CardTitle, EmptyState, Icon, PageHeader, StatusTag } from "@/components/ui";
import { timeAgo } from "@/lib/format";
import { routes } from "@/lib/routes";

export function DesaProblemDetailScreen() {
  useDatabaseVersion();
  const me = useDesa();
  const run = useAction();
  const { id } = useParams<{ id: string }>();
  const problem = getProblem(id);

  if (!problem || problem.desaId !== me.id) {
    return (
      <>
        <PageHeader title="Tidak ditemukan" />
        <Card>
          <EmptyState icon="mood-empty" action={<ButtonLink href={routes.desa.problems} size="sm">Kembali</ButtonLink>}>
            Kebutuhan tidak ditemukan.
          </EmptyState>
        </Card>
      </>
    );
  }

  const active = problem.partnershipId ? getPartnership(problem.partnershipId) : undefined;
  const past = getDb().partnerships.filter(
    (x) => x.problemId === id && ["rejected", "expired", "declined"].includes(x.status),
  );
  const editable = ["draft", "available", "expired"].includes(problem.status);

  return (
    <>
      <PageHeader
        back="Kembali"
        title={problem.title}
        subtitle={`${problem.city} · ${problem.category}`}
        actions={
          <>
            <StatusTag status={problem.status} large />
            {editable && (
              <ButtonLink href={routes.desa.editProblem(problem.id)} variant="outline">
                <Icon name="edit" /> Ubah
              </ButtonLink>
            )}
            {problem.status === "expired" && (
              <Button onClick={() => run(() => problemService.republishProblem(problem.id), "Kebutuhan dipublikasikan ulang.")}>
                <Icon name="refresh" /> Publikasikan ulang
              </Button>
            )}
            {problem.status === "draft" && (
              <ButtonLink href={routes.desa.editProblem(problem.id)}>Lanjutkan & publikasikan</ButtonLink>
            )}
          </>
        }
      />
      <div className="grid items-start gap-4 lg:grid-cols-[3fr_2fr]">
        <div className="flex flex-col gap-3">
          <ProblemBody problem={problem} />
          {problem.status === "available" && (
            <Card>
              <EmptyState icon="inbox">
                Belum ada universitas yang mengajukan kerja sama. Saat ada pengajuan, Anda cukup menyetujui atau
                menolaknya, lalu berdiskusi dengan koordinator lewat WhatsApp.
              </EmptyState>
            </Card>
          )}
          {active && (
            <Card variant="soft">
              <CardTitle>Kerja sama berjalan</CardTitle>
              <div className="flex items-center gap-3">
                <Avatar name={getUniv(active.univId).name} variant="univ" />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{getUniv(active.univId).name}</div>
                  <StatusTag status={active.status} />
                </div>
                <ButtonLink href={routes.partnership(active.id)} size="sm">
                  Buka kerja sama <Icon name="arrow-right" />
                </ButtonLink>
              </div>
            </Card>
          )}
          {past.length > 0 && (
            <Card>
              <CardTitle>Riwayat pengajuan</CardTitle>
              <div className="flex flex-col gap-2.5">
                {past.map((x) => (
                  <Link
                    key={x.id}
                    href={routes.partnership(x.id)}
                    className="flex items-center gap-3.5 rounded-xl border border-transparent bg-cream-50 px-3.5 py-3 hover:border-line hover:bg-white"
                  >
                    <div className="min-w-0 flex-1">
                      <b>{getUniv(x.univId).name}</b>
                      <div className="text-[11px] text-muted">{timeAgo(x.createdAt)}</div>
                    </div>
                    <StatusTag status={x.status} />
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <ProblemSide problem={problem} />
        </div>
      </div>
    </>
  );
}
