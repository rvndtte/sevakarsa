/* Fungsi matematika kecil untuk animasi dan pembangkit angka acak deterministik. */

export const clamp = (x: number, a = 0, b = 1): number => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, k: number): number => a + (b - a) * k;

/** Posisi p di rentang [a, b] dinormalisasi ke 0–1. */
export const seg = (p: number, a: number, b: number): number => clamp((p - a) / (b - a));

/** Smoothstep. */
export const ease = (x: number): number => x * x * (3 - 2 * x);

export function easeOutBack(x: number, overshoot = 1.6): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const c3 = overshoot + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + overshoot * Math.pow(x - 1, 2);
}

/** PRNG deterministik agar dunia 3D selalu sama di setiap muat. */
export function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const hash = (x: number, y: number, z: number): number => {
  const s = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
  return s - Math.floor(s);
};
