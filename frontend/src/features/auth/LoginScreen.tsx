"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { auth, type Role } from "@/domain";
import { useAction } from "@/hooks/useAction";
import { useSession } from "@/hooks/useDatabase";
import { Button, Field, Icon, Input } from "@/components/ui";
import { homeFor, routes } from "@/lib/routes";
import { AuthTabs } from "./AuthTabs";
import { RolePicker, type RoleOption } from "./RolePicker";

const ROLES: readonly RoleOption<Role>[] = [
  { value: "desa", icon: "home-heart", label: "Desa" },
  { value: "univ", icon: "building-community", label: "Universitas" },
  { value: "admin", icon: "shield-check", label: "Admin" },
];

const DEMO_ACCOUNTS = [
  { email: "desa@demo.id", label: "Desa Sumber Rejeki" },
  { email: "univ@demo.ac.id", label: "Universitas Brawijaya" },
  { email: "admin@demo.id", label: "Super Admin" },
];

export function LoginScreen() {
  const router = useRouter();
  const run = useAction();
  const { me } = useSession();
  const [role, setRole] = useState<Role>("desa");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (me) router.replace(homeFor(me.role));
  }, [me, router]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const result = run(() => auth.login(email, password, role));
    if (result.ok) router.push(homeFor(result.value.role));
  };

  const demoLogin = (demoEmail: string) => {
    const result = run(() => auth.demoLogin(demoEmail));
    if (result.ok) router.push(homeFor(result.value.role));
  };

  return (
    <>
      <AuthTabs active="login" />
      <h1 className="mt-4 font-display text-[30px] leading-[1.2] font-semibold">Selamat datang kembali</h1>
      <p className="mt-1 text-muted">Masuk sebagai:</p>
      <form onSubmit={submit} className="mt-3" noValidate>
        <RolePicker options={ROLES} value={role} onChange={setRole} columns={3} />
        <Field label="Email">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@desa.go.id" autoComplete="username" />
        </Field>
        <Field label="Kata sandi">
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
        </Field>
        <Button type="submit" size="lg" block>
          Masuk <Icon name="arrow-right" />
        </Button>
      </form>
      <p className="mt-4 text-center text-muted">
        Belum punya akun?{" "}
        <Link href={routes.register} className="font-semibold text-leaf-500">Daftar</Link>
      </p>
      <div className="mt-[18px] rounded-[14px] border border-dashed border-[#e5c97a] bg-honey-100 p-3.5">
        <div className="font-semibold">
          <Icon name="flask" /> Akun demo (kata sandi: <code>demo123</code>)
        </div>
        <div className="mt-2 flex flex-wrap gap-2.5">
          {DEMO_ACCOUNTS.map((a) => (
            <Button key={a.email} size="sm" variant="outline" onClick={() => demoLogin(a.email)}>
              {a.label}
            </Button>
          ))}
        </div>
      </div>
    </>
  );
}
