type ClassValue = string | false | null | undefined;

/** Gabungkan class Tailwind, mengabaikan nilai falsy. */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
