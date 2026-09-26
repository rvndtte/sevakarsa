import Link from "next/link";
import { Icon } from "@/components/ui";
import { routes } from "@/lib/routes";

/** Panel kiri hijau tua yang dipakai bersama halaman masuk, daftar, dan konfirmasi. */
export function AuthPanel() {
  return (
    <div className="flex flex-col justify-between gap-6 bg-forest-900 p-11 text-ondark">
      <Link href={routes.home} className="flex items-center gap-2 font-display text-xl font-semibold">
        <Icon name="leaf" className="text-[22px] text-lime" /> SevaKarsa
      </Link>
      <div>
        <h2 className="font-display text-[38px] leading-[1.15] font-semibold">
          Kolaborasi kecil hari ini, dampak besar untuk esok.
        </h2>
        <div className="mt-6 flex gap-3.5 rounded-2xl bg-forest-800 p-[18px]">
          <Icon name="shield-check" className="text-xl text-lime" />
          <div>
            <div className="font-semibold">Akun diverifikasi Super Admin</div>
            <div className="mt-0.5 text-xs text-[#b8c8bd]">
              Setelah mendaftar, dokumen Anda diperiksa dalam 1–2 hari kerja sebelum akun aktif penuh.
            </div>
          </div>
        </div>
      </div>
      <div className="text-xs text-[#9fb2a6]">© SevaKarsa · Prototipe demo</div>
    </div>
  );
}
