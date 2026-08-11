import type {
  ExerciseBest,
  ExerciseTrendPoint,
  ProgressExerciseEvent,
  ProgressRecord,
  ProgressWorkout,
} from "./model";

export const exerciseEvents = (
  workouts: ProgressWorkout[],
  exerciseId: string,
): ProgressExerciseEvent[] =>
  workouts
    .flatMap((workout) => workout.exercises)
    .filter((event) => event.exerciseId === exerciseId)
    .sort((a, b) => a.date.localeCompare(b.date) || a.workoutId.localeCompare(b.workoutId));

export function buildExerciseTrend(
  workouts: ProgressWorkout[],
  exerciseId: string,
): ExerciseTrendPoint[] {
  return exerciseEvents(workouts, exerciseId).map((event) => ({
    workoutId: event.workoutId,
    date: event.date,
    e1rm: event.bestE1rm,
    maxLoad: event.bestLoad,
    volume: event.volume,
    completedSets: event.completedSets,
  }));
}

export function detectProgressRecords(workouts: ProgressWorkout[]): ProgressRecord[] {
  const bestE1rm = new Map<string, number>();
  const bestLoad = new Map<string, number>();
  const records: ProgressRecord[] = [];
  const events = workouts
    .flatMap((workout) => workout.exercises)
    .sort((a, b) => a.date.localeCompare(b.date) || a.workoutId.localeCompare(b.workoutId));

  for (const event of events) {
    if (event.bestE1rm != null) {
      const previous = bestE1rm.get(event.exerciseId);
      if (previous != null && event.bestE1rm > previous) {
        records.push({
          workoutId: event.workoutId,
          date: event.date,
          exerciseId: event.exerciseId,
          exerciseName: event.exerciseName,
          type: "e1rm",
          value: event.bestE1rm,
          previousBest: previous,
        });
      }
      bestE1rm.set(
        event.exerciseId,
        Math.max(previous ?? event.bestE1rm, event.bestE1rm),
      );
    }

    if (event.bestLoad != null) {
      const previous = bestLoad.get(event.exerciseId);
      if (previous != null && event.bestLoad > previous) {
        records.push({
          workoutId: event.workoutId,
          date: event.date,
          exerciseId: event.exerciseId,
          exerciseName: event.exerciseName,
          type: "load",
          value: event.bestLoad,
          previousBest: previous,
        });
      }
      bestLoad.set(
        event.exerciseId,
        Math.max(previous ?? event.bestLoad, event.bestLoad),
      );
    }
  }

  return records.sort(
    (a, b) => b.date.localeCompare(a.date) || b.value - a.value,
  );
}

export function buildExerciseBests(workouts: ProgressWorkout[]): ExerciseBest[] {
  const byExercise = new Map<string, ExerciseBest>();
  for (const event of workouts.flatMap((workout) => workout.exercises)) {
    const current = byExercise.get(event.exerciseId);
    byExercise.set(event.exerciseId, {
      exerciseId: event.exerciseId,
      exerciseName: event.exerciseName,
      bestE1rm:
        event.bestE1rm == null
          ? current?.bestE1rm
          : Math.max(current?.bestE1rm ?? 0, event.bestE1rm),
      bestLoad:
        event.bestLoad == null
          ? current?.bestLoad
          : Math.max(current?.bestLoad ?? 0, event.bestLoad),
      latestDate:
        !current || event.date > current.latestDate ? event.date : current.latestDate,
    });
  }
  return [...byExercise.values()].sort((a, b) =>
    b.latestDate.localeCompare(a.latestDate) || a.exerciseName.localeCompare(b.exerciseName),
  );
}
