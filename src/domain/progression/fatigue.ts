import type { RecoveryState, SessionWorkload } from "@/domain/feedback/types";

export type FatigueState = "low" | "manageable" | "high";

export interface FatigueInput {
  recovery?: RecoveryState;
  workload?: SessionWorkload;
  performanceTrend?: number;
}

export function assessFatigue({
  recovery,
  workload,
  performanceTrend,
}: FatigueInput): FatigueState {
  if (
    recovery === "meaningful_fatigue" ||
    workload === "too_much" ||
    (performanceTrend != null && performanceTrend <= -0.05)
  ) {
    return "high";
  }

  if (
    recovery === "recovered" &&
    (workload == null || workload === "easy" || workload === "appropriate") &&
    (performanceTrend == null || performanceTrend >= 0)
  ) {
    return "low";
  }

  return "manageable";
}
