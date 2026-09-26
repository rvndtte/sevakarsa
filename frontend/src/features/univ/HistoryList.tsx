import type { ProgramHistory } from "@/domain";
import { IconBox, ListItem } from "@/components/ui";

/** Daftar program KKN yang pernah diambil universitas. */
export function HistoryList({ items, limit }: { items: ProgramHistory[]; limit?: number }) {
  if (!items.length) return <span className="text-xs text-muted">Belum ada program tercatat.</span>;
  return (
    <div className="flex flex-col gap-2.5">
      {items.slice(0, limit ?? items.length).map((h) => (
        <ListItem key={h.id} className="px-3 py-2.5">
          <IconBox icon="circle-check" size="sm" />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold">
              {h.title} <span className="text-muted">· {h.year}</span>
            </div>
            <div className="text-[11px] text-muted">
              {h.desa} — {h.result}
            </div>
          </div>
        </ListItem>
      ))}
    </div>
  );
}
