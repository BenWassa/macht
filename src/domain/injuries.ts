import { EXERCISE_LIBRARY } from "./exercises";
import type { ExerciseConflict, ExerciseInjury } from "./types";

const ALTERNATIVES: Record<string, string> = {
  bench_press: "neutral_db_press",
  overhead_press: "landmine_press",
  lat_pulldown_behind: "lat_pulldown_front",
  pull_up: "lat_pulldown_front",
  dip: "tricep_pushdown",
};

export const getAlternativeFor = (exerciseId: string): string | null =>
  ALTERNATIVES[exerciseId] ?? null;

export function getExerciseConflict(
  exerciseId: string,
  injuries: ExerciseInjury[],
): ExerciseConflict | null {
  const exercise = EXERCISE_LIBRARY.find((item) => item.id === exerciseId);
  if (!exercise) return null;

  for (const injury of injuries.filter((item) => !item.clearedDate)) {
    const tags = exercise.tags.filter((tag) =>
      injury.forbiddenTags.includes(tag),
    );
    if (tags.length > 0) {
      return {
        injuryId: injury.id,
        injury: injury.name,
        tags,
        severity: injury.severity,
        alternative: getAlternativeFor(exerciseId),
      };
    }
  }

  return null;
}

export function getBlockedExercises(injury: ExerciseInjury): string[] {
  return EXERCISE_LIBRARY.filter((exercise) =>
    exercise.tags.some((tag) => injury.forbiddenTags.includes(tag)),
  ).map((exercise) => exercise.id);
}
