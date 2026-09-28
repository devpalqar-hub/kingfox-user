"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Shared scroll-reveal hook — fade + slide-up entrance animation.
 *
 * Attach `ref` to the element you want to animate and toggle a "visible"
 * class based on `isVisible`. Uses IntersectionObserver, fires only once,
 * and respects `prefers-reduced-motion`.
 *
 * Usage:
 *   const { ref, isVisible } = useScrollReveal<HTMLElement>();
 *   <section ref={ref} className={`${styles.section} ${isVisible ? styles.revealVisible : ""}`}>
 *
 * Or with the shared globals.css utility classes:
 *   <section ref={ref} className={`scrollReveal ${isVisible ? "scrollRevealVisible" : ""}`}>
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options?: IntersectionObserverInit
) {
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Respect reduced-motion preference — show content immediately, no animation.
    if (
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setIsVisible(true);
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      // Fallback for environments without IntersectionObserver support.
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -80px 0px",
        ...options,
      }
    );

    observer.observe(node);

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ref, isVisible };
}
