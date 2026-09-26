import Link from "next/link";
import { notificationsOf } from "@/domain";
import { IconBox } from "@/components/ui";
import { cn } from "@/lib/cn";
import { timeAgo } from "@/lib/format";
import { routes } from "@/lib/routes";
import { NOTIFICATION_STYLE } from "./style";

/** Empat notifikasi terbaru untuk kartu dashboard. */
export function RecentNotifications({ userId }: { userId: string }) {
  const items = notificationsOf(userId).slice(0, 4);
  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-[17px] font-semibold">Notifikasi</h3>
        <Link href={routes.notifications} className="text-[11px] font-semibold text-leaf-500">
          Semua
        </Link>
      </div>
      <div className="flex flex-col gap-3">
        {items.length ? (
          items.map((n) => {
            const style = NOTIFICATION_STYLE[n.type];
            return (
              <div key={n.id} className="flex items-start gap-2.5">
                <IconBox icon={style.icon} tone={style.tone} size="sm" round />
                <div>
                  <div className={cn("text-xs", !n.read && "font-semibold")}>{n.text}</div>
                  <div className="text-[11px] text-muted">{timeAgo(n.ts)}</div>
                </div>
              </div>
            );
          })
        ) : (
          <span className="text-xs text-muted">Tidak ada notifikasi.</span>
        )}
      </div>
    </>
  );
}
