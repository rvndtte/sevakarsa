import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type CardVariant = "default" | "soft" | "warn" | "muted" | "danger";
type CardPadding = "none" | "tight" | "normal";

const VARIANTS: Record<CardVariant, string> = {
  default: "bg-white border-line",
  soft: "bg-[#f1f6ec] border-[#d7e6cd]",
  warn: "bg-honey-100 border-[#f0d9a2]",
  muted: "bg-cream-200 border-line",
  danger: "bg-brick-100 border-[#f0c2bc]",
};

const PADDING: Record<CardPadding, string> = {
  none: "",
  tight: "p-3.5",
  normal: "p-5",
};

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  /** Kartu yang bisa diklik: kursor dan efek hover. */
  interactive?: boolean;
  /** Tampil abu-abu untuk kebutuhan yang terkunci. */
  locked?: boolean;
}

export function Card({
  variant = "default",
  padding = "normal",
  interactive,
  locked,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-card border",
        VARIANTS[variant],
        PADDING[padding],
        interactive &&
          "cursor-pointer transition hover:-translate-y-px hover:border-[#c9d4cc] hover:shadow-[0_6px_20px_rgba(16,41,29,0.08)]",
        locked && "bg-[#f1f0ea] opacity-60 grayscale",
        padding === "none" && "overflow-hidden",
        className,
      )}
      {...props}
    />
  );
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
  /** Hilangkan jarak bawah (untuk judul dengan aksi di sebelahnya). */
  flush?: boolean;
}

export function CardTitle({ children, className, flush }: CardTitleProps) {
  return (
    <h3
      className={cn(
        "font-display text-[17px] font-semibold",
        !flush && "mb-3",
        className,
      )}
    >
      {children}
    </h3>
  );
}
