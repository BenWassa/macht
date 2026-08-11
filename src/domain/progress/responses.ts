import { getExerciseById } from "@/domain/exerciseLibrary";
import { explainProgressionDecision } from "@/domain/progression/explanation";
import type { ProgressionDecision } from "@/domain/progression/types";
import type { CustomExercise } from "@/domain/types";
import type { ExerciseResponseEvent } from "./model";

export interface ExerciseResponseHistory {
  exerciseId: string;
  exerciseName: string;
  events: ExerciseResponseEvent[];
}

export function buildExerciseResponseHistory(
  decisions: ProgressionDecision[],
  customExercises: CustomExercise[] = [],
): ExerciseResponseHistory[] {
  const grouped = new Map<string, ProgressionDecision[]>();
  for (const decision of decisions) {
    const existing = grouped.get(decision.exerciseId) ?? [];
    existing.push(decision);
    grouped.set(decision.exerciseId, existing);
  }

  return [...grouped.entries()]
    .map(([exerciseId, items]) => ({
      exerciseId,
      exerciseName:
        getExerciseById(exerciseId, customExercises)?.name ?? exerciseId,
      events: [...items]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((decision) => {
          const explanation = explainProgressionDecision(decision);
          return {
            id: decision.id,
            date: decision.createdAt.slice(0, 10),
            decision: decision.decision,
            reasons: explanation.reasons,
            summary: explanation.title,
          };
        }),
    }))
    .sort((a, b) => {
      const aDate = a.events[0]?.date ?? "";
      const bDate = b.events[0]?.date ?? "";
      return bDate.localeCompare(aDate) || a.exerciseName.localeCompare(b.exerciseName);
    });
}
