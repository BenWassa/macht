import type {
  ExercisePerformance,
  ExercisePrescriptionSnapshot,
  SetPerformance,
  SetPrescriptionSnapshot,
  WorkoutSession,
} from "./types";
import type {
  ExerciseId,
  ExercisePerformanceId,
  IsoDateTime,
  MesocycleId,
  ProgramId,
  SetPerformanceId,
  WorkoutSessionId,
} from "@/domain/shared/ids";
import type {
  ExercisePrescription,
  PlannedSession,
  SetPrescription,
} from "@/domain/training/types";

export interface PlannedWorkoutContext {
  programId: ProgramId;
  mesocycleId: MesocycleId;
}

export interface PlannedWorkoutIdFactory {
  workout: () => WorkoutSessionId;
  exercise: (prescription: ExercisePrescription) => ExercisePerformanceId;
  set: (prescription: SetPrescription) => SetPerformanceId;
}

const defaultIds: PlannedWorkoutIdFactory = {
  workout: () => crypto.randomUUID(),
  exercise: () => crypto.randomUUID(),
  set: () => crypto.randomUUID(),
};

const exerciseSnapshot = (
  prescription: ExercisePrescription,
): ExercisePrescriptionSnapshot => ({
  exercisePrescriptionId: prescription.id,
  programExerciseSlotId: prescription.programExerciseSlotId,
  exerciseId: prescription.exerciseId,
  targetMuscleIds: [...prescription.targetMuscleIds],
  plannedSetCount: prescription.plannedSetCount,
  repRange: { ...prescription.repRange },
  targetRep: prescription.targetRep,
  targetEffort: prescription.targetEffort
    ? { ...prescription.targetEffort }
    : undefined,
  recommendedLoad: prescription.recommendedLoad,
  restSeconds: prescription.restSeconds,
  substitutionFamilyId: prescription.substitutionFamilyId,
  allowedSubstitutionExerciseIds: prescription.allowedSubstitutionExerciseIds
    ? [...prescription.allowedSubstitutionExerciseIds]
    : undefined,
  source: prescription.source,
  progressionDecisionId: prescription.progressionDecisionId,
});

const setSnapshot = (
  set: SetPrescription,
  prescription: ExercisePrescription,
): SetPrescriptionSnapshot => ({
  setPrescriptionId: set.id,
  exercisePrescriptionId: prescription.id,
  type: set.type,
  targetLoad: set.targetLoad,
  repRange: { ...set.repRange },
  targetReps: set.targetReps,
  targetEffort: set.targetEffort ? { ...set.targetEffort } : undefined,
});

function plannedSetPerformance(
  set: SetPrescription,
  prescription: ExercisePrescription,
  ids: PlannedWorkoutIdFactory,
): SetPerformance {
  return {
    id: ids.set(set),
    index: set.index,
    completed: false,
    actualLoad: set.targetLoad ?? prescription.recommendedLoad,
    actualReps:
      set.targetReps ?? prescription.targetRep ?? set.repRange.min,
    prescription: setSnapshot(set, prescription),
  };
}

function plannedExercisePerformance(
  prescription: ExercisePrescription,
  ids: PlannedWorkoutIdFactory,
): ExercisePerformance {
  return {
    id: ids.exercise(prescription),
    exerciseId: prescription.exerciseId,
    prescriptionId: prescription.id,
    prescription: exerciseSnapshot(prescription),
    order: prescription.order,
    sets: [...prescription.sets]
      .sort((a, b) => a.index - b.index)
      .map((set) => plannedSetPerformance(set, prescription, ids)),
  };
}

export interface CreatePlannedWorkoutInput {
  plannedSession: PlannedSession;
  context: PlannedWorkoutContext;
  startedAt: IsoDateTime;
  ids?: PlannedWorkoutIdFactory;
}

export function createPlannedWorkout({
  plannedSession,
  context,
  startedAt,
  ids = defaultIds,
}: CreatePlannedWorkoutInput): WorkoutSession {
  return {
    id: ids.workout(),
    plannedSessionId: plannedSession.id,
    programId: context.programId,
    mesocycleId: context.mesocycleId,
    weekId: plannedSession.weekId,
    name: plannedSession.name,
    date: startedAt.slice(0, 10),
    startedAt,
    state: "active",
    exercisePerformances: [...plannedSession.prescriptions]
      .sort((a, b) => a.order - b.order)
      .map((prescription) => plannedExercisePerformance(prescription, ids)),
    adaptedDuringSession: false,
    source: "planned",
  };
}

