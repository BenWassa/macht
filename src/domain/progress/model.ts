import type { MusclePriority } from "@/domain/exercises/muscles";
import type { ProgressionDecisionType } from "@/domain/progression/types";
import type { MuscleId } from "@/domain/shared/ids";

export type ProgressSource = "v2" | "legacy";

export interface ProgressSet {
  load: number;
  reps: number;
  effort?: {
    value: number;
    scale?: "RIR" | "RPE";
  };
  prescribed: boolean;
}

export interface ProgressExerciseEvent {
  workoutId: string;
  date: string;
  exerciseId: string;
  exerciseName: string;
  targetMuscleIds: MuscleId[];
  programExerciseSlotId?: string;
  source: ProgressSource;
  sets: ProgressSet[];
  completedSets: number;
  volume: number;
  bestLoad?: number;
  bestReps?: number;
  bestE1rm?: number;
}

export interface ProgressWorkout {
  id: string;
  date: string;
  name: string;
  source: ProgressSource;
  durationSeconds?: number;
  programId?: string;
  mesocycleId?: string;
  weekId?: string;
  totalSets: number;
  totalVolume: number;
  exercises: ProgressExerciseEvent[];
}

export interface ExerciseTrendPoint {
  workoutId: string;
  date: string;
  e1rm?: number;
  maxLoad?: number;
  volume: number;
  completedSets: number;
}

export type ProgressRecordType = "e1rm" | "load";

export interface ProgressRecord {
  workoutId: string;
  date: string;
  exerciseId: string;
  exerciseName: string;
  type: ProgressRecordType;
  value: number;
  previousBest: number;
}

export interface ExerciseBest {
  exerciseId: string;
  exerciseName: string;
  bestE1rm?: number;
  bestLoad?: number;
  latestDate: string;
}

export interface ConsistencyWeek {
  startDate: string;
  endDate: string;
  completedSessions: number;
  targetSessions?: number;
  targetMet?: boolean;
}

export interface MuscleProgress {
  muscleId: MuscleId;
  name: string;
  targetedSets: number;
  sessions: number;
  latestDate?: string;
  priority?: MusclePriority;
}

export interface MesocycleProgressSummary {
  id: string;
  name: string;
  index: number;
  status: string;
  plannedSessions: number;
  completedSessions: number;
  completionRate: number;
  totalSets: number;
  totalVolume: number;
  records: number;
  startDate?: string;
}

export interface ExerciseResponseEvent {
  id: string;
  date: string;
  decision: ProgressionDecisionType;
  reasons: string[];
  summary: string;
}
