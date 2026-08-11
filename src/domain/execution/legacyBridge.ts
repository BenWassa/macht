import { computeExerciseE1rm } from "@/domain/sessionStats";
import type { SessionLog, SetEntry } from "@/domain/types";
import type { WorkoutSession } from "./types";

const asLegacySets = (
  workout: WorkoutSession,
  exerciseIndex: number,
): SetEntry[] =>
  workout.exercisePerformances[exerciseIndex].sets.map((set, index) => ({
    id: index + 1,
    weight: set.actualLoad ?? 0,
    reps: set.actualReps ?? 0,
    rpe: set.actualEffort?.value ?? null,
    completed: set.completed,
    last: "-",
  }));

export function v2WorkoutSummary(workout: WorkoutSession): {
  sets: number;
  volume: number;
} {
  const completedSets = workout.exercisePerformances.flatMap((exercise) =>
    exercise.sets.filter((set) => set.completed),
  );
  return {
    sets: completedSets.length,
    volume: completedSets.reduce(
      (sum, set) => sum + (set.actualLoad ?? 0) * (set.actualReps ?? 0),
      0,
    ),
  };
}

export function toLegacySessionLog(workout: WorkoutSession): SessionLog {
  const summary = v2WorkoutSummary(workout);
  const exerciseSnapshots = workout.exercisePerformances.map((exercise, index) => {
    const sets = asLegacySets(workout, index);
    return {
      exerciseId: exercise.exerciseId,
      sets,
      e1rm: computeExerciseE1rm(exercise.exerciseId, sets),
      ...(exercise.note ? { notes: exercise.note } : {}),
    };
  });

  return {
    id: workout.id,
    date: workout.date,
    template: workout.name,
    duration: `${Math.floor((workout.durationSeconds ?? 0) / 60)}m`,
    volume: summary.volume,
    sets: summary.sets,
    adapted: workout.adaptedDuringSession,
    isMinimumSession: false,
    exerciseSnapshots,
  };
}
