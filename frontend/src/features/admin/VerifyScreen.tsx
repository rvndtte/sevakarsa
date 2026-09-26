"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { auth, getDb, type User, type VerificationStatus } from "@/domain";
import { useAction } from "@/hooks/useAction";
import { useDatabaseVersion } from "@/hooks/useDatabase";
import { Avatar, Button, Card, CardTitle, Chip, ChipRow, Divider, EmptyState, Field, Icon, IconBox, Label, Modal, PageHeader, StatusTag, Textarea, Timeline } from "@/components/ui";
import { formatDateTime, timeAgo } from "@/lib/format";
import { cn } from "@/lib/cn";

const TABS: [VerificationStatus, string][] = [
  ["pending", "Menunggu"],
  ["approved", "Disetujui"],
  ["rejected", "Ditolak"],
];

function Detail({ user }: { user: Exclude<User, { role: "admin" }> }) {
  const run = useAction();
  const [note, setNote] = useState("");
  const [doc, setDoc] = useState<string | null>(null);

  const decide = (decision: "approve" | "reject") => {
    if (decision === "reject" && !note.trim()) {
      run(() => auth.verifyAccount(user.id, "reject", "")); // memunculkan pesan kesalahan domain
      return;
    }
    const result = run(
      () => auth.verifyAccount(user.id, decision, note.trim()),
      decision === "approve" ? "Akun disetujui — pengguna kini bisa masuk." : "Akun ditolak.",
    );
    if (result.ok) setNote("");
  };

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Avatar name={user.name} variant={user.role === "univ" ? "univ" : "desa"} />
          <div>
            <div className="font-display text-xl font-semibold">{user.name}</div>
            <div className="text-xs text-muted">{user.role === "desa" ? "Desa" : "Universitas"} · {user.profile.city}</div>
          </div>
        </div>
        <StatusTag status={user.verified} large />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div><Label>Email</Label><b>{user.email}</b></div>
        <div><Label>Kontak</Label><b>{user.profile.contactName || "-"} · {user.profile.phone || "-"}</b></div>
        <div><Label>Lokasi</Label><b>{user.profile.city}, {user.profile.province}</b></div>
        <div><Label>Terdaftar</Label><b>{formatDateTime(user.createdAt)}</b></div>
      </div>
      <Divider className="my-4" />
      <CardTitle>Dokumen pendukung</CardTitle>
      <div className="flex flex-col gap-2.5">
        {user.docs.length ? (
          user.docs.map((d) => (
            <div key={d} className="flex items-center gap-3.5 rounded-xl bg-cream-50 px-3.5 py-3">
              <IconBox icon={/jpg|png/i.test(d) ? "photo" : "file-text"} size="sm" />
              <div className="flex-1 text-xs font-semibold">{d}</div>
              <Button size="sm" variant="outline" onClick={() => setDoc(d)}>Lihat</Button>
            </div>
          ))
        ) : (
          <span className="text-xs text-muted">Tidak ada dokumen.</span>
        )}
      </div>
      <Divider className="my-4" />
      <CardTitle>Riwayat verifikasi</CardTitle>
      <Timeline entries={user.vlog} />
      {user.verified === "pending" && (
        <>
          <Divider className="my-4" />
          <Field label="Catatan (wajib jika menolak)">
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Alasan penolakan atau catatan verifikasi" />
          </Field>
          <div className="flex flex-wrap gap-2.5">
            <Button onClick={() => decide("approve")}><Icon name="check" /> Setujui akun</Button>
            <Button variant="danger" onClick={() => decide("reject")}><Icon name="x" /> Tolak</Button>
          </div>
        </>
      )}
      <Modal open={!!doc} onClose={() => setDoc(null)} title={doc} actions={<Button variant="outline" onClick={() => setDoc(null)}>Tutup</Button>}>
        <div className="flex h-[220px] flex-col items-center justify-center gap-2 rounded-[14px] bg-cream-100 text-muted">
          <Icon name="file-text" />
          <span className="text-xs">Pratinjau dokumen (demo — berkas tidak diunggah ke server)</span>
        </div>
      </Modal>
    </Card>
  );
}

/** Dibungkus <Suspense> oleh page karena memakai searchParams (?u=<id akun>). */
export function VerifyScreen() {
  useDatabaseVersion();
  const preselected = useSearchParams().get("u");
  const accounts = getDb().users.filter((u): u is Exclude<User, { role: "admin" }> => u.role !== "admin");
  const initialTab = accounts.find((u) => u.id === preselected)?.verified ?? "pending";
  const [tab, setTab] = useState<VerificationStatus>(initialTab);
  const [selectedId, setSelectedId] = useState<string | null>(preselected);

  const list = accounts.filter((u) => u.verified === tab).sort((a, b) => b.createdAt - a.createdAt);
  const selected = list.find((u) => u.id === selectedId) ?? list[0];

  return (
    <>
      <PageHeader title="Verifikasi akun" subtitle="Periksa data dan dokumen sebelum akun desa atau universitas aktif" />
      <ChipRow className="mb-3">
        {TABS.map(([key, label]) => (
          <Chip
            key={key}
            active={tab === key}
            count={accounts.filter((u) => u.verified === key).length}
            onClick={() => {
              setTab(key);
              setSelectedId(null);
            }}
          >
            {label}
          </Chip>
        ))}
      </ChipRow>
      <div className="grid items-start gap-4 lg:grid-cols-[1fr_2fr]">
        <Card>
          <CardTitle>Antrean</CardTitle>
          <div className="flex flex-col gap-2.5">
            {list.length ? (
              list.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setSelectedId(u.id)}
                  className={cn(
                    "flex items-center gap-3.5 rounded-xl border px-3.5 py-3 text-left",
                    selected?.id === u.id ? "border-leaf-500 bg-[#f1f6ec]" : "border-transparent bg-cream-50 hover:border-line hover:bg-white",
                  )}
                >
                  <Icon name={u.role === "desa" ? "home-heart" : "building-community"} className="text-muted" />
                  <div className="flex-1">
                    <div className="text-xs font-semibold">{u.name}</div>
                    <div className="text-[11px] text-muted">{timeAgo(u.createdAt)}</div>
                  </div>
                </button>
              ))
            ) : (
              <span className="text-xs text-muted">Kosong.</span>
            )}
          </div>
        </Card>
        {selected ? (
          <Detail key={selected.id} user={selected} />
        ) : (
          <Card>
            <EmptyState icon="user-check">Tidak ada akun pada kategori ini.</EmptyState>
          </Card>
        )}
      </div>
    </>
  );
}
