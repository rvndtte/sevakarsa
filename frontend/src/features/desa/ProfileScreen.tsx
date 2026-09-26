"use client";

import { useState, type FormEvent } from "react";
import { CITIES, DomainError, auth, problemsOf, type Desa, type DesaProfile } from "@/domain";
import { useDesa } from "@/components/layout/RoleOnly";
import { useAction } from "@/hooks/useAction";
import { useDatabaseVersion } from "@/hooks/useDatabase";
import { ContactRows } from "@/features/partnership/Contact";
import { ProfileCover } from "@/features/profile/ProfileCover";
import { Button, Card, CardTitle, Field, Icon, Input, Label, PageHeader, Select, StatCard, StatusTag, Tag, Textarea } from "@/components/ui";
import { routes } from "@/lib/routes";
import Link from "next/link";

const csv = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

interface FormState {
  name: string;
  kecamatan: string;
  city: string;
  population: string;
  area: string;
  umkm: string;
  about: string;
  potentials: string;
  facilities: string;
  contactName: string;
  phone: string;
  email: string;
}

const toForm = (me: Desa): FormState => ({
  name: me.name,
  kecamatan: me.profile.kecamatan,
  city: me.profile.city,
  population: String(me.profile.population),
  area: me.profile.area,
  umkm: String(me.profile.umkm),
  about: me.profile.about,
  potentials: me.profile.potentials.join(", "),
  facilities: me.profile.facilities.join(", "),
  contactName: me.profile.contactName,
  phone: me.profile.phone,
  email: me.profile.email,
});

function EditForm({ me, onDone }: { me: Desa; onDone: () => void }) {
  const run = useAction();
  const [form, setForm] = useState<FormState>(() => toForm(me));
  const set = (key: keyof FormState, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const result = run(() => {
      if (!form.name.trim()) throw new DomainError("Nama desa wajib diisi.");
      const profile: Partial<DesaProfile> = {
        kecamatan: form.kecamatan,
        city: form.city,
        province: CITIES[form.city],
        population: form.population,
        area: form.area,
        umkm: form.umkm,
        about: form.about,
        potentials: csv(form.potentials),
        facilities: csv(form.facilities),
        contactName: form.contactName,
        phone: form.phone,
        email: form.email,
      };
      auth.updateDesaProfile(me.id, {
        name: form.name.startsWith("Desa ") ? form.name : `Desa ${form.name}`,
        profile,
      });
    }, "Profil desa disimpan.");
    if (result.ok) onDone();
  };

  return (
    <>
      <PageHeader back="Batal" title="Edit profil desa" />
      <Card className="max-w-[820px]">
        <form onSubmit={submit} noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nama desa"><Input value={form.name} onChange={(e) => set("name", e.target.value)} /></Field>
            <Field label="Kecamatan"><Input value={form.kecamatan} onChange={(e) => set("kecamatan", e.target.value)} /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Kabupaten / Kota">
              <Select value={form.city} onChange={(e) => set("city", e.target.value)}>
                {Object.keys(CITIES).map((c) => <option key={c}>{c}</option>)}
              </Select>
            </Field>
            <Field label="Penduduk"><Input type="number" value={form.population} onChange={(e) => set("population", e.target.value)} /></Field>
            <Field label="Luas (km²)"><Input value={form.area} onChange={(e) => set("area", e.target.value)} /></Field>
          </div>
          <Field label="Jumlah UMKM aktif" className="max-w-[200px]">
            <Input type="number" value={form.umkm} onChange={(e) => set("umkm", e.target.value)} />
          </Field>
          <Field label="Tentang desa"><Textarea value={form.about} onChange={(e) => set("about", e.target.value)} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Potensi desa" hint="Pisahkan dengan koma."><Input value={form.potentials} onChange={(e) => set("potentials", e.target.value)} /></Field>
            <Field label="Fasilitas" hint="Pisahkan dengan koma."><Input value={form.facilities} onChange={(e) => set("facilities", e.target.value)} /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Nama kontak"><Input value={form.contactName} onChange={(e) => set("contactName", e.target.value)} /></Field>
            <Field label="Telepon"><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
            <Field label="Email kontak"><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>
          </div>
          <div className="flex gap-2.5">
            <Button type="submit">Simpan profil</Button>
            <Button variant="outline" onClick={onDone}>Batal</Button>
          </div>
        </form>
      </Card>
    </>
  );
}

