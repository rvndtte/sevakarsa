"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { auth, getUser } from "@/domain";
import { useAction } from "@/hooks/useAction";
import { useDatabaseVersion } from "@/hooks/useDatabase";
import { Button, ButtonLink, Icon, IconBox } from "@/components/ui";
import { routes } from "@/lib/routes";

/** Konfirmasi setelah mendaftar. Dibungkus <Suspense> oleh page karena memakai searchParams. */
export function RegisteredScreen() {
  useDatabaseVersion();
  const router = useRouter();
  const run = useAction();
  const userId = useSearchParams().get("u");
  const user = userId ? getUser(userId) : undefined;

  const openAdmin = () => {
    const result = run(() => auth.demoLogin("admin@demo.id"));
    if (result.ok) router.push(`${routes.admin.verify}${userId ? `?u=${userId}` : ""}`);
  };

  return (
    <>
      <IconBox icon="mail-check" round className="size-16 text-[30px]" />
      <h1 className="mt-4 font-display text-[30px] leading-[1.2] font-semibold">Pendaftaran terkirim</h1>
      <p className="mt-2 text-muted">
        {user ? (
          <>
            Akun <b>{user.name}</b> sedang menunggu verifikasi
          </>
        ) : (
          "Akun Anda menunggu verifikasi"
        )}{" "}
        Super Admin (1–2 hari kerja). Anda baru bisa masuk setelah akun disetujui.
      </p>
      <div className="mt-[18px] rounded-[14px] border border-dashed border-[#e5c97a] bg-honey-100 p-3.5">
        <div className="font-semibold">
          <Icon name="flask" /> Coba sendiri di demo
        </div>
        <p className="mt-1 text-xs">
          Masuk sebagai Super Admin, buka <b>Verifikasi Akun</b>, lalu setujui akun ini. Setelah itu Anda bisa masuk
          dengan email dan kata sandi tadi.
        </p>
        <Button size="sm" className="mt-2" onClick={openAdmin}>
          Buka panel admin <Icon name="arrow-right" />
        </Button>
      </div>
      <ButtonLink href={routes.login} variant="outline" className="mt-4 self-start">
        Ke halaman masuk
      </ButtonLink>
    </>
  );
}
