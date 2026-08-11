import type { EffortScale } from "@/domain/training/types";
import type { SessionLog } from "@/domain/types";
import type { WorkoutSession } from "./types";

export interface PreviousSetSummary {
  load: number;
  reps: number;
  effort?: {
    value: number;
    scale?: EffortScale;
  };
}

export interface PreviousExerciseSummary {
  date: string;
  sets: PreviousSetSummary[];
  source: "v2" | "legacy";
}

export function findPreviousExercisePerformance(
  exerciseId: string,
  v2Workouts: WorkoutSession[],
  legacySessions: SessionLog[],
  excludeWorkoutId?: string,
): PreviousExerciseSummary | undefined {
  const v2Match = [...v2Workouts]
    .filter(
      (workout) =>
        workout.id !== excludeWorkoutId && workout.state === "completed",
    )
    .sort((a, b) =>
      (b.finishedAt ?? b.startedAt ?? b.date).localeCompare(
        a.finishedAt ?? a.startedAt ?? a.date,
      ),
    )
    .map((workout) => ({
      workout,
      performance: workout.exercisePerformances.find(
        (exercise) => exercise.exerciseId === exerciseId,
      ),
    }))
    .find(({ performance }) =>
      performance?.sets.some((set) => set.completed),
    );

  if (v2Match?.performance) {
    return {
      date: v2Match.workout.date,
      source: "v2",
      sets: v2Match.performance.sets
        .filter((set) => set.completed)
        .map((set) => ({
          load: set.actualLoad ?? 0,
          reps: set.actualReps ?? 0,
          effort: set.actualEffort
            ? {
                value: set.actualEffort.value,
                scale: set.actualEffort.scale,
              }
            : undefined,
        })),
    };
  }

  const legacyMatch = [...legacySessions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((session) => ({
      session,
      snapshot: session.exerciseSnapshots?.find(
        (snapshot) => snapshot.exerciseId === exerciseId,
      ),
    }))
    .find(({ snapshot }) => snapshot?.sets.some((set) => set.completed));

  if (!legacyMatch?.snapshot) return undefined;
  return {
    date: legacyMatch.session.date,
    source: "legacy",
    sets: legacyMatch.snapshot.sets
      .filter((set) => set.completed)
      .map((set) => ({
        load: set.weight,
        reps: set.reps,
        effort:
          set.rpe == null
            ? undefined
            : {
                value: set.rpe,
              },
      })),
  };
}
