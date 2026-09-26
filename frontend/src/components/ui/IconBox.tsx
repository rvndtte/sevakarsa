import { cn } from "@/lib/cn";
import { Icon } from "./Icon";
import { TONE_CLASSES, type Tone } from "./tone";

interface IconBoxProps {
  icon: string;
  tone?: Tone;
  size?: "sm" | "md";
  round?: boolean;
  className?: string;
}

export function IconBox({
  icon,
  tone = "green",
  size = "md",
  round,
  className,
}: IconBoxProps) {
  return (
    <span
      className={cn(
        "flex flex-none items-center justify-center",
        size === "md" ? "size-11 text-[21px]" : "size-[34px] text-base",
        round ? "rounded-full" : "rounded-xl",
        TONE_CLASSES[tone],
        className,
      )}
    >
      <Icon name={icon} />
    </span>
  );
}
