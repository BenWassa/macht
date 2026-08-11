import type { MusclePriorities } from "@/domain/exercises/muscles";
import type { MuscleId } from "@/domain/shared/ids";
import { PROGRAM_MUSCLES } from "@/domain/training/starterProgram";
import type { MuscleProgress, ProgressWorkout } from "./model";
import { normalizeMuscleId } from "./normalize";

const DAY_MS = 86_400_000;

const muscleName = (muscleId: MuscleId): string =>
  PROGRAM_MUSCLES.find((muscle) => muscle.id === muscleId)?.name ?? muscleId;

export function buildMuscleProgress(
  workouts: ProgressWorkout[],
  asOfDate: string,
  windowDays = 28,
  priorities: MusclePriorities = {},
): MuscleProgress[] {
  const end = new Date(`${asOfDate}T00:00:00Z`).getTime();
  const start = end - Math.max(1, windowDays - 1) * DAY_MS;
  const included = workouts.filter((workout) => {
    const time = new Date(`${workout.date}T00:00:00Z`).getTime();
    return time >= start && time <= end;
  });
  const stats = new Map<
    MuscleId,
    { targetedSets: number; workoutIds: Set<string>; latestDate?: string }
  >();

  for (const workout of included) {
    for (const exercise of workout.exercises) {
      for (const rawMuscleId of exercise.targetMuscleIds) {
        const muscleId = normalizeMuscleId(rawMuscleId);
        const current = stats.get(muscleId) ?? {
          targetedSets: 0,
          workoutIds: new Set<string>(),
        };
        current.targetedSets += exercise.completedSets;
        current.workoutIds.add(workout.id);
        if (!current.latestDate || workout.date > current.latestDate) {
          current.latestDate = workout.date;
        }
        stats.set(muscleId, current);
      }
    }
  }

  const allIds = new Set<MuscleId>([
    ...stats.keys(),
    ...Object.keys(priorities),
  ]);
  return [...allIds]
    .map((muscleId) => {
      const stat = stats.get(muscleId);
      return {
        muscleId,
        name: muscleName(muscleId),
        targetedSets: stat?.targetedSets ?? 0,
        sessions: stat?.workoutIds.size ?? 0,
        latestDate: stat?.latestDate,
        priority: priorities[muscleId],
      };
    })
    .sort(
      (a, b) =>
        b.targetedSets - a.targetedSets || a.name.localeCompare(b.name),
    );
}
