import type { RecoveryState, SessionWorkload, StimulusRating } from "@/domain/feedback/types";
import type {
  ExerciseId,
  ExercisePrescriptionId,
  IsoDateTime,
  ProgressionDecisionId,
} from "@/domain/shared/ids";
import type { EffortScale } from "@/domain/training/types";

export type ProgressionDecisionType =
  | "maintain"
  | "add_rep"
  | "add_load"
  | "add_set"
  | "remove_set"
  | "deload"
  | "rotate_exercise";

export type RecommendationReason =
  | "rep_target_reached"
  | "rep_target_missed"
  | "effort_on_target"
  | "effort_too_high"
  | "effort_too_low"
  | "performance_improving"
  | "performance_declining"
  | "recovery_good"
  | "recovery_incomplete"
  | "stimulus_low"
  | "stimulus_adequate"
  | "stimulus_high"
  | "workload_easy"
  | "workload_appropriate"
  | "workload_limit_reached"
  | "mesocycle_progression"
  | "deload_week"
  | "load_baseline_established"
  | "load_increment_available"
  | "load_increment_unavailable"
  | "insufficient_evidence"
  | "user_override";

export interface ProgressionEvidence {
  previousLoad?: number;
  previousRepTarget?: number;
  previousEffort?: {
    scale: EffortScale;
    value: number;
  };
  targetEffort?: {
    scale: EffortScale;
    value: number;
  };
  completedWorkingSets?: number;
  plannedWorkingSets?: number;
  minimumCompletedReps?: number;
  maximumCompletedReps?: number;
  repTargetAchieved?: boolean;
  performanceTrend?: number;
  recovery?: RecoveryState;
  stimulus?: StimulusRating;
  workload?: SessionWorkload;
  sessionDurationMinutes?: number;
  sessionDurationBudgetMinutes?: number;
  mesocycleWeek?: number;
  mesocyclePhase?: "accumulation" | "deload";
}

export interface PrescriptionDelta {
  loadDelta?: number;
  nextLoad?: number;
  repTargetDelta?: number;
  nextRepTarget?: number;
  setCountDelta?: number;
  nextSetCount?: number;
  nextTargetEffort?: {
    scale: EffortScale;
    value: number;
  };
  replacementExerciseId?: ExerciseId;
}

export interface ProgressionPersonalizationAudit {
  baseDecision: ProgressionDecisionType;
  baseDelta: PrescriptionDelta;
  adjustment: "suppress_volume_increase";
  explanation: string;
  evidenceCount: number;
  confidence: "established";
  muscleIds: string[];
}

export interface ProgressionDecision {
  id: ProgressionDecisionId;
  createdAt: IsoDateTime;
  exerciseId: ExerciseId;
  sourcePrescriptionId?: ExercisePrescriptionId;
  decision: ProgressionDecisionType;
  reasons: RecommendationReason[];
  evidence: ProgressionEvidence;
  delta: PrescriptionDelta;
  confidence?: number;
  userDisposition?: "pending" | "accepted" | "overridden" | "auto_applied";
  personalization?: ProgressionPersonalizationAudit;
}
