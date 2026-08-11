import type { ProgressionDecision } from "@/domain/progression/types";
import { normalizeMuscleId } from "@/domain/progress/normalize";
import type { ExercisePrescription } from "@/domain/training/types";
import type {
  PersonalTrainingModel,
  PersonalizationAdjustment,
} from "./types";

export interface PersonalizedRecommendationResult {
  baseDecision: ProgressionDecision;
  finalDecision: ProgressionDecision;
  adjustment?: PersonalizationAdjustment;
}

export function personalizeProgressionDecision(
  baseDecision: ProgressionDecision,
  prescription: ExercisePrescription,
  model: PersonalTrainingModel,
): PersonalizedRecommendationResult {
  if (baseDecision.decision !== "add_set") {
    return { baseDecision, finalDecision: baseDecision };
  }

  const muscleIds = [
    ...new Set(prescription.targetMuscleIds.map(normalizeMuscleId)),
  ];
  const guards = muscleIds.flatMap((muscleId) => {
    const profile = model.muscleVolumeResponses.find(
      (candidate) => candidate.muscleId === muscleId,
    );
    if (
      !profile ||
      profile.confidence !== "established" ||
      profile.repeatedFatigueAtOrAboveSets == null ||
      prescription.plannedSetCount < profile.repeatedFatigueAtOrAboveSets
    ) {
      return [];
    }
    return [profile];
  });

  if (!guards.length) {
    return { baseDecision, finalDecision: baseDecision };
  }

  const { setCountDelta: _setDelta, nextSetCount: _nextSetCount, ...safeDelta } =
    baseDecision.delta;
  const adjustment: PersonalizationAdjustment = {
    kind: "suppress_volume_increase",
    explanation: `The base engine proposed another set, but repeated established fatigue or workload-limit observations have occurred at this exposure for ${guards.map((profile) => profile.muscleId).join(", ")}. The set count is held while the rest of the prescription can continue to progress normally.`,
    evidenceCount: Math.max(...guards.map((profile) => profile.evidenceCount)),
    confidence: "established",
    muscleIds: guards.map((profile) => profile.muscleId),
  };
  const finalDecision: ProgressionDecision = {
    ...baseDecision,
    decision: "maintain",
    delta: safeDelta,
  };

  return {
    baseDecision,
    finalDecision,
    adjustment,
  };
}
