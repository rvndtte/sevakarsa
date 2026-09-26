"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { auth, getDb, now, resetDatabase, scheduler } from "@/domain";
import { useAction } from "@/hooks/useAction";
import { useDatabaseVersion, useSession } from "@/hooks/useDatabase";
import { useConfirm } from "@/components/providers/ConfirmProvider";
import { Button, Icon } from "@/components/ui";
import { formatDateTime } from "@/lib/format";
import { homeFor, routes } from "@/lib/routes";
import { cn } from "@/lib/cn";

const DEMO_ACCOUNTS = [
  { email: "desa@demo.id", label: "Desa", icon: "home-heart", id: "d1" },
  { email: "univ@demo.ac.id", label: "Univ", icon: "building-community", id: "u1" },
  { email: "admin@demo.id", label: "Admin", icon: "shield-check", id: "a1" },
];

/** Panel melayang untuk berganti akun demo dan mensimulasikan waktu. */
export function DemoPanel() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const run = useAction();
  const confirm = useConfirm();
  const { ready, me } = useSession();
  useDatabaseVersion();
  if (!ready) return null;

  const offsetDays = Math.round(getDb().clock / 86_400_000);

  const loginAs = (email: string) => {
    const result = run(() => auth.demoLogin(email), "Masuk sebagai akun demo");
    if (result.ok) router.push(homeFor(result.value.role));
  };
  const advance = (days: number) =>
    run(() => scheduler.advanceClock(days), `Waktu dimajukan ${days} hari.`);
  const reset = async () => {
    const ok = await confirm({
      title: "Reset data demo?",
      message: "Semua perubahan (akun, kebutuhan, kerja sama) akan dikembalikan ke data awal.",
      confirmLabel: "Reset",
      danger: true,
    });
    if (!ok) return;
    resetDatabase();
    router.push(routes.home);
  };

  return (
    <div className="fixed right-[18px] bottom-[18px] z-90 text-xs">
      {open && (
        <div className="absolute right-0 bottom-[52px] w-[290px] rounded-[18px] border border-line bg-white p-4 shadow-[0_16px_50px_rgba(0,0,0,0.25)]">
          <PanelTitle first>Masuk cepat (akun demo)</PanelTitle>
          <div className="flex flex-wrap gap-1.5">
            {DEMO_ACCOUNTS.map((a) => (
              <Button
                key={a.email}
                size="sm"
                variant={me?.id === a.id ? "primary" : "outline"}
                onClick={() => loginAs(a.email)}
              >
                <Icon name={a.icon} /> {a.label}
              </Button>
            ))}
          </div>

          <PanelTitle>Simulasi waktu</PanelTitle>
          <div className="mb-2 text-muted">
            Sekarang: <b className="text-ink">{formatDateTime(now())}</b>
            {offsetDays ? ` (+${offsetDays} hari)` : ""}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[1, 3, 7].map((d) => (
              <Button key={d} size="sm" variant="outline" onClick={() => advance(d)}>
                +{d} hari
              </Button>
            ))}
            <Button size="sm" variant="ghost" onClick={() => run(scheduler.resetClock, "Waktu simulasi dikembalikan.")}>
              Reset waktu
            </Button>
          </div>
          <p className="mt-2 text-[11px] text-muted">
            Majukan waktu untuk melihat pengajuan <b>Kedaluwarsa</b> dan notifikasi pengingat.
          </p>

          <PanelTitle>Data</PanelTitle>
          <Button size="sm" variant="danger" onClick={reset}>
            <Icon name="refresh" /> Reset semua data demo
          </Button>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2 rounded-full bg-forest-900 px-[18px] py-[11px] font-bold text-lime shadow-[0_8px_24px_rgba(0,0,0,0.25)]",
        )}
      >
        <Icon name="flask" /> Panel demo
      </button>
    </div>
  );
}

function PanelTitle({ children, first }: { children: string; first?: boolean }) {
  return (
    <h4 className={cn("mb-2 text-eyebrow text-muted", first ? "mt-0" : "mt-3")}>{children}</h4>
  );
}
