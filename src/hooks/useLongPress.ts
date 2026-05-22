import { useEffect, useRef } from "react";

interface LongPressOptions {
  delay?: number;
  interval?: number;
}

export function useLongPress(callback: () => void, options?: LongPressOptions) {
  const timeoutRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const cbRef = useRef(callback);
  cbRef.current = callback;
  const delay = options?.delay ?? 350;
  const interval = options?.interval ?? 80;

  const stop = () => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
    timeoutRef.current = null;
    intervalRef.current = null;
  };

  const start = () => {
    stop();
    cbRef.current();
    timeoutRef.current = window.setTimeout(() => {
      intervalRef.current = window.setInterval(() => cbRef.current(), interval);
    }, delay);
  };

  useEffect(() => stop, []);

  return {
    onPointerDown: start,
    onPointerUp: stop,
    onPointerLeave: stop,
    onPointerCancel: stop,
  };
}
