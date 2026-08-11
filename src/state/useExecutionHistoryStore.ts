import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WorkoutSession } from "@/domain/execution/types";
import { demoStorageKey } from "@/lib/demoMode";

interface ExecutionHistoryState {
  workouts: WorkoutSession[];
  addWorkout: (workout: WorkoutSession) => void;
  hydrateWorkouts: (workouts: WorkoutSession[]) => void;
  clearWorkouts: () => void;
}

export const useExecutionHistoryStore = create<ExecutionHistoryState>()(
  persist(
    (set) => ({
      workouts: [],
      addWorkout: (workout) =>
        set((state) => ({
          workouts: [workout, ...state.workouts.filter((item) => item.id !== workout.id)],
        })),
      hydrateWorkouts: (workouts) => set({ workouts }),
      clearWorkouts: () => set({ workouts: [] }),
    }),
    {
      name: demoStorageKey("macht_workouts_v2"),
      partialize: (state) => ({ workouts: state.workouts }),
    },
  ),
);
