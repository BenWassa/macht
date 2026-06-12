import { brzyckiE1rm } from "./e1rm";
import { getExerciseById } from "./exercises";
import { getExercisePrescription } from "./prescriptions";
import type {
  CustomExercise,
  EffortMode,
  SessionLog,
  SetEntry,
  Units,
} from "./types";

export const PROGRESSION = {
  capPct: 0.1,
  capWindowDays: 28,
  rustRepeatDays: 10,
  rustDecayDays: 21,
  rustDecayFactor: 0.9,
  deloadPct: 0.075,
  increments: {
    lbs: { lower: 5, upper: 2.5 },
    kgs: { lower: 2.5, upper: 1.25 },
  },
} as const;

export interface LiftPerformance {
  date: string;
  sets: SetEntry[];
  top: SetEntry;
}

/** Completed performances of a lift, oldest first. */
export function liftHistory(
  exerciseId: string,
  sessions: SessionLog[],
): LiftPerformance[] {
  return sessions
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .flatMap((session) => {
      const snapshot = session.exerciseSnapshots?.find(
        (item) => item.exerciseId === exerciseId,
      );
      const completed =
        snapshot?.sets.filter((set) => set.completed && set.weight > 0) ?? [];
      if (completed.length === 0) return [];
      const top = completed
        .slice()
        .sort(
          (a, b) =>
            brzyckiE1rm(b.weight, Math.min(b.reps, 30)) -
            brzyckiE1rm(a.weight, Math.min(a.reps, 30)),
        )[0];
      return [{ date: session.date, sets: completed, top }];
    });
}

/** Prescribed rep range, parsed from the planned string (e.g. "2-3 x 8-12"). */
export function repRange(
  exerciseId: string,
  customExercises: CustomExercise[],
): { min: number; max: number } {
  const prescription = getExercisePrescription(exerciseId, customExercises);
  const repsPart = prescription.planned.split(/x/i).pop() ?? "";
  const match = repsPart.match(/(\d+)\s*-\s*(\d+)/);
  if (match) return { min: Number(match[1]), max: Number(match[2]) };
  const reps = prescription.defaultSets[0]?.reps ?? 8;
  return { min: reps, max: reps };
}

const LOWER_BODY = /quads|glutes|hamstrings|calves|posterior/i;

export function incrementFor(
  exerciseId: string,
  units: Units,
  customExercises: CustomExercise[],
): number {
  const exercise =
    getExerciseById(exerciseId) ??
    customExercises.find((item) => item.id === exerciseId);
  const lower = Boolean(
    exercise &&
    (exercise.tags.includes("lower_body_primary") ||
      LOWER_BODY.test(exercise.target)),
  );
  return PROGRESSION.increments[units][lower ? "lower" : "upper"];
}

export const isHardEffort = (rpe: number | null, mode: EffortMode): boolean =>
  rpe != null && (mode === "RIR" ? rpe <= 0.5 : rpe >= 9.5);

export const isEasyEffort = (rpe: number | null, mode: EffortMode): boolean =>
  rpe == null || (mode === "RIR" ? rpe >= 2 : rpe <= 8);

export function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((Date.parse(toIso) - Date.parse(fromIso)) / 86_400_000);
}

const workingSets = (perf: LiftPerformance): SetEntry[] =>
  perf.sets.filter((set) => set.weight === perf.top.weight);

/** Any working set under the prescribed minimum, or ground out near failure. */
export function missedPrescription(
  perf: LiftPerformance,
  minReps: number,
  mode: EffortMode,
): boolean {
  return workingSets(perf).some(
    (set) => set.reps < minReps || isHardEffort(set.rpe, mode),
  );
}

/** Every working set at the top of the rep range with effort in reserve. */
export function toppedOut(
  perf: LiftPerformance,
  maxReps: number,
  mode: EffortMode,
): boolean {
  return workingSets(perf).every(
    (set) => set.reps >= maxReps && isEasyEffort(set.rpe, mode),
  );
}
