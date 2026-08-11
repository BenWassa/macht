import type {
  RecoveryState,
  SessionWorkload,
  StimulusRating,
} from "@/domain/feedback/types";
import type { MusclePriority } from "@/domain/exercises/muscles";
import type {
  PrescriptionDelta,
  ProgressionDecisionType,
  RecommendationReason,
} from "./types";
import { assessFatigue } from "./fatigue";

export interface VolumeRecommendation {
  decision: Extract<ProgressionDecisionType, "maintain" | "add_set" | "remove_set">;
  reasons: RecommendationReason[];
  delta: PrescriptionDelta;
}

export interface VolumeProgressionInput {
  currentSetCount: number;
  musclePriority: MusclePriority;
  recovery?: RecoveryState;
  stimulus?: StimulusRating;
  workload?: SessionWorkload;
  performanceTrend?: number;
  sessionDurationMinutes?: number;
  sessionDurationBudgetMinutes?: number;
}

const atTimeLimit = ({
  sessionDurationMinutes,
  sessionDurationBudgetMinutes,
}: Pick<
  VolumeProgressionInput,
  "sessionDurationMinutes" | "sessionDurationBudgetMinutes"
>): boolean =>
  sessionDurationMinutes != null &&
  sessionDurationBudgetMinutes != null &&
  sessionDurationMinutes >= sessionDurationBudgetMinutes;

export function recommendVolumeProgression(
  input: VolumeProgressionInput,
): VolumeRecommendation {
  const fatigue = assessFatigue(input);
  const reasons: RecommendationReason[] = [];

  if (input.recovery === "recovered") reasons.push("recovery_good");
  if (
    input.recovery === "mild_fatigue" ||
    input.recovery === "meaningful_fatigue"
  ) {
    reasons.push("recovery_incomplete");
  }
  if (input.stimulus === "low") reasons.push("stimulus_low");
  if (input.stimulus === "adequate") reasons.push("stimulus_adequate");
  if (input.stimulus === "high") reasons.push("stimulus_high");
  if (input.workload === "easy") reasons.push("workload_easy");
  if (input.workload === "appropriate") reasons.push("workload_appropriate");
  if (
    input.workload === "pushing_limit" ||
    input.workload === "too_much" ||
    atTimeLimit(input)
  ) {
    reasons.push("workload_limit_reached");
  }

  if (fatigue === "high" && input.currentSetCount > 1) {
    return {
      decision: "remove_set",
      reasons:
        reasons.length > 0
          ? reasons
          : ["performance_declining"],
      delta: {
        setCountDelta: -1,
        nextSetCount: input.currentSetCount - 1,
      },
    };
  }

  const hasVolumeEvidence = input.recovery != null && input.stimulus != null;
  if (!hasVolumeEvidence) {
    return {
      decision: "maintain",
      reasons: reasons.length > 0 ? reasons : ["insufficient_evidence"],
      delta: {},
    };
  }

  const timeAllowsMore =
    !atTimeLimit(input) &&
    input.workload !== "pushing_limit" &&
    input.workload !== "too_much";
  const performanceAllowsMore =
    input.performanceTrend == null || input.performanceTrend >= -0.02;
  const priorityAllowsMore =
    input.musclePriority === "emphasize" || input.musclePriority === "grow";
  const evidenceSupportsMore =
    input.recovery === "recovered" &&
    input.stimulus === "low" &&
    timeAllowsMore &&
    performanceAllowsMore &&
    priorityAllowsMore;

  const growThresholdMet =
    input.musclePriority !== "grow" || input.workload === "easy";

  if (evidenceSupportsMore && growThresholdMet) {
    return {
      decision: "add_set",
      reasons,
      delta: {
        setCountDelta: 1,
        nextSetCount: input.currentSetCount + 1,
      },
    };
  }

  return {
    decision: "maintain",
    reasons: reasons.length > 0 ? reasons : ["insufficient_evidence"],
    delta: {},
  };
}
