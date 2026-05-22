import { useEffect, useRef, useState } from "react";
import { chirp } from "@/lib/audio";

export function useRestTimer(defaultRest: number) {
  const [seconds, setSeconds] = useState(defaultRest);
  const [running, setRunning] = useState(false);
  const [visible, setVisible] = useState(false);

  const endsAtRef = useRef<number>(0);
  const remainingRef = useRef<number>(defaultRest);
  const firedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!running) return undefined;
    const tick = () => {
      const remaining = Math.max(
        0,
        Math.ceil((endsAtRef.current - performance.now()) / 1000),
      );
      setSeconds(remaining);
      if (remaining === 0 && !firedRef.current) {
        firedRef.current = true;
        chirp();
        setRunning(false);
      }
    };
    tick();
    const interval = window.setInterval(tick, 250);
    return () => window.clearInterval(interval);
  }, [running]);

  const start = () => {
    endsAtRef.current = performance.now() + defaultRest * 1000;
    remainingRef.current = defaultRest;
    firedRef.current = false;
    setSeconds(defaultRest);
    setRunning(true);
    setVisible(true);
  };

  const add = (amount: number) => {
    if (running) {
      endsAtRef.current = Math.max(
        performance.now(),
        endsAtRef.current + amount * 1000,
      );
    } else {
      remainingRef.current = Math.max(0, remainingRef.current + amount);
      setSeconds(remainingRef.current);
    }
  };

  const toggle = () => {
    setRunning((current) => {
      if (current) {
        remainingRef.current = Math.max(
          0,
          Math.ceil((endsAtRef.current - performance.now()) / 1000),
        );
        return false;
      } else {
        endsAtRef.current =
          performance.now() + remainingRef.current * 1000;
        firedRef.current = false;
        return true;
      }
    });
  };

  const reset = () => {
    endsAtRef.current = performance.now() + defaultRest * 1000;
    remainingRef.current = defaultRest;
    firedRef.current = false;
    setSeconds(defaultRest);
    setRunning(false);
  };

  return {
    seconds,
    running,
    visible,
    start,
    add,
    toggle,
    reset,
    dismiss: () => setVisible(false),
  };
}
