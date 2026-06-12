import { getDefaultSetsForExercise } from "@/domain/prescriptions";
import type { CustomExercise, SetEntry, WorkoutSets } from "@/domain/types";
import type { WorkoutState } from "@/state/workoutTypes";

export {
  addWorkoutExercise,
  substituteWorkoutExercise,
} from "@/state/workoutExerciseMutations";

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
  const previousWeight = sets[setIndex]?.weight;
  return {
    workoutSets: {
      ...state.workoutSets,
      [exerciseId]: sets.map((entry, index) => {
        if (index === setIndex) return { ...entry, [field]: value };
        // Straight sets: later uncompleted sets still at the old weight
        // follow a weight edit; individually adjusted sets are left alone.
        if (
          field === "weight" &&
          index > setIndex &&
          !entry.completed &&
          entry.weight === previousWeight
        ) {
          return { ...entry, weight: value as SetEntry["weight"] };
        }
        return entry;
      }),
    },
  };
}

export function appendWorkoutSet(
  state: WorkoutState,
  exerciseId: string,
  customExercises: CustomExercise[] = [],
): Pick<WorkoutState, "workoutSets"> {
  const sets = state.workoutSets[exerciseId] ?? [];
  const prev = sets[sets.length - 1];
  const fallback = getDefaultSetsForExercise(
    exerciseId,
    undefined,
    customExercises,
  )[0];
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
