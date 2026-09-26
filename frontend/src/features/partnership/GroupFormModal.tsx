"use client";

import { useState } from "react";
import { partnerships, type Group, type GroupInput, type Partnership } from "@/domain";
import { useAction } from "@/hooks/useAction";
import { Button, Field, Input, Modal, Textarea } from "@/components/ui";

interface GroupFormModalProps {
  ps: Partnership;
  coordinatorId: string;
  /** Kelompok yang diubah; kosong berarti membuat kelompok baru. */
  group?: Group | null;
  open: boolean;
  onClose: () => void;
}

const emptyGroup = (ps: Partnership): GroupInput => ({
  name: `Kelompok ${ps.groups.length + 1}`,
  dpl: "",
  students: "",
  start: "",
  end: "",
  program: "",
  note: "",
});

/** Form koordinator untuk mengisi ringkasan hasil diskusi dengan desa. */
export function GroupFormModal({ ps, coordinatorId, group, open, onClose }: GroupFormModalProps) {
  // Modal dipasang ulang (key) tiap dibuka agar isian selalu segar.
  return open ? (
    <FormBody ps={ps} coordinatorId={coordinatorId} group={group} onClose={onClose} />
  ) : null;
}

function FormBody({
  ps,
  coordinatorId,
  group,
  onClose,
}: Omit<GroupFormModalProps, "open">) {
  const run = useAction();
  const [form, setForm] = useState<GroupInput>(() => (group ? { ...group } : emptyGroup(ps)));
  const set = <K extends keyof GroupInput>(key: K, value: GroupInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const save = () => {
    const result = run(
      () => partnerships.saveGroup(ps.id, coordinatorId, form, group?.id),
      "Draft kesepakatan disimpan.",
    );
    if (result.ok) onClose();
  };

  return (
    <Modal
      open
      wide
      onClose={onClose}
      title={group ? "Ubah kesepakatan" : "Kelompok baru"}
      actions={
        <>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={save}>Simpan draft</Button>
        </>
      }
    >
      <p className="text-xs text-muted">
        Isi ringkasan hasil diskusi dengan desa. Tidak perlu menulis ulang isi percakapan.
      </p>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <Field label="Nama kelompok *">
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
        </Field>
        <Field label="Dosen pembimbing (DPL) *">
          <Input value={form.dpl} onChange={(e) => set("dpl", e.target.value)} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Jumlah mahasiswa *">
          <Input type="number" min={1} max={200} value={form.students} onChange={(e) => set("students", e.target.value)} />
        </Field>
        <Field label="Mulai *">
          <Input type="date" value={form.start} onChange={(e) => set("start", e.target.value)} />
        </Field>
        <Field label="Selesai *">
          <Input type="date" value={form.end} onChange={(e) => set("end", e.target.value)} />
        </Field>
      </div>
      <Field label="Program utama *">
        <Input
          value={form.program}
          onChange={(e) => set("program", e.target.value)}
          placeholder="mis. toko online 10 UMKM dan pelatihan pemasaran digital"
        />
      </Field>
      <Field label="Catatan (opsional)">
        <Textarea
          value={form.note}
          onChange={(e) => set("note", e.target.value)}
          placeholder="mis. akomodasi di balai desa, pelatihan hari Sabtu"
        />
      </Field>
    </Modal>
  );
}
