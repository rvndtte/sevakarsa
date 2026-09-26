"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CLOSED_STATUSES, getProblem, otherParty, partnershipsOf, usedSlots, type Partnership } from "@/domain";
import { useUser } from "@/components/layout/RoleOnly";
import { useDatabaseVersion } from "@/hooks/useDatabase";
import {
  Button,
  ButtonLink,
  Card,
  Chip,
  ChipRow,
  Countdown,
  EmptyState,
  Icon,
  PageHeader,
  Photo,
  ProgressBar,
  StatusTag,
  Tag,
} from "@/components/ui";
import { formatDate } from "@/lib/format";
import { routes } from "@/lib/routes";
import { ProfileModal } from "./PartyCard";
import { ApproveButton, RejectButton } from "./RequestActions";
import { deadlineOf, progressOf } from "./utils";

type Filter = "all" | "active" | "matched" | "closed";

const FILTERS: Record<Filter, (p: Partnership) => boolean> = {
  all: () => true,
  active: (p) => ["requested", "connected"].includes(p.status),
  matched: (p) => p.status === "matched",
  closed: (p) => CLOSED_STATUSES.includes(p.status),
};

const FILTER_LABELS: [Filter, string][] = [
  ["all", "Semua"],
  ["active", "Berjalan"],
  ["matched", "Aktif"],
  ["closed", "Berakhir"],
];

function Row({ ps, onViewProfile }: { ps: Partnership; onViewProfile: (id: string) => void }) {
  const me = useUser();
  const router = useRouter();
  const problem = getProblem(ps.problemId);
  const other = otherParty(ps, me);
  const deadline = deadlineOf(ps);
  const waiting = ps.groups.filter((g) => g.status === "submitted").length;
  const isDesa = me.role === "desa";
  const univProfile = other.role === "univ" ? other.profile : null;

  return (
    <Card padding="tight" interactive onClick={() => router.push(routes.partnership(ps.id))}>
      <div className="flex items-start gap-3.5">
        <Photo seed={problem?.id ?? ps.id} className="h-20 w-[110px]" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <b className="text-[15px]">{problem?.title}</b>
            <StatusTag status={ps.completed ? "done" : ps.status} />
            {waiting > 0 && isDesa && <Tag tone="blue">{waiting} kesepakatan menunggu Anda</Tag>}
          </div>
          <div className="mt-1 text-xs text-muted">
            <Icon name="building-community" /> {other.name} · <Icon name="map-pin" /> {problem?.city} ·{" "}
            {usedSlots(ps)}/{ps.quota} kelompok
          </div>
          <div className="mt-2 flex items-center gap-2.5">
            <ProgressBar value={progressOf(ps)} thin className="max-w-[180px] flex-1" />
            {deadline ? (
              <span className="text-[11px] text-muted">
                <Icon name="clock" /> <Countdown end={deadline.end} />
              </span>
            ) : (
              <span className="text-[11px] text-muted">Diajukan {formatDate(ps.createdAt)}</span>
            )}
          </div>
          {isDesa && univProfile && (
            <div className="mt-2 border-t border-dashed border-line pt-2 text-xs">
              <div className="text-eyebrow text-muted">Deskripsi universitas</div>
              <div className="line-clamp-2 text-muted">{univProfile.about || "Belum ada deskripsi."}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {univProfile.fields.slice(0, 4).map((f) => (
                  <Tag key={f} tone="blue">{f}</Tag>
                ))}
                <Tag tone="gray">{univProfile.history.length} program pernah diambil</Tag>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2" onClick={(e) => e.stopPropagation()}>
          {isDesa && ps.status === "requested" && (
            <>
              <ApproveButton id={ps.id} size="sm" />
              <RejectButton id={ps.id} size="sm" />
            </>
          )}
          {isDesa && (
            <Button size="sm" variant="outline" onClick={() => onViewProfile(other.id)}>
              Profil univ
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

export function PartnershipListScreen() {
  useDatabaseVersion();
  const me = useUser();
  const [filter, setFilter] = useState<Filter>("all");
  const [profileId, setProfileId] = useState<string | null>(null);

  const all = partnershipsOf(me).sort((a, b) => b.createdAt - a.createdAt);
  const list = all.filter(FILTERS[filter]);
  const profileUser = profileId ? (otherPartyById(all, profileId, me) ?? null) : null;

  return (
    <>
      <PageHeader
        title="Kerja Sama"
        subtitle={
          me.role === "desa"
            ? "Pengajuan dan kolaborasi dengan universitas"
            : "Kerja sama yang Anda ajukan dan kelompok KKN-nya"
        }
      />
      <ChipRow className="mb-3">
        {FILTER_LABELS.map(([key, label]) => (
          <Chip key={key} active={filter === key} count={all.filter(FILTERS[key]).length} onClick={() => setFilter(key)}>
            {label}
          </Chip>
        ))}
      </ChipRow>
      <div className="mt-4 flex flex-col gap-2.5">
        {list.length ? (
          list.map((ps) => <Row key={ps.id} ps={ps} onViewProfile={setProfileId} />)
        ) : (
          <Card>
            <EmptyState
              icon="heart-handshake"
              action={
                me.role === "univ" ? (
                  <ButtonLink href={routes.univ.discover} size="sm">
                    Jelajahi desa
                  </ButtonLink>
                ) : undefined
              }
            >
              Belum ada kerja sama.
            </EmptyState>
          </Card>
        )}
      </div>
      <ProfileModal user={profileUser} onClose={() => setProfileId(null)} />
    </>
  );
}

function otherPartyById(list: Partnership[], id: string, me: Parameters<typeof otherParty>[1]) {
  const ps = list.find((p) => (me.role === "desa" ? p.univId : p.desaId) === id);
  return ps ? otherParty(ps, me) : undefined;
}
