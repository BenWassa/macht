import type { ProgressionDecision } from "@/domain/progression/types";
import { confidenceCopy, personalizationConfidence } from "./confidence";
import type { SessionDurationPattern } from "./types";

interface SessionObservation {
  key: string;
  durationMinutes: number;
  workload?: string;
}

const workloadRank: Record<string, number> = {
  easy: 0,
  appropriate: 1,
  pushing_limit: 2,
  too_much: 3,
};

const median = (values: number[]): number | undefined => {
  if (!values.length) return undefined;
  const sorted = [...values].sort((a, b) => a - b);
  const midpoint = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[midpoint]
    : (sorted[midpoint - 1] + sorted[midpoint]) / 2;
};

function sessionObservations(
  decisions: ProgressionDecision[],
): SessionObservation[] {
  const grouped = new Map<string, SessionObservation>();
  for (const decision of decisions) {
    const duration = decision.evidence.sessionDurationMinutes;
    if (duration == null || duration <= 0) continue;
    const key = decision.createdAt;
    const existing = grouped.get(key);
    const workload = decision.evidence.workload;
    if (!existing) {
      grouped.set(key, {
        key,
        durationMinutes: duration,
        workload,
      });
      continue;
    }
    existing.durationMinutes = Math.max(
      existing.durationMinutes,
      duration,
    );
    if (
      workload &&
      (workloadRank[workload] ?? -1) >
        (workloadRank[existing.workload ?? ""] ?? -1)
    ) {
      existing.workload = workload;
    }
  }
  return [...grouped.values()].sort((a, b) => a.key.localeCompare(b.key));
}

const repeatedHighWorkloadThreshold = (
  observations: SessionObservation[],
): number | undefined => {
  const high = observations.filter(
    (item) =>
      item.workload === "pushing_limit" || item.workload === "too_much",
  );
  if (high.length < 2) return undefined;
  const durations = high.map((item) => item.durationMinutes).sort((a, b) => a - b);
  return durations[1];
};

export function buildSessionDurationPattern(
  decisions: ProgressionDecision[],
): SessionDurationPattern {
  const observations = sessionObservations(decisions);
  const evidenceCount = observations.length;
  const confidence = personalizationConfidence(evidenceCount);
  const comfortable = observations
    .filter(
      (item) =>
        item.workload === "easy" || item.workload === "appropriate",
    )
    .map((item) => item.durationMinutes);
  const medianDurationMinutes = median(
    observations.map((item) => item.durationMinutes),
  );
  const comfortableDurationMinutes =
    comfortable.length >= 3 ? median(comfortable) : undefined;
  const repeatedHighWorkloadAtOrAboveMinutes =
    confidence === "established"
      ? repeatedHighWorkloadThreshold(observations)
      : undefined;
  const detail = repeatedHighWorkloadAtOrAboveMinutes != null
    ? `High workload has repeated in sessions around ${Math.round(repeatedHighWorkloadAtOrAboveMinutes)} minutes or longer.`
    : comfortableDurationMinutes != null
      ? `Manageable sessions have commonly clustered around ${Math.round(comfortableDurationMinutes)} minutes.`
      : "There is not yet a stable relationship between session duration and workload feedback.";

  return {
    evidenceCount,
    confidence,
    observations: evidenceCount,
    medianDurationMinutes,
    comfortableDurationMinutes,
    repeatedHighWorkloadAtOrAboveMinutes,
    explanation: `${confidenceCopy(confidence)} ${detail}`,
  };
}
