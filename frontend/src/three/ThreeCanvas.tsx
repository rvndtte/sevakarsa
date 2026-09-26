"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/cn";
import { trackPointer, type SceneFactory } from "./controller";

interface ThreeCanvasProps {
  /** Pabrik scene. Harus stabil (didefinisikan di luar komponen atau di-memo). */
  create: SceneFactory;
  className?: string;
  /** Dipanggil bila WebGL tidak tersedia, agar induk menampilkan pengganti. */
  onUnavailable?: () => void;
}

/**
 * Menjalankan satu scene Three.js di dalam <div>: mengatur ukuran, menjeda saat
 * tidak terlihat, dan membebaskan sumber daya saat dilepas.
 */
export function ThreeCanvas({ create, className, onUnavailable }: ThreeCanvasProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const onUnavailableRef = useRef(onUnavailable);
  useEffect(() => {
    onUnavailableRef.current = onUnavailable;
  });

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    trackPointer();

    let controller;
    try {
      controller = create({ reducedMotion });
    } catch (error) {
      console.warn("WebGL tidak tersedia", error);
      onUnavailableRef.current?.();
      return;
    }
    host.appendChild(controller.renderer.domElement);

    let visible = true;
    let time = 0;
    let last = performance.now();
    let frameId = 0;

    const fit = () => {
      if (host.clientWidth && host.clientHeight) controller.resize(host.clientWidth, host.clientHeight);
    };
    const resizeObserver = new ResizeObserver(fit);
    resizeObserver.observe(host);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    intersection.observe(host);
    fit();

    const frame = (now: number) => {
      frameId = requestAnimationFrame(frame);
      // Frame pertama bisa punya timestamp lebih awal dari `last`: jangan biarkan waktu mundur.
      const delta = Math.max(0, Math.min(0.05, (now - last) / 1000));
      last = now;
      if (!visible || document.hidden) return;
      if (!reducedMotion) time += delta;
      controller.render(time, reducedMotion ? 0 : delta);
    };
    frameId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      intersection.disconnect();
      controller.dispose();
    };
  }, [create, reducedMotion]);

  return <div ref={hostRef} aria-hidden className={cn("three-host", className)} />;
}
