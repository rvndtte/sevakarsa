import type { Problem } from "@/domain";
import { Card, CardTitle, Label, StatusTag, Tag } from "@/components/ui";

/** Uraian lengkap kebutuhan (masalah, kondisi, harapan, target). */
export function ProblemBody({ problem }: { problem: Problem }) {
  const sections: [string, string][] = [
    ["Permasalahan", problem.desc],
    ["Kondisi desa saat ini", problem.condition],
    ["Kebutuhan yang diharapkan", problem.need],
    ["Target / output", problem.target],
  ];
  return (
    <Card>
      {sections.map(([title, text], i) => (
        <div key={title} className={i ? "mt-4" : ""}>
          <Label>{title}</Label>
          <p>{text || "-"}</p>
        </div>
      ))}
    </Card>
  );
}

/** Ringkasan dan kompetensi yang dibutuhkan. */
export function ProblemSide({ problem }: { problem: Problem }) {
  return (
    <>
      <Card>
        <CardTitle>Ringkasan</CardTitle>
        <div className="flex justify-between py-1.5"><span className="text-muted">Kategori</span><b>{problem.category}</b></div>
        <div className="flex justify-between py-1.5"><span className="text-muted">Lokasi</span><b>{problem.city}</b></div>
        <div className="flex justify-between py-1.5"><span className="text-muted">Status</span><StatusTag status={problem.status} /></div>
      </Card>
      <Card>
        <CardTitle>Kompetensi dibutuhkan</CardTitle>
        <div className="flex flex-wrap gap-2">
          {problem.skills.map((s) => (
            <Tag key={s}>{s}</Tag>
          ))}
        </div>
      </Card>
    </>
  );
}
