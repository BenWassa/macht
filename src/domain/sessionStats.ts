import { brzyckiE1rm } from "./e1rm";
import { PROGRESS_LIFTS } from "./exercises";
import { getExercisePrescription } from "./prescriptions";
import type { ExerciseSnapshot, SetEntry } from "./types";

/**
 * Estimated 1RM for a tracked lift, computed from the best completed working
 * set. Progress is recorded whenever a tracked lift is actually performed —
 * regardless of session type (template or free play) or injury caution flags.
 * Only the load mode matters, since an e1RM is only meaningful for externally
 * loaded lifts.
 */
export function computeExerciseE1rm(
  exerciseId: string,
  sets: SetEntry[],
): number | undefined {
  const prescription = getExercisePrescription(exerciseId);
  const tracksE1rm =
    PROGRESS_LIFTS.includes(exerciseId) && prescription.loadMode === "external";
  if (!tracksE1rm) return undefined;
  const topSet = sets
    .filter((set) => set.completed && set.reps <= 10)
    .sort(
      (a, b) => brzyckiE1rm(b.weight, b.reps) - brzyckiE1rm(a.weight, a.reps),
    )[0];
  return topSet ? brzyckiE1rm(topSet.weight, topSet.reps) : undefined;
}

/** Total volume and completed-set count derived from exercise snapshots. */
export function computeSessionTotals(snapshots: ExerciseSnapshot[]): {
  volume: number;
  sets: number;
} {
  let volume = 0;
  let sets = 0;
  for (const snapshot of snapshots) {
    for (const set of snapshot.sets) {
      if (!set.completed) continue;
      volume += set.weight * set.reps;
      sets += 1;
    }
  }
  return { volume, sets };
}
