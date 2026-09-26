import { cn } from "@/lib/cn";

interface ProgressBarProps {
  /** 0–100 */
  value: number;
  thin?: boolean;
  className?: string;
}

export function ProgressBar({ value, thin, className }: ProgressBarProps) {
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("overflow-hidden rounded-full bg-cream-200", thin ? "h-[5px]" : "h-2", className)}
    >
      <div
        className="h-full rounded-full bg-leaf-500 transition-[width] duration-400"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
