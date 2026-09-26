import { cn } from "@/lib/cn";

interface IconProps {
  /** Nama ikon Tabler tanpa prefix, mis. "arrow-right". */
  name: string;
  className?: string;
}

export function Icon({ name, className }: IconProps) {
  return <i aria-hidden className={cn("ti", `ti-${name}`, className)} />;
}
