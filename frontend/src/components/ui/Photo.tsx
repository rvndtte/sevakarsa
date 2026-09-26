import { cn } from "@/lib/cn";

const PALETTES = [
  ["#CFE3D6", "#6C9A7C", "#3F6B54", "#22432F"],
  ["#D8E6EE", "#7FA58F", "#4B7A62", "#27483A"],
  ["#EADFC6", "#8FB39B", "#5C8A70", "#2F5442"],
  ["#C9DCE6", "#6F9C86", "#3A6650", "#1F3F30"],
] as const;

const hashOf = (seed: string): number => {
  let h = 0;
  for (const c of String(seed)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
};

interface PhotoProps {
  /** Seed menentukan palet dan posisi, sehingga gambar konsisten per item. */
  seed: string;
  className?: string;
}

/** Ilustrasi desa datar sebagai pengganti foto. */
export function Photo({ seed, className }: PhotoProps) {
  const h = hashOf(seed);
  const p = PALETTES[h % PALETTES.length];
  const o = h % 30;
  return (
    <div className={cn("flex-none overflow-hidden rounded-xl bg-[#cfe3d6]", className)}>
      <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice" className="block size-full">
        <rect width="200" height="120" fill={p[0]} />
        <circle cx={150 + o / 3} cy="28" r="12" fill="#F6E7A8" opacity=".8" />
        <ellipse cx={30 + o} cy="105" rx="110" ry="60" fill={p[1]} />
        <ellipse cx={170 - o} cy="118" rx="120" ry="62" fill={p[2]} />
        <ellipse cx="90" cy="150" rx="150" ry="50" fill={p[3]} />
        <rect x={60 + o} y="88" width="14" height="9" rx="2" fill="#C97A56" />
        <rect x={105 + o / 2} y="96" width="16" height="10" rx="2" fill="#D08A5F" />
      </svg>
    </div>
  );
}
