import { PRESCRIPTIONS } from "./prescriptionData";
import { external, type ExercisePrescription } from "./prescriptionFactory";
import type { SetEntry } from "./types";

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
): ExercisePrescription => PRESCRIPTIONS[exerciseId] ?? FALLBACK;

export function getDefaultSetsForExercise(
  exerciseId: string,
  deloadWeight?: number,
): SetEntry[] {
  const prescription = getExercisePrescription(exerciseId);
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
