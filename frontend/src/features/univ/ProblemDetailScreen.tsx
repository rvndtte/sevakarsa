"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { activePartnership, auth, getDesa, getProblem, isLocked, lastPartnership } from "@/domain";
import { useUniv } from "@/components/layout/RoleOnly";
import { useAction } from "@/hooks/useAction";
import { useDatabaseVersion } from "@/hooks/useDatabase";
import { ProfileModal } from "@/features/partnership/PartyCard";
import { ProblemBody, ProblemSide } from "@/features/problem/ProblemParts";
import { Avatar, Button, ButtonLink, Card, CardTitle, EmptyState, Icon, PageHeader, StatusTag } from "@/components/ui";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import { ApplyModal } from "./ApplyModal";

export function UnivProblemDetailScreen() {
  useDatabaseVersion();
  const me = useUniv();
  const run = useAction();
  const { id } = useParams<{ id: string }>();
  const [applying, setApplying] = useState(false);
  const [showDesa, setShowDesa] = useState(false);
  const problem = getProblem(id);

  if (!problem || problem.status === "draft") {
    return (
      <>
        <PageHeader title="Tidak ditemukan" />
        <Card>
          <EmptyState icon="mood-empty" action={<ButtonLink href={routes.univ.discover} size="sm">Kembali</ButtonLink>}>
            Kebutuhan tidak ditemukan.
          </EmptyState>
        </Card>
      </>
    );
  }

  const mine = activePartnership(id, me.id);
  const last = lastPartnership(id, me.id);
  const desa = getDesa(problem.desaId);
  const saved = me.saved.includes(id);
  const locked = isLocked(problem) && !mine;
  const toggleSave = () => run(() => auth.toggleSaved(me.id, id), saved ? "Dihapus dari simpanan." : "Disimpan ke daftar Anda.");

  return (
    <>
      <PageHeader
        back="Kembali"
        title={problem.title}
        subtitle={
          <>
            <Icon name="map-pin" /> {desa.name} · {problem.city}
          </>
        }
        actions={!locked && <StatusTag status={problem.status} large />}
      />

      {locked && (
        <Card variant="muted" padding="tight" className="mb-3">
          <Icon name="lock" />{" "}
          <b>
            {problem.status === "requested"
              ? "Kebutuhan ini sedang diajukan universitas lain."
              : "Kebutuhan ini sedang berjalan bersama universitas lain."}
          </b>{" "}
          <span className="text-xs text-muted">
            Akan terbuka kembali jika kerja samanya ditolak, dibatalkan, atau kedaluwarsa.
          </span>
        </Card>
      )}

      <Card className="mb-3 flex flex-wrap items-center gap-3.5">
        <div className="min-w-0 flex-1">
          <div className="font-semibold">
            {locked ? "Tidak dapat diajukan saat ini" : mine ? "Anda sudah terlibat di kebutuhan ini" : "Tertarik membantu desa ini?"}
          </div>
          <div className="text-xs text-muted">
            {locked
              ? "Anda tetap bisa membaca detailnya."
              : "Ajukan sekali di level universitas dengan kuota kelompok. Setelah desa menyetujui, kontak terbuka dan koordinator KKN Anda berdiskusi dengan desa lewat WhatsApp."}
          </div>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {mine ? (
            <ButtonLink href={routes.partnership(mine.id)}>
              Buka kerja sama <Icon name="arrow-right" />
            </ButtonLink>
          ) : problem.status === "available" ? (
            <Button onClick={() => setApplying(true)}>
              Ajukan kerja sama <Icon name="arrow-right" />
            </Button>
          ) : (
            <Button disabled>
              <Icon name="lock" /> Terkunci
            </Button>
          )}
          {!locked && (
            <Button variant="outline" onClick={toggleSave}>
              <Icon name={saved ? "bookmark-filled" : "bookmark"} /> {saved ? "Tersimpan" : "Simpan"}
            </Button>
          )}
        </div>
      </Card>

      {last && !mine && ["rejected", "expired", "declined"].includes(last.status) && (
        <Card variant="warn" padding="tight" className="mb-3 text-xs">
          <Icon name="info-circle" /> Pengajuan Anda sebelumnya: <StatusTag status={last.status} /> — Anda dapat
          mengajukan lagi jika kebutuhan Available.
        </Card>
      )}

      <div className={cn("grid items-start gap-4 lg:grid-cols-[3fr_2fr]", locked && "opacity-60 grayscale")}>
        <ProblemBody problem={problem} />
        <div className="flex flex-col gap-3">
          <ProblemSide problem={problem} />
          <Card>
            <CardTitle>Tentang desa</CardTitle>
            <div className="flex items-center gap-2.5">
              <Avatar name={desa.name} />
              <div>
                <div className="font-semibold">{desa.name}</div>
                <div className="text-[11px] text-muted">{desa.profile.city}</div>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted">{desa.profile.about}</p>
            <Button size="sm" variant="outline" className="mt-3" onClick={() => setShowDesa(true)}>
              Lihat profil desa
            </Button>
          </Card>
        </div>
      </div>

      <ApplyModal key={String(applying)} problem={problem} open={applying} onClose={() => setApplying(false)} />
      <ProfileModal user={showDesa ? desa : null} onClose={() => setShowDesa(false)} />
    </>
  );
}
