"use client";

import { useState } from "react";
import {
  CLOSED_STATUSES,
  DAY,
  OPEN_STATUSES,
  getDesa,
  getProblem,
  getUniv,
  getUser,
  now,
  partnerships,
  usedSlots,
  type Partnership,
  type User,
} from "@/domain";
import { useAction } from "@/hooks/useAction";
import {
  Button,
  ButtonLink,
  Card,
  CardTitle,
  EmptyState,
  Icon,
  KeyValue,
  PageHeader,
  Stepper,
  StatusTag,
  Tabs,
  Tag,
  Timeline,
  Field,
  Select,
  Input,
  Countdown,
  Label,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import { routes } from "@/lib/routes";
import { openingMessage } from "@/lib/whatsapp";
import { CoordinatorCard } from "./CoordinatorCard";
import { GroupCard } from "./GroupCard";
import { PartyCard } from "./PartyCard";
import { ApproveButton, CancelRequestButton, RejectButton } from "./RequestActions";
import { STAGES, deadlineOf, stageIndex } from "./utils";

type TabId = "info" | "kelompok" | "status";
const TABS = [
  { id: "info", label: "Informasi kedua pihak" },
  { id: "kelompok", label: "Kesepakatan & kelompok" },
  { id: "status", label: "Status & riwayat" },
] as const;

/* ------------------------------------------------------------ banner status */

function Banner({ ps, me }: { ps: Partnership; me: User }) {
  const isDesa = me.role === "desa";
  const boxed = "mt-4";

  if (ps.status === "requested") {
    return isDesa ? (
      <Card variant="warn" className={boxed}>
        <Icon name="inbox" /> <b>Pengajuan kerja sama menunggu keputusan Anda.</b>{" "}
        <span className="text-xs">
          Setujui atau tolak sekali saja di level universitas. Setelah disetujui, kontak koordinator langsung terbuka dan
          diskusi teknis dilanjutkan lewat WhatsApp. Jika tidak direspons dalam 7 hari, pengajuan kedaluwarsa.
        </span>
        <div className="mt-2 flex flex-wrap gap-2.5">
          <ApproveButton id={ps.id} />
          <RejectButton id={ps.id} />
        </div>
      </Card>
    ) : (
      <Card variant="warn" className={boxed}>
        <Icon name="hourglass-empty" /> <b>Menunggu persetujuan desa.</b>{" "}
        <span className="text-xs">
          Kontak desa terbuka setelah disetujui. Anda bisa mengundang koordinator KKN sekarang agar siap berdiskusi
          dengan desa.
        </span>
        <div className="mt-2">
          <CancelRequestButton ps={ps} />
        </div>
      </Card>
    );
  }
  if (ps.status === "connected") {
    return (
      <Card variant="soft" className={boxed}>
        <Icon name="brand-whatsapp" /> <b>Kerja sama disetujui.</b>{" "}
        <span className="text-xs">
          Kontak kedua pihak sudah terbuka. Diskusi teknis dilakukan di WhatsApp; setelah sepakat, koordinator mengirim
          konfirmasi kesepakatan per kelompok dan desa tinggal menekan &quot;Sesuai&quot;.
        </span>
        <div className="mt-1 text-[11px] text-muted">
          Kerja sama yang sudah disetujui tidak dapat dibatalkan sepihak oleh universitas.
        </div>
      </Card>
    );
  }
  if (ps.status === "rejected") {
    return (
      <Card variant="danger" className={boxed}>
        <Icon name="circle-x" /> <b>Kerja sama ditolak desa.</b> Kebutuhan terbuka kembali.
        {ps.rejectNote && <div className="mt-1 text-xs">Catatan desa: {ps.rejectNote}</div>}
      </Card>
    );
  }
  if (ps.status === "expired") {
    return (
      <Card variant="muted" className={boxed}>
        <Icon name="hourglass-empty" /> <b>Kedaluwarsa.</b> Desa tidak merespons dalam 7 hari. Kebutuhan terbuka kembali.
      </Card>
    );
  }
  if (ps.status === "declined") {
    return (
      <Card variant="muted" className={boxed}>
        <Icon name="info-circle" /> Kerja sama ini dibatalkan universitas. Kebutuhan terbuka kembali.
      </Card>
    );
  }
  return null;
}

/* ------------------------------------------------------------ tab */

function InfoTab({ ps }: { ps: Partnership }) {
  const open = OPEN_STATUSES.includes(ps.status);
  const desa = getDesa(ps.desaId);
  const univ = getUniv(ps.univId);
  return (
    <>
      {open ? (
        <Card variant="soft" padding="tight" className="mb-3">
          <Icon name="brand-whatsapp" /> Diskusikan jadwal, jumlah mahasiswa, dan program utama lewat WhatsApp (tombol
          di bawah membawa pesan pembuka otomatis). Platform hanya mencatat hasilnya lewat{" "}
          <b>konfirmasi kesepakatan</b>.
        </Card>
      ) : ps.status === "requested" ? (
        <Card variant="soft" padding="tight" className="mb-3">
          <Icon name="lock" /> Kontak kedua pihak terbuka setelah desa menyetujui kerja sama.
        </Card>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        <PartyCard user={desa} label="Desa" access={{ open, waText: openingMessage(ps, true) }} />
        <PartyCard user={univ} label="Universitas" access={{ open, waText: openingMessage(ps, false) }} />
      </div>
    </>
  );
}

function GroupsTab({ ps, me }: { ps: Partnership; me: User }) {
  if (!OPEN_STATUSES.includes(ps.status)) {
    return (
      <Card>
        <EmptyState icon="file-check">
          {ps.status === "requested"
            ? "Konfirmasi kesepakatan tersedia setelah desa menyetujui kerja sama."
            : "Tidak ada kesepakatan."}
        </EmptyState>
      </Card>
    );
  }
  const isDesa = me.role === "desa";
  return (
    <>
      <Card variant="soft" padding="tight" className="mb-3">
        <Icon name="users" /> <b>{usedSlots(ps)} dari {ps.quota} kelompok</b>{" "}
        <span className="text-xs text-muted">
          ·{" "}
          {isDesa
            ? "Koordinator mengirim konfirmasi kesepakatan tiap kelompok setelah berdiskusi dengan Anda via WhatsApp. Tinggal tekan \"Sesuai\" atau minta revisi."
            : "Koordinator mengisi konfirmasi kesepakatan lewat tautan undangan (lihat panel Koordinator KKN)."}
        </span>
      </Card>
      <div className="flex flex-col gap-3">
        {ps.groups.length ? (
          ps.groups.map((g) => <GroupCard key={g.id} ps={ps} group={g} viewer={isDesa ? "desa" : "univ"} />)
        ) : (
          <Card>
            <EmptyState icon="file-check">
              {isDesa
                ? "Belum ada konfirmasi kesepakatan dari koordinator."
                : "Belum ada kelompok. Undang koordinator agar dapat mengisi konfirmasi kesepakatan."}
            </EmptyState>
          </Card>
        )}
      </div>
    </>
  );
}

/* ------------------------------------------------------------ panel samping */

function PlanCard({ ps }: { ps: Partnership }) {
  const univ = getUniv(ps.univId);
  const plan = ps.plan;
  return (
    <Card>
      <CardTitle>Rencana pengajuan</CardTitle>
      {ps.message && <p className="text-xs">{ps.message}</p>}
      <div className="mt-2">
        <KeyValue label="Kuota">{`${ps.quota} kelompok`}</KeyValue>
        {plan?.period && <KeyValue label="Perkiraan periode">{plan.period}</KeyValue>}
        {plan?.students ? <KeyValue label="Perkiraan mahasiswa">{`${plan.students} orang (total)`}</KeyValue> : null}
      </div>
      {univ.profile.fields.length > 0 && (
        <>
          <Label className="mt-3">Bidang keahlian univ</Label>
          <div className="flex flex-wrap gap-2">
            {univ.profile.fields.map((f) => (
              <Tag key={f} tone="blue">{f}</Tag>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}

function DocumentsCard({ ps, me }: { ps: Partnership; me: User }) {
  const run = useAction();
  const [fileName, setFileName] = useState<string>("");
  const [kind, setKind] = useState<"pdf" | "report" | "photo">("pdf");

  return (
    <Card>
      <CardTitle>Dokumen</CardTitle>
      <div className="flex flex-col gap-2">
        {ps.docs.length ? (
          ps.docs.map((d) => (
            <div key={d.id} className="flex items-center gap-3.5 rounded-xl bg-cream-50 px-3 py-2">
              <span className="flex size-[34px] flex-none items-center justify-center rounded-xl bg-leaf-100 text-base text-leaf-700">
                <Icon name={d.kind === "photo" ? "photo" : "file-text"} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-semibold">{d.name}</div>
                <div className="text-[11px] text-muted">
                  {getUser(d.by)?.name} · {formatDate(d.ts)}
                </div>
              </div>
            </div>
          ))
        ) : (
          <span className="text-xs text-muted">Belum ada dokumen.</span>
        )}
      </div>
      <form
        className="mt-3"
        onSubmit={(e) => {
          e.preventDefault();
          const result = run(() => partnerships.addDocument(ps.id, me.id, fileName || undefined, kind), "Dokumen ditambahkan.");
          if (result.ok) setFileName("");
        }}
      >
        <Field className="mb-2">
          <Input
            type="file"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
            key={ps.docs.length}
          />
        </Field>
        {ps.status === "matched" && (
          <Field className="mb-2">
            <Select value={kind} onChange={(e) => setKind(e.target.value as typeof kind)}>
              <option value="pdf">Dokumen lain</option>
              <option value="report">Laporan akhir</option>
              <option value="photo">Dokumentasi foto</option>
            </Select>
          </Field>
        )}
        <Button type="submit" size="sm" variant="outline" block>
          <Icon name="upload" /> Tambah dokumen
        </Button>
      </form>
    </Card>
  );
}

function CompletionCard({ ps }: { ps: Partnership }) {
  const run = useAction();
  return (
    <Card variant="soft">
      <CardTitle>Pelaksanaan KKN</CardTitle>
      <p className="text-xs text-muted">
        {ps.completed
          ? "KKN sudah ditandai selesai dan masuk arsip riwayat desa."
          : "Setelah kegiatan selesai, unggah Laporan akhir lalu tandai selesai."}
      </p>
      {ps.completed ? (
        <div className="mt-2">
          <StatusTag status="done" large />
        </div>
      ) : (
        <Button size="sm" className="mt-3" onClick={() => run(() => partnerships.completePartnership(ps.id), "KKN ditandai selesai.")}>
          <Icon name="flag-check" /> Tandai KKN selesai
        </Button>
      )}
    </Card>
  );
}

/* ------------------------------------------------------------ halaman */

export function PartnershipDetail({ ps, me }: { ps: Partnership; me: User }) {
  const problem = getProblem(ps.problemId);
  const desa = getDesa(ps.desaId);
  const univ = getUniv(ps.univId);
  const [tab, setTab] = useState<TabId>(OPEN_STATUSES.includes(ps.status) ? "kelompok" : "info");
  const deadline = deadlineOf(ps);
  const detailHref = problem
    ? me.role === "univ"
      ? routes.univ.problem(problem.id)
      : routes.desa.problem(problem.id)
    : "";

  return (
    <>
      <PageHeader
        back="Kembali"
        title={problem?.title}
        subtitle={`${desa.name} × ${univ.name}`}
        actions={
          <>
            <StatusTag status={ps.completed ? "done" : ps.status} large />
            {deadline && (
              <div
                className={cn(
                  "flex items-center gap-3.5 rounded-2xl border bg-white px-5 py-3.5",
                  deadline.end - now() < DAY ? "border-[#f0c2bc]" : "border-line",
                )}
              >
                <Icon name="clock-hour-4" />
                <div>
                  <div className="font-display text-2xl leading-[1.1] font-semibold">
                    <Countdown end={deadline.end} />
                  </div>
                  <div className="text-[11px] text-muted">{deadline.label}</div>
                </div>
              </div>
            )}
          </>
        }
      />
      <Card padding="tight">
        <Stepper
          steps={STAGES}
          current={stageIndex(ps)}
          completed={ps.status === "matched"}
          stopped={CLOSED_STATUSES.includes(ps.status)}
        />
      </Card>
      <Banner ps={ps} me={me} />

      <div className="mt-4 grid items-start gap-4 lg:grid-cols-[3fr_2fr]">
        <div>
          <Tabs tabs={TABS} active={tab} onChange={setTab} />
          {tab === "info" && <InfoTab ps={ps} />}
          {tab === "kelompok" && <GroupsTab ps={ps} me={me} />}
          {tab === "status" && (
            <Card>
              <CardTitle>Riwayat proses</CardTitle>
              <Timeline entries={ps.log} />
            </Card>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <PlanCard ps={ps} />
          <CoordinatorCard ps={ps} me={me} />
          {OPEN_STATUSES.includes(ps.status) && <DocumentsCard ps={ps} me={me} />}
          {ps.status === "matched" && <CompletionCard ps={ps} />}
          {detailHref && (
            <ButtonLink href={detailHref} variant="outline" block>
              Lihat detail kebutuhan
            </ButtonLink>
          )}
        </div>
      </div>
    </>
  );
}
