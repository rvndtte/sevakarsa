"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  CATEGORIES,
  CATEGORY_ICONS,
  LIMITS,
  SKILLS,
  activeProblemCount,
  getProblem,
  problems as problemService,
  type ProblemDraft,
} from "@/domain";
import { useDesa } from "@/components/layout/RoleOnly";
import { useConfirm } from "@/components/providers/ConfirmProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { useAction } from "@/hooks/useAction";
import { Button, Card, CheckPill, Divider, Field, Icon, Input, KeyValue, PageHeader, Stepper, Tag, Textarea } from "@/components/ui";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";

const STEPS = ["Masalah", "Kondisi & harapan", "Target", "Kompetensi"] as const;

/** Bagian wajib per langkah, dipakai validasi sebelum lanjut/publikasi. */
const REQUIRED: { step: number; label: string; ok: (d: ProblemDraft) => boolean }[] = [
  { step: 1, label: "judul", ok: (d) => !!d.title.trim() },
  { step: 1, label: "uraian masalah", ok: (d) => !!d.desc.trim() },
  { step: 2, label: "kondisi desa", ok: (d) => !!d.condition.trim() },
  { step: 2, label: "kebutuhan yang diharapkan", ok: (d) => !!d.need.trim() },
  { step: 3, label: "target / output", ok: (d) => !!d.target.trim() },
  { step: 4, label: "kompetensi", ok: (d) => d.skills.length > 0 },
];

interface WizardState {
  items: ProblemDraft[];
  /** Indeks masalah yang sedang dilengkapi (langkah 2–4). */
  current: number;
  step: number;
}

