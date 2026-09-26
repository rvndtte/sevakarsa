"use client";

import { useCallback } from "react";
import { DomainError } from "@/domain";
import { useToast } from "@/components/providers/ToastProvider";

export type ActionResult<T> = { ok: true; value: T } | { ok: false };

/**
 * Menjalankan aksi domain dengan penanganan kesalahan seragam:
 * DomainError → toast merah; sukses → toast hijau (jika ada pesan).
 */
export function useAction() {
  const toast = useToast();
  return useCallback(
    <T,>(action: () => T, successMessage?: string): ActionResult<T> => {
      try {
        const value = action();
        if (successMessage) toast.success(successMessage);
        return { ok: true, value };
      } catch (error) {
        if (error instanceof DomainError) toast.error(error.message);
        else {
          console.error(error);
          toast.error("Terjadi kesalahan tak terduga.");
        }
        return { ok: false };
      }
    },
    [toast],
  );
}
