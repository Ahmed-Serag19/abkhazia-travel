"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ElementType,
} from "react";
import { cn } from "@/lib/utils";

// useLayoutEffect warns during SSR; on the client it lets us hide the element
// before first paint so the reveal has something to animate from.
const useIso =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Fades + lifts its children in when they scroll into view.
 *
 * The element is VISIBLE by default. It only becomes hidden-then-animated
 * ("armed") after JS has mounted and confirmed it starts below the fold —
 * the one situation where the animation is worth doing and safe to do.
 *
 * No-JS, SSR, a frozen compositor, a throttled tab, a missing
 * IntersectionObserver: in every one of those the content is simply shown.
 */
export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className,
}: {
  children: React.ReactNode;
  /** stagger, in ms */
  delay?: number;
  as?: ElementType;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [armed, setArmed] = useState(false);
  const [visible, setVisible] = useState(false);

  // Decide whether to animate at all — before paint, so there's no flash.
  useIso(() => {
    const node = ref.current;
    if (!node) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced || typeof IntersectionObserver === "undefined") return;

    const box = node.getBoundingClientRect();
    const belowFold = box.top > window.innerHeight * 0.9;
    // Already on screen (or above it): nothing to reveal — leave it visible.
    if (!belowFold) return;

    setArmed(true);
  }, []);

  // Once armed, watch for it to enter, with a failsafe.
  useEffect(() => {
    if (!armed) return;
    const node = ref.current;
    if (!node) return;

    const reveal = () => setVisible(true);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          reveal();
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
    );
    observer.observe(node);

    // If the observer never fires (edge cases, throttling), show it anyway.
    const failsafe = window.setTimeout(reveal, 2000);

    return () => {
      observer.disconnect();
      window.clearTimeout(failsafe);
    };
  }, [armed]);

  return (
    <Tag
      ref={ref}
      className={cn(
        armed && "reveal-armed",
        armed && visible && "is-visible",
        className,
      )}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}
