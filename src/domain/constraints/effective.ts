import type { ExerciseInjury } from "@/domain/types";
import { constraintsFromLegacyInjuries } from "./legacy";
import type { TrainingConstraint } from "./types";

export function effectiveTrainingConstraints(
  constraints: TrainingConstraint[],
  legacyInjuries: ExerciseInjury[],
): TrainingConstraint[] {
  const byId = new Map<string, TrainingConstraint>();
  for (const legacy of constraintsFromLegacyInjuries(legacyInjuries)) {
    byId.set(legacy.id, legacy);
  }
  for (const constraint of constraints) {
    byId.set(constraint.id, constraint);
  }
  return [...byId.values()].sort((a, b) => {
    if (a.active !== b.active) return a.active ? -1 : 1;
    if (a.level !== b.level) return a.level === "avoid" ? -1 : 1;
    return a.label.localeCompare(b.label);
  });
}
