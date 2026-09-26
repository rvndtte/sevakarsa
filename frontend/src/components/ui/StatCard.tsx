import type { ReactNode } from "react";
import { Card } from "./Card";
import { IconBox } from "./IconBox";
import type { Tone } from "./tone";

interface StatCardProps {
  icon: string;
  tone?: Tone;
  value: ReactNode;
  label: string;
}

export function StatCard({ icon, tone, value, label }: StatCardProps) {
  return (
    <Card padding="none" className="flex items-center gap-3.5 px-[18px] py-4">
      <IconBox icon={icon} tone={tone} />
      <div>
        <div className="font-display text-[26px] leading-none font-semibold">{value}</div>
        <div className="mt-1 text-xs text-muted">{label}</div>
      </div>
    </Card>
  );
}
