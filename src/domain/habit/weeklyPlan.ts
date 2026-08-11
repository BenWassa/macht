import type { IsoDate } from "@/domain/shared/ids";
import type { ProgressWorkout } from "@/domain/progress/model";
import type { RollingPlanStatus, WeeklyPlanStatus } from "./types";

const DAY_MS = 86_400_000;

const parseDate = (date: IsoDate): Date => new Date(`${date}T00:00:00Z`);
const isoDate = (date: Date): IsoDate => date.toISOString().slice(0, 10);

const mondayFor = (date: Date): Date => {
  const sinceMonday = (date.getUTCDay() + 6) % 7;
  return new Date(date.getTime() - sinceMonday * DAY_MS);
};

export function weeklyPlanStatus(
  workouts: ProgressWorkout[],
  asOfDate: IsoDate,
  plannedSessions: number,
  weekOffset = 0,
): WeeklyPlanStatus {
  const currentMonday = mondayFor(parseDate(asOfDate));
  const start = new Date(currentMonday.getTime() + weekOffset * 7 * DAY_MS);
  const end = new Date(start.getTime() + 6 * DAY_MS);
  const weekStart = isoDate(start);
  const weekEnd = isoDate(end);
  const completedSessions = workouts.filter(
    (workout) => workout.date >= weekStart && workout.date <= weekEnd,
  ).length;
  const cappedCompleted = Math.min(completedSessions, plannedSessions);
  return {
    weekStart,
    weekEnd,
    plannedSessions,
    completedSessions,
    remainingSessions: Math.max(0, plannedSessions - completedSessions),
    coverage: plannedSessions > 0 ? cappedCompleted / plannedSessions : 1,
    planMet: completedSessions >= plannedSessions,
  };
}

export function rollingPlanStatus(
  workouts: ProgressWorkout[],
  asOfDate: IsoDate,
  plannedSessions: number,
  weeks = 8,
): RollingPlanStatus {
  const statuses = Array.from({ length: weeks }, (_, index) =>
    weeklyPlanStatus(
      workouts,
      asOfDate,
      plannedSessions,
      -(weeks - index - 1),
    ),
  );
  const completedPlannedSessions = statuses.reduce(
    (sum, week) =>
      sum + Math.min(week.completedSessions, week.plannedSessions),
    0,
  );
  const planned = statuses.reduce(
    (sum, week) => sum + week.plannedSessions,
    0,
  );
  return {
    weeks: statuses,
    completedPlannedSessions,
    plannedSessions: planned,
    coverage: planned > 0 ? completedPlannedSessions / planned : 1,
    weeksMet: statuses.filter((week) => week.planMet).length,
  };
}
