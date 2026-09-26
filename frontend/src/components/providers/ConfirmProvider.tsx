"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface ConfirmOptions {
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  /** Tombol konfirmasi berwarna merah untuk aksi yang merusak. */
  danger?: boolean;
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

interface Pending extends ConfirmOptions {
  resolve: (ok: boolean) => void;
}

const ConfirmContext = createContext<ConfirmFn | null>(null);

/** Dialog konfirmasi berbasis Promise: `if (await confirm({...})) { ... }`. */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<Pending | null>(null);

  const confirm = useCallback<ConfirmFn>(
    (options) => new Promise<boolean>((resolve) => setPending({ ...options, resolve })),
    [],
  );

  const close = (ok: boolean) => {
    pending?.resolve(ok);
    setPending(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal
        open={!!pending}
        onClose={() => close(false)}
        title={pending?.title}
        actions={
          <>
            <Button variant="outline" onClick={() => close(false)}>
              Batal
            </Button>
            <Button variant={pending?.danger ? "danger" : "primary"} onClick={() => close(true)}>
              {pending?.confirmLabel ?? "Ya, lanjutkan"}
            </Button>
          </>
        }
      >
        <p className="text-muted">{pending?.message}</p>
      </Modal>
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm harus dipakai di dalam <ConfirmProvider>");
  return ctx;
}
