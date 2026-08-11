import type { ProgressionDecision } from "@/domain/progression/types";
import type { MuscleId } from "@/domain/shared/ids";
import type { Mesocycle } from "@/domain/training/types";
import { normalizeMuscleId } from "@/domain/progress/normalize";
import { confidenceCopy, personalizationConfidence } from "./confidence";
import type {
  MuscleVolumeResponseProfile,
  VolumeObservation,
  VolumeObservationOutcome,
} from "./types";

interface PrescriptionContext {
  targetMuscleIds: MuscleId[];
  plannedWorkingSets?: number;
}

const prescriptionLookup = (
  mesocycles: Mesocycle[],
): Map<string, PrescriptionContext> => {
  const lookup = new Map<string, PrescriptionContext>();
  for (const cycle of mesocycles) {
    for (const week of cycle.weeks) {
      for (const session of week.sessions) {
        for (const prescription of session.prescriptions) {
          lookup.set(prescription.id, {
            targetMuscleIds: [
              ...new Set(
                prescription.targetMuscleIds.map(normalizeMuscleId),
              ),
            ],
            plannedWorkingSets: prescription.plannedSetCount,
          });
        }
      }
    }
  }
  return lookup;
};

const outcomeFor = (
  decision: ProgressionDecision,
): VolumeObservationOutcome => {
  const evidence = decision.evidence;
  const workloadLimited =
    evidence.workload === "pushing_limit" ||
    evidence.workload === "too_much";
  const recoveryLimited =
    evidence.recovery === "mild_fatigue" ||
    evidence.recovery === "meaningful_fatigue";
  const performanceLimited =
    evidence.performanceTrend != null && evidence.performanceTrend < -0.05;

  if (workloadLimited || recoveryLimited || performanceLimited) {
    return "fatigue_limited";
  }
  if (
    evidence.stimulus === "low" &&
    evidence.recovery === "recovered"
  ) {
    return "understimulated";
  }
  if (
    evidence.stimulus === "adequate" &&
    evidence.recovery === "recovered" &&
    (evidence.workload === "easy" ||
      evidence.workload === "appropriate" ||
      evidence.workload == null) &&
    (evidence.performanceTrend == null || evidence.performanceTrend >= -0.02)
  ) {
    return "productive";
  }
  return "unclear";
};

export function buildVolumeObservations(
  decisions: ProgressionDecision[],
  mesocycles: Mesocycle[],
): VolumeObservation[] {
  const lookup = prescriptionLookup(mesocycles);
  const observations: VolumeObservation[] = [];

  for (const decision of decisions) {
    if (!decision.sourcePrescriptionId) continue;
    const context = lookup.get(decision.sourcePrescriptionId);
    const plannedWorkingSets =
      decision.evidence.plannedWorkingSets ?? context?.plannedWorkingSets;
    if (!context || plannedWorkingSets == null || plannedWorkingSets < 1) {
      continue;
    }
    const outcome = outcomeFor(decision);
    for (const muscleId of context.targetMuscleIds) {
      observations.push({
        decisionId: decision.id,
        date: decision.createdAt.slice(0, 10),
        muscleId,
        plannedWorkingSets,
        outcome,
      });
    }
  }
  return observations;
}

const repeatedFatigueThreshold = (
  observations: VolumeObservation[],
): number | undefined => {
  const fatigue = observations.filter(
    (observation) => observation.outcome === "fatigue_limited",
  );
  const counts = new Map<number, number>();
  for (const observation of fatigue) {
    for (let setCount = observation.plannedWorkingSets; setCount <= 8; setCount += 1) {
      counts.set(setCount, (counts.get(setCount) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .filter(([, count]) => count >= 2)
    .map(([setCount]) => setCount)
    .sort((a, b) => a - b)[0];
};

export function buildMuscleVolumeResponseProfiles(
  decisions: ProgressionDecision[],
  mesocycles: Mesocycle[],
): MuscleVolumeResponseProfile[] {
  const observations = buildVolumeObservations(decisions, mesocycles);
  const grouped = new Map<MuscleId, VolumeObservation[]>();
  for (const observation of observations) {
    const items = grouped.get(observation.muscleId) ?? [];
    items.push(observation);
    grouped.set(observation.muscleId, items);
  }

  return [...grouped.entries()]
    .map(([muscleId, items]) => {
      const productive = items.filter(
        (observation) => observation.outcome === "productive",
      );
      const fatigue = items.filter(
        (observation) => observation.outcome === "fatigue_limited",
      );
      const understimulated = items.filter(
        (observation) => observation.outcome === "understimulated",
      );
      const evidenceCount = items.length;
      const confidence = personalizationConfidence(evidenceCount);
      const productiveSets = productive.map(
        (observation) => observation.plannedWorkingSets,
      );
      const fatigueThreshold = repeatedFatigueThreshold(items);
      const observedProductiveSetRange =
        productiveSets.length >= 3
          ? {
              min: Math.min(...productiveSets),
              max: Math.max(...productiveSets),
            }
          : undefined;
      const repeatedFatigueAtOrAboveSets =
        confidence === "established" ? fatigueThreshold : undefined;
      const detail = repeatedFatigueAtOrAboveSets != null
        ? `Repeated fatigue or workload-limit evidence has appeared at ${repeatedFatigueAtOrAboveSets}+ planned sets for this muscle in an exercise exposure.`
        : observedProductiveSetRange
          ? `Productive observations have occurred between ${observedProductiveSetRange.min} and ${observedProductiveSetRange.max} planned sets in an exercise exposure.`
          : "The model does not yet have a stable set-response range.";

      return {
        muscleId,
        evidenceCount,
        confidence,
        observations: evidenceCount,
        productiveObservations: productive.length,
        fatigueLimitedObservations: fatigue.length,
        understimulatedObservations: understimulated.length,
        observedProductiveSetRange,
        repeatedFatigueAtOrAboveSets,
        explanation: `${confidenceCopy(confidence)} ${detail}`,
      };
    })
    .sort(
      (a, b) =>
        b.evidenceCount - a.evidenceCount ||
        a.muscleId.localeCompare(b.muscleId),
    );
}
