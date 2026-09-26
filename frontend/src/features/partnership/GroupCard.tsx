"use client";

import { useState } from "react";
import { LIMITS, partnerships, type Group, type GroupDecision, type Partnership } from "@/domain";
import { useAction } from "@/hooks/useAction";
import { useConfirm } from "@/components/providers/ConfirmProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { Button, Card, Divider, Field, Icon, Label, StatusTag, Textarea } from "@/components/ui";
import { formatDate, timeAgo } from "@/lib/format";
import { openingMessage } from "@/lib/whatsapp";
import { WhatsAppButton } from "./Contact";

export type GroupViewer = "desa" | "univ" | "coord";

interface GroupCardProps {
  ps: Partnership;
  group: Group;
  viewer: GroupViewer;
  /** Hanya dipakai koordinator: buka form ubah kesepakatan. */
  onEdit?: (group: Group) => void;
}

const REVIEW_TEXT: Record<GroupDecision, { title: string; message: string; label: string; done: string }> = {
  confirm: {
    title: "Konfirmasi kesepakatan sesuai?",
    message: "Kelompok ini tercatat sesuai kesepakatan.",
    label: "Sesuai",
    done: "Kesepakatan dikonfirmasi.",
  },
  revision: {
    title: "Minta revisi?",
    message: "Koordinator akan diberi tahu untuk memperbarui kesepakatan.",
    label: "Minta revisi",
    done: "Permintaan revisi dikirim.",
  },
  close: {
    title: "Tutup kelompok ini?",
    message: "Kelompok ditutup dan kuotanya dilepas. Koordinator menerima alasan Anda. Keputusan ini tidak bisa dibatalkan.",
    label: "Tutup kelompok",
    done: "Kelompok ditutup.",
  },
};

/** Kartu satu kelompok KKN beserta aksi sesuai peran pemirsa. */
export function GroupCard({ ps, group, viewer, onEdit }: GroupCardProps) {
  const run = useAction();
  const toast = useToast();
  const confirm = useConfirm();
  const [note, setNote] = useState("");

  const coordinator = ps.coordinators.find((c) => c.id === group.coordinatorId);
  const atLimit = group.revisions >= LIMITS.MAX_REVISIONS;
  const canReview = viewer === "desa" && group.status === "submitted";
  const canEdit = viewer === "coord" && ["draft", "revision"].includes(group.status);

  const review = async (decision: GroupDecision) => {
    if (decision !== "confirm" && !note.trim()) {
      toast.error(
        decision === "close"
          ? "Isi alasan menutup kelompok terlebih dulu."
          : "Isi catatan revisi untuk koordinator terlebih dulu.",
      );
      return;
    }
    const text = REVIEW_TEXT[decision];
    const ok = await confirm({
      title: text.title,
      message: text.message,
      confirmLabel: text.label,
      danger: decision === "close",
    });
    if (!ok) return;
    const result = run(() => partnerships.reviewGroup(ps.id, group.id, decision, note.trim()), text.done);
    if (result.ok) setNote("");
  };

  const send = async () => {
    if (!run(() => partnerships.validateGroup(ps.id, group.id)).ok) return;
    const ok = await confirm({
      title: "Kirim kesepakatan ke desa?",
      message: "Setelah dikirim, kesepakatan tidak bisa diubah kecuali desa meminta revisi.",
      confirmLabel: "Kirim",
    });
    if (ok) run(() => partnerships.submitGroup(ps.id, group.id), "Konfirmasi kesepakatan terkirim ke desa.");
  };

  const remove = async () => {
    const ok = await confirm({
      title: "Hapus draft kelompok?",
      message: "Draft ini akan dihapus.",
      confirmLabel: "Hapus",
      danger: true,
    });
    if (ok) run(() => partnerships.deleteGroup(ps.id, group.id), "Draft dihapus.");
  };

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="font-display text-lg font-semibold">{group.name}</div>
          <div className="text-[11px] text-muted">
            Koordinator: {coordinator?.name ?? "-"}
            {group.submittedAt ? ` · dikirim ${timeAgo(group.submittedAt)}` : ""}
          </div>
        </div>
        <StatusTag status={group.status} large />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div><Label>Dosen pembimbing</Label><b>{group.dpl || "-"}</b></div>
        <div><Label>Jumlah mahasiswa</Label><b>{group.students ? `${group.students} orang` : "-"}</b></div>
        <div>
          <Label>Periode</Label>
          <b>
            {group.start ? formatDate(group.start) : "-"} – {group.end ? formatDate(group.end) : "-"}
          </b>
        </div>
      </div>
      <Label className="mt-4">Program utama</Label>
      <p>{group.program || "-"}</p>
      {group.note && (
        <>
          <Label className="mt-4">Catatan koordinator</Label>
          <p>{group.note}</p>
        </>
      )}

      {group.revisions > 0 && (
        <div className="mt-3 text-[11px] text-muted">
          <Icon name="refresh" /> Revisi {group.revisions} dari {LIMITS.MAX_REVISIONS}
        </div>
      )}
      {group.status === "revision" && group.reviewNote && (
        <Card variant="warn" padding="tight" className="mt-3">
          <Label>Catatan revisi dari desa</Label>
          {group.reviewNote}
        </Card>
      )}
      {group.status === "closed" && group.reviewNote && (
        <Card variant="muted" padding="tight" className="mt-3">
          <Label>Alasan desa menutup kelompok</Label>
          {group.reviewNote}
        </Card>
      )}

      {canReview && (
        <>
          <Divider />
          {atLimit && (
            <Card variant="warn" padding="tight" className="mb-3">
              <Icon name="brand-whatsapp" /> <b>Batas revisi ({LIMITS.MAX_REVISIONS}x) tercapai.</b>{" "}
              <span className="text-xs">
                Diskusikan langsung dengan koordinator lewat WhatsApp, lalu pilih <b>Sesuai</b> atau tutup
                kelompok ini dengan alasan.
              </span>
              {coordinator && (
                <div className="mt-2">
                  <WhatsAppButton phone={coordinator.phone} text={openingMessage(ps, false)} />
                </div>
              )}
            </Card>
          )}
          <Field label={atLimit ? "Alasan (wajib jika menutup kelompok)" : "Catatan (wajib jika meminta revisi)"}>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                atLimit
                  ? "mis. jadwal dan formasi tidak bisa disepakati"
                  : "Bagian mana yang belum sesuai? Detailnya bisa dibahas via WhatsApp."
              }
            />
          </Field>
          <div className="flex flex-wrap gap-2.5">
            <Button onClick={() => review("confirm")}>
              <Icon name="check" /> Sesuai
            </Button>
            {atLimit ? (
              <Button variant="danger" onClick={() => review("close")}>
                Tutup kelompok
              </Button>
            ) : (
              <Button variant="outline" onClick={() => review("revision")}>
                Perlu revisi ({group.revisions + 1}/{LIMITS.MAX_REVISIONS})
              </Button>
            )}
          </div>
        </>
      )}

      {canEdit && onEdit && (
        <div className="mt-4 flex flex-wrap gap-2.5">
          <Button variant="outline" onClick={() => onEdit(group)}>
            <Icon name="edit" /> Ubah
          </Button>
          <Button onClick={send}>
            Kirim ke desa <Icon name="send" />
          </Button>
          {group.status === "draft" && (
            <Button variant="danger" onClick={remove}>
              <Icon name="trash" />
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
