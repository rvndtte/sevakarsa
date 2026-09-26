import type { ReactNode } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";

export interface RoleOption<T extends string> {
  value: T;
  icon: string;
  label: string;
  hint?: string;
}

interface RolePickerProps<T extends string> {
  options: readonly RoleOption<T>[];
  value: T;
  onChange: (value: T) => void;
  columns?: 2 | 3;
  children?: ReactNode;
}

/** Pilihan peran berbentuk kartu (radio). */
export function RolePicker<T extends string>({ options, value, onChange, columns = 2 }: RolePickerProps<T>) {
  return (
    <div className={cn("mb-4 grid gap-2.5", columns === 3 ? "grid-cols-3" : "grid-cols-2")} role="radiogroup">
      {options.map((o) => (
        <label
          key={o.value}
          className={cn(
            "flex cursor-pointer items-center gap-2.5 rounded-[14px] border-[1.5px] bg-white p-3",
            value === o.value ? "border-forest-900 bg-[#f1f6ec]" : "border-line",
          )}
        >
          <input
            type="radio"
            name="role"
            value={o.value}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
            className="sr-only"
          />
          <Icon name={o.icon} className="text-xl" />
          <div>
            <div className="font-semibold">{o.label}</div>
            {o.hint && <div className="text-[11px] text-muted">{o.hint}</div>}
          </div>
        </label>
      ))}
    </div>
  );
}
