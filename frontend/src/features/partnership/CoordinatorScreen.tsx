"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { CLOSED_STATUSES, OPEN_STATUSES, findCoordinator, getDesa, getProblem, getUniv, usedSlots, type Group } from "@/domain";
import { useDatabaseVersion, useSession } from "@/hooks/useDatabase";
import { Button, ButtonLink, Card, CardTitle, EmptyState, Icon, KeyValue, StatusTag, Tag } from "@/components/ui";
import { routes } from "@/lib/routes";
import { openingMessage } from "@/lib/whatsapp";
import { ContactRows } from "./Contact";
import { GroupCard } from "./GroupCard";
import { GroupFormModal } from "./GroupFormModal";

function Page({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-[920px] px-4 pt-7 pb-20">{children}</div>;
}

/**
 * Halaman koordinator KKN: dibuka lewat tautan undangan tanpa login.
 * Koordinator berdiskusi dengan desa lewat WhatsApp lalu mencatat hasilnya per kelompok.
 */
export function CoordinatorScreen() {
  useDatabaseVersion();
  const { ready, me } = useSession();
  const { token } = useParams<{ token: string }>();
  const [form, setForm] = useState<{ open: boolean; group: Group | null }>({ open: false, group: null });

  if (!ready) return null;
  const found = findCoordinator(token);
  if (!found) {
    return (
      <Page>
        <Card>
          <EmptyState icon="link-off" action={<ButtonLink href={routes.home} size="sm">Ke beranda</ButtonLink>}>
            Tautan koordinator tidak valid atau sudah dihapus.
          </EmptyState>
        </Card>
      </Page>
    );
  }

  const { partnership: ps, coordinator } = found;
  const problem = getProblem(ps.problemId);
  const desa = getDesa(ps.desaId);
  const univ = getUniv(ps.univId);
  const open = OPEN_STATUSES.includes(ps.status);
  const mine = ps.groups.filter((g) => g.coordinatorId === coordinator.id);
  const backToApp = me && (me.id === ps.univId || me.id === ps.desaId);

  return (
    <Page>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <Link href={routes.home} className="flex items-center gap-1.5 font-display text-lg font-semibold text-forest-900">
          <Icon name="leaf" /> SevaKarsa
        </Link>
        {backToApp && (
          <ButtonLink href={routes.partnership(ps.id)} size="sm" variant="outline">
            <Icon name="arrow-left" /> Kembali ke aplikasi
          </ButtonLink>
        )}
      </div>
      <h1 className="font-display text-[30px] leading-[1.2] font-semibold">Halo, {coordinator.name}</h1>
      <div className="mb-3 text-muted">
        Koordinator KKN {univ.name} · {problem?.title}
      </div>

      {ps.status === "requested" && (
        <Card variant="warn" className="mb-3">
          <Icon name="hourglass-empty" /> <b>Menunggu desa menyetujui kerja sama.</b>{" "}
          <span className="text-xs">
            Setelah disetujui, kontak desa dan formulir kesepakatan terbuka di halaman ini.
          </span>
        </Card>
      )}
      {CLOSED_STATUSES.includes(ps.status) && (
        <Card variant="muted" className="mb-3">
          <Icon name="info-circle" /> Kerja sama ini sudah berakhir. <StatusTag status={ps.status} />
        </Card>
      )}

      {open && (
        <>
          <Card variant="soft" padding="tight" className="mb-3">
            <Icon name="brand-whatsapp" /> Diskusikan jadwal dan program dengan desa lewat WhatsApp, lalu catat
            hasilnya sebagai <b>konfirmasi kesepakatan</b> di bawah.
          </Card>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardTitle>Kontak desa</CardTitle>
              <div className="font-semibold">{desa.name}</div>
              <div className="mb-3 text-[11px] text-muted">
                <Icon name="map-pin" /> {desa.profile.city}
              </div>
              <ContactRows
                contact={{ name: desa.profile.contactName, phone: desa.profile.phone, email: desa.profile.email }}
                waText={openingMessage(ps, true)}
              />
            </Card>
            <Card>
              <CardTitle>Kerja sama</CardTitle>
              <KeyValue label="Kebutuhan">{problem?.title ?? "-"}</KeyValue>
              <KeyValue label="Universitas">{univ.name}</KeyValue>
              <KeyValue label="Kuota">{`${usedSlots(ps)} / ${ps.quota} kelompok`}</KeyValue>
              <KeyValue label="Status">
                <StatusTag status={ps.status} />
              </KeyValue>
            </Card>
          </div>

          <div className="mt-6 mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="font-display text-lg font-semibold">Kelompok Anda</div>
            {usedSlots(ps) < ps.quota ? (
              <Button onClick={() => setForm({ open: true, group: null })}>
                <Icon name="plus" /> Tambah kelompok
              </Button>
            ) : (
              <Tag tone="gray">Kuota penuh</Tag>
            )}
          </div>
          <div className="flex flex-col gap-3">
            {mine.length ? (
              mine.map((g) => (
                <GroupCard key={g.id} ps={ps} group={g} viewer="coord" onEdit={(group) => setForm({ open: true, group })} />
              ))
            ) : (
              <Card>
                <EmptyState icon="users">Belum ada kelompok. Tambahkan kelompok setelah sepakat dengan desa.</EmptyState>
              </Card>
            )}
          </div>
          <GroupFormModal
            ps={ps}
            coordinatorId={coordinator.id}
            group={form.group}
            open={form.open}
            onClose={() => setForm({ open: false, group: null })}
          />
        </>
      )}
    </Page>
  );
}
