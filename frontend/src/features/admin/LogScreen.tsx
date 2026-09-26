"use client";

import { getDb } from "@/domain";
import { useDatabaseVersion } from "@/hooks/useDatabase";
import { Card, Icon, PageHeader } from "@/components/ui";
import { formatDateTime } from "@/lib/format";

export function LogScreen() {
  useDatabaseVersion();
  const log = getDb().log;
  return (
    <>
      <PageHeader title="Log aktivitas" subtitle="Riwayat aktivitas sistem" />
      <Card>
        <div className="flex flex-col">
          {log.map((l, i) => (
            <div key={i} className="relative flex gap-3.5 pb-4">
              {i < log.length - 1 && <span className="absolute top-[26px] bottom-0 left-[11px] w-0.5 bg-line" />}
              <div className="z-1 flex size-6 flex-none items-center justify-center rounded-full bg-leaf-500 text-[13px] text-white">
                <Icon name={l.icon} />
              </div>
              <div>
                <div className="font-semibold">{l.text}</div>
                <div className="text-[11px] text-muted">{formatDateTime(l.ts)}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
