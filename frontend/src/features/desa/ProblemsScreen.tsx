"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  LIMITS,
  STATUS_META,
  activeProblemCount,
  pendingRequestsFor,
  problems as problemService,
  problemsOf,
  type ProblemStatus,
} from "@/domain";
import { useDesa } from "@/components/layout/RoleOnly";
import { useConfirm } from "@/components/providers/ConfirmProvider";
import { useAction } from "@/hooks/useAction";
import { useDatabaseVersion } from "@/hooks/useDatabase";
import { Button, ButtonLink, Card, Chip, ChipRow, EmptyState, Icon, PageHeader, StatusTag, Tag } from "@/components/ui";
import { routes } from "@/lib/routes";

type Filter = "all" | ProblemStatus;
const FILTERS: Filter[] = ["all", "available", "requested", "connected", "matched", "draft", "expired"];

export function DesaProblemsScreen() {
  useDatabaseVersion();
  const me = useDesa();
  const router = useRouter();
  const run = useAction();
  const confirm = useConfirm();
  const [filter, setFilter] = useState<Filter>("all");

  const all = problemsOf(me.id).sort((a, b) => b.createdAt - a.createdAt);
  const list = filter === "all" ? all : all.filter((p) => p.status === filter);

  const remove = async (id: string, title: string) => {
    const ok = await confirm({
      title: "Hapus kebutuhan?",
      message: `"${title}" akan dihapus. Pengajuan yang masuk akan dibatalkan.`,
      confirmLabel: "Hapus",
      danger: true,
    });
    if (ok) run(() => problemService.deleteProblem(id), "Kebutuhan dihapus.");
  };

  return (
    <>
      <PageHeader
        title="Kebutuhan Saya"
        subtitle={`Ajukan beberapa masalah sekaligus, satu kartu per masalah · ${activeProblemCount(me.id)}/${LIMITS.MAX_ACTIVE_PROBLEMS} kebutuhan aktif`}
        actions={
          <ButtonLink href={routes.desa.newProblem}>
            <Icon name="plus" /> Buat kebutuhan baru
          </ButtonLink>
        }
      />
      <ChipRow className="mb-3">
        {FILTERS.map((key) => (
          <Chip
            key={key}
            active={filter === key}
            count={key === "all" ? all.length : all.filter((p) => p.status === key).length}
            onClick={() => setFilter(key)}
          >
            {key === "all" ? "Semua" : STATUS_META[key].label}
          </Chip>
        ))}
      </ChipRow>

      <Card padding="none">
        {list.length ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-left text-eyebrow text-muted">
                  <th className="px-4 py-3">Kebutuhan</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Kompetensi</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {list.map((p) => {
                  const pending = pendingRequestsFor(p.id).length;
                  const editable = ["draft", "available", "expired"].includes(p.status);
                  return (
                    <tr
                      key={p.id}
                      className="cursor-pointer border-t border-line hover:bg-cream-50"
                      onClick={() => router.push(routes.desa.problem(p.id))}
                    >
                      <td className="px-4 py-3.5">
                        <b>{p.title}</b>
                        <div className="text-[11px] text-muted">
                          <Icon name="map-pin" /> {p.city}
                          {pending > 0 && <span className="font-semibold text-lake-700"> · {pending} pengajuan</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3.5"><Tag tone="blue">{p.category}</Tag></td>
                      <td className="px-4 py-3.5 text-xs text-muted">
                        {p.skills.slice(0, 3).join(", ")}
                        {p.skills.length > 3 ? ` +${p.skills.length - 3}` : ""}
                      </td>
                      <td className="px-4 py-3.5"><StatusTag status={p.status} /></td>
                      <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                        {editable && (
                          <div className="flex justify-end gap-2">
                            <ButtonLink href={routes.desa.editProblem(p.id)} size="sm" variant="outline">
                              <Icon name="edit" />
                            </ButtonLink>
                            <Button size="sm" variant="danger" onClick={() => remove(p.id, p.title)}>
                              <Icon name="trash" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon="file-text"
            action={<ButtonLink href={routes.desa.newProblem} size="sm">Buat kebutuhan</ButtonLink>}
          >
            Belum ada kebutuhan pada filter ini.
          </EmptyState>
        )}
      </Card>
    </>
  );
}
