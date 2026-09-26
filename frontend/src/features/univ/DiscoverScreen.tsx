"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { CATEGORIES, activePartnership, auth, getDb, getDesa, isLocked, type Problem } from "@/domain";
import { useUniv } from "@/components/layout/RoleOnly";
import { useToast } from "@/components/providers/ToastProvider";
import { useDatabaseVersion } from "@/hooks/useDatabase";
import { Button, Card, Chip, ChipRow, EmptyState, Icon, PageHeader, Photo, SearchBox, Select, StatusTag, Tag } from "@/components/ui";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";

const VISIBLE: Problem["status"][] = ["available", "requested", "connected"];

interface Filters {
  q: string;
  category: string;
  city: string;
  showClosed: boolean;
  sort: "new" | "deadline";
}

export function DiscoverScreen() {
  useDatabaseVersion();
  const me = useUniv();
  const router = useRouter();
  const toast = useToast();
  const [f, setF] = useState<Filters>({ q: "", category: "", city: "", showClosed: false, sort: "new" });
  const patch = (p: Partial<Filters>) => setF((prev) => ({ ...prev, ...p }));

  const problems = getDb().problems;
  const cities = useMemo(() => [...new Set(problems.map((p) => p.city))], [problems]);

  const q = f.q.toLowerCase();
  const rows = problems
    .filter((p) => VISIBLE.includes(p.status) || (f.showClosed && ["matched", "expired"].includes(p.status)))
    .filter((p) => !q || `${p.title} ${p.desc} ${getDesa(p.desaId).name} ${p.category}`.toLowerCase().includes(q))
    .filter((p) => !f.category || p.category === f.category)
    .filter((p) => !f.city || p.city === f.city);
  // Kebutuhan yang terkunci untuk univ lain diurutkan paling bawah.
  const rank = (p: Problem) => (isLocked(p) && !activePartnership(p.id, me.id) ? 1 : 0);
  rows.sort((a, b) => rank(a) - rank(b) || (f.sort === "deadline" ? a.deadline - b.deadline : b.createdAt - a.createdAt));

  const hasFilter = f.q || f.category || f.city;

  const toggleSave = (id: string) => {
    const saved = auth.toggleSaved(me.id, id);
    toast.success(saved ? "Disimpan ke daftar Anda." : "Dihapus dari simpanan.");
  };

  return (
    <>
      <PageHeader title="Jelajahi Desa" subtitle="Temukan kebutuhan desa yang bisa dibantu tim Anda" />
      <SearchBox value={f.q} onChange={(e) => patch({ q: e.target.value })} placeholder="Cari nama desa, kategori, atau kata kunci..." />
      <div className="mt-3 flex flex-wrap items-center gap-2.5">
        <Select className="w-auto" value={f.category} onChange={(e) => patch({ category: e.target.value })}>
          <option value="">Semua kategori</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </Select>
        <Select className="w-auto" value={f.city} onChange={(e) => patch({ city: e.target.value })}>
          <option value="">Semua lokasi</option>
          {cities.map((c) => <option key={c}>{c}</option>)}
        </Select>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line bg-white px-3.5 py-2 text-xs font-semibold has-checked:border-leaf-500 has-checked:bg-[#f1f6ec]">
          <input type="checkbox" className="accent-forest-700" checked={f.showClosed} onChange={(e) => patch({ showClosed: e.target.checked })} />
          Tampilkan juga yang selesai/kedaluwarsa
        </label>
        {hasFilter && (
          <Button size="sm" variant="ghost" onClick={() => patch({ q: "", category: "", city: "" })}>
            <Icon name="x" /> Reset filter
          </Button>
        )}
      </div>
      <Card variant="soft" padding="tight" className="mt-3 text-xs">
        <Icon name="info-circle" /> Kebutuhan berwarna <b>abu-abu</b> sedang diajukan atau berjalan bersama universitas
        lain. Kebutuhan itu terbuka kembali jika kerja samanya ditolak, dibatalkan, atau kedaluwarsa.
      </Card>

      <div className="mt-6 mb-3 flex flex-wrap items-center justify-between gap-2.5">
        <div className="font-display text-lg font-semibold">{rows.length} kebutuhan ditemukan</div>
        <ChipRow>
          <Chip active={f.sort === "new"} onClick={() => patch({ sort: "new" })}>Terbaru</Chip>
          <Chip active={f.sort === "deadline"} onClick={() => patch({ sort: "deadline" })}>Deadline</Chip>
        </ChipRow>
      </div>

      <div className="flex flex-col gap-2.5">
        {rows.length ? (
          rows.map((p) => {
            const mine = activePartnership(p.id, me.id);
            const locked = isLocked(p) && !mine;
            const saved = me.saved.includes(p.id);
            return (
              <Card
                key={p.id}
                padding="tight"
                interactive={!locked}
                locked={locked}
                className="cursor-pointer"
                onClick={() => router.push(routes.univ.problem(p.id))}
              >
                <div className="flex items-center gap-3.5">
                  <Photo seed={p.id} className="h-20 w-[110px]" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <b className="text-base">{p.title}</b>
                      {mine && <StatusTag status={mine.status} />}
                      {!mine && p.status !== "available" && !locked && <StatusTag status={p.status} />}
                    </div>
                    <div className="mt-1 text-xs text-muted">
                      <Icon name="building-community" /> {getDesa(p.desaId).name} · <Icon name="map-pin" /> {p.city}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Tag tone="blue">{p.category}</Tag>
                      {p.skills.slice(0, 3).map((s) => <Tag key={s} tone="gray">{s}</Tag>)}
                    </div>
                    {locked && (
                      <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#e3e2da] px-3 py-[3px] text-[11px] font-bold text-[#5c655f]">
                        <Icon name="lock" />{" "}
                        {p.status === "requested" ? "Sedang diajukan universitas lain" : "Sedang berjalan bersama universitas lain"}
                      </div>
                    )}
                  </div>
                  {!locked && (
                    <button
                      type="button"
                      title="Simpan"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSave(p.id);
                      }}
                      className={cn(
                        "flex size-[38px] items-center justify-center rounded-full border border-line bg-white text-lg",
                        saved && "text-honey-500",
                      )}
                    >
                      <Icon name={saved ? "bookmark-filled" : "bookmark"} />
                    </button>
                  )}
                </div>
              </Card>
            );
          })
        ) : (
          <Card>
            <EmptyState icon="search-off">Tidak ada kebutuhan yang cocok dengan filter.</EmptyState>
          </Card>
        )}
      </div>
    </>
  );
}
