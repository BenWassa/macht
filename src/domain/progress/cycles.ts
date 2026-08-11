import type { Mesocycle } from "@/domain/training/types";
import type {
  MesocycleProgressSummary,
  ProgressRecord,
  ProgressWorkout,
} from "./model";

export function buildMesocycleSummaries(
  mesocycles: Mesocycle[],
  workouts: ProgressWorkout[],
  records: ProgressRecord[],
): MesocycleProgressSummary[] {
  return mesocycles
    .map((mesocycle) => {
      const cycleWorkouts = workouts.filter(
        (workout) => workout.mesocycleId === mesocycle.id,
      );
      const workoutIds = new Set(cycleWorkouts.map((workout) => workout.id));
      const plannedSessions = mesocycle.weeks.reduce(
        (sum, week) => sum + week.sessions.length,
        0,
      );
      const completedSessions = cycleWorkouts.length;
      return {
        id: mesocycle.id,
        name: mesocycle.name ?? `Cycle ${mesocycle.index}`,
        index: mesocycle.index,
        status: mesocycle.status,
        plannedSessions,
        completedSessions,
        completionRate:
          plannedSessions > 0
            ? Math.min(1, completedSessions / plannedSessions)
            : 0,
        totalSets: cycleWorkouts.reduce(
          (sum, workout) => sum + workout.totalSets,
          0,
        ),
        totalVolume: cycleWorkouts.reduce(
          (sum, workout) => sum + workout.totalVolume,
          0,
        ),
        records: records.filter((record) => workoutIds.has(record.workoutId)).length,
        startDate: mesocycle.startDate,
      };
    })
    .sort((a, b) => b.index - a.index || b.id.localeCompare(a.id));
}
