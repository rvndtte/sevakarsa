"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Icon } from "./Icon";

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  /** Label tombol kembali; jika diisi, tombol memanggil history.back(). */
  back?: string;
}

export function PageHeader({ title, subtitle, actions, back }: PageHeaderProps) {
  const router = useRouter();
  return (
    <div className="mb-[22px] flex flex-wrap items-start justify-between gap-4">
      <div>
        {back && (
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-1.5 inline-flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-ink"
          >
            <Icon name="arrow-left" /> {back}
          </button>
        )}
        <h1 className="font-display text-[30px] leading-[1.2] font-semibold">{title}</h1>
        {subtitle && <div className="mt-0.5 text-muted">{subtitle}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  );
}
