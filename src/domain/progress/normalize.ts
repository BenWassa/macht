import { getExerciseById } from "@/domain/exerciseLibrary";
import type { WorkoutSession } from "@/domain/execution/types";
import type { MuscleId } from "@/domain/shared/ids";
import type { CustomExercise, SessionLog } from "@/domain/types";
import type {
  ProgressExerciseEvent,
  ProgressSet,
  ProgressWorkout,
} from "./model";

const MUSCLE_ALIASES: Array<{ pattern: RegExp; muscleId: MuscleId }> = [
  { pattern: /chest/i, muscleId: "chest" },
  { pattern: /lat|back|row/i, muscleId: "back" },
  { pattern: /shoulder|delt|rotator|scap/i, muscleId: "shoulders" },
  { pattern: /bicep|tricep|arm/i, muscleId: "arms" },
  { pattern: /quad|leg/i, muscleId: "quads" },
  { pattern: /hamstring/i, muscleId: "hamstrings" },
  { pattern: /glute/i, muscleId: "glutes" },
  { pattern: /calf|calves/i, muscleId: "calves" },
  { pattern: /core|abdom|anti-rotation/i, muscleId: "core" },
];

export const normalizeMuscleId = (muscleId: MuscleId): MuscleId =>
  muscleId === "biceps" || muscleId === "triceps" ? "arms" : muscleId;

export function inferProgressMuscles(targetLabel?: string): MuscleId[] {
  if (!targetLabel) return [];
  return [
    ...new Set(
      MUSCLE_ALIASES.filter(({ pattern }) => pattern.test(targetLabel)).map(
        ({ muscleId }) => muscleId,
      ),
    ),
  ];
}

const e1rm = (load: number, reps: number): number | undefined => {
  if (load <= 0 || reps <= 0) return undefined;
  const cappedReps = Math.min(reps, 10);
  return load * (36 / (37 - cappedReps));
};

function summarizeExercise(
  workoutId: string,
  date: string,
  exerciseId: string,
  exerciseName: string,
  targetMuscleIds: MuscleId[],
  source: "v2" | "legacy",
  sets: ProgressSet[],
  programExerciseSlotId?: string,
  legacyE1rm?: number,
): ProgressExerciseEvent {
  const volume = sets.reduce((sum, set) => sum + set.load * set.reps, 0);
  const loads = sets.map((set) => set.load).filter((value) => value > 0);
  const reps = sets.map((set) => set.reps).filter((value) => value > 0);
  const calculatedE1rms = sets
    .map((set) => e1rm(set.load, set.reps))
    .filter((value): value is number => value != null);
  return {
    workoutId,
    date,
    exerciseId,
    exerciseName,
    targetMuscleIds: [...new Set(targetMuscleIds.map(normalizeMuscleId))],
    programExerciseSlotId,
    source,
    sets,
    completedSets: sets.length,
    volume,
    bestLoad: loads.length ? Math.max(...loads) : undefined,
    bestReps: reps.length ? Math.max(...reps) : undefined,
    bestE1rm:
      legacyE1rm && legacyE1rm > 0
        ? legacyE1rm
        : calculatedE1rms.length
          ? Math.max(...calculatedE1rms)
          : undefined,
  };
}

const parseLegacyDuration = (duration: string): number | undefined => {
  const hours = duration.match(/(\d+(?:\.\d+)?)\s*h/i);
  const minutes = duration.match(/(\d+(?:\.\d+)?)\s*m/i);
  if (!hours && !minutes) return undefined;
  return Math.round(
    ((hours ? Number(hours[1]) * 60 : 0) +
      (minutes ? Number(minutes[1]) : 0)) *
      60,
  );
};

function normalizeV2(
  workout: WorkoutSession,
  customExercises: CustomExercise[],
): ProgressWorkout {
  const exercises = workout.exercisePerformances
    .map((performance) => {
      const completed = performance.sets.filter((set) => set.completed);
      if (!completed.length) return null;
      const definition = getExerciseById(performance.exerciseId, customExercises);
      return summarizeExercise(
        workout.id,
        workout.date,
        performance.exerciseId,
        definition?.name ?? performance.exerciseId,
        performance.prescription?.targetMuscleIds ??
          inferProgressMuscles(definition?.target),
        "v2",
        completed.map((set) => ({
          load: set.actualLoad ?? 0,
          reps: set.actualReps ?? 0,
          effort: set.actualEffort
            ? { value: set.actualEffort.value, scale: set.actualEffort.scale }
            : undefined,
          prescribed: Boolean(set.prescription),
        })),
        performance.prescription?.programExerciseSlotId,
      );
    })
    .filter((event): event is ProgressExerciseEvent => event != null);
  return {
    id: workout.id,
    date: workout.date,
    name: workout.name,
    source: "v2",
    durationSeconds: workout.durationSeconds,
    programId: workout.programId,
    mesocycleId: workout.mesocycleId,
    weekId: workout.weekId,
    totalSets: exercises.reduce((sum, exercise) => sum + exercise.completedSets, 0),
    totalVolume: exercises.reduce((sum, exercise) => sum + exercise.volume, 0),
    exercises,
  };
}

function normalizeLegacy(
  session: SessionLog,
  customExercises: CustomExercise[],
): ProgressWorkout {
  const exercises = (session.exerciseSnapshots ?? [])
    .map((snapshot) => {
      const completed = snapshot.sets.filter((set) => set.completed);
      if (!completed.length) return null;
      const definition = getExerciseById(snapshot.exerciseId, customExercises);
      return summarizeExercise(
        session.id,
        session.date,
        snapshot.exerciseId,
        definition?.name ?? snapshot.exerciseId,
        inferProgressMuscles(definition?.target),
        "legacy",
        completed.map((set) => ({
          load: set.weight,
          reps: set.reps,
          effort: set.rpe == null ? undefined : { value: set.rpe },
          prescribed: false,
        })),
        undefined,
        snapshot.e1rm,
      );
    })
    .filter((event): event is ProgressExerciseEvent => event != null);
  return {
    id: session.id,
    date: session.date,
    name: session.template,
    source: "legacy",
    durationSeconds: parseLegacyDuration(session.duration),
    totalSets: exercises.reduce((sum, exercise) => sum + exercise.completedSets, 0),
    totalVolume: exercises.reduce((sum, exercise) => sum + exercise.volume, 0),
    exercises,
  };
}

export function normalizeProgressHistory(
  v2Workouts: WorkoutSession[],
  legacySessions: SessionLog[],
  customExercises: CustomExercise[] = [],
): ProgressWorkout[] {
  const completedV2 = v2Workouts.filter((workout) => workout.state === "completed");
  const v2Ids = new Set(completedV2.map((workout) => workout.id));
  return [
    ...completedV2.map((workout) => normalizeV2(workout, customExercises)),
    ...legacySessions
      .filter((session) => !v2Ids.has(session.id))
      .map((session) => normalizeLegacy(session, customExercises)),
  ].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
}
