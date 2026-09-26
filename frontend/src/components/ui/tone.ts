import type { Tone } from "@/domain";

/** Pasangan warna latar + teks untuk setiap nada semantik. */
export const TONE_CLASSES: Record<Tone, string> = {
  green: "bg-leaf-100 text-leaf-700",
  amber: "bg-honey-100 text-honey-700",
  blue: "bg-lake-100 text-lake-700",
  purple: "bg-plum-100 text-plum-700",
  red: "bg-brick-100 text-brick-700",
  gray: "bg-cream-200 text-muted",
};

export type { Tone };
