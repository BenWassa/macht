import type {
  ExerciseFeedbackId,
  ExerciseId,
  IsoDateTime,
  MuscleId,
  RecoveryObservationId,
} from "@/domain/shared/ids";

export type ExerciseQuality = "poor" | "okay" | "great";
export type StimulusRating = "low" | "adequate" | "high";
export type ComfortRating = "none" | "mild" | "significant";
export type RecoveryState = "recovered" | "mild_fatigue" | "meaningful_fatigue";
export type SessionWorkload = "easy" | "appropriate" | "pushing_limit" | "too_much";

export interface ExerciseFeedback {
  id: ExerciseFeedbackId;
  exerciseId: ExerciseId;
  recordedAt: IsoDateTime;
  quality?: ExerciseQuality;
  stimulus?: StimulusRating;
  comfortIssue?: ComfortRating;
  note?: string;
}

export interface RecoveryObservation {
  id: RecoveryObservationId;
  muscleId: MuscleId;
  recordedAt: IsoDateTime;
  state: RecoveryState;
  source: "pre_session" | "post_session" | "manual";
}

export interface SessionFeedback {
  workload?: SessionWorkload;
  durationPressure?: boolean;
  note?: string;
}
