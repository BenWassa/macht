import { useEffect } from "react";
import { useWorkoutStore } from "@/state/useWorkoutStore";

export function useSessionClock(): void {
  const workoutActive = useWorkoutStore((state) => state.workoutActive);
  const tick = useWorkoutStore((state) => state.tick);

  useEffect(() => {
    if (!workoutActive) return undefined;
    tick();
    const interval = window.setInterval(tick, 1000);
    const onVisible = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [tick, workoutActive]);
}