function TagList({ items, tone }: { items: string[]; tone?: "gray" }) {
  return items.length ? (
    <div className="flex flex-wrap gap-2">{items.map((x) => <Tag key={x} tone={tone}>{x}</Tag>)}</div>
  ) : (
    <span className="text-xs text-muted">—</span>
  );
}

export function DesaProfileScreen() {
  useDatabaseVersion();
  const me = useDesa();
  const [editing, setEditing] = useState(false);
  const p = me.profile;
  const active = problemsOf(me.id).filter((x) => ["available", "requested", "connected"].includes(x.status));

  if (editing) return <EditForm me={me} onDone={() => setEditing(false)} />;

  return (
    <>
      <PageHeader
        title="Profil Desa"
        subtitle="Informasi umum desa yang dilihat universitas"
        actions={<Button variant="outline" onClick={() => setEditing(true)}><Icon name="edit" /> Edit profil</Button>}
      />
      <ProfileCover user={me} subtitle={`Kec. ${p.kecamatan || "-"}, ${p.city}, ${p.province}`} />
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon="users" tone="green" value={p.population || "-"} label="Penduduk" />
        <StatCard icon="map" tone="blue" value={p.area ? `${p.area} km²` : "-"} label="Luas wilayah" />
        <StatCard icon="building-store" tone="amber" value={p.umkm || "-"} label="UMKM aktif" />
        <StatCard icon="file-text" tone="purple" value={active.length} label="Kebutuhan aktif" />
      </div>
      <div className="mt-4 grid items-start gap-4 lg:grid-cols-[3fr_2fr]">
        <div className="flex flex-col gap-3">
          <Card>
            <CardTitle>Tentang & potensi desa</CardTitle>
            <p>{p.about || "Belum diisi."}</p>
            <Label className="mt-4">Potensi</Label>
            <TagList items={p.potentials} />
            <Label className="mt-4">Fasilitas</Label>
            <TagList items={p.facilities} tone="gray" />
          </Card>
          <Card>
            <CardTitle>Bidang yang membutuhkan dukungan</CardTitle>
            <div className="flex flex-col gap-2.5">
              {active.length ? (
                active.map((x) => (
                  <Link
                    key={x.id}
                    href={routes.desa.problem(x.id)}
                    className="flex items-center gap-3.5 rounded-xl border border-transparent bg-cream-50 px-3.5 py-3 hover:border-line hover:bg-white"
                  >
                    <div className="flex-1 font-semibold">{x.title}</div>
                    <Tag tone="blue">{x.category}</Tag>
                    <StatusTag status={x.status} />
                  </Link>
                ))
              ) : (
                <span className="text-xs text-muted">Belum ada kebutuhan aktif.</span>
              )}
            </div>
          </Card>
        </div>
        <div className="flex flex-col gap-3">
          <Card>
            <CardTitle>Lokasi</CardTitle>
            <div className="flex h-[140px] items-center justify-center rounded-xl bg-leaf-100 text-[34px] text-leaf-500">
              <Icon name="map-pin" />
            </div>
            <p className="mt-2 text-xs text-muted">{p.city}, {p.province}</p>
          </Card>
          <Card>
            <CardTitle>Kontak</CardTitle>
            <ContactRows contact={{ name: p.contactName, phone: p.phone, email: p.email }} />
          </Card>
          <Card>
            <CardTitle>Dokumen verifikasi</CardTitle>
            <div className="flex flex-col gap-2">
              {me.docs.map((d) => (
                <div key={d} className="flex items-center gap-2 text-xs">
                  <Icon name="file-text" className="text-muted" /> {d}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
