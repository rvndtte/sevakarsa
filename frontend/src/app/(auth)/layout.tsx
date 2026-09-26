import type { ReactNode } from "react";
import { AuthPanel } from "@/features/auth/AuthPanel";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <AuthPanel />
      <div className="mx-auto flex w-full max-w-[620px] flex-col justify-center px-5 py-11 lg:px-14">
        {children}
      </div>
    </div>
  );
}
