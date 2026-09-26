"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { useReducedMotion } from "./useReducedMotion";

/**
 * True setelah elemen pertama kali masuk viewport (sekali saja).
 * Pengguna dengan gerak minimal langsung dianggap terlihat.
 */
export function useInView<T extends Element>(
  options: IntersectionObserverInit = { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
): [RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [seen, setSeen] = useState(false);
  const reduced = useReducedMotion();
  const { threshold, rootMargin } = options;

  useEffect(() => {
    if (reduced) return;
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [reduced, threshold, rootMargin]);

  return [ref, seen || reduced];
}
