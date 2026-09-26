"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { CITIES, auth } from "@/domain";
import { useAction } from "@/hooks/useAction";
import { Button, Field, Icon, Input, Select } from "@/components/ui";
import { routes } from "@/lib/routes";
import { AuthTabs } from "./AuthTabs";
import { RolePicker, type RoleOption } from "./RolePicker";

type RegisterRole = "desa" | "univ";

const ROLES: readonly RoleOption<RegisterRole>[] = [
  { value: "desa", icon: "home-heart", label: "Desa", hint: "Ajukan kebutuhan" },
  { value: "univ", icon: "building-community", label: "Universitas", hint: "Cari & bantu desa" },
];

const DOC_EXAMPLES: Record<RegisterRole, string> = {
  desa: "Contoh: SK Kepala Desa, KTP Kepala Desa.",
  univ: "Contoh: Surat tugas LPPM, SK institusi.",
};

export function RegisterScreen() {
  const router = useRouter();
  const run = useAction();
  const [role, setRole] = useState<RegisterRole>("desa");
  const [form, setForm] = useState({ name: "", email: "", password: "", city: "Kab. Malang", contactName: "" });
  const [docs, setDocs] = useState<string[]>([]);
  const set = (key: keyof typeof form, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const result = run(() => auth.register({ role, ...form, docs }));
    if (result.ok) router.push(`${routes.registered}?u=${result.value.id}`);
  };

  return (
    <>
      <AuthTabs active="register" />
      <h1 className="mt-4 font-display text-[30px] leading-[1.2] font-semibold">Buat akun baru</h1>
      <p className="mt-1 text-muted">Daftar sebagai:</p>
      <form onSubmit={submit} className="mt-3" noValidate>
        <RolePicker options={ROLES} value={role} onChange={setRole} />
        <Field label={role === "desa" ? "Nama desa" : "Nama universitas / tim"}>
          <Input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder={role === "desa" ? "mis. Sumber Makmur" : "mis. Institut Teknologi Nusantara"}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email">
            <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="nama@email.com" />
          </Field>
          <Field label="Kata sandi">
            <Input type="password" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="min. 6 karakter" />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Kabupaten / Kota">
            <Select value={form.city} onChange={(e) => set("city", e.target.value)}>
              {Object.keys(CITIES).map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>
          <Field label="Nama kontak">
            <Input value={form.contactName} onChange={(e) => set("contactName", e.target.value)} placeholder="Nama penanggung jawab" />
          </Field>
        </div>
        <Field
          label="Dokumen pendukung verifikasi"
          hint={`${DOC_EXAMPLES[role]} (berkas tidak diunggah ke server, hanya nama berkas yang disimpan)`}
        >
          <Input type="file" multiple onChange={(e) => setDocs(Array.from(e.target.files ?? []).map((f) => f.name))} />
        </Field>
        <Button type="submit" size="lg" block>
          Kirim pendaftaran <Icon name="send" />
        </Button>
      </form>
      <p className="mt-4 text-center text-muted">
        Sudah punya akun?{" "}
        <Link href={routes.login} className="font-semibold text-leaf-500">Masuk</Link>
      </p>
    </>
  );
}
