import type { ExerciseInjury } from "@/domain/types";
import type { TrainingConstraint } from "./types";

const isoDateTime = (date: string): string =>
  date.includes("T") ? date : `${date}T00:00:00Z`;

export function constraintFromLegacyInjury(
  injury: ExerciseInjury,
): TrainingConstraint {
  return {
    id: `legacy:${injury.id}`,
    label: injury.name,
    level: injury.severity === "avoid" ? "avoid" : "caution",
    source: "legacy_injury",
    createdAt: isoDateTime(injury.dateAdded),
    active: !injury.clearedDate,
    exerciseIds: [],
    blockedTags: [...injury.forbiddenTags],
    cautionTags: [...(injury.cautionTags ?? [])],
    notes: injury.notes || undefined,
    expiresOn: injury.targetReturn,
  };
}

export function constraintsFromLegacyInjuries(
  injuries: ExerciseInjury[],
): TrainingConstraint[] {
  return injuries.map(constraintFromLegacyInjury);
}
