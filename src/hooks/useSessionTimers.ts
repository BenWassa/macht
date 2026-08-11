import { useCallback, useEffect, useRef } from "react";
import { useRestTimer } from "@/hooks/useRestTimer";
import { useSettingsStore } from "@/state/useSettingsStore";
import { useWorkoutStore } from "@/state/useWorkoutStore";

const WARMUP_SECONDS = 300;

type PendingAdvance = {
  sourceIndex: number;
  nextIndex: number;
  legacyExerciseId?: string;
};

export function useSessionTimers() {
  const defaultRest = useSettingsStore((state) => state.defaultRest);
  const activeWorkoutList = useWorkoutStore((state) => state.activeWorkoutList);
  const selectedExIndex = useWorkoutStore((state) => state.selectedExIndex);
  const setSelectedExIndex = useWorkoutStore(
    (state) => state.setSelectedExIndex,
  );
  const restTimer = useRestTimer(defaultRest);
  const warmupTimer = useRestTimer(WARMUP_SECONDS);
  const pendingAdvance = useRef<PendingAdvance | null>(null);

  const advanceAfterRest = useCallback(() => {
    const pending = pendingAdvance.current;
    pendingAdvance.current = null;
    if (!pending || pending.nextIndex >= activeWorkoutList.length) return;

    const state = useWorkoutStore.getState();
    const sourceComplete = state.activeV2Workout
      ? state.activeV2Workout.exercisePerformances[pending.sourceIndex]?.sets.every(
          (set) => set.completed,
        )
      : Boolean(
          pending.legacyExerciseId &&
            state.workoutSets[pending.legacyExerciseId]?.length &&
            state.workoutSets[pending.legacyExerciseId]?.every(
              (set) => set.completed,
            ),
        );
    if (!sourceComplete) return;
    setSelectedExIndex(pending.nextIndex);
  }, [activeWorkoutList.length, setSelectedExIndex]);

  useEffect(() => {
    if (!restTimer.visible || restTimer.running || restTimer.seconds !== 0) {
      return;
    }
    if (pendingAdvance.current === null) return;
    advanceAfterRest();
    restTimer.dismiss();
  }, [restTimer, advanceAfterRest]);

  const startRest = (options: {
    advanceAfterRest: boolean;
    restSeconds?: number;
  }) => {
    warmupTimer.dismiss();
    const exerciseId = activeWorkoutList[selectedExIndex];
    pendingAdvance.current =
      options.advanceAfterRest &&
      selectedExIndex < activeWorkoutList.length - 1
        ? {
            sourceIndex: selectedExIndex,
            nextIndex: selectedExIndex + 1,
            legacyExerciseId: exerciseId,
          }
        : null;
    restTimer.start(options.restSeconds ?? defaultRest);
  };

  const startWarmup = () => {
    pendingAdvance.current = null;
    restTimer.dismiss();
    warmupTimer.start();
  };

  const dismissRest = () => {
    advanceAfterRest();
    restTimer.dismiss();
  };

  const clear = () => {
    pendingAdvance.current = null;
    restTimer.dismiss();
    warmupTimer.dismiss();
  };

  return { restTimer, warmupTimer, startRest, startWarmup, dismissRest, clear };
}
