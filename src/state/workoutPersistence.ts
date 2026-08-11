import type { WorkoutSession } from "@/domain/execution/types";
import type { SetEntry, WorkoutSets } from "@/domain/types";

interface PersistedWorkoutShape {
  workoutActive?: boolean;
  workoutName?: string;
  workoutDuration?: number;
  startedAt?: number | null;
  activeWorkoutList?: string[];
  workoutSets?: WorkoutSets;
  activeV2Workout?: WorkoutSession | null;
  selectedExIndex?: number;
  selectedSetIndex?: number;
  isMinimumSession?: boolean;
  adaptedDuringSession?: boolean;
  exerciseNotes?: Record<string, string>;
}

const migratedSet = (exerciseId: string, set: SetEntry, index: number) => ({
  id: `migrated-active:${exerciseId}:set:${set.id ?? index}`,
  index,
  completed: Boolean(set.completed),
  actualLoad: Math.max(0, Number(set.weight) || 0),
  actualReps: Math.max(0, Math.round(Number(set.reps) || 0)),
});

export function migratePersistedActiveWorkout(
  persisted: PersistedWorkoutShape,
): PersistedWorkoutShape {
  if (!persisted.workoutActive || persisted.activeV2Workout) return persisted;

  const exerciseIds = persisted.activeWorkoutList ?? [];
  const workoutSets = persisted.workoutSets ?? {};
  if (!exerciseIds.length) return { ...persisted, workoutActive: false };

  const startMillis =
    typeof persisted.startedAt === "number" && Number.isFinite(persisted.startedAt)
      ? persisted.startedAt
      : Date.now() - Math.max(0, persisted.workoutDuration ?? 0) * 1000;
  const startedAt = new Date(startMillis).toISOString();
  const activeV2Workout: WorkoutSession = {
    id: `migrated-active:${startMillis}`,
    name: persisted.workoutName?.trim() || "Recovered session",
    date: startedAt.slice(0, 10),
    startedAt,
    state: "active",
    exercisePerformances: exerciseIds.map((exerciseId, order) => {
      const existingSets = workoutSets[exerciseId] ?? [];
      const sets = existingSets.length
        ? existingSets.map((set, index) => migratedSet(exerciseId, set, index))
        : [
            {
              id: `migrated-active:${exerciseId}:set:0`,
              index: 0,
              completed: false,
              actualLoad: 0,
              actualReps: 0,
            },
          ];
      return {
        id: `migrated-active:${exerciseId}:${order}`,
        exerciseId,
        order,
        sets,
        note: persisted.exerciseNotes?.[exerciseId],
      };
    }),
    adaptedDuringSession: Boolean(persisted.adaptedDuringSession),
    source: "freeplay",
    note: persisted.isMinimumSession ? "Recovered from a legacy minimum session." : undefined,
  };

  return {
    ...persisted,
    activeV2Workout,
    activeWorkoutList: activeV2Workout.exercisePerformances.map(
      (exercise) => exercise.exerciseId,
    ),
    workoutSets: {},
    selectedExIndex: Math.min(
      Math.max(0, persisted.selectedExIndex ?? 0),
      activeV2Workout.exercisePerformances.length - 1,
    ),
    selectedSetIndex: Math.max(0, persisted.selectedSetIndex ?? 0),
    isMinimumSession: false,
  };
}
