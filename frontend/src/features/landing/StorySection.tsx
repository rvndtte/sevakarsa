"use client";

import { useEffect, useRef, useState } from "react";
import { Icon, Tag } from "@/components/ui";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/cn";
import { clamp, seg } from "@/three/math";
import { ThreeCanvas } from "@/three/ThreeCanvas";
import { sceneInputs } from "@/three/inputs";
import { createStoryScene } from "@/three/scenes/StoryScene";
import { STORY_STEPS, STORY_STEP_PROGRESS } from "./content";

const createScene = createStoryScene(() => sceneInputs.storyProgress);
const SIDE = "left-5 lg:left-[max(52px,calc((100vw-1240px)/2))]";

/** Langkah aktif berdasarkan progres scroll. */
const stepAt = (p: number) => (p < 0.25 ? 0 : p < 0.5 ? 1 : p < 0.75 ? 2 : 3);

/** Alur kerja 3D yang berjalan mengikuti scroll (section setinggi ±4,6 layar dengan panel lengket). */
export function StorySection() {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const warmRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [noGL, setNoGL] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || noGL) return;
    let smoothed = 0;
    let last = performance.now();
    let visible = true;
    let frameId = 0;
    const observer = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    observer.observe(section);

    const loop = (now: number) => {
      frameId = requestAnimationFrame(loop);
      const delta = (now - last) / 1000;
      last = now;
      if (!visible || document.hidden) return;

      const rect = section.getBoundingClientRect();
      const range = rect.height - window.innerHeight;
      const target = range > 0 ? clamp(-rect.top / range) : 0;
      smoothed += (target - smoothed) * (reduced ? 1 : 1 - Math.exp(-Math.min(delta, 0.3) * 9));
      if (Math.abs(target - smoothed) < 0.0005) smoothed = target;
      sceneInputs.storyProgress = smoothed;

      setStep((prev) => (prev === stepAt(smoothed) ? prev : stepAt(smoothed)));
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${smoothed})`;
      if (warmRef.current) warmRef.current.style.opacity = String(seg(smoothed, 0.75, 1));
      if (hintRef.current) hintRef.current.style.opacity = String(1 - seg(smoothed, 0, 0.04));
    };
    frameId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, [reduced, noGL]);

  const jumpTo = (i: number) => {
    const section = sectionRef.current;
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const range = rect.height - window.innerHeight;
    window.scrollTo({ top: window.scrollY + rect.top + range * STORY_STEP_PROGRESS[i], behavior: "smooth" });
  };

  if (noGL) {
    // Tanpa WebGL: tampilkan empat langkah sebagai kartu biasa.
    return (
      <section id="how" className="bg-story px-5 py-10 text-ondark lg:px-14">
        <span className="text-xs font-bold tracking-[0.1em] text-lime uppercase">Cara kerja</span>
        <h2 className="max-w-[460px] font-display text-[26px] leading-[1.12] font-semibold">Satu alur, dari kebutuhan hingga dokumentasi</h2>
        <div className="mt-7 grid gap-6 md:grid-cols-4">
          {STORY_STEPS.map((s) => (
            <div key={s.number}>
              <div className="text-outline-lime font-display text-[64px] leading-[0.85] font-semibold">{s.number}</div>
              <Tag tone={s.tone} large>{s.status}</Tag>
              <h3 className="mt-3 font-display text-[21px] font-semibold">{s.title}</h3>
              <p className="mt-1 text-[13px] text-[#b8c8bd]">{s.body}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="how" ref={sectionRef} className="relative h-[420vh] lg:h-[460vh]">
      <div className="bg-story sticky top-0 h-screen min-h-[520px] overflow-hidden text-ondark lg:min-h-[560px]">
        <ThreeCanvas create={createScene} onUnavailable={() => setNoGL(true)} className="absolute inset-0" />

        {/* peredam agar teks terbaca di atas scene */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-1 h-[140px] bg-linear-to-b from-forest-900 to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-0 z-1 hidden bg-[linear-gradient(90deg,rgba(11,31,22,0.92)_0,rgba(11,31,22,0.6)_32%,transparent_55%),linear-gradient(0deg,rgba(11,31,22,0.85)_0,transparent_30%)] lg:block" />
        <div aria-hidden className="pointer-events-none absolute inset-0 z-1 bg-[linear-gradient(0deg,rgba(11,31,22,0.95)_0,rgba(11,31,22,0.7)_38%,transparent_62%)] lg:hidden" />
        <div ref={warmRef} aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_600px_at_62%_30%,rgba(255,184,107,0.3),transparent_65%)] opacity-0" />

        <div className={cn("absolute top-[22px] right-5 z-2 max-w-[460px] lg:top-11", SIDE)}>
          <span className="mb-2.5 inline-block text-xs font-bold tracking-[0.1em] text-lime uppercase">Cara kerja</span>
          <h2 className="font-display text-[22px] leading-[1.12] font-semibold tracking-[-0.01em] text-ondark lg:text-4xl">
            Satu alur, dari kebutuhan hingga dokumentasi
          </h2>
        </div>

        <div ref={hintRef} className="absolute top-[52px] right-[max(52px,calc((100vw-1240px)/2))] z-2 hidden animate-bob items-center gap-2 text-[13px] font-semibold text-lime lg:flex motion-reduce:animate-none">
          Gulir untuk menjalankan alur <Icon name="arrow-down" />
        </div>

        <div className={cn("absolute right-5 bottom-[110px] z-2 h-[200px] lg:right-auto lg:bottom-[150px] lg:h-[280px] lg:w-[min(430px,40%)]", SIDE)}>
          {STORY_STEPS.map((s, i) => (
            <div
              key={s.number}
              className={cn(
                "pointer-events-none absolute inset-0 translate-y-[18px] opacity-0 transition-[opacity,transform] duration-500",
                i === step && "translate-y-0 opacity-100",
              )}
            >
              <div className="text-outline-lime mb-1 font-display text-[56px] leading-[0.85] font-semibold lg:mb-2.5 lg:text-[132px]">{s.number}</div>
              <Tag tone={s.tone} large>{s.status}</Tag>
              <h3 className="mt-2 mb-1 font-display text-[21px] leading-[1.15] font-semibold lg:mt-3 lg:mb-2 lg:text-[30px]">{s.title}</h3>
              <p className="text-[13px] leading-[1.6] text-[#b8c8bd] lg:text-[15px]">{s.body}</p>
            </div>
          ))}
        </div>

        <div className={cn("absolute right-5 bottom-[18px] z-2 grid grid-cols-4 gap-2 lg:right-[max(52px,calc((100vw-1240px)/2))] lg:bottom-[34px]", SIDE)}>
          <div className="absolute inset-x-0 top-[9px] h-[3px] overflow-hidden rounded-sm bg-ondark/16">
            <span ref={fillRef} className="block h-full origin-left scale-x-0 bg-lime" />
          </div>
          {STORY_STEPS.map((s, i) => (
            <button
              key={s.number}
              type="button"
              onClick={() => jumpTo(i)}
              className={cn("relative flex flex-col items-start gap-0.5 text-left transition-colors duration-300", i <= step ? "text-ondark" : "text-[#9fb2a6]")}
            >
              <span
                className={cn(
                  "relative z-1 mb-2 size-[21px] rounded-full border-[3px] transition-all duration-300",
                  i <= step ? "border-lime bg-lime" : "border-forest-600 bg-forest-800",
                  i === step && "shadow-[0_0_0_6px_rgba(216,236,110,0.25)]",
                )}
              />
              <b className={cn("text-[11px] font-bold lg:text-[13px]", i === step && "text-lime")}>{s.status}</b>
              <small className="hidden text-xs opacity-85 lg:block">{s.title}</small>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
