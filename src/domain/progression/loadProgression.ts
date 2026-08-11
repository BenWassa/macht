import type { ExercisePerformance } from "@/domain/execution/types";
import type { ExercisePrescription } from "@/domain/training/types";
import type {
  PrescriptionDelta,
  ProgressionDecisionType,
  RecommendationReason,
} from "./types";
import { summarizePerformance } from "./performanceSummary";

export interface RepLoadRecommendation {
  decision: Extract<ProgressionDecisionType, "maintain" | "add_rep" | "add_load">;
  reasons: RecommendationReason[];
  delta: PrescriptionDelta;
}

export interface RepLoadProgressionInput {
  prescription: ExercisePrescription;
  performance: ExercisePerformance;
  availableLoadIncrement?: number;
  performanceTrend?: number;
}

const currentLoad = (prescription: ExercisePrescription): number | undefined =>
  prescription.recommendedLoad ??
  prescription.sets.find((set) => set.targetLoad != null)?.targetLoad;

export function recommendRepLoadProgression({
  prescription,
  performance,
  availableLoadIncrement,
  performanceTrend,
}: RepLoadProgressionInput): RepLoadRecommendation {
  const summary = summarizePerformance(prescription, performance);
  const trendReason: RecommendationReason[] =
    performanceTrend != null && performanceTrend > 0
      ? ["performance_improving"]
      : performanceTrend != null && performanceTrend < -0.05
        ? ["performance_declining"]
        : [];

  if (
    summary.completedWorkingSets < summary.plannedWorkingSets ||
    summary.minimumCompletedReps == null
  ) {
    return {
      decision: "maintain",
      reasons: ["insufficient_evidence", ...trendReason],
      delta: {},
    };
  }

  if (!summary.allSetsMeetRangeMinimum) {
    return {
      decision: "maintain",
      reasons: ["rep_target_missed", ...trendReason],
      delta: {},
    };
  }

  if (summary.effortStatus === "too_hard") {
    return {
      decision: "maintain",
      reasons: ["effort_too_high", ...trendReason],
      delta: {},
    };
  }

  if (!summary.allSetsMeetTarget) {
    return {
      decision: "maintain",
      reasons: ["insufficient_evidence", ...trendReason],
      delta: {},
    };
  }

  const effortReason: RecommendationReason[] =
    summary.effortStatus === "on_target"
      ? ["effort_on_target"]
      : summary.effortStatus === "too_easy"
        ? ["effort_too_low"]
        : [];

  if (summary.targetRep < prescription.repRange.max) {
    const nextRepTarget = Math.min(
      prescription.repRange.max,
      summary.targetRep + 1,
    );
    return {
      decision: "add_rep",
      reasons: ["rep_target_reached", ...effortReason, ...trendReason],
      delta: {
        repTargetDelta: nextRepTarget - summary.targetRep,
        nextRepTarget,
      },
    };
  }

  const load = currentLoad(prescription);
  if (
    summary.allSetsReachRangeMaximum &&
    summary.effortStatus !== "unknown" &&
    load != null &&
    availableLoadIncrement != null &&
    availableLoadIncrement > 0
  ) {
    return {
      decision: "add_load",
      reasons: [
        "rep_target_reached",
        ...effortReason,
        "load_increment_available",
        ...trendReason,
      ],
      delta: {
        loadDelta: availableLoadIncrement,
        nextLoad: load + availableLoadIncrement,
        nextRepTarget: prescription.repRange.min,
        repTargetDelta: prescription.repRange.min - summary.targetRep,
      },
    };
  }

  return {
    decision: "maintain",
    reasons: [
      "rep_target_reached",
      ...(summary.effortStatus === "unknown" ? ["insufficient_evidence" as const] : []),
      ...(availableLoadIncrement == null || availableLoadIncrement <= 0
        ? ["load_increment_unavailable" as const]
        : []),
      ...trendReason,
    ],
    delta: {},
  };
}
