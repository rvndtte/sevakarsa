import { STATUS_META, type AnyStatus, type Tone } from "@/domain";
import { cn } from "@/lib/cn";
import { TONE_CLASSES } from "./tone";
import type { ReactNode } from "react";

interface TagProps {
  tone?: Tone;
  large?: boolean;
  className?: string;
  children: ReactNode;
}

export function Tag({ tone = "green", large, className, children }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-semibold whitespace-nowrap",
        large ? "px-3.5 py-[5px] text-xs" : "px-2.5 py-[3px] text-[11px]",
        TONE_CLASSES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Tag berwarna untuk status kebutuhan, kerja sama, kelompok, atau akun. */
export function StatusTag({
  status,
  large,
}: {
  status: AnyStatus;
  large?: boolean;
}) {
  const meta = STATUS_META[status];
  return (
    <Tag tone={meta.tone} large={large}>
      {meta.label}
    </Tag>
  );
}
