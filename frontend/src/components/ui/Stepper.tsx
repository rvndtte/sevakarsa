import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

interface StepperProps {
  steps: readonly string[];
  /** Indeks langkah saat ini (0-based). */
  current: number;
  /** Seluruh alur selesai: langkah saat ini ikut ditandai centang. */
  completed?: boolean;
  /** Proses berhenti (ditolak/kedaluwarsa): langkah saat ini tidak disorot. */
  stopped?: boolean;
}

export function Stepper({ steps, current, completed, stopped }: StepperProps) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {steps.map((label, i) => {
        const done = i < current || (i === current && completed);
        const active = i === current && !done && !stopped;
        return (
          <div key={label} className="contents">
            {i > 0 && (
              <span
                className={cn(
                  "h-0.5 min-w-6 flex-1",
                  i <= current && !stopped ? "bg-leaf-500" : "bg-line",
                )}
              />
            )}
            <div
              className={cn(
                "flex items-center gap-2 text-[13px] font-semibold",
                done || active ? "text-ink" : "text-muted",
              )}
            >
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-full text-xs",
                  done
                    ? "bg-leaf-500 text-white"
                    : active
                      ? "bg-forest-900 text-lime"
                      : "bg-cream-200",
                )}
              >
                {done ? <Icon name="check" /> : i + 1}
              </span>
              {label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
