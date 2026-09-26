"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LIMITS, partnerships, type Problem } from "@/domain";
import { useUniv } from "@/components/layout/RoleOnly";
import { useAction } from "@/hooks/useAction";
import { Button, Field, Input, Modal, Textarea } from "@/components/ui";
import { routes } from "@/lib/routes";

/** Form pengajuan kerja sama (payung) dari universitas ke desa. */
export function ApplyModal({ problem, open, onClose }: { problem: Problem; open: boolean; onClose: () => void }) {
  const me = useUniv();
  const router = useRouter();
  const run = useAction();
  const [form, setForm] = useState({ quota: "1", period: "", students: "", message: "" });
  const set = (key: keyof typeof form, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const submit = () => {
    const result = run(
      () =>
        partnerships.requestPartnership(problem.id, me.id, {
          quota: form.quota,
          period: form.period,
          students: form.students,
          message: form.message.trim(),
        }),
      "Kerja sama diajukan — menunggu persetujuan desa.",
    );
    if (result.ok) {
      onClose();
      router.push(routes.partnership(result.value.id));
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Ajukan kerja sama"
      actions={
        <>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={submit}>Kirim pengajuan</Button>
        </>
      }
    >
      <p className="text-xs text-muted">
        Untuk <b>{problem.title}</b>. Setelah dikirim, kebutuhan ini <b>terkunci</b> untuk universitas lain sampai desa
        menyetujui atau menolak (kedaluwarsa jika {LIMITS.RESPONSE_DAYS} hari tanpa respons). Setelah disetujui, kontak
        terbuka dan koordinator KKN yang Anda undang berdiskusi dengan desa lewat WhatsApp.
      </p>
      <Field label="Kuota kelompok KKN *" hint="Jumlah kelompok yang akan ditempatkan di desa ini." className="mt-3">
        <Input
          type="number"
          min={1}
          max={LIMITS.MAX_QUOTA}
          value={form.quota}
          onChange={(e) => set("quota", e.target.value)}
          className="max-w-[140px]"
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Perkiraan periode">
          <Input value={form.period} onChange={(e) => set("period", e.target.value)} placeholder="mis. Jul – Agu 2025" />
        </Field>
        <Field label="Perkiraan total mahasiswa">
          <Input type="number" min={1} max={500} value={form.students} onChange={(e) => set("students", e.target.value)} placeholder="mis. 20" />
        </Field>
      </div>
      <div className="-mt-1 mb-3 text-xs text-muted">
        Opsional, cukup perkiraan kasar untuk seluruh kelompok. Detail per kelompok diisi koordinator setelah disetujui.
      </div>
      <Field label="Pesan untuk desa">
        <Textarea
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          placeholder="Ceritakan singkat pengalaman dan alasan tim Anda tertarik..."
        />
      </Field>
    </Modal>
  );
}
