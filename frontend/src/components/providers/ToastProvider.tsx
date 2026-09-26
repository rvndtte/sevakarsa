"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

type ToastKind = "success" | "error";
interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);
const DURATION_MS = 3800;
let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((kind: ToastKind, message: string) => {
    const id = nextId++;
    setItems((prev) => [...prev, { id, kind, message }]);
    window.setTimeout(
      () => setItems((prev) => prev.filter((t) => t.id !== id)),
      DURATION_MS,
    );
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      success: (message) => push("success", message),
      error: (message) => push("error", message),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed top-5 right-5 z-200 flex flex-col gap-2.5">
        {items.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              "flex max-w-[360px] animate-slide-in items-center gap-2.5 rounded-[14px] px-[18px] py-3 font-medium text-ondark shadow-[0_8px_30px_rgba(0,0,0,0.25)]",
              t.kind === "error" ? "bg-brick-700" : "bg-forest-900",
            )}
          >
            <Icon
              name={t.kind === "error" ? "alert-circle" : "circle-check"}
              className={cn("text-lg", t.kind === "error" ? "text-white" : "text-lime")}
            />
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast harus dipakai di dalam <ToastProvider>");
  return ctx;
}
