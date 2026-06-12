import { getDefaultSetsForExercise } from "./prescriptions";
import type { LoadSuggestion } from "./progression";
import type { CustomExercise, SetEntry, WorkoutSets } from "./types";

export function applySuggestionToSets(
  sets: SetEntry[],
  suggestion: LoadSuggestion,
): SetEntry[] {
  return sets.map((entry) => ({
    ...entry,
    weight: suggestion.weight,
    reps: suggestion.repTarget,
    last: suggestion.lastSummary,
  }));
}

/** Default sets with the suggested load prefilled; an explicit deload weight
 *  (injury plumbing) takes precedence over the suggestion. */
export function prefillSetsForExercise(
  exerciseId: string,
  deloadWeight: number | undefined,
  customExercises: CustomExercise[] = [],
  suggestion?: LoadSuggestion,
): SetEntry[] {
  const sets = getDefaultSetsForExercise(
    exerciseId,
    deloadWeight,
    customExercises,
  );
  if (!suggestion || deloadWeight !== undefined) return sets;
  return applySuggestionToSets(sets, suggestion);
}

export const buildWorkoutSets = (
  exercises: string[],
  deloadWeights: Record<string, number> = {},
  customExercises: CustomExercise[] = [],
  suggestions: Record<string, LoadSuggestion> = {},
): WorkoutSets =>
  exercises.reduce<WorkoutSets>((acc, exerciseId) => {
    acc[exerciseId] = prefillSetsForExercise(
      exerciseId,
      deloadWeights[exerciseId],
      customExercises,
      suggestions[exerciseId],
    );
    return acc;
  }, {});
