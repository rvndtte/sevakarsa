import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Label huruf kapital kecil di atas nilai. */
export function Label({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mb-1 text-eyebrow text-muted", className)}>{children}</div>;
}

/** Baris "nama ..... nilai". */
export function KeyValue({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex justify-between gap-3 py-1.5">
      <span className="text-muted">{label}</span>
      {typeof children === "string" || typeof children === "number" ? (
        <b>{children}</b>
      ) : (
        children
      )}
    </div>
  );
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn("my-3.5 h-px bg-line", className)} />;
}

/** Daftar vertikal dengan jarak antar item. */
export function Stack({
  children,
  gap = 3,
  className,
}: {
  children: ReactNode;
  gap?: 2 | 3 | 4;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col", gap === 2 ? "gap-2" : gap === 3 ? "gap-3" : "gap-4", className)}>
      {children}
    </div>
  );
}

/** Baris item dalam daftar (latar krem, bisa diklik). */
export function ListItem({
  children,
  className,
  interactive,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-3.5 rounded-xl border border-transparent bg-cream-50 px-3.5 py-3",
        interactive && "cursor-pointer hover:border-line hover:bg-white",
        className,
      )}
    >
      {children}
    </div>
  );
}
