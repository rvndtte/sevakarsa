import { cn } from "@/lib/cn";

interface TabsProps<T extends string> {
  tabs: readonly { id: T; label: string }[];
  active: T;
  onChange: (id: T) => void;
}

export function Tabs<T extends string>({ tabs, active, onChange }: TabsProps<T>) {
  return (
    <div className="mb-4 flex gap-1 border-b border-line">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "-mb-px border-b-2 px-4 py-2.5 text-[13px] font-semibold",
            active === tab.id
              ? "border-forest-900 text-ink"
              : "border-transparent text-muted",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
