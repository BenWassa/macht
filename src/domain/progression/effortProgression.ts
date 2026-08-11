import type { EffortScale, EffortTarget, WeekPhase } from "@/domain/training/types";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export interface EffortProgressionInput {
  scale: EffortScale;
  startingValue: number;
  weekIndex: number;
  phase: WeekPhase;
  stepPerWeek?: number;
}

/**
 * Produces a conservative mesocycle effort target.
 *
 * RIR decreases gradually across accumulation weeks, with a floor of 1 RIR.
 * RPE increases gradually, with a ceiling of 9 RPE. Deloads move effort
 * materially easier without requiring load-specific assumptions.
 */
export function effortTargetForWeek({
  scale,
  startingValue,
  weekIndex,
  phase,
  stepPerWeek = 0.5,
}: EffortProgressionInput): EffortTarget {
  if (phase === "deload") {
    return scale === "RIR"
      ? { scale, value: Math.max(4, startingValue + 2) }
      : { scale, value: Math.min(6.5, startingValue - 2) };
  }

  const completedSteps = Math.max(0, weekIndex - 1);
  if (scale === "RIR") {
    return {
      scale,
      value: clamp(startingValue - completedSteps * stepPerWeek, 1, 6),
    };
  }

  return {
    scale,
    value: clamp(startingValue + completedSteps * stepPerWeek, 5, 9),
  };
}