export interface SetPerformancePatch {
  actualLoad?: number;
  actualReps?: number;
  actualEffort?: SetPerformance["actualEffort"];
}

export function updateSetPerformance(
  session: WorkoutSession,
  exercisePerformanceId: ExercisePerformanceId,
  setPerformanceId: SetPerformanceId,
  patch: SetPerformancePatch,
): WorkoutSession {
  return {
    ...session,
    exercisePerformances: session.exercisePerformances.map((exercise) =>
      exercise.id !== exercisePerformanceId
        ? exercise
        : {
            ...exercise,
            sets: exercise.sets.map((set) =>
              set.id === setPerformanceId ? { ...set, ...patch } : set,
            ),
          },
    ),
  };
}

export function appendSetPerformance(
  session: WorkoutSession,
  exercisePerformanceId: ExercisePerformanceId,
  setPerformanceId: SetPerformanceId,
): WorkoutSession {
  return {
    ...session,
    adaptedDuringSession: true,
    exercisePerformances: session.exercisePerformances.map((exercise) => {
      if (exercise.id !== exercisePerformanceId) return exercise;
      const previous = exercise.sets[exercise.sets.length - 1];
      return {
        ...exercise,
        sets: [
          ...exercise.sets,
          {
            id: setPerformanceId,
            index: exercise.sets.length,
            completed: false,
            actualLoad: previous?.actualLoad,
            actualReps: previous?.actualReps,
            actualEffort: previous?.actualEffort,
          },
        ],
      };
    }),
  };
}

export function toggleSetPerformance(
  session: WorkoutSession,
  exercisePerformanceId: ExercisePerformanceId,
  setPerformanceId: SetPerformanceId,
  completedAt: IsoDateTime,
): { session: WorkoutSession; completedNow: boolean } {
  let completedNow = false;
  const next = {
    ...session,
    exercisePerformances: session.exercisePerformances.map((exercise) => {
      if (exercise.id !== exercisePerformanceId) return exercise;
      return {
        ...exercise,
        sets: exercise.sets.map((set) => {
          if (set.id !== setPerformanceId) return set;
          completedNow = !set.completed;
          return {
            ...set,
            completed: completedNow,
            completedAt: completedNow ? completedAt : undefined,
          };
        }),
      };
    }),
  };
  return { session: next, completedNow };
}

export function updateExerciseNote(
  session: WorkoutSession,
  exercisePerformanceId: ExercisePerformanceId,
  note: string,
): WorkoutSession {
  return {
    ...session,
    exercisePerformances: session.exercisePerformances.map((exercise) =>
      exercise.id === exercisePerformanceId ? { ...exercise, note } : exercise,
    ),
  };
}

export function substituteExercisePerformance(
  session: WorkoutSession,
  exercisePerformanceId: ExercisePerformanceId,
  replacementExerciseId: ExerciseId,
): WorkoutSession {
  let changed = false;
  const exercisePerformances = session.exercisePerformances.map((exercise) => {
    if (exercise.id !== exercisePerformanceId) return exercise;
    const allowed = exercise.prescription?.allowedSubstitutionExerciseIds;
    if (allowed?.length && !allowed.includes(replacementExerciseId)) {
      return exercise;
    }
    changed = true;
    const substitutedFromExerciseId =
      exercise.substitutedFromExerciseId ?? exercise.exerciseId;
    return {
      ...exercise,
      exerciseId: replacementExerciseId,
      substitutedFromExerciseId,
    };
  });
  return changed
    ? { ...session, adaptedDuringSession: true, exercisePerformances }
    : session;
}

export function completeWorkout(
  session: WorkoutSession,
  finishedAt: IsoDateTime,
  durationSeconds: number,
): WorkoutSession {
  return {
    ...session,
    state: "completed",
    finishedAt,
    durationSeconds,
  };
}

export const allWorkingSetsComplete = (session: WorkoutSession): boolean =>
  session.exercisePerformances.length > 0 &&
  session.exercisePerformances.every(
    (exercise) =>
      exercise.sets.length > 0 && exercise.sets.every((set) => set.completed),
  );
