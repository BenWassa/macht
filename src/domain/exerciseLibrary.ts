import { EXERCISE_LIBRARY } from "@/domain/exercises";
import type { CustomExercise, Exercise } from "@/domain/types";

export function getAllExercises(
  customExercises: CustomExercise[] = [],
): Exercise[] {
  return [...EXERCISE_LIBRARY, ...customExercises];
}

export function getExerciseById(
  exerciseId: string,
  customExercises: CustomExercise[] = [],
): Exercise | undefined {
  return getAllExercises(customExercises).find(
    (exercise) => exercise.id === exerciseId,
  );
}

export function normalizeExerciseName(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}
