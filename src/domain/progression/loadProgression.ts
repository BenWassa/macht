import type {
  ExercisePerformance,
  SetPerformance,
} from "@/domain/execution/types";
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

const baselineSets = (performance: ExercisePerformance): SetPerformance[] => {
  const prescribed = performance.sets.filter((set) => set.prescription);
  return prescribed.length > 0 ? prescribed : performance.sets;
};

const actualLoadBaseline = (
  performance: ExercisePerformance,
): number | undefined => {
  const loads = baselineSets(performance)
    .filter((set) => set.completed && set.actualLoad != null && set.actualLoad > 0)
    .map((set) => set.actualLoad!);
  return loads.length ? Math.min(...loads) : undefined;
};

const withBaseline = (
  prescription: ExercisePrescription,
  performance: ExercisePerformance,
): {
  load: number | undefined;
  reasons: RecommendationReason[];
  delta: PrescriptionDelta;
} => {
  const prescribedLoad = currentLoad(prescription);
  if (prescribedLoad != null) {
    return { load: prescribedLoad, reasons: [], delta: {} };
  }
  const baseline = actualLoadBaseline(performance);
  if (baseline == null) return { load: undefined, reasons: [], delta: {} };
  return {
    load: baseline,
    reasons: ["load_baseline_established"],
    delta: { nextLoad: baseline },
  };
};

export function recommendRepLoadProgression({
  prescription,
  performance,
  availableLoadIncrement,
  performanceTrend,
}: RepLoadProgressionInput): RepLoadRecommendation {
  const summary = summarizePerformance(prescription, performance);
  const baseline = withBaseline(prescription, performance);
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
      reasons: ["insufficient_evidence", ...baseline.reasons, ...trendReason],
      delta: baseline.delta,
    };
  }

  if (!summary.allSetsMeetRangeMinimum) {
    return {
      decision: "maintain",
      reasons: ["rep_target_missed", ...baseline.reasons, ...trendReason],
      delta: baseline.delta,
    };
  }

  if (summary.effortStatus === "too_hard") {
    return {
      decision: "maintain",
      reasons: ["effort_too_high", ...baseline.reasons, ...trendReason],
      delta: baseline.delta,
    };
  }

  if (!summary.allSetsMeetTarget) {
    return {
      decision: "maintain",
      reasons: ["insufficient_evidence", ...baseline.reasons, ...trendReason],
      delta: baseline.delta,
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
      reasons: [
        "rep_target_reached",
        ...effortReason,
        ...baseline.reasons,
        ...trendReason,
      ],
      delta: {
        ...baseline.delta,
        repTargetDelta: nextRepTarget - summary.targetRep,
        nextRepTarget,
      },
    };
  }

  if (
    summary.allSetsReachRangeMaximum &&
    summary.effortStatus !== "unknown" &&
    baseline.load != null &&
    availableLoadIncrement != null &&
    availableLoadIncrement > 0
  ) {
    return {
      decision: "add_load",
      reasons: [
        "rep_target_reached",
        ...effortReason,
        ...baseline.reasons,
        "load_increment_available",
        ...trendReason,
      ],
      delta: {
        loadDelta: availableLoadIncrement,
        nextLoad: baseline.load + availableLoadIncrement,
        nextRepTarget: prescription.repRange.min,
        repTargetDelta: prescription.repRange.min - summary.targetRep,
      },
    };
  }

  return {
    decision: "maintain",
    reasons: [
      "rep_target_reached",
      ...baseline.reasons,
      ...(summary.effortStatus === "unknown"
        ? ["insufficient_evidence" as const]
        : []),
      ...(availableLoadIncrement == null || availableLoadIncrement <= 0
        ? ["load_increment_unavailable" as const]
        : []),
      ...trendReason,
    ],
    delta: baseline.delta,
  };
}
