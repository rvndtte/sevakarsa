"use client";

import Link from "next/link";
import type { User } from "@/domain";
import { ButtonLink, Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { homeFor, routes } from "@/lib/routes";
import { SECTIONS } from "./content";
import { scrollToSection } from "./useLandingScroll";

function Brand({ className }: { className?: string }) {
  return (
    <Link href={routes.home} className={cn("flex items-center gap-2 font-display text-xl font-semibold text-ondark", className)}>
      <Icon name="leaf" className="text-[22px] text-lime" /> SevaKarsa
    </Link>
  );
}

function SectionLinks({ activeId, className }: { activeId?: string; className?: string }) {
  return (
    <div className={cn("hidden gap-0.5 text-sm font-medium lg:flex", className)}>
      {SECTIONS.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => scrollToSection(s.id)}
          className={cn(
            "rounded-full px-3 py-1.5 text-[#c9d4cc] transition hover:text-lime",
            activeId === s.id && "bg-forest-800 text-lime",
          )}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

/** Navigasi di dalam hero. */
export function HeroNav({ me }: { me: User | null }) {
  return (
    <div className="z-3 flex w-full items-center justify-between pt-2 text-ondark">
      <Brand />
      <SectionLinks />
      <div className="flex items-center gap-2.5">
        {me ? (
          <ButtonLink href={homeFor(me.role)} variant="lime" size="sm">Dasbor</ButtonLink>
        ) : (
          <>
            <ButtonLink href={routes.login} variant="outlineDark" size="sm">Masuk</ButtonLink>
            <ButtonLink href={routes.register} variant="lime" size="sm">Daftar</ButtonLink>
          </>
        )}
      </div>
    </div>
  );
}

/** Navigasi melayang berbentuk pil yang muncul setelah hero terlewati. */
export function FloatingNav({ me, show, activeId }: { me: User | null; show: boolean; activeId: string }) {
  return (
    <div
      className={cn(
        "fixed top-3 left-1/2 z-110 flex w-[min(880px,calc(100%-24px))] items-center justify-between gap-5 rounded-full border border-ondark/12 bg-forest-900/80 py-2 pr-2.5 pl-[22px] text-ondark shadow-[0_10px_30px_rgba(11,31,22,0.28)] backdrop-blur-[14px] transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
        show ? "-translate-x-1/2 translate-y-0 opacity-100" : "pointer-events-none -translate-x-1/2 -translate-y-[160%] opacity-0",
      )}
    >
      <Brand />
      <SectionLinks activeId={activeId} />
      <ButtonLink href={me ? homeFor(me.role) : routes.register} variant="lime" size="sm">
        {me ? "Dasbor" : "Daftar"}
      </ButtonLink>
    </div>
  );
}
