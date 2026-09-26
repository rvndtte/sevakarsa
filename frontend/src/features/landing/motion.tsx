"use client";

import { Fragment, useEffect, useState, type HTMLAttributes, type ReactNode } from "react";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/cn";

type RevealVariant = "up" | "left" | "right" | "zoom";

const HIDDEN: Record<RevealVariant, string> = {
  up: "translate-y-7",
  left: "-translate-x-12",
  right: "translate-x-12",
  zoom: "translate-y-[26px] scale-[0.94]",
};

interface RevealProps extends HTMLAttributes<HTMLDivElement> {
  variant?: RevealVariant;
  /** Jeda (ms) agar item dalam satu grup muncul berurutan. */
  delay?: number;
}

/** Muncul (fade + geser) saat masuk viewport. */
export function Reveal({ variant = "up", delay = 0, className, style, children, ...props }: RevealProps) {
  const [ref, seen] = useInView<HTMLDivElement>();
  // Setelah animasi masuk selesai, jeda dilepas supaya efek hover tetap responsif.
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    if (!seen) return;
    const id = window.setTimeout(() => setSettled(true), delay + 900);
    return () => window.clearTimeout(id);
  }, [seen, delay]);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-[opacity,transform,box-shadow,border-color] duration-[800ms] ease-[cubic-bezier(0.2,0.7,0.2,1)]",
        seen ? "translate-x-0 translate-y-0 scale-100 opacity-100" : cn("opacity-0", HIDDEN[variant]),
        settled && "duration-300",
        className,
      )}
      style={{ transitionDelay: settled ? "0ms" : `${delay}ms`, ...style }}
      {...props}
    >
      {children}
    </div>
  );
}

/** Judul yang muncul kata demi kata, dengan garis aksen di bawahnya. */
export function SplitHeading({ children, className }: { children: string; className?: string }) {
  const [ref, seen] = useInView<HTMLHeadingElement>();
  return (
    <h2
      ref={ref}
      className={cn(
        "mb-2.5 max-w-[720px] font-display text-[30px] leading-[1.12] font-semibold tracking-[-0.01em] text-ondark lg:text-[40px]",
        "after:mt-3.5 after:block after:h-[3px] after:rounded after:bg-linear-to-r after:from-leaf-500 after:to-lime after:transition-[width] after:delay-[350ms] after:duration-[900ms] after:content-['']",
        seen ? "after:w-16" : "after:w-0",
        className,
      )}
    >
      {children.split(" ").map((word, i) => (
        <Fragment key={i}>
          <span className="-mb-[0.14em] inline-block overflow-hidden pb-[0.14em] align-bottom">
            <span
              className={cn(
                "inline-block transition-transform duration-[850ms] ease-[cubic-bezier(0.2,0.7,0.2,1)]",
                !seen && "translate-y-[115%]",
              )}
              style={{ transitionDelay: `${i * 70 + 120}ms` }}
            >
              {word}
            </span>
          </span>{" "}
        </Fragment>
      ))}
    </h2>
  );
}

/** Kartu dengan sorotan cahaya yang mengikuti kursor. */
export function SpotlightCard({ className, children, ...props }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      onPointerMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
        e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
      }}
      className={cn(
        "spotlight rounded-card border border-ondark/10 bg-ondark/[0.045] text-ondark backdrop-blur-[6px]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
