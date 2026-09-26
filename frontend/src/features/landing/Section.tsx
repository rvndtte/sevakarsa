"use client";

import type { ReactNode } from "react";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/cn";

const GLOWS = {
  red: "right-[-160px] top-10 bg-[radial-gradient(closest-side,rgba(217,90,70,0.2),transparent)]",
  lime: "left-[-200px] top-[120px] bg-[radial-gradient(closest-side,rgba(216,236,110,0.16),transparent)]",
  blue: "right-[-180px] top-20 bg-[radial-gradient(closest-side,rgba(59,126,168,0.2),transparent)] [animation-delay:-5s]",
  green: "left-[-160px] top-10 bg-[radial-gradient(closest-side,rgba(47,143,91,0.3),transparent)] [animation-delay:-9s]",
} as const;

interface SectionProps {
  id: string;
  kicker: string;
  glow?: keyof typeof GLOWS;
  children: ReactNode;
  className?: string;
}

/** Bagian landing dengan garis pembuka, cahaya ambient, dan kicker. */
export function Section({ id, kicker, glow, children, className }: SectionProps) {
  const [ref, seen] = useInView<HTMLElement>({ threshold: 0 });
  return (
    <section
      id={id}
      ref={ref}
      className={cn("relative mx-auto max-w-[1240px] px-5 pt-12 text-ondark lg:px-10 lg:pt-[88px]", className)}
    >
      {glow && (
        <div
          aria-hidden
          className={cn("pointer-events-none absolute z-0 size-[640px] animate-orb rounded-full blur-[40px] motion-reduce:animate-none", GLOWS[glow])}
        />
      )}
      <span
        aria-hidden
        className={cn(
          "absolute top-0 right-5 left-5 h-px origin-center bg-linear-to-r from-transparent via-lime/35 to-transparent transition-transform duration-[1400ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] lg:right-10 lg:left-10",
          seen ? "scale-x-100" : "scale-x-0",
        )}
      />
      <div className="relative z-1">
        <span className="mb-2.5 inline-block text-xs font-bold tracking-[0.1em] text-lime uppercase">{kicker}</span>
        {children}
      </div>
    </section>
  );
}
