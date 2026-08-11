import type {
  ExercisePerformance,
  SetPerformance,
} from "@/domain/execution/types";
import type {
  ExercisePrescription,
  EffortTarget,
} from "@/domain/training/types";

export type EffortStatus = "unknown" | "too_easy" | "on_target" | "too_hard";

export interface PerformanceSummary {
  completedWorkingSets: number;
  plannedWorkingSets: number;
  minimumCompletedReps?: number;
  maximumCompletedReps?: number;
  targetRep: number;
  allSetsMeetTarget: boolean;
  allSetsMeetRangeMinimum: boolean;
  allSetsReachRangeMaximum: boolean;
  effortStatus: EffortStatus;
  representativeEffort?: {
    scale: "RIR" | "RPE";
    value: number;
  };
}

const effortHardness = (scale: "RIR" | "RPE", value: number): number =>
  scale === "RPE" ? value : 10 - value;

const progressionSets = (performance: ExercisePerformance): SetPerformance[] => {
  const prescribed = performance.sets.filter((set) => set.prescription);
  return prescribed.length > 0 ? prescribed : performance.sets;
};

function summarizeEffort(
  sets: SetPerformance[],
  target?: EffortTarget,
): Pick<PerformanceSummary, "effortStatus" | "representativeEffort"> {
  if (!target) return { effortStatus: "unknown" };

  const actuals = sets
    .filter((set) => set.completed && set.actualEffort)
    .map((set) => set.actualEffort!);
  if (actuals.length === 0) return { effortStatus: "unknown" };

  const averageHardness =
    actuals.reduce(
      (sum, effort) => sum + effortHardness(effort.scale, effort.value),
      0,
    ) / actuals.length;
  const targetHardness = effortHardness(target.scale, target.value);
  const difference = averageHardness - targetHardness;

  const representative = actuals[actuals.length - 1];
  if (difference > 0.75) {
    return { effortStatus: "too_hard", representativeEffort: representative };
  }
  if (difference < -0.75) {
    return { effortStatus: "too_easy", representativeEffort: representative };
  }
  return { effortStatus: "on_target", representativeEffort: representative };
}

export function summarizePerformance(
  prescription: ExercisePrescription,
  performance: ExercisePerformance,
): PerformanceSummary {
  const consideredSets = progressionSets(performance);
  const completed = consideredSets.filter((set) => set.completed);
  const reps = completed.flatMap((set) =>
    set.actualReps == null ? [] : [set.actualReps],
  );
  const targetRep = Math.min(
    Math.max(
      prescription.targetRep ?? prescription.repRange.min,
      prescription.repRange.min,
    ),
    prescription.repRange.max,
  );
  const effort = summarizeEffort(consideredSets, prescription.targetEffort);

  return {
    completedWorkingSets: completed.length,
    plannedWorkingSets: prescription.plannedSetCount,
    ...(reps.length > 0
      ? {
          minimumCompletedReps: Math.min(...reps),
          maximumCompletedReps: Math.max(...reps),
        }
      : {}),
    targetRep,
    allSetsMeetTarget:
      completed.length >= prescription.plannedSetCount &&
      reps.length >= prescription.plannedSetCount &&
      reps.every((rep) => rep >= targetRep),
    allSetsMeetRangeMinimum:
      completed.length >= prescription.plannedSetCount &&
      reps.length >= prescription.plannedSetCount &&
      reps.every((rep) => rep >= prescription.repRange.min),
    allSetsReachRangeMaximum:
      completed.length >= prescription.plannedSetCount &&
      reps.length >= prescription.plannedSetCount &&
      reps.every((rep) => rep >= prescription.repRange.max),
    ...effort,
  };
}
