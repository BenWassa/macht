import type { ExerciseId, IsoDate, IsoDateTime } from "@/domain/shared/ids";

export type TrainingConstraintLevel = "avoid" | "caution";
export type TrainingConstraintSource = "user" | "legacy_injury" | "program";

export interface TrainingConstraint {
  id: string;
  label: string;
  level: TrainingConstraintLevel;
  source: TrainingConstraintSource;
  createdAt: IsoDateTime;
  active: boolean;
  exerciseIds: ExerciseId[];
  blockedTags: string[];
  cautionTags: string[];
  notes?: string;
  expiresOn?: IsoDate;
}

export interface ConstraintMatch {
  constraintId: string;
  label: string;
  level: TrainingConstraintLevel;
  reasons: string[];
}

export interface ExerciseConstraintResult {
  exerciseId: ExerciseId;
  level: "clear" | TrainingConstraintLevel;
  matches: ConstraintMatch[];
}
