"use client";

import { useState } from "react";
import { getDb, getProblem, getUser } from "@/domain";
import { useDatabaseVersion } from "@/hooks/useDatabase";
import { Card, Chip, ChipRow, PageHeader, StatusTag } from "@/components/ui";
import { timeAgo } from "@/lib/format";

type TableId = "problems" | "partnerships" | "users";
const TABS: [TableId, string][] = [
  ["problems", "Kebutuhan"],
  ["partnerships", "Kerja sama"],
  ["users", "Akun"],
];

const Cell = ({ children }: { children: React.ReactNode }) => <td className="border-t border-line px-4 py-3.5">{children}</td>;
const Head = ({ labels }: { labels: string[] }) => (
  <thead>
    <tr className="text-left text-eyebrow text-muted">
      {labels.map((l) => <th key={l} className="px-4 py-3">{l}</th>)}
    </tr>
  </thead>
);

export function DataScreen() {
  useDatabaseVersion();
  const [tab, setTab] = useState<TableId>("problems");
  const db = getDb();

  return (
    <>
      <PageHeader title="Data platform" subtitle="Seluruh data kebutuhan, kerja sama, dan akun" />
      <ChipRow className="mb-3">
        {TABS.map(([id, label]) => (
          <Chip key={id} active={tab === id} onClick={() => setTab(id)}>{label}</Chip>
        ))}
      </ChipRow>
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            {tab === "problems" && (
              <>
                <Head labels={["Kebutuhan", "Kategori", "Status"]} />
                <tbody>
                  {db.problems.map((p) => (
                    <tr key={p.id}>
                      <Cell><b>{p.title}</b><div className="text-[11px] text-muted">{getUser(p.desaId)?.name}</div></Cell>
                      <Cell>{p.category}</Cell>
                      <Cell><StatusTag status={p.status} /></Cell>
                    </tr>
                  ))}
                </tbody>
              </>
            )}
            {tab === "partnerships" && (
              <>
                <Head labels={["Kebutuhan", "Pihak", "Diajukan", "Status"]} />
                <tbody>
                  {db.partnerships.map((p) => (
                    <tr key={p.id}>
                      <Cell><b>{getProblem(p.problemId)?.title}</b></Cell>
                      <Cell>{getUser(p.desaId)?.name} × {getUser(p.univId)?.name}</Cell>
                      <Cell>{timeAgo(p.createdAt)}</Cell>
                      <Cell><StatusTag status={p.status} /></Cell>
                    </tr>
                  ))}
                </tbody>
              </>
            )}
            {tab === "users" && (
              <>
                <Head labels={["Akun", "Peran", "Lokasi", "Status"]} />
                <tbody>
                  {db.users.filter((u) => u.role !== "admin").map((u) => (
                    <tr key={u.id}>
                      <Cell><b>{u.name}</b><div className="text-[11px] text-muted">{u.email}</div></Cell>
                      <Cell>{u.role === "desa" ? "Desa" : "Universitas"}</Cell>
                      <Cell>{u.profile.city}</Cell>
                      <Cell><StatusTag status={u.verified} /></Cell>
                    </tr>
                  ))}
                </tbody>
              </>
            )}
          </table>
        </div>
      </Card>
    </>
  );
}
