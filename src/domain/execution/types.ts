import type { ExerciseFeedback, SessionFeedback } from "@/domain/feedback/types";
import type {
  ExerciseId,
  ExercisePerformanceId,
  ExercisePrescriptionId,
  IsoDate,
  IsoDateTime,
  MesocycleId,
  MuscleId,
  PlannedSessionId,
  ProgramId,
  SetPerformanceId,
  SetPrescriptionId,
  WeekId,
  WorkoutSessionId,
} from "@/domain/shared/ids";
import type {
  EffortScale,
  ExercisePrescription as PlannedExercisePrescription,
  SetType,
} from "@/domain/training/types";

export type WorkoutCompletionState = "active" | "completed" | "abandoned";

export interface EffortActual {
  scale: EffortScale;
  value: number;
}

export interface SetPrescriptionSnapshot {
  setPrescriptionId?: SetPrescriptionId;
  exercisePrescriptionId?: ExercisePrescriptionId;
  type: SetType;
  targetLoad?: number;
  repRange?: {
    min: number;
    max: number;
  };
  targetReps?: number;
  targetEffort?: {
    scale: EffortScale;
    value: number;
  };
}

export interface ExercisePrescriptionSnapshot {
  exercisePrescriptionId: ExercisePrescriptionId;
  programExerciseSlotId?: string;
  exerciseId: ExerciseId;
  targetMuscleIds: MuscleId[];
  plannedSetCount: number;
  repRange: { min: number; max: number };
  targetRep?: number;
  targetEffort?: {
    scale: EffortScale;
    value: number;
  };
  recommendedLoad?: number;
  restSeconds?: number;
  substitutionFamilyId?: string;
  allowedSubstitutionExerciseIds?: ExerciseId[];
  source: PlannedExercisePrescription["source"];
  progressionDecisionId?: string;
}

export interface SetPerformance {
  id: SetPerformanceId;
  index: number;
  completed: boolean;
  completedAt?: IsoDateTime;
  actualLoad?: number;
  actualReps?: number;
  actualEffort?: EffortActual;
  prescription?: SetPrescriptionSnapshot;
}

export interface ExercisePerformance {
  id: ExercisePerformanceId;
  exerciseId: ExerciseId;
  prescriptionId?: ExercisePrescriptionId;
  prescription?: ExercisePrescriptionSnapshot;
  order: number;
  substitutedFromExerciseId?: ExerciseId;
  sets: SetPerformance[];
  feedback?: ExerciseFeedback;
  note?: string;
}

export interface WorkoutSession {
  id: WorkoutSessionId;
  plannedSessionId?: PlannedSessionId;
  programId?: ProgramId;
  mesocycleId?: MesocycleId;
  weekId?: WeekId;
  name: string;
  date: IsoDate;
  startedAt?: IsoDateTime;
  finishedAt?: IsoDateTime;
  durationSeconds?: number;
  state: WorkoutCompletionState;
  exercisePerformances: ExercisePerformance[];
  sessionFeedback?: SessionFeedback;
  adaptedDuringSession: boolean;
  source: "planned" | "freeplay" | "legacy_migration";
  note?: string;
}
