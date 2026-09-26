"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon, IconBox } from "@/components/ui";
import { useCountUp } from "@/hooks/useCountUp";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/cn";
import { ThreeCanvas } from "@/three/ThreeCanvas";
import { sceneInputs } from "@/three/inputs";
import { createProblemScene } from "@/three/scenes/ProblemScene";
import { PROBLEM_CARDS, PROBLEM_SLIDES, type StatSlide } from "./content";
import { Reveal, SplitHeading } from "./motion";
import { Section } from "./Section";

const AUTOPLAY_MS = 7000;
const createScene = createProblemScene(() => sceneInputs.problemSlide);

function SlideTag({ icon, children }: { icon: string; children: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-lime/12 px-3.5 py-1.5 text-[13px] font-semibold text-lime">
      <Icon name={icon} /> {children}
    </div>
  );
}

function StatContent({ slide, active }: { slide: StatSlide; active: boolean }) {
  const shown = useCountUp(slide.value, slide.decimals, active);
  return (
    <>
      <SlideTag icon={slide.icon}>{slide.tag}</SlideTag>
      <div className="mt-[18px] font-display text-[clamp(64px,9vw,124px)] leading-none font-semibold tracking-[-0.03em] text-lime tabular-nums [text-shadow:0_0_40px_rgba(216,236,110,0.25)]">
        {shown}
      </div>
      <div className="mt-1.5 font-display text-xl leading-[1.2] text-ondark lg:text-2xl">{slide.label}</div>
      <p className="mt-4 max-w-[470px] text-[15.5px] leading-[1.65] text-[#a9bbaf]">{slide.body}</p>
      <small className="mt-4 flex max-w-[470px] items-start gap-1.5 text-[11.5px] leading-normal text-[#7f9587]">
        <Icon name="info-circle" /> {slide.source}
      </small>
    </>
  );
}

function CardsContent() {
  return (
    <>
      <SlideTag icon="unlink">Mengapa belum tersalurkan?</SlideTag>
      <h3 className="my-4 font-display text-[28px] leading-[1.15] font-semibold text-ondark">
        Jembatan antara desa dan kampus masih putus
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {PROBLEM_CARDS.map((card) => (
          <div
            key={card.title}
            className="flex min-h-[132px] flex-col justify-between gap-3.5 rounded-[18px] border border-ondark/9 bg-ondark/5 p-[18px] transition hover:-translate-y-[3px] hover:border-lime/40 hover:bg-ondark/8 max-sm:min-h-0 max-sm:flex-row max-sm:items-center"
          >
            <IconBox icon={card.icon} tone={card.tone} size="sm" />
            <b className="text-[15.5px] leading-[1.3]">{card.title}</b>
          </div>
        ))}
      </div>
    </>
  );
}

/** Carousel permasalahan (statistik + kartu) dengan scene 3D yang berubah per slide. */
export function ProblemSection() {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const hoverRef = useRef(false);
  const swipeStart = useRef<number | null>(null);
  const total = PROBLEM_SLIDES.length;

  const go = useCallback((i: number) => setIndex(((i % total) + total) % total), [total]);

  useEffect(() => {
    sceneInputs.problemSlide = index;
  }, [index]);

  // Putar otomatis hanya saat carousel terlihat, tidak disorot, dan gerak tidak dikurangi.
  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => {
      const rect = stageRef.current?.getBoundingClientRect();
      const inView = !!rect && rect.top < window.innerHeight * 0.7 && rect.bottom > window.innerHeight * 0.3;
      if (inView && !hoverRef.current) setIndex((i) => (i + 1) % total);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [reduced, total, index]);

  return (
    <div className="relative">
      <Section id="problem" kicker="Permasalahan" glow="red" className="pb-0">
        <SplitHeading>Potensi besar, belum tersalurkan dengan baik</SplitHeading>
        <div
          ref={stageRef}
          className="mt-7 grid items-center gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-8"
          onPointerEnter={() => (hoverRef.current = true)}
          onPointerLeave={() => (hoverRef.current = false)}
          onPointerDown={(e) => (swipeStart.current = e.clientX)}
          onPointerUp={(e) => {
            if (swipeStart.current !== null && Math.abs(e.clientX - swipeStart.current) > 50) {
              go(index + (e.clientX < swipeStart.current ? 1 : -1));
            }
            swipeStart.current = null;
          }}
        >
          <div>
            <div className="grid min-h-[420px] lg:min-h-[390px]">
              {PROBLEM_SLIDES.map((slide, i) => (
                <div
                  key={i}
                  className={cn(
                    "self-center transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.2,0.7,0.2,1)] [grid-area:1/1] motion-reduce:transition-none",
                    i === index
                      ? "pointer-events-auto translate-x-0 opacity-100"
                      : cn("pointer-events-none opacity-0", i < index ? "-translate-x-12" : "translate-x-12"),
                  )}
                >
                  {slide.kind === "stat" ? <StatContent slide={slide} active={i === index} /> : <CardsContent />}
                </div>
              ))}
            </div>
            <div className="relative mt-[22px] flex items-center gap-3.5 pb-3">
              <button type="button" aria-label="Sebelumnya" onClick={() => go(index - 1)} className="flex size-10 items-center justify-center rounded-full border border-ondark/20 bg-ondark/5 text-lg text-ondark transition hover:scale-[1.08] hover:bg-lime hover:text-forest-950">
                <Icon name="arrow-left" />
              </button>
              <div className="flex gap-2">
                {PROBLEM_SLIDES.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Slide ${i + 1}`}
                    onClick={() => go(i)}
                    className={cn("h-2.5 rounded-full transition-all duration-300", i === index ? "w-8 bg-lime" : "w-2.5 bg-ondark/25")}
                  />
                ))}
              </div>
              <button type="button" aria-label="Berikutnya" onClick={() => go(index + 1)} className="flex size-10 items-center justify-center rounded-full border border-ondark/20 bg-ondark/5 text-lg text-ondark transition hover:scale-[1.08] hover:bg-lime hover:text-forest-950">
                <Icon name="arrow-right" />
              </button>
              <span className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden rounded-sm bg-ondark/10">
                <i key={index} className="block h-full origin-left animate-pfill bg-lime motion-reduce:animate-none" />
              </span>
            </div>
          </div>
          <div className="bg-scene-panel relative order-first h-[340px] overflow-hidden rounded-[28px] border border-ondark/9 shadow-[0_30px_80px_rgba(0,0,0,0.35)] lg:order-none lg:h-[540px]">
            <ThreeCanvas create={createScene} className="size-full" />
          </div>
        </div>
      </Section>
      <Reveal className="mx-auto -mt-10 flex flex-col items-center gap-2 bg-linear-to-b from-transparent to-forest-900 to-70% px-5 pt-[120px] pb-10 text-center font-display text-[22px] text-ondark">
        <b className="max-w-[520px] font-semibold">Bagaimana SevaKarsa menjawabnya?</b>
        <Icon name="arrow-down" className="animate-bob text-[26px] text-lime motion-reduce:animate-none" />
      </Reveal>
    </div>
  );
}
