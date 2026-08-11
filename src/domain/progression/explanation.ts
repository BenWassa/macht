import type {
  ProgressionDecision,
  RecommendationReason,
} from "./types";

const REASON_COPY: Record<RecommendationReason, string> = {
  rep_target_reached: "Rep target was completed.",
  rep_target_missed: "At least one working set missed the rep range.",
  effort_on_target: "Recorded effort matched the prescription.",
  effort_too_high: "Recorded effort was harder than prescribed.",
  effort_too_low: "Recorded effort was easier than prescribed.",
  performance_improving: "Recent comparable performance is improving.",
  performance_declining: "Recent comparable performance is declining.",
  recovery_good: "Recovery was complete before the next exposure.",
  recovery_incomplete: "Meaningful fatigue remained between exposures.",
  stimulus_low: "Target-muscle stimulus was reported as low.",
  stimulus_adequate: "Target-muscle stimulus was adequate.",
  stimulus_high: "Target-muscle stimulus was high.",
  workload_easy: "Session workload had spare capacity.",
  workload_appropriate: "Session workload was manageable.",
  workload_limit_reached: "Session workload or time budget was at its limit.",
  mesocycle_progression: "The next target follows the mesocycle progression.",
  deload_week: "The next session is in the deload phase.",
  load_increment_available: "A usable load increment is available.",
  load_increment_unavailable: "A suitable load increment is unavailable.",
  insufficient_evidence: "The available evidence does not support a progression change.",
  user_override: "The user changed the automated prescription.",
};

export interface ProgressionExplanation {
  title: string;
  detail: string;
  reasons: string[];
}

function titleFor(decision: ProgressionDecision): string {
  switch (decision.decision) {
    case "add_rep":
      return decision.delta.nextRepTarget != null
        ? `Target ${decision.delta.nextRepTarget} reps`
        : "Add 1 rep";
    case "add_load":
      return decision.delta.nextLoad != null
        ? `Increase load to ${decision.delta.nextLoad}`
        : "Increase load";
    case "add_set":
      return decision.delta.nextSetCount != null
        ? `Increase to ${decision.delta.nextSetCount} sets`
        : "Add 1 set";
    case "remove_set":
      return decision.delta.nextSetCount != null
        ? `Reduce to ${decision.delta.nextSetCount} sets`
        : "Remove 1 set";
    case "deload":
      return "Deload this exposure";
    case "rotate_exercise":
      return "Rotate exercise";
    case "maintain":
    default:
      return "Hold prescription";
  }
}

export function explainProgressionDecision(
  decision: ProgressionDecision,
): ProgressionExplanation {
  const reasons = decision.reasons.map((reason) => REASON_COPY[reason]);
  return {
    title: titleFor(decision),
    detail: reasons[0] ?? "Prescription held pending more evidence.",
    reasons,
  };
}
