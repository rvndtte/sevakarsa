"use client";

import Link from "next/link";
import { useState } from "react";
import { OPEN_STATUSES, LIVE_STATUSES, partnerships, usedSlots, type Partnership, type User } from "@/domain";
import { useAction } from "@/hooks/useAction";
import { useConfirm } from "@/components/providers/ConfirmProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { Avatar, Button, Card, CardTitle, Field, Icon, Input, Modal, Tag } from "@/components/ui";
import { routes } from "@/lib/routes";
import { openingMessage } from "@/lib/whatsapp";
import { WhatsAppButton } from "./Contact";

/** Tautan pribadi koordinator (dibuka tanpa login). */
const coordinatorUrl = (token: string) => `${window.location.origin}${routes.coordinator(token)}`;

function InviteModal({ psId, open, onClose }: { psId: string; open: boolean; onClose: () => void }) {
  const run = useAction();
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const set = (key: keyof typeof form, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const submit = () => {
    const result = run(
      () => partnerships.inviteCoordinator(psId, form),
      "Undangan dibuat. Salin tautannya untuk dikirim ke koordinator (demo: email tidak benar-benar terkirim).",
    );
    if (result.ok) {
      setForm({ name: "", phone: "", email: "" });
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Undang koordinator KKN"
      actions={
        <>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={submit}>Buat undangan</Button>
        </>
      }
    >
      <p className="text-xs text-muted">
        Koordinator akan mendapat tautan pribadi untuk berdiskusi dengan desa dan mengisi konfirmasi
        kesepakatan per kelompok.
      </p>
      <Field label="Nama koordinator *" className="mt-3">
        <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="mis. Bu Dewi Lestari" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nomor WhatsApp *">
          <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="08xx-xxxx-xxxx" />
        </Field>
        <Field label="Email">
          <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="opsional" />
        </Field>
      </div>
    </Modal>
  );
}

/** Daftar koordinator KKN; univ dapat mengundang, desa melihat kontak setelah disetujui. */
export function CoordinatorCard({ ps, me }: { ps: Partnership; me: User }) {
  const run = useAction();
  const toast = useToast();
  const confirm = useConfirm();
  const [inviting, setInviting] = useState(false);
  const [linkFor, setLinkFor] = useState<string | null>(null);

  const isUniv = me.role === "univ";
  const open = OPEN_STATUSES.includes(ps.status);
  const hidden = !isUniv && !open && ps.coordinators.length > 0;

  const copyLink = async (token: string) => {
    const link = coordinatorUrl(token);
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Tautan koordinator disalin.");
    } catch {
      setLinkFor(link); // clipboard tidak tersedia: tampilkan agar bisa disalin manual
    }
  };

  const remove = async (id: string) => {
    const ok = await confirm({
      title: "Hapus koordinator?",
      message: "Tautan undangannya tidak berlaku lagi.",
      confirmLabel: "Hapus",
      danger: true,
    });
    if (ok) run(() => partnerships.removeCoordinator(ps.id, id), "Koordinator dihapus.");
  };

  return (
    <Card>
      <div className="flex items-center justify-between">
        <CardTitle flush>Koordinator KKN</CardTitle>
        <Tag tone="gray">
          {usedSlots(ps)}/{ps.quota} kelompok
        </Tag>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        {hidden ? (
          <span className="text-xs text-muted">
            <Icon name="lock" /> {ps.coordinators.length} koordinator ditunjuk. Kontak terbuka setelah Anda menyetujui.
          </span>
        ) : ps.coordinators.length ? (
          ps.coordinators.map((c) => {
            const groups = ps.groups.filter((g) => g.coordinatorId === c.id).length;
            return (
              <div key={c.id} className="flex items-start gap-3.5 rounded-xl bg-cream-50 px-3.5 py-3">
                <Avatar name={c.name} variant="univ" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold">{c.name}</div>
                  <div className="text-[11px] text-muted">
                    {groups} kelompok{isUniv || open ? ` · ${c.phone}` : ""}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {isUniv ? (
                      <>
                        <Button size="sm" variant="outline" onClick={() => copyLink(c.token)}>
                          <Icon name="link" /> Salin tautan
                        </Button>
                        <Link
                          href={routes.coordinator(c.token)}
                          className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-1.5 text-xs font-semibold hover:bg-cream-100"
                        >
                          <Icon name="external-link" /> Buka
                        </Link>
                        {groups === 0 && (
                          <Button size="sm" variant="danger" onClick={() => remove(c.id)}>
                            <Icon name="trash" />
                          </Button>
                        )}
                      </>
                    ) : (
                      open && <WhatsAppButton phone={c.phone} text={openingMessage(ps, false)} />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <span className="text-xs text-muted">
            Belum ada koordinator.
            {isUniv && " Undang koordinator agar bisa berdiskusi dengan desa dan mengisi kesepakatan tiap kelompok."}
          </span>
        )}
      </div>

      {isUniv && LIVE_STATUSES.includes(ps.status) && (
        <>
          <Button size="sm" block className="mt-3" onClick={() => setInviting(true)}>
            <Icon name="user-plus" /> Undang koordinator KKN
          </Button>
          <div className="mt-2 text-[11px] text-muted">
            Koordinator menerima tautan pribadi, tanpa perlu membuat akun. Satu kerja sama bisa punya beberapa
            koordinator (per fakultas atau klaster).
          </div>
        </>
      )}

      <InviteModal psId={ps.id} open={inviting} onClose={() => setInviting(false)} />
      <Modal
        open={!!linkFor}
        onClose={() => setLinkFor(null)}
        title="Tautan koordinator"
        actions={<Button variant="outline" onClick={() => setLinkFor(null)}>Tutup</Button>}
      >
        <Input readOnly value={linkFor ?? ""} onFocus={(e) => e.currentTarget.select()} />
      </Modal>
    </Card>
  );
}
