import type { IsoDate, PlannedSessionId } from "@/domain/shared/ids";

export type ScheduleRecoveryChoice = "train_today" | "move_forward" | "skip";

export interface WeeklyPlanStatus {
  weekStart: IsoDate;
  weekEnd: IsoDate;
  plannedSessions: number;
  completedSessions: number;
  remainingSessions: number;
  coverage: number;
  planMet: boolean;
}

export interface RollingPlanStatus {
  weeks: WeeklyPlanStatus[];
  completedPlannedSessions: number;
  plannedSessions: number;
  coverage: number;
  weeksMet: number;
}

export interface MissedSessionRecovery {
  plannedSessionId: PlannedSessionId;
  sessionName: string;
  plannedDate: IsoDate;
  daysOverdue: number;
  suggestedMoveDate: IsoDate;
}

export type TrainingMilestoneType =
  | "first_planned_session"
  | "first_performance_record"
  | "first_adaptive_change"
  | "first_completed_cycle"
  | "four_planned_weeks";

export interface TrainingMilestone {
  type: TrainingMilestoneType;
  achieved: boolean;
  achievedOn?: IsoDate;
  title: string;
  detail: string;
}
