import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/cn";

const CONTROL =
  "w-full rounded-xl border border-line bg-cream-50 px-3.5 py-[11px] text-ink outline-none transition focus:border-forest-600 focus:bg-white focus:ring-[3px] focus:ring-forest-600/15";

interface FieldProps {
  label?: string;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** Pembungkus label + kontrol + petunjuk. */
export function Field({ label, hint, className, children }: FieldProps) {
  return (
    <div className={cn("mb-3.5 flex flex-col gap-1.5", className)}>
      {label && <label className="text-[13px] font-semibold">{label}</label>}
      {children}
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </div>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(CONTROL, className)} {...props} />;
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(CONTROL, className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(CONTROL, "min-h-[92px] resize-y", className)} {...props} />;
}

/** Kotak pencarian dengan ikon di sisi kiri. */
export function SearchBox({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex items-center gap-2.5 rounded-[14px] border border-line bg-white px-4">
      <i aria-hidden className="ti ti-search text-muted" />
      <input
        type="text"
        className={cn("w-full bg-transparent py-[13px] outline-none", className)}
        {...props}
      />
    </div>
  );
}

interface CheckPillProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  type?: "checkbox" | "radio";
  children: ReactNode;
}

/** Pilihan berbentuk pil (checkbox/radio) yang berubah warna saat terpilih. */
export function CheckPill({ type = "checkbox", children, className, ...props }: CheckPillProps) {
  return (
    <label
      className={cn(
        "inline-flex cursor-pointer items-center gap-2 rounded-full border border-line bg-white px-3.5 py-2 text-xs font-semibold select-none has-checked:border-leaf-500 has-checked:bg-[#f1f6ec]",
        className,
      )}
    >
      <input
        type={type}
        className={cn("accent-forest-700", type === "radio" && "sr-only")}
        {...props}
      />
      {children}
    </label>
  );
}
