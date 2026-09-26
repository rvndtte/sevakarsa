"use client";

import { useState, type FormEvent } from "react";
import { CATEGORIES, CITIES, DomainError, auth, type Univ } from "@/domain";
import { useUniv } from "@/components/layout/RoleOnly";
import { useAction } from "@/hooks/useAction";
import { useDatabaseVersion } from "@/hooks/useDatabase";
import { ContactRows } from "@/features/partnership/Contact";
import { ProfileCover } from "@/features/profile/ProfileCover";
import { Button, Card, CardTitle, CheckPill, Field, Icon, Input, Label, PageHeader, Select, StatCard, Tag, Textarea } from "@/components/ui";
import { HistoryList } from "./HistoryList";

const csv = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

function HistoryEditor({ me }: { me: Univ }) {
  const run = useAction();
  const [form, setForm] = useState({ title: "", year: "", desa: "", result: "" });
  const set = (key: keyof typeof form, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const add = (e: FormEvent) => {
    e.preventDefault();
    const result = run(() => auth.addHistory(me.id, form), "Program ditambahkan.");
    if (result.ok) setForm({ title: "", year: "", desa: "", result: "" });
  };

  return (
    <Card>
      <CardTitle>Program yang pernah diambil</CardTitle>
      <div className="flex flex-col gap-2.5">
        {me.profile.history.length ? (
          me.profile.history.map((h) => (
            <div key={h.id} className="flex items-center gap-3.5 rounded-xl bg-cream-50 px-3.5 py-3">
              <div className="min-w-0 flex-1">
                <b>{h.title}</b> <span className="text-xs text-muted">· {h.year} · {h.desa}</span>
                <div className="text-[11px] text-muted">{h.result}</div>
              </div>
              <Button size="sm" variant="danger" onClick={() => run(() => auth.deleteHistory(me.id, h.id))}>
                <Icon name="trash" />
              </Button>
            </div>
          ))
        ) : (
          <span className="text-xs text-muted">Belum ada program tercatat.</span>
        )}
      </div>
      <form onSubmit={add} className="mt-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Judul program"><Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="mis. Digitalisasi UMKM" /></Field>
          <Field label="Tahun"><Input value={form.year} onChange={(e) => set("year", e.target.value)} placeholder="2024" /></Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Desa mitra"><Input value={form.desa} onChange={(e) => set("desa", e.target.value)} placeholder="mis. Desa Tegalrejo" /></Field>
          <Field label="Hasil singkat"><Input value={form.result} onChange={(e) => set("result", e.target.value)} placeholder="mis. 12 UMKM terlatih" /></Field>
        </div>
        <Button type="submit"><Icon name="plus" /> Tambah program</Button>
      </form>
    </Card>
  );
}

function EditForm({ me, onDone }: { me: Univ; onDone: () => void }) {
  const run = useAction();
  const pr = me.profile;
  const [form, setForm] = useState({
    name: me.name,
    city: pr.city,
    about: pr.about,
    programs: pr.programs.join(", "),
    contactName: pr.contactName,
    phone: pr.phone,
    email: pr.email,
  });
  const [fields, setFields] = useState<string[]>(pr.fields);
  const set = (key: keyof typeof form, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    run(() => {
      if (!form.name.trim()) throw new DomainError("Nama wajib diisi.");
      auth.updateUnivProfile(me.id, {
        name: form.name,
        profile: {
          city: form.city,
          province: CITIES[form.city],
          about: form.about,
          fields,
          programs: csv(form.programs),
          contactName: form.contactName,
          phone: form.phone,
          email: form.email,
        },
      });
    }, "Profil universitas disimpan.");
  };

  return (
    <>
      <PageHeader back="Batal" title="Edit profil universitas" subtitle="Informasi ini terlihat oleh desa mitra" />
      <div className="flex max-w-[860px] flex-col gap-3">
        <Card>
          <form onSubmit={submit} noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nama universitas"><Input value={form.name} onChange={(e) => set("name", e.target.value)} /></Field>
              <Field label="Kabupaten / Kota">
                <Select value={form.city} onChange={(e) => set("city", e.target.value)}>
                  {Object.keys(CITIES).map((c) => <option key={c}>{c}</option>)}
                </Select>
              </Field>
            </div>
            <Field label="Tentang institusi"><Textarea value={form.about} onChange={(e) => set("about", e.target.value)} /></Field>
            <Field label="Bidang keahlian">
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <CheckPill
                    key={c}
                    checked={fields.includes(c)}
                    onChange={(e) => setFields((prev) => (e.target.checked ? [...prev, c] : prev.filter((x) => x !== c)))}
                  >
                    {c}
                  </CheckPill>
                ))}
              </div>
            </Field>
            <Field label="Program studi" hint="Pisahkan dengan koma."><Input value={form.programs} onChange={(e) => set("programs", e.target.value)} /></Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Nama kontak"><Input value={form.contactName} onChange={(e) => set("contactName", e.target.value)} /></Field>
              <Field label="Telepon / WhatsApp"><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
              <Field label="Email kontak"><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>
            </div>
            <div className="flex gap-2.5">
              <Button type="submit">Simpan profil</Button>
              <Button variant="outline" onClick={onDone}>Selesai</Button>
            </div>
          </form>
        </Card>
        <HistoryEditor me={me} />
      </div>
    </>
  );
}

export function UnivProfileScreen() {
  useDatabaseVersion();
  const me = useUniv();
  const [editing, setEditing] = useState(false);
  const pr = me.profile;

  if (editing) return <EditForm me={me} onDone={() => setEditing(false)} />;

  return (
    <>
      <PageHeader
        title="Profil Universitas"
        subtitle="Informasi institusi yang terlihat oleh desa mitra"
        actions={<Button variant="outline" onClick={() => setEditing(true)}><Icon name="edit" /> Edit profil</Button>}
      />
      <ProfileCover user={me} subtitle={`${pr.city}, ${pr.province}`} />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <StatCard icon="school" tone="blue" value={pr.programs.length} label="Program studi" />
        <StatCard icon="history" tone="green" value={pr.history.length} label="Program KKN yang pernah diambil" />
      </div>
      <div className="mt-4 grid items-start gap-4 lg:grid-cols-[3fr_2fr]">
        <div className="flex flex-col gap-3">
          <Card>
            <CardTitle>Tentang institusi</CardTitle>
            <p>{pr.about || "Belum diisi."}</p>
            <Label className="mt-4">Bidang keahlian</Label>
            <div className="flex flex-wrap gap-2">
              {pr.fields.length ? pr.fields.map((x) => <Tag key={x} tone="blue">{x}</Tag>) : <span className="text-xs text-muted">—</span>}
            </div>
            <Label className="mt-4">Program studi</Label>
            <div className="flex flex-wrap gap-2">
              {pr.programs.length ? pr.programs.map((x) => <Tag key={x} tone="gray">{x}</Tag>) : <span className="text-xs text-muted">—</span>}
            </div>
          </Card>
          <Card>
            <CardTitle>Program yang pernah diambil</CardTitle>
            <HistoryList items={pr.history} />
          </Card>
        </div>
        <div className="flex flex-col gap-3">
          <Card>
            <CardTitle>Kontak</CardTitle>
            <ContactRows contact={{ name: pr.contactName, phone: pr.phone, email: pr.email }} />
          </Card>
          <Card>
            <CardTitle>Dokumen verifikasi</CardTitle>
            <div className="flex flex-col gap-2">
              {me.docs.map((d) => (
                <div key={d} className="flex items-center gap-2 text-xs"><Icon name="file-text" className="text-muted" /> {d}</div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