/** Wizard ajukan kebutuhan; `problemId` diisi saat mengubah kebutuhan yang ada. */
export function ProblemWizardScreen({ problemId }: { problemId?: string }) {
  const me = useDesa();
  const router = useRouter();
  const run = useAction();
  const toast = useToast();
  const confirm = useConfirm();
  const existing = problemId ? getProblem(problemId) : undefined;

  const [state, setState] = useState<WizardState>(() => ({
    items: [existing ? draftFrom(existing) : problemService.blankProblemDraft()],
    current: 0,
    step: 1,
  }));

  if (problemId && (!existing || existing.desaId !== me.id)) {
    return <Card>Kebutuhan tidak ditemukan.</Card>;
  }

  const { items, current, step } = state;
  const multi = !problemId;
  const draft = items[current];
  const isLast = current >= items.length - 1;
  const room = LIMITS.MAX_ACTIVE_PROBLEMS - activeProblemCount(me.id, problemId);

  const update = (index: number, patch: Partial<ProblemDraft>) =>
    setState((s) => ({ ...s, items: s.items.map((it, i) => (i === index ? { ...it, ...patch } : it)) }));
  const goto = (patch: Partial<WizardState>) => setState((s) => ({ ...s, ...patch }));

  const addItem = () => {
    if (items.length >= room) return toast.error(`Maksimal ${LIMITS.MAX_ACTIVE_PROBLEMS} kebutuhan aktif per desa.`);
    setState((s) => ({ ...s, items: [...s.items, problemService.blankProblemDraft()] }));
  };
  const removeItem = (index: number) =>
    setState((s) => ({ ...s, items: s.items.filter((_, i) => i !== index), current: 0 }));

  const next = () => {
    if (step === 1) {
      const bad = items.findIndex((it) => !it.title.trim() || !it.desc.trim());
      if (bad >= 0) return toast.error(`Masalah ${bad + 1}: judul dan uraian wajib diisi.`);
      return goto({ current: 0, step: 2 });
    }
    const missing = REQUIRED.find((r) => r.step === step && !r.ok(draft));
    if (missing) return toast.error(`${capitalize(missing.label)} wajib diisi.`);
    goto({ step: step + 1 });
  };

  const back = () =>
    step === 2 && current > 0 ? goto({ current: current - 1, step: 4 }) : goto({ step: step - 1 });

  const saveDraft = () => {
    const result = run(() => {
      items.forEach((it, i) => problemService.saveProblem(me.id, it, false, i === 0 ? problemId : null));
    }, "Draft tersimpan.");
    if (result.ok) router.push(routes.desa.problems);
  };

  const publish = async () => {
    for (let i = 0; i < items.length; i++) {
      const missing = REQUIRED.find((r) => !r.ok(items[i]));
      if (missing) {
        goto({ current: i, step: missing.step });
        return toast.error(`Masalah ${i + 1}: ${missing.label} wajib diisi.`);
      }
    }
    if (activeProblemCount(me.id, problemId) + items.length > LIMITS.MAX_ACTIVE_PROBLEMS)
      return toast.error(`Maksimal ${LIMITS.MAX_ACTIVE_PROBLEMS} kebutuhan aktif per desa.`);

    const n = items.length;
    const ok = await confirm({
      title: n > 1 ? `Publikasikan ${n} kebutuhan?` : "Publikasikan kebutuhan?",
      message:
        "Kebutuhan akan terlihat oleh universitas terverifikasi. Jika ada yang mengajukan kerja sama, Anda cukup menyetujui atau menolaknya.",
      confirmLabel: "Publikasikan",
    });
    if (!ok) return;
    const result = run(
      () => items.map((it, i) => problemService.saveProblem(me.id, it, true, i === 0 ? problemId : null)),
      n > 1 ? `${n} kebutuhan dipublikasikan!` : "Kebutuhan dipublikasikan!",
    );
    if (result.ok) router.push(n > 1 ? routes.desa.problems : routes.desa.problem(result.value[0].id));
  };

  return (
    <>
      <PageHeader
        back="Kembali"
        title={problemId ? "Ubah kebutuhan" : "Ajukan kebutuhan"}
        subtitle="Isi bertahap agar kebutuhan mudah dipahami universitas"
      />
      <Card padding="tight">
        <Stepper steps={STEPS} current={step - 1} />
      </Card>

      <Card className="mt-4 max-w-[760px]">
        {step === 1 && (
          <>
            <h3 className="font-display text-[17px] font-semibold">
              {multi ? "Masalah apa saja yang ingin dibantu?" : "Jelaskan masalahnya"}
            </h3>
            {multi && (
              <p className="mt-1 text-xs text-muted">
                Desa boleh mengajukan lebih dari satu masalah. Tiap masalah menjadi kebutuhan terpisah dengan
                kategorinya sendiri. Sisa kuota kebutuhan aktif: <b>{Math.max(0, room - items.length)}</b> dari{" "}
                {LIMITS.MAX_ACTIVE_PROBLEMS}.
              </p>
            )}
            {items.map((it, i) => (
              <Card key={i} padding="tight" className="mt-3 bg-cream-50">
                <div className="flex items-center justify-between">
                  <b>Masalah {i + 1}</b>
                  {multi && items.length > 1 && (
                    <Button size="sm" variant="danger" onClick={() => removeItem(i)}>
                      <Icon name="trash" /> Hapus
                    </Button>
                  )}
                </div>
                <Field label="Judul masalah *" className="mt-2">
                  <Input value={it.title} onChange={(e) => update(i, { title: e.target.value })} placeholder="mis. Digitalisasi UMKM Desa" />
                </Field>
                <Field label="Kategori masalah *">
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((c) => (
                      <CheckPill
                        key={c}
                        type="radio"
                        name={`category-${i}`}
                        checked={it.category === c}
                        onChange={() => update(i, { category: c })}
                      >
                        <Icon name={CATEGORY_ICONS[c] ?? "tag"} />
                        {c}
                      </CheckPill>
                    ))}
                  </div>
                </Field>
                <Field label="Uraian permasalahan *">
                  <Textarea value={it.desc} onChange={(e) => update(i, { desc: e.target.value })} placeholder="Apa masalah yang dihadapi desa?" />
                </Field>
              </Card>
            ))}
            {multi && (
              <Button variant="outline" className="mt-3" onClick={addItem}>
                <Icon name="plus" /> Tambah masalah lain
              </Button>
            )}
            <Card variant="soft" padding="tight" className="mt-4">
              <Icon name="map-pin" /> Lokasi otomatis dari profil: <b>{me.profile.city}, {me.profile.province}</b>
            </Card>
          </>
        )}

        {step > 1 && items.length > 1 && (
          <Card variant="soft" padding="tight" className="mb-3 text-xs">
            <Icon name="list-details" /> Masalah <b>{current + 1} dari {items.length}</b>: {draft.title}{" "}
            <Tag tone="blue">{draft.category}</Tag>
          </Card>
        )}

        {step === 2 && (
          <>
            <h3 className="font-display text-[17px] font-semibold">Kondisi saat ini & harapan</h3>
            <Field label="Kondisi desa saat ini *" hint="Contoh: ada balai desa, internet, 10 UMKM aktif." className="mt-3">
              <Textarea value={draft.condition} onChange={(e) => update(current, { condition: e.target.value })} placeholder="Fasilitas, sumber daya, dan situasi terkini" />
            </Field>
            <Field label="Kebutuhan yang diharapkan *">
              <Textarea value={draft.need} onChange={(e) => update(current, { need: e.target.value })} placeholder="Bantuan apa yang diharapkan dari universitas?" />
            </Field>
          </>
        )}

        {step === 3 && (
          <>
            <h3 className="font-display text-[17px] font-semibold">Target yang diharapkan</h3>
            <Field label="Target / output yang diharapkan *" className="mt-3">
              <Textarea value={draft.target} onChange={(e) => update(current, { target: e.target.value })} placeholder="Hasil konkret yang ingin dicapai" />
            </Field>
          </>
        )}

        {step === 4 && (
          <>
            <h3 className="font-display text-[17px] font-semibold">Kompetensi yang dibutuhkan</h3>
            <p className="mt-1 text-xs text-muted">Pilih keahlian yang dibutuhkan. Informasi ini ditampilkan kepada universitas.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {SKILLS.map((s) => (
                <CheckPill
                  key={s}
                  checked={draft.skills.includes(s)}
                  onChange={(e) =>
                    update(current, {
                      skills: e.target.checked ? [...draft.skills, s] : draft.skills.filter((x) => x !== s),
                    })
                  }
                >
                  {s}
                </CheckPill>
              ))}
            </div>
            <Divider />
            <div className="text-eyebrow text-muted">Ringkasan</div>
            <KeyValue label="Judul">{draft.title || "-"}</KeyValue>
            <KeyValue label="Kategori">{draft.category}</KeyValue>
            <KeyValue label="Kompetensi">{`${draft.skills.length} dipilih`}</KeyValue>
          </>
        )}

        <div
          className={cn(
            "sticky bottom-0 z-5 -mx-5 mt-5 -mb-5 flex flex-wrap items-center justify-between gap-2.5 rounded-b-card border-t border-line bg-white px-5 py-3.5",
          )}
        >
          <Button variant="outline" onClick={saveDraft}>Simpan draft</Button>
          <div className="flex gap-2.5">
            {(step > 1 || current > 0) && (
              <Button variant="outline" onClick={back}>Kembali</Button>
            )}
            {step < 4 ? (
              <Button onClick={next}>Lanjut <Icon name="arrow-right" /></Button>
            ) : isLast ? (
              <Button onClick={publish}>
                <Icon name="send" /> Publikasikan{items.length > 1 ? ` ${items.length} kebutuhan` : ""}
              </Button>
            ) : (
              <Button onClick={() => goto({ current: current + 1, step: 2 })}>
                Lanjut ke masalah {current + 2} <Icon name="arrow-right" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    </>
  );
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function draftFrom(p: NonNullable<ReturnType<typeof getProblem>>): ProblemDraft {
  return {
    title: p.title,
    category: p.category,
    desc: p.desc,
    condition: p.condition,
    need: p.need,
    target: p.target,
    skills: [...p.skills],
    deadline: new Date(p.deadline).toISOString().slice(0, 10),
  };
}
