import type { MuscleId } from "@/domain/shared/ids";
import type { ProgressionDecisionType } from "@/domain/progression/types";

export type PersonalizationConfidence =
  | "insufficient"
  | "emerging"
  | "established";

export interface EvidenceSummary {
  evidenceCount: number;
  confidence: PersonalizationConfidence;
  explanation: string;
}

export type ExerciseResponsePattern =
  | "insufficient"
  | "progressing"
  | "stable"
  | "fatigue_limited"
  | "mixed";

export interface ExerciseResponseProfile extends EvidenceSummary {
  exerciseId: string;
  exerciseName: string;
  pattern: ExerciseResponsePattern;
  progressionRate: number;
  fatigueInterventionRate: number;
  decisionCounts: Partial<Record<ProgressionDecisionType, number>>;
  medianObservedLoadIncrement?: number;
  latestEvidenceDate?: string;
}

export type VolumeObservationOutcome =
  | "productive"
  | "understimulated"
  | "fatigue_limited"
  | "unclear";

export interface VolumeObservation {
  decisionId: string;
  date: string;
  muscleId: MuscleId;
  plannedWorkingSets: number;
  outcome: VolumeObservationOutcome;
}

export interface MuscleVolumeResponseProfile extends EvidenceSummary {
  muscleId: MuscleId;
  observations: number;
  productiveObservations: number;
  fatigueLimitedObservations: number;
  understimulatedObservations: number;
  observedProductiveSetRange?: {
    min: number;
    max: number;
  };
  repeatedFatigueAtOrAboveSets?: number;
}

export interface SessionDurationPattern extends EvidenceSummary {
  observations: number;
  medianDurationMinutes?: number;
  comfortableDurationMinutes?: number;
  repeatedHighWorkloadAtOrAboveMinutes?: number;
}

export interface WeekdayPattern {
  weekday: number;
  label: string;
  plannedSessions: number;
  completedSessions: number;
  skippedSessions: number;
  completionRate?: number;
}

export interface SchedulePattern extends EvidenceSummary {
  weekdays: WeekdayPattern[];
  strongerWeekdays: number[];
  weakerWeekdays: number[];
}

export interface PersonalTrainingModel {
  generatedAt: string;
  exerciseResponses: ExerciseResponseProfile[];
  muscleVolumeResponses: MuscleVolumeResponseProfile[];
  sessionDuration: SessionDurationPattern;
  schedule: SchedulePattern;
  establishedSignals: number;
}

export interface PersonalizationAdjustment {
  kind: "suppress_volume_increase";
  explanation: string;
  evidenceCount: number;
  confidence: "established";
  muscleIds: MuscleId[];
}
