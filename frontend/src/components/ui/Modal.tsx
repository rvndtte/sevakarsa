"use client";

import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children?: ReactNode;
  /** Baris tombol di bagian bawah. */
  actions?: ReactNode;
  wide?: boolean;
}

export function Modal({ open, onClose, title, children, actions, wide }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-100 flex animate-fade items-center justify-center bg-forest-950/55 p-5"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={cn(
          "max-h-[90vh] w-full overflow-auto rounded-[20px] bg-white p-[26px] shadow-[0_20px_60px_rgba(0,0,0,0.3)]",
          wide ? "max-w-[680px]" : "max-w-[520px]",
        )}
      >
        <h3 className="mb-1.5 font-display text-[22px] font-semibold">{title}</h3>
        <div>{children}</div>
        {actions && <div className="mt-5 flex justify-end gap-2.5">{actions}</div>}
      </div>
    </div>
  );
}
