import { useEffect, useRef, useState } from "react";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** ease-out-quint: fast start, long settle. No overshoot. */
const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);

/**
 * Animates a number from its previous value to `target` on change.
 * Returns the in-flight display value. Honors reduced-motion (snaps instantly).
 */
export function useCountUp(target: number, durationMs = 900): number {
  const [display, setDisplay] = useState(target);
  const fromRef = useRef(target);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (prefersReducedMotion() || fromRef.current === target) {
      fromRef.current = target;
      setDisplay(target);
      return;
    }
    const from = fromRef.current;
    const delta = target - from;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min((now - start) / durationMs, 1);
      setDisplay(Math.round(from + delta * easeOutQuint(t)));
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, durationMs]);

  return display;
}
