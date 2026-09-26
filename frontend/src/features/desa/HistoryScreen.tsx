"use client";

import { useState } from "react";
import { getProblem, getUniv, partnershipsOf, type Partnership } from "@/domain";
import { useDesa } from "@/components/layout/RoleOnly";
import { useDatabaseVersion } from "@/hooks/useDatabase";
import { ButtonLink, Card, Chip, ChipRow, EmptyState, IconBox, Label, PageHeader, StatusTag, Tag, Timeline } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { routes } from "@/lib/routes";

type Filter = "all" | "done" | "run" | "closed";

const FILTERS: Record<Filter, (p: Partnership) => boolean> = {
  all: () => true,
  done: (p) => !!p.completed,
  run: (p) => p.status === "connected" || (p.status === "matched" && !p.completed),
  closed: (p) => ["rejected", "expired"].includes(p.status),
};

const LABELS: [Filter, string][] = [
  ["all", "Semua"],
  ["done", "Selesai"],
  ["run", "Berjalan"],
  ["closed", "Berakhir"],
];

function HistoryCard({ ps }: { ps: Partnership }) {
  const problem = getProblem(ps.problemId);
  const univ = getUniv(ps.univId);
  const confirmed = ps.groups.filter((g) => g.status === "confirmed");
  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="font-display text-lg font-semibold">{problem?.title}</div>
          <div className="text-xs text-muted">{univ.name} · {formatDate(ps.createdAt)}</div>
        </div>
        <StatusTag status={ps.completed ? "done" : ps.status} large />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div>
          <Label>Kesepakatan & hasil</Label>
          {confirmed.length ? (
            confirmed.map((g) => (
              <div key={g.id} className="mt-2 flex items-center gap-3 rounded-xl bg-cream-50 px-3 py-2">
                <IconBox icon="file-check" tone="blue" size="sm" />
                <div>
                  <div className="text-xs font-semibold">{g.name}</div>
                  <div className="text-[11px] text-muted">{g.students} mahasiswa · {g.program}</div>
                </div>
              </div>
            ))
          ) : (
            <span className="text-xs text-muted">—</span>
          )}
          {ps.coordinators.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {ps.coordinators.map((c) => (
                <Tag key={c.id} tone="blue">Koord. {c.name}</Tag>
              ))}
            </div>
          )}
        </div>
        <div>
          <Label>Dokumen & laporan</Label>
          <div className="mt-2 flex flex-col gap-2">
            {ps.docs.length ? (
              ps.docs.map((d) => (
                <div key={d.id} className="flex items-center gap-3 rounded-xl bg-cream-50 px-3 py-2">
                  <IconBox icon={d.kind === "photo" ? "photo" : "file-text"} size="sm" />
                  <span className="text-xs font-semibold">{d.name}</span>
                </div>
              ))
            ) : (
              <span className="text-xs text-muted">Belum ada dokumen.</span>
            )}
          </div>
        </div>
        <div>
          <Label>Riwayat proses</Label>
          <Timeline entries={ps.log} />
        </div>
      </div>
      <div className="mt-3">
        <ButtonLink href={routes.partnership(ps.id)} size="sm" variant="outline">Buka kerja sama</ButtonLink>
      </div>
    </Card>
  );
}

export function DesaHistoryScreen() {
  useDatabaseVersion();
  const me = useDesa();
  const [filter, setFilter] = useState<Filter>("all");
  const all = partnershipsOf(me)
    .filter((p) => !["requested", "declined"].includes(p.status))
    .sort((a, b) => b.createdAt - a.createdAt);
  const list = all.filter(FILTERS[filter]);

  return (
    <>
      <PageHeader
        title="Riwayat & Dokumentasi"
        subtitle="Arsip kolaborasi desa dengan universitas: kesepakatan, hasil kegiatan, laporan, dan dokumentasi"
      />
      <ChipRow className="mb-3">
        {LABELS.map(([key, label]) => (
          <Chip key={key} active={filter === key} count={all.filter(FILTERS[key]).length} onClick={() => setFilter(key)}>
            {label}
          </Chip>
        ))}
      </ChipRow>
      <div className="mt-4 flex flex-col gap-3">
        {list.length ? (
          list.map((ps) => <HistoryCard key={ps.id} ps={ps} />)
        ) : (
          <Card>
            <EmptyState icon="history">Belum ada riwayat kerja sama.</EmptyState>
          </Card>
        )}
      </div>
    </>
  );
}
