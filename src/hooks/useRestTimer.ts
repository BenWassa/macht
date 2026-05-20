import { useEffect, useState } from "react";

export function useRestTimer(defaultRest: number) {
  const [seconds, setSeconds] = useState(defaultRest);
  const [running, setRunning] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!running || seconds <= 0) return undefined;
    const interval = window.setInterval(() => {
      setSeconds((current) => {
        if (current <= 1) {
          setRunning(false);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [running, seconds]);

  const start = () => {
    setSeconds(defaultRest);
    setRunning(true);
    setVisible(true);
  };

  return {
    seconds,
    running,
    visible,
    start,
    add: (amount: number) =>
      setSeconds((current) => Math.max(0, current + amount)),
    reset: () => {
      setSeconds(defaultRest);
      setRunning(false);
    },
    toggle: () => setRunning((current) => !current),
    dismiss: () => setVisible(false),
  };
}
