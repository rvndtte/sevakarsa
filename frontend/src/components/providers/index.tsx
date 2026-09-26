"use client";

import type { ReactNode } from "react";
import { ConfirmProvider } from "./ConfirmProvider";
import { StoreProvider } from "./StoreProvider";
import { ToastProvider } from "./ToastProvider";
import { DemoPanel } from "@/components/layout/DemoPanel";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <StoreProvider>
          {children}
          <DemoPanel />
        </StoreProvider>
      </ConfirmProvider>
    </ToastProvider>
  );
}
