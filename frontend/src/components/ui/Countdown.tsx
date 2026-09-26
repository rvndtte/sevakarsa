"use client";

import { useNow } from "@/hooks/useNow";
import { formatRemaining } from "@/lib/format";

/** Sisa waktu menuju `end` (timestamp aplikasi), diperbarui tiap detik. */
export function Countdown({ end }: { end: number }) {
  const time = useNow(1000);
  return <span suppressHydrationWarning>{formatRemaining(end - time)}</span>;
}
