import { PRESCRIPTIONS } from "./prescriptionData";
import {
  external,
  sets,
  type ExercisePrescription,
} from "./prescriptionFactory";
import type { CustomExercise, SetEntry } from "./types";

export type {
  ExerciseLoadMode,
  ExerciseMetric,
  ExercisePrescription,
} from "./prescriptionFactory";

const FALLBACK = external("3 x 8-10", [
  { weight: 80, reps: 8, last: "-" },
  { weight: 80, reps: 8, last: "-" },
  { weight: 75, reps: 10, last: "-" },
]);

export const getExercisePrescription = (
  exerciseId: string,
  customExercises: CustomExercise[] = [],
): ExercisePrescription => {
  const customExercise = customExercises.find((item) => item.id === exerciseId);
  if (!customExercise) return PRESCRIPTIONS[exerciseId] ?? FALLBACK;
  const defaultReps = customExercise.defaultReps ?? 8;
  const defaultWeight = customExercise.defaultWeight ?? 20;
  return external(
    `3 x ${defaultReps}`,
    sets(3, defaultWeight, defaultReps, "Custom"),
  );
};

export function getDefaultSetsForExercise(
  exerciseId: string,
  deloadWeight?: number,
  customExercises: CustomExercise[] = [],
): SetEntry[] {
  const prescription = getExercisePrescription(exerciseId, customExercises);
  return prescription.defaultSets.map((entry, index) => ({
    id: index + 1,
    weight:
      typeof deloadWeight === "number" && prescription.loadMode === "external"
        ? Math.max(0, deloadWeight)
        : entry.weight,
    reps: entry.reps,
    rpe: null,
    completed: false,
    last: entry.last,
  }));
}
