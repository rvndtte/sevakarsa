"use client";

import { useState } from "react";
import { type Desa, type Univ, type User } from "@/domain";
import { Avatar, Button, Card, Icon, Label, Modal, Tag } from "@/components/ui";
import { HistoryList } from "@/features/univ/HistoryList";
import { ContactRows, LockedContactNote } from "./Contact";

interface ContactAccess {
  /** Kontak hanya terbuka setelah desa menyetujui. */
  open: boolean;
  /** Pesan pembuka WhatsApp. */
  waText?: string;
}

function TagList({ items, tone = "green" }: { items: string[]; tone?: "green" | "blue" | "gray" }) {
  if (!items.length) return <span className="text-xs text-muted">—</span>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((x) => (
        <Tag key={x} tone={tone}>
          {x}
        </Tag>
      ))}
    </div>
  );
}

function ContactSection({ user, access }: { user: Desa | Univ; access: ContactAccess }) {
  return (
    <>
      <Label className="mt-4">Kontak</Label>
      {access.open ? (
        <ContactRows
          contact={{ name: user.profile.contactName, phone: user.profile.phone, email: user.profile.email }}
          waText={access.waText}
        />
      ) : (
        <LockedContactNote />
      )}
    </>
  );
}

/** Isi profil desa atau universitas, tanpa pembungkus kartu. */
export function PartyBody({
  user,
  access = { open: false },
  historyLimit,
  onViewAll,
}: {
  user: Desa | Univ;
  access?: ContactAccess;
  historyLimit?: number;
  onViewAll?: () => void;
}) {
  if (user.role === "desa") {
    const p = user.profile;
    return (
      <>
        <p>{p.about || "Belum ada deskripsi."}</p>
        <div className="mt-3 grid grid-cols-3 gap-4">
          <div><Label>Penduduk</Label><b>{p.population || "-"}</b></div>
          <div><Label>Luas</Label><b>{p.area || "-"} km²</b></div>
          <div><Label>UMKM</Label><b>{p.umkm || "-"}</b></div>
        </div>
        <Label className="mt-4">Potensi desa</Label>
        <TagList items={p.potentials} />
        <Label className="mt-4">Fasilitas</Label>
        <TagList items={p.facilities} tone="gray" />
        <ContactSection user={user} access={access} />
      </>
    );
  }
  const p = user.profile;
  const truncated = historyLimit !== undefined && p.history.length > historyLimit;
  return (
    <>
      <p>{p.about || "Belum ada deskripsi."}</p>
      <Label className="mt-4">Bidang keahlian</Label>
      <TagList items={p.fields} tone="blue" />
      <Label className="mt-4">Program studi</Label>
      <TagList items={p.programs} tone="gray" />
      <Label className="mt-4">Program yang pernah diambil</Label>
      <div className="mt-2">
        <HistoryList items={p.history} limit={historyLimit} />
      </div>
      {truncated && onViewAll && (
        <Button size="sm" variant="outline" className="mt-2" onClick={onViewAll}>
          Lihat semua ({p.history.length})
        </Button>
      )}
      <ContactSection user={user} access={access} />
    </>
  );
}

/** Kartu ringkas satu pihak pada halaman kerja sama. */
export function PartyCard({
  user,
  label,
  access,
}: {
  user: Desa | Univ;
  label: string;
  access: ContactAccess;
}) {
  const [showAll, setShowAll] = useState(false);
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <Avatar name={user.name} variant={user.role === "univ" ? "univ" : "desa"} />
          <div>
            <div className="text-base font-semibold">{user.name}</div>
            <div className="text-[11px] text-muted">
              <Icon name="map-pin" /> {user.profile.city}, {user.profile.province}
            </div>
          </div>
        </div>
        <Tag tone={user.role === "desa" ? "green" : "blue"}>{label}</Tag>
      </div>
      <div className="mt-4">
        <PartyBody user={user} access={access} historyLimit={3} onViewAll={() => setShowAll(true)} />
      </div>
      <ProfileModal user={showAll ? user : null} onClose={() => setShowAll(false)} />
    </Card>
  );
}

/** Profil lengkap dalam dialog. Kontak dikunci; dibuka hanya di halaman kerja sama. */
export function ProfileModal({ user, onClose }: { user: User | null; onClose: () => void }) {
  const party = user && user.role !== "admin" ? user : null;
  return (
    <Modal
      open={!!party}
      onClose={onClose}
      wide
      title={party?.name}
      actions={<Button variant="outline" onClick={onClose}>Tutup</Button>}
    >
      {party && (
        <>
          <p className="text-xs text-muted">
            <Icon name="map-pin" /> {party.profile.city}, {party.profile.province}
          </p>
          <div className="mt-2">
            <PartyBody user={party} />
          </div>
        </>
      )}
    </Modal>
  );
}
