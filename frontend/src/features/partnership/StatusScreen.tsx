"use client";

import { useState } from "react";
import { CLOSED_STATUSES, LIVE_STATUSES, getProblem, getUser, otherParty, partnershipsOf, type Partnership } from "@/domain";
import { useUser } from "@/components/layout/RoleOnly";
import { useDatabaseVersion } from "@/hooks/useDatabase";
import { ButtonLink, Card, CardTitle, Countdown, EmptyState, Icon, PageHeader, Select, StatusTag, Timeline } from "@/components/ui";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import { routes } from "@/lib/routes";
import { deadlineOf } from "./utils";

const CURRENT_NODE: Record<Partnership["status"], number> = {
  requested: 1,
  declined: 1,
  rejected: 1,
  expired: 1,
  connected: 2,
  matched: 3,
};

/** Jalur empat titik (Available → Diajukan → Disetujui → Aktif) pada panel gelap. */
function StatusTrack({ ps }: { ps: Partnership }) {
  const problem = getProblem(ps.problemId);
  const current = CURRENT_NODE[ps.status];
  const stopped = CLOSED_STATUSES.includes(ps.status);
  const matched = ps.status === "matched";
  const nodes: [string, string, number | undefined][] = [
    ["Available", "circle-dot", problem?.createdAt],
    ["Diajukan", "send", ps.createdAt],
    ["Disetujui", "lock-open", ps.approvedAt],
    ["Aktif", "circle-check", ps.activeAt],
  ];
  const fill = (Math.min(3, matched ? 3 : current) / 3) * 75;

  return (
    <div className="relative mt-[26px] mb-2 grid grid-cols-4">
      <div className="absolute top-[21px] right-[12.5%] left-[12.5%] h-1 rounded bg-forest-600" />
      <div className="absolute top-[21px] left-[12.5%] h-1 rounded bg-lime" style={{ width: `${fill}%` }} />
      {nodes.map(([label, icon, ts], i) => {
        const ok = i < current || matched;
        const now = (i === current && !stopped && !matched) || (matched && i === 3);
        return (
          <div key={label} className="relative z-1 text-center">
            <div
              className={cn(
                "mx-auto flex items-center justify-center rounded-full text-[22px]",
                now ? "-mt-1 size-[54px] outline-[7px] outline-lime/25" : "size-[46px]",
                ok || now ? "bg-lime text-forest-950" : "bg-forest-600 text-[#9fb2a6]",
              )}
            >
              <Icon name={icon} />
            </div>
            <b className={cn("mt-2.5 block", now && "text-lime")}>{label}</b>
            <small className="text-[#9fb2a6]">{ts ? formatDate(ts) : "—"}</small>
          </div>
        );
      })}
    </div>
  );
}

function Branch({ on, icon, title, children }: { on: boolean; icon: string; title: string; children: string }) {
  return (
    <div className={cn("min-w-[220px] flex-1 rounded-[14px] bg-forest-800 px-4 py-3.5", on ? "outline-2 outline-lime" : "opacity-55")}>
      <div className="flex items-center gap-2.5 font-semibold">
        <Icon name={icon} /> {title}
      </div>
      <div className="text-xs text-[#b8c8bd]">{children}</div>
    </div>
  );
}

export function StatusScreen() {
  useDatabaseVersion();
  const me = useUser();
  const all = partnershipsOf(me).sort((a, b) => b.createdAt - a.createdAt);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!all.length) {
    return (
      <>
        <PageHeader title="Status kerja sama" subtitle="Pantau posisi proses Anda" />
        <Card>
          <EmptyState
            icon="timeline-event"
            action={me.role === "univ" ? <ButtonLink href={routes.univ.discover} size="sm">Jelajahi desa</ButtonLink> : undefined}
          >
            Belum ada kerja sama.
          </EmptyState>
        </Card>
      </>
    );
  }

  const sel = all.find((p) => p.id === selectedId) ?? all.find((p) => LIVE_STATUSES.includes(p.status)) ?? all[0];
  const problem = getProblem(sel.problemId);
  const other = otherParty(sel, me);
  const deadline = deadlineOf(sel);
  const confirmed = sel.groups.filter((g) => g.status === "confirmed").length;

  return (
    <>
      <PageHeader title="Status kerja sama" subtitle="Perjalanan kolaborasi dari pengajuan hingga dampak nyata" />
      <div className="mb-3 flex flex-wrap items-center gap-2.5">
        <span className="text-xs text-muted">Pilih kerja sama:</span>
        <Select className="max-w-[380px]" value={sel.id} onChange={(e) => setSelectedId(e.target.value)}>
          {all.map((x) => (
            <option key={x.id} value={x.id}>
              {getProblem(x.problemId)?.title} — {otherParty(x, me).name}
            </option>
          ))}
        </Select>
      </div>

      <div className="rounded-3xl bg-forest-900 p-8 text-ondark">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="font-display text-2xl font-semibold">{problem?.title}</div>
            <div className="text-xs text-[#b8c8bd]">
              {getUser(sel.desaId)?.name} · {getUser(sel.univId)?.name} · {confirmed}/{sel.quota} kelompok sesuai
            </div>
          </div>
          <StatusTag status={sel.completed ? "done" : sel.status} large />
        </div>
        <StatusTrack ps={sel} />
        <div className="mt-[18px] flex flex-wrap gap-3.5">
          <Branch on={sel.status === "rejected"} icon="circle-x" title="Ditolak">
            Desa menolak pengajuan. Kebutuhan terbuka kembali.
          </Branch>
          <Branch on={sel.status === "expired"} icon="hourglass-empty" title="Kedaluwarsa">
            Desa tidak merespons dalam 7 hari. Kebutuhan terbuka kembali.
          </Branch>
        </div>
        {deadline && (
          <div className="mt-4 flex items-center gap-2.5">
            <Icon name="clock" /> {deadline.label}: <b><Countdown end={deadline.end} /></b>
          </div>
        )}
        <div className="mt-4">
          <ButtonLink href={routes.partnership(sel.id)} variant="lime">
            Buka kerja sama <Icon name="arrow-right" />
          </ButtonLink>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Card>
          <CardTitle>Semua status</CardTitle>
          <div className="flex flex-col gap-2.5">
            {all.map((x) => (
              <button
                key={x.id}
                type="button"
                onClick={() => {
                  setSelectedId(x.id);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="flex items-center gap-3.5 rounded-xl border border-transparent bg-cream-50 px-3.5 py-3 text-left hover:border-line hover:bg-white"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{getProblem(x.problemId)?.title}</div>
                  <div className="text-[11px] text-muted">{otherParty(x, me).name}</div>
                </div>
                <StatusTag status={x.completed ? "done" : x.status} />
              </button>
            ))}
          </div>
        </Card>
        <Card>
          <CardTitle>Riwayat: {other.name}</CardTitle>
          <Timeline entries={sel.log} />
        </Card>
      </div>
    </>
  );
}
