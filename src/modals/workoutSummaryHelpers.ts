import { getExerciseById } from "@/domain/exerciseLibrary";
import { getExercisePrescription } from "@/domain/prescriptions";
import type { CustomExercise, ExerciseSnapshot } from "@/domain/types";

export const cloneSnapshots = (
  snapshots: ExerciseSnapshot[],
): ExerciseSnapshot[] =>
  snapshots.map((snapshot) => ({
    ...snapshot,
    sets: snapshot.sets.map((set) => ({ ...set })),
  }));

export function metricSuffix(exerciseId: string): string {
  const metric = getExercisePrescription(exerciseId).metric;
  return metric === "sec" ? " sec" : metric === "min" ? " min" : "";
}

export function exerciseName(
  exerciseId: string,
  customExercises: CustomExercise[],
): string {
  return getExerciseById(exerciseId, customExercises)?.name ?? exerciseId;
}
