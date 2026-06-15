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
/**
 * Reps are clamped before the Brzycki estimate: the formula loses accuracy past
 * ~10 reps and is undefined at 37. Clamping (rather than discarding higher-rep
 * sets) means a lift logged only at higher reps still records progress instead
 * of silently dropping off the Progress screen.
 */
const E1RM_REP_CLAMP = 10;

export function computeExerciseE1rm(
  exerciseId: string,
  sets: SetEntry[],
): number | undefined {
  const prescription = getExercisePrescription(exerciseId);
  const tracksE1rm =
    PROGRESS_LIFTS.includes(exerciseId) && prescription.loadMode === "external";
  if (!tracksE1rm) return undefined;
  const e1rms = sets
    .filter((set) => set.completed && set.weight > 0 && set.reps >= 1)
    .map((set) =>
      brzyckiE1rm(set.weight, Math.min(set.reps, E1RM_REP_CLAMP)),
    );
  return e1rms.length ? Math.max(...e1rms) : undefined;
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
