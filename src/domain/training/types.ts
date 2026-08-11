import type { MusclePriorities } from "@/domain/exercises/muscles";
import type {
  ExerciseId,
  ExercisePrescriptionId,
  IsoDate,
  IsoDateTime,
  MesocycleId,
  PlannedSessionId,
  ProgramId,
  SetPrescriptionId,
  WeekId,
} from "@/domain/shared/ids";

export type TrainingGoal = "hypertrophy" | "strength_hypertrophy";
export type MesocycleStatus = "planned" | "active" | "completed" | "archived";
export type WeekPhase = "accumulation" | "deload";
export type PlannedSessionStatus =
  | "planned"
  | "completed"
  | "moved"
  | "skipped";
export type EffortScale = "RIR" | "RPE";
export type SetType = "working" | "backoff" | "myorep" | "other";

export interface EffortTarget {
  scale: EffortScale;
  value: number;
}

export interface Program {
  id: ProgramId;
  name: string;
  goal: TrainingGoal;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
  sessionsPerWeek: 2 | 3 | 4 | 5 | 6;
  defaultSessionDurationMinutes: number;
  musclePriorities: MusclePriorities;
  preferredWeekdays?: number[];
  activeMesocycleId?: MesocycleId;
}

export interface Mesocycle {
  id: MesocycleId;
  programId: ProgramId;
  index: number;
  name?: string;
  status: MesocycleStatus;
  createdAt: IsoDateTime;
  startDate?: IsoDate;
  accumulationWeeks: number;
  includesDeload: boolean;
  weeks: MesocycleWeek[];
}

export interface MesocycleWeek {
  id: WeekId;
  mesocycleId: MesocycleId;
  index: number;
  phase: WeekPhase;
  targetEffort?: EffortTarget;
  sessions: PlannedSession[];
}

export interface PlannedSession {
  id: PlannedSessionId;
  weekId: WeekId;
  index: number;
  name: string;
  plannedDate?: IsoDate;
  movedFromDate?: IsoDate;
  targetDurationMinutes: number;
  status: PlannedSessionStatus;
  prescriptions: ExercisePrescription[];
}

export interface ExercisePrescription {
  id: ExercisePrescriptionId;
  plannedSessionId: PlannedSessionId;
  exerciseId: ExerciseId;
  order: number;
  targetMuscleIds: string[];
  plannedSetCount: number;
  repRange: {
    min: number;
    max: number;
  };
  targetEffort?: EffortTarget;
  recommendedLoad?: number;
  restSeconds?: number;
  substitutionFamilyId?: string;
  source:
    | "program_initial"
    | "progression_engine"
    | "user_override"
    | "schedule_repair";
  progressionDecisionId?: string;
  sets: SetPrescription[];
}

export interface SetPrescription {
  id: SetPrescriptionId;
  exercisePrescriptionId: ExercisePrescriptionId;
  index: number;
  type: SetType;
  targetLoad?: number;
  repRange: {
    min: number;
    max: number;
  };
  targetEffort?: EffortTarget;
}
