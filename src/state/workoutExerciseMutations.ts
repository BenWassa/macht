import type { LoadSuggestion } from "@/domain/progression";
import { prefillSetsForExercise } from "@/domain/workoutPrefill";
import type { CustomExercise } from "@/domain/types";
import type { WorkoutState } from "@/state/workoutTypes";

const mergeSuggestion = (
  state: WorkoutState,
  exerciseId: string,
  suggestion?: LoadSuggestion,
): WorkoutState["loadSuggestions"] =>
  suggestion
    ? { ...state.loadSuggestions, [exerciseId]: suggestion }
    : state.loadSuggestions;

export function substituteWorkoutExercise(
  state: WorkoutState,
  targetId: string,
  subId: string,
  customExercises: CustomExercise[] = [],
  suggestion?: LoadSuggestion,
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
    loadSuggestions: mergeSuggestion(state, subId, suggestion),
    workoutSets: {
      ...state.workoutSets,
      [subId]:
        state.workoutSets[subId] ??
        prefillSetsForExercise(subId, undefined, customExercises, suggestion),
    },
  };
}

export function addWorkoutExercise(
  state: WorkoutState,
  exerciseId: string,
  customExercises: CustomExercise[] = [],
  suggestion?: LoadSuggestion,
): Partial<WorkoutState> {
  const existing = state.activeWorkoutList.indexOf(exerciseId);
  if (existing !== -1) {
    return { selectedExIndex: existing, selectedSetIndex: 0 };
  }
  const list = [...state.activeWorkoutList, exerciseId];
  return {
    activeWorkoutList: list,
    selectedExIndex: list.length - 1,
    selectedSetIndex: 0,
    loadSuggestions: mergeSuggestion(state, exerciseId, suggestion),
    workoutSets: {
      ...state.workoutSets,
      [exerciseId]:
        state.workoutSets[exerciseId] ??
        prefillSetsForExercise(
          exerciseId,
          undefined,
          customExercises,
          suggestion,
        ),
    },
  };
}
