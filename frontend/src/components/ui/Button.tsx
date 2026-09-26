import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant =
  | "primary"
  | "lime"
  | "outline"
  | "outlineDark"
  | "danger"
  | "green"
  | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full border border-transparent font-semibold whitespace-nowrap transition disabled:pointer-events-none disabled:opacity-45";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-forest-900 text-ondark hover:bg-forest-700",
  lime: "bg-lime text-forest-950 hover:bg-lime-soft",
  outline: "border-line bg-white text-ink hover:bg-cream-100",
  outlineDark: "border-[#6e8a79] bg-transparent text-ondark hover:bg-forest-800",
  danger: "border-[#f0c2bc] bg-white text-brick-700 hover:bg-brick-100",
  green: "bg-leaf-500 text-ondark hover:bg-leaf-700",
  ghost: "bg-transparent text-ink hover:bg-cream-200",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "px-3.5 py-1.5 text-xs",
  md: "px-5 py-2.5 text-[13px]",
  lg: "px-[26px] py-[13px] text-sm",
};

interface StyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  className?: string;
}

/** Class tombol, dipakai juga oleh <a>/<Link> yang tampil seperti tombol. */
export function buttonClass({
  variant = "primary",
  size = "md",
  block,
  className,
}: StyleProps = {}): string {
  return cn(BASE, VARIANTS[variant], SIZES[size], block && "w-full", className);
}

type ButtonProps = StyleProps & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  variant,
  size,
  block,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClass({ variant, size, block, className })}
      {...props}
    />
  );
}

interface ButtonLinkProps extends StyleProps {
  href: string;
  children: ReactNode;
  external?: boolean;
}

export function ButtonLink({
  href,
  children,
  external,
  variant,
  size,
  block,
  className,
}: ButtonLinkProps) {
  const cls = buttonClass({ variant, size, block, className });
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}
