import { useEffect } from "react";
import { useWorkoutStore } from "@/state/useWorkoutStore";

export function useSessionClock(): void {
  const workoutActive = useWorkoutStore((state) => state.workoutActive);
  const tick = useWorkoutStore((state) => state.tick);

  useEffect(() => {
    if (!workoutActive) return undefined;
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [tick, workoutActive]);
}
