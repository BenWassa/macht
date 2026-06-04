import { getDefaultSetsForExercise } from "@/domain/prescriptions";
import type { SetEntry, WorkoutSets } from "@/domain/types";
import type { WorkoutState } from "@/state/workoutTypes";

export const buildWorkoutSets = (
  exercises: string[],
  deloadWeights: Record<string, number> = {},
): WorkoutSets =>
  exercises.reduce<WorkoutSets>((acc, exerciseId) => {
    acc[exerciseId] = getDefaultSetsForExercise(
      exerciseId,
      deloadWeights[exerciseId],
    );
    return acc;
  }, {});

export function toggleSetCompletion(
  state: WorkoutState,
  exerciseId: string,
  setIndex: number,
): { workoutSets: WorkoutSets; completedNow: boolean } {
  let completedNow = false;
  const sets = state.workoutSets[exerciseId] ?? [];
  const next = sets.map((entry, index) => {
    if (index !== setIndex) return entry;
    completedNow = !entry.completed;
    return { ...entry, completed: completedNow };
  });
  return {
    completedNow,
    workoutSets: { ...state.workoutSets, [exerciseId]: next },
  };
}

export function updateWorkoutSet<K extends keyof SetEntry>(
  state: WorkoutState,
  exerciseId: string,
  setIndex: number,
  field: K,
  value: SetEntry[K],
): Pick<WorkoutState, "workoutSets"> {
  const sets = state.workoutSets[exerciseId] ?? [];
  return {
    workoutSets: {
      ...state.workoutSets,
      [exerciseId]: sets.map((entry, index) =>
        index === setIndex ? { ...entry, [field]: value } : entry,
      ),
    },
  };
}

export function substituteWorkoutExercise(
  state: WorkoutState,
  targetId: string,
  subId: string,
): Partial<WorkoutState> {
  const index = state.activeWorkoutList.indexOf(targetId);
  if (index === -1) return state;
  const list = [...state.activeWorkoutList];
  list[index] = subId;
  return {
    activeWorkoutList: list,
    selectedExIndex: index,
    selectedSetIndex: 0,
    adaptedDuringSession: true,
    workoutSets: {
      ...state.workoutSets,
      [subId]: state.workoutSets[subId] ?? getDefaultSetsForExercise(subId),
    },
  };
}

export function appendWorkoutSet(
  state: WorkoutState,
  exerciseId: string,
): Pick<WorkoutState, "workoutSets"> {
  const sets = state.workoutSets[exerciseId] ?? [];
  const prev = sets[sets.length - 1];
  const fallback = getDefaultSetsForExercise(exerciseId)[0];
  const next: SetEntry = prev
    ? {
        id: prev.id + 1,
        weight: prev.weight,
        reps: prev.reps,
        rpe: null,
        completed: false,
        last: "-",
      }
    : { ...fallback, id: 1, rpe: null, completed: false };

  return {
    workoutSets: { ...state.workoutSets, [exerciseId]: [...sets, next] },
  };
}
