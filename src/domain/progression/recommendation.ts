import type { ExercisePerformance } from "@/domain/execution/types";
import type {
  RecoveryState,
  SessionWorkload,
  StimulusRating,
} from "@/domain/feedback/types";
import type { MusclePriority } from "@/domain/exercises/muscles";
import type { ProgressionDecisionId } from "@/domain/shared/ids";
import type {
  EffortTarget,
  ExercisePrescription,
  WeekPhase,
} from "@/domain/training/types";
import { effortTargetForWeek } from "./effortProgression";
import { recommendRepLoadProgression } from "./loadProgression";
import { summarizePerformance } from "./performanceSummary";
import type {
  PrescriptionDelta,
  ProgressionDecision,
  RecommendationReason,
} from "./types";
import { recommendVolumeProgression } from "./volumeProgression";

export interface RecommendProgressionInput {
  decisionId: ProgressionDecisionId;
  createdAt: string;
  prescription: ExercisePrescription;
  performance: ExercisePerformance;
  musclePriority: MusclePriority;
  availableLoadIncrement?: number;
  performanceTrend?: number;
  recovery?: RecoveryState;
  stimulus?: StimulusRating;
  workload?: SessionWorkload;
  sessionDurationMinutes?: number;
  sessionDurationBudgetMinutes?: number;
  mesocycleWeek: number;
  mesocyclePhase: WeekPhase;
  baseEffortTarget?: EffortTarget;
}

const uniqueReasons = (reasons: RecommendationReason[]) => [...new Set(reasons)];

function plannedEffortDelta(
  input: RecommendProgressionInput,
): Pick<PrescriptionDelta, "nextTargetEffort"> {
  if (!input.baseEffortTarget) return {};

  const nextTargetEffort = effortTargetForWeek({
    scale: input.baseEffortTarget.scale,
    startingValue: input.baseEffortTarget.value,
    weekIndex: input.mesocycleWeek,
    phase: input.mesocyclePhase,
  });
  return { nextTargetEffort };
}

function buildBaseDecision(
  input: RecommendProgressionInput,
  decision: ProgressionDecision["decision"],
  reasons: RecommendationReason[],
  delta: PrescriptionDelta,
): ProgressionDecision {
  const summary = summarizePerformance(input.prescription, input.performance);

  return {
    id: input.decisionId,
    createdAt: input.createdAt,
    exerciseId: input.prescription.exerciseId,
    sourcePrescriptionId: input.prescription.id,
    decision,
    reasons: uniqueReasons(reasons),
    evidence: {
      previousLoad:
        input.prescription.recommendedLoad ??
        input.prescription.sets.find((set) => set.targetLoad != null)?.targetLoad,
      previousRepTarget: summary.targetRep,
      ...(summary.representativeEffort
        ? { previousEffort: summary.representativeEffort }
        : {}),
      ...(input.prescription.targetEffort
        ? { targetEffort: input.prescription.targetEffort }
        : {}),
      completedWorkingSets: summary.completedWorkingSets,
      plannedWorkingSets: summary.plannedWorkingSets,
      minimumCompletedReps: summary.minimumCompletedReps,
      maximumCompletedReps: summary.maximumCompletedReps,
      repTargetAchieved: summary.allSetsMeetTarget,
      performanceTrend: input.performanceTrend,
      recovery: input.recovery,
      stimulus: input.stimulus,
      workload: input.workload,
      sessionDurationMinutes: input.sessionDurationMinutes,
      sessionDurationBudgetMinutes: input.sessionDurationBudgetMinutes,
      mesocycleWeek: input.mesocycleWeek,
      mesocyclePhase: input.mesocyclePhase,
    },
    delta,
    userDisposition: "pending",
  };
}

export function recommendProgression(
  input: RecommendProgressionInput,
): ProgressionDecision {
  const effortDelta = plannedEffortDelta(input);

  if (input.mesocyclePhase === "deload") {
    const nextSetCount = Math.max(1, Math.ceil(input.prescription.plannedSetCount / 2));
    return buildBaseDecision(
      input,
      "deload",
      ["deload_week", "mesocycle_progression"],
      {
        setCountDelta: nextSetCount - input.prescription.plannedSetCount,
        nextSetCount,
        ...effortDelta,
      },
    );
  }

  const volume = recommendVolumeProgression({
    currentSetCount: input.prescription.plannedSetCount,
    musclePriority: input.musclePriority,
    recovery: input.recovery,
    stimulus: input.stimulus,
    workload: input.workload,
    performanceTrend: input.performanceTrend,
    sessionDurationMinutes: input.sessionDurationMinutes,
    sessionDurationBudgetMinutes: input.sessionDurationBudgetMinutes,
  });

  if (volume.decision === "remove_set") {
    return buildBaseDecision(
      input,
      volume.decision,
      volume.reasons,
      { ...volume.delta, ...effortDelta },
    );
  }

  const repLoad = recommendRepLoadProgression({
    prescription: input.prescription,
    performance: input.performance,
    availableLoadIncrement: input.availableLoadIncrement,
    performanceTrend: input.performanceTrend,
  });

  if (repLoad.decision === "add_load" || repLoad.decision === "add_rep") {
    return buildBaseDecision(
      input,
      repLoad.decision,
      [...repLoad.reasons, "mesocycle_progression"],
      { ...repLoad.delta, ...effortDelta },
    );
  }

  if (volume.decision === "add_set") {
    return buildBaseDecision(
      input,
      volume.decision,
      [...volume.reasons, "mesocycle_progression"],
      { ...volume.delta, ...effortDelta },
    );
  }

  return buildBaseDecision(
    input,
    "maintain",
    [...repLoad.reasons, ...volume.reasons, "mesocycle_progression"],
    effortDelta,
  );
}
