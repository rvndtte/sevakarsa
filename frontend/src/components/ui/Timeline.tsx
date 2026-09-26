import type { LogEntry } from "@/domain";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/format";
import { Icon } from "./Icon";

/** Garis waktu vertikal dari daftar kejadian (terlama di atas). */
export function Timeline({ entries }: { entries: LogEntry[] }) {
  const sorted = [...entries].sort((a, b) => a.ts - b.ts);
  return (
    <div className="flex flex-col">
      {sorted.map((entry, i) => {
        const last = i === sorted.length - 1;
        return (
          <div key={`${entry.ts}-${i}`} className="relative flex gap-3.5 pb-4">
            {!last && <span className="absolute top-[26px] bottom-0 left-[11px] w-0.5 bg-line" />}
            <div
              className={cn(
                "z-1 flex size-6 flex-none items-center justify-center rounded-full text-[13px]",
                last ? "bg-forest-900 text-lime" : "bg-leaf-500 text-white",
              )}
            >
              <Icon name={last ? "point" : "check"} />
            </div>
            <div>
              <div className="font-semibold">{entry.text}</div>
              <div className="text-[11px] text-muted">{formatDateTime(entry.ts)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
