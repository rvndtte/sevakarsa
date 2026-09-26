"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DAY, now, notifications, notificationsOf, type Notification, type NotificationType } from "@/domain";
import { useUser } from "@/components/layout/RoleOnly";
import { useDatabaseVersion } from "@/hooks/useDatabase";
import { Button, Card, Chip, ChipRow, EmptyState, IconBox, PageHeader } from "@/components/ui";
import { cn } from "@/lib/cn";
import { timeAgo } from "@/lib/format";
import { NOTIFICATION_STYLE } from "./style";

type Filter = "all" | "partnership" | "agreement" | "deadline" | "status";

const GROUPS: Record<Exclude<Filter, "all">, NotificationType[]> = {
  partnership: ["partnership"],
  agreement: ["agreement"],
  deadline: ["deadline", "expire"],
  status: ["status", "reject", "system"],
};

const FILTERS: [Filter, string][] = [
  ["all", "Semua"],
  ["partnership", "Kerja sama"],
  ["agreement", "Kesepakatan"],
  ["deadline", "Pengingat"],
  ["status", "Status"],
];

function Item({ n, onOpen }: { n: Notification; onOpen: (n: Notification) => void }) {
  const style = NOTIFICATION_STYLE[n.type];
  return (
    <div
      onClick={() => onOpen(n)}
      className={cn(
        "flex cursor-pointer items-center gap-3.5 rounded-xl border px-3.5 py-3",
        n.read ? "border-transparent bg-cream-50" : "border-line bg-white",
      )}
    >
      <IconBox icon={style.icon} tone={style.tone} round />
      <div className="min-w-0 flex-1">
        <div className={n.read ? "" : "font-semibold"}>{n.text}</div>
        <div className="text-[11px] text-muted">{timeAgo(n.ts)}</div>
      </div>
      {!n.read && <span className="size-[9px] rounded-full bg-leaf-500" />}
    </div>
  );
}

export function NotificationsScreen() {
  useDatabaseVersion();
  const me = useUser();
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");

  const all = notificationsOf(me.id);
  const list = filter === "all" ? all : all.filter((n) => GROUPS[filter].includes(n.type));
  const today = list.filter((n) => now() - n.ts < DAY);
  const before = list.filter((n) => now() - n.ts >= DAY);

  const open = (n: Notification) => {
    notifications.markRead(n.id);
    if (n.link) router.push(n.link);
  };

  return (
    <>
      <PageHeader
        title="Notifikasi"
        subtitle="Pemberitahuan kerja sama, kesepakatan, pengingat, dan perubahan status"
        actions={<Button size="sm" variant="outline" onClick={() => notifications.markAllRead(me.id)}>Tandai semua dibaca</Button>}
      />
      <ChipRow>
        {FILTERS.map(([key, label]) => (
          <Chip key={key} active={filter === key} onClick={() => setFilter(key)}>{label}</Chip>
        ))}
      </ChipRow>
      {list.length ? (
        <>
          {today.length > 0 && (
            <>
              <div className="mt-6 mb-1 text-eyebrow text-muted">Hari ini</div>
              <div className="flex flex-col gap-2.5">{today.map((n) => <Item key={n.id} n={n} onOpen={open} />)}</div>
            </>
          )}
          {before.length > 0 && (
            <>
              <div className="mt-6 mb-1 text-eyebrow text-muted">Sebelumnya</div>
              <div className="flex flex-col gap-2.5">{before.map((n) => <Item key={n.id} n={n} onOpen={open} />)}</div>
            </>
          )}
        </>
      ) : (
        <Card className="mt-4">
          <EmptyState icon="bell-off">Tidak ada notifikasi.</EmptyState>
        </Card>
      )}
    </>
  );
}
