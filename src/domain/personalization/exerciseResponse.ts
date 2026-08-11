import { getExerciseById } from "@/domain/exerciseLibrary";
import type {
  ProgressionDecision,
  ProgressionDecisionType,
} from "@/domain/progression/types";
import type { CustomExercise } from "@/domain/types";
import { confidenceCopy, personalizationConfidence } from "./confidence";
import type {
  ExerciseResponsePattern,
  ExerciseResponseProfile,
} from "./types";

const median = (values: number[]): number | undefined => {
  if (!values.length) return undefined;
  const sorted = [...values].sort((a, b) => a - b);
  const midpoint = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[midpoint - 1] + sorted[midpoint]) / 2
    : sorted[midpoint];
};

const patternFor = (
  evidenceCount: number,
  progressionRate: number,
  fatigueRate: number,
  maintainRate: number,
): ExerciseResponsePattern => {
  if (personalizationConfidence(evidenceCount) === "insufficient") {
    return "insufficient";
  }
  if (fatigueRate >= 0.35) return "fatigue_limited";
  if (progressionRate >= 0.45 && fatigueRate < 0.25) return "progressing";
  if (maintainRate >= 0.5) return "stable";
  return "mixed";
};

const explanationFor = (
  pattern: ExerciseResponsePattern,
  evidenceCount: number,
  confidence: ExerciseResponseProfile["confidence"],
): string => {
  const prefix = confidenceCopy(confidence);
  switch (pattern) {
    case "progressing":
      return `${prefix} This exercise has repeatedly supported rep or load progression without frequent fatigue interventions.`;
    case "fatigue_limited":
      return `${prefix} This exercise has repeatedly produced fatigue, workload-limit, or volume-reduction signals.`;
    case "stable":
      return `${prefix} The prescription has most often been held steady across ${evidenceCount} recorded decisions.`;
    case "mixed":
      return `${prefix} Progression and hold/fatigue signals are mixed, so the model should avoid strong automatic changes.`;
    case "insufficient":
    default:
      return prefix;
  }
};

export function buildExerciseResponseProfiles(
  decisions: ProgressionDecision[],
  customExercises: CustomExercise[] = [],
): ExerciseResponseProfile[] {
  const grouped = new Map<string, ProgressionDecision[]>();
  for (const decision of decisions) {
    const items = grouped.get(decision.exerciseId) ?? [];
    items.push(decision);
    grouped.set(decision.exerciseId, items);
  }

  return [...grouped.entries()]
    .map(([exerciseId, items]) => {
      const ordered = [...items].sort((a, b) =>
        a.createdAt.localeCompare(b.createdAt),
      );
      const counts: Partial<Record<ProgressionDecisionType, number>> = {};
      for (const item of ordered) {
        counts[item.decision] = (counts[item.decision] ?? 0) + 1;
      }
      const evidenceCount = ordered.length;
      const progressionCount =
        (counts.add_rep ?? 0) + (counts.add_load ?? 0);
      const fatigueCount = ordered.filter(
        (item) =>
          item.decision === "remove_set" ||
          item.decision === "deload" ||
          item.reasons.includes("recovery_incomplete") ||
          item.reasons.includes("workload_limit_reached") ||
          item.reasons.includes("performance_declining"),
      ).length;
      const maintainCount = counts.maintain ?? 0;
      const progressionRate = evidenceCount
        ? progressionCount / evidenceCount
        : 0;
      const fatigueInterventionRate = evidenceCount
        ? fatigueCount / evidenceCount
        : 0;
      const maintainRate = evidenceCount ? maintainCount / evidenceCount : 0;
      const confidence = personalizationConfidence(evidenceCount);
      const pattern = patternFor(
        evidenceCount,
        progressionRate,
        fatigueInterventionRate,
        maintainRate,
      );
      const increments = ordered.flatMap((item) =>
        item.decision === "add_load" &&
        item.delta.loadDelta != null &&
        item.delta.loadDelta > 0
          ? [item.delta.loadDelta]
          : [],
      );
      return {
        exerciseId,
        exerciseName:
          getExerciseById(exerciseId, customExercises)?.name ?? exerciseId,
        evidenceCount,
        confidence,
        pattern,
        progressionRate,
        fatigueInterventionRate,
        decisionCounts: counts,
        medianObservedLoadIncrement: median(increments),
        latestEvidenceDate: ordered[ordered.length - 1]?.createdAt.slice(0, 10),
        explanation: explanationFor(
          pattern,
          evidenceCount,
          confidence,
        ),
      };
    })
    .sort(
      (a, b) =>
        (b.latestEvidenceDate ?? "").localeCompare(
          a.latestEvidenceDate ?? "",
        ) || a.exerciseName.localeCompare(b.exerciseName),
    );
}
