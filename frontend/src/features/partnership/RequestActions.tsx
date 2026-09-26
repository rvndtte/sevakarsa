"use client";

import { useRouter } from "next/navigation";
import { useState, type MouseEvent } from "react";
import { partnerships, type Partnership } from "@/domain";
import { useAction } from "@/hooks/useAction";
import { useConfirm } from "@/components/providers/ConfirmProvider";
import { Button, Field, Icon, Modal, Textarea, type ButtonSize } from "@/components/ui";
import { routes } from "@/lib/routes";

interface ActionButtonProps {
  id: string;
  size?: ButtonSize;
}

/** Desa menyetujui pengajuan: kontak kedua pihak terbuka. */
export function ApproveButton({ id, size }: ActionButtonProps) {
  const run = useAction();
  const confirm = useConfirm();
  const onClick = async (e: MouseEvent) => {
    e.stopPropagation();
    const ok = await confirm({
      title: "Setujui kerja sama?",
      message:
        "Kontak kedua pihak akan terbuka dan universitas dapat mengundang koordinator KKN untuk berdiskusi dengan Anda via WhatsApp.",
      confirmLabel: "Setujui",
    });
    if (ok) run(() => partnerships.respondRequest(id, "approve"), "Kerja sama disetujui — kontak kedua pihak terbuka.");
  };
  return (
    <Button size={size} onClick={onClick}>
      <Icon name="check" /> Setujui{size === "sm" ? "" : " kerja sama"}
    </Button>
  );
}

/** Desa menolak pengajuan dengan catatan opsional. */
export function RejectButton({ id, size }: ActionButtonProps) {
  const run = useAction();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const submit = () => {
    const result = run(() => partnerships.respondRequest(id, "reject", note.trim()), "Kerja sama ditolak.");
    if (result.ok) setOpen(false);
  };
  return (
    <>
      <Button
        size={size}
        variant="outline"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
      >
        Tolak
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Tolak kerja sama?"
        actions={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button variant="danger" onClick={submit}>Tolak</Button>
          </>
        }
      >
        <p className="text-xs text-muted">Kebutuhan akan terbuka kembali untuk universitas lain.</p>
        <Field label="Catatan untuk universitas (opsional)" className="mt-3">
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="mis. jadwal belum sesuai" />
        </Field>
      </Modal>
    </>
  );
}

/** Univ membatalkan pengajuan (hanya selagi status Diajukan). */
export function CancelRequestButton({ ps }: { ps: Partnership }) {
  const run = useAction();
  const confirm = useConfirm();
  const router = useRouter();
  const onClick = async () => {
    const ok = await confirm({
      title: "Batalkan pengajuan?",
      message: "Kebutuhan akan terbuka kembali untuk universitas lain.",
      confirmLabel: "Batalkan",
      danger: true,
    });
    if (!ok) return;
    const result = run(() => partnerships.cancelRequest(ps.id), "Pengajuan dibatalkan.");
    if (result.ok) router.push(routes.partnerships);
  };
  return (
    <Button size="sm" variant="danger" onClick={onClick}>
      Batalkan pengajuan
    </Button>
  );
}
