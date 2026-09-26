"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { SECTIONS } from "./content";

/**
 * Melacak scroll halaman landing: mengisi bilah progres (lewat ref, tanpa render),
 * menandai kapan navigasi mengambang tampil, dan bagian mana yang sedang aktif.
 */
export function useLandingScroll(heroHeightRatio = 0.8) {
  const progressBar = useRef<HTMLDivElement>(null);
  const [floatingNav, setFloatingNav] = useState(false);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    let frameRequested = false;

    const update = () => {
      frameRequested = false;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progressBar.current) {
        progressBar.current.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
      }
      setFloatingNav(y > window.innerHeight * heroHeightRatio);
      let current = "";
      for (const { id } of SECTIONS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.4) current = id;
      }
      setActiveId(current);
    };

    const onScroll = () => {
      if (frameRequested) return;
      frameRequested = true;
      requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => window.removeEventListener("scroll", onScroll);
  }, [heroHeightRatio]);

  return { progressBar, floatingNav, activeId };
}

export function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

/** Menggeser elemen secara vertikal mengikuti scroll (parallax ringan). */
export function useParallax(ref: RefObject<HTMLElement | null>, factor: number, disabled: boolean) {
  useEffect(() => {
    if (disabled) return;
    let frameRequested = false;
    const update = () => {
      frameRequested = false;
      const y = Math.min(window.scrollY, window.innerHeight * 1.2);
      if (ref.current) ref.current.style.translate = `0 ${y * factor}px`;
    };
    const onScroll = () => {
      if (frameRequested) return;
      frameRequested = true;
      requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [ref, factor, disabled]);
}
