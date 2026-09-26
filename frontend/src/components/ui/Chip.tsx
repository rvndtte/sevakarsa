import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  count?: number;
}

/** Tombol filter berbentuk pil. */
export function Chip({ active, count, className, children, ...props }: ChipProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-[7px] text-xs font-semibold transition",
        active
          ? "border-forest-900 bg-forest-900 text-ondark"
          : "border-line bg-white hover:border-[#c9d4cc]",
        className,
      )}
      {...props}
    >
      {children}
      {count !== undefined && <span className="font-medium opacity-60">{count}</span>}
    </button>
  );
}

export function ChipRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("flex flex-wrap gap-2", className)}>{children}</div>;
}
