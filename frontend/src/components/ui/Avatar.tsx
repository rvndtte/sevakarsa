import { cn } from "@/lib/cn";
import { initials } from "@/lib/format";

interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  /** Universitas memakai warna hijau lebih tua. */
  variant?: "desa" | "univ";
  className?: string;
}

const SIZES = {
  sm: "size-7 text-[11px]",
  md: "size-9 text-[13px]",
  lg: "size-[72px] text-2xl border-4 border-white",
};

export function Avatar({ name, size = "md", variant = "desa", className }: AvatarProps) {
  return (
    <div
      className={cn(
        "flex flex-none items-center justify-center rounded-full font-bold text-white",
        variant === "univ" ? "bg-forest-700" : "bg-forest-600",
        SIZES[size],
        className,
      )}
    >
      {initials(name)}
    </div>
  );
}
