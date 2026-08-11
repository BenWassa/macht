import type { ConsistencyWeek, ProgressWorkout } from "./model";

const DAY_MS = 86_400_000;

const parseDate = (date: string): Date => new Date(`${date}T00:00:00Z`);
const isoDate = (date: Date): string => date.toISOString().slice(0, 10);

const mondayFor = (date: Date): Date => {
  const sinceMonday = (date.getUTCDay() + 6) % 7;
  return new Date(date.getTime() - sinceMonday * DAY_MS);
};

export function buildConsistencyWeeks(
  workouts: ProgressWorkout[],
  asOfDate: string,
  weeks = 8,
  weeklyPlan?: number,
): ConsistencyWeek[] {
  const currentMonday = mondayFor(parseDate(asOfDate));
  return Array.from({ length: weeks }, (_, index) => {
    const offset = weeks - index - 1;
    const start = new Date(currentMonday.getTime() - offset * 7 * DAY_MS);
    const end = new Date(start.getTime() + 6 * DAY_MS);
    const startDate = isoDate(start);
    const endDate = isoDate(end);
    const completedSessions = workouts.filter(
      (workout) => workout.date >= startDate && workout.date <= endDate,
    ).length;
    return {
      startDate,
      endDate,
      completedSessions,
      targetSessions: weeklyPlan,
      targetMet:
        weeklyPlan == null ? undefined : completedSessions >= weeklyPlan,
    };
  });
}

export function plannedSessionCoverage(
  weeks: ConsistencyWeek[],
): number | undefined {
  const plannedWeeks = weeks.filter((week) => week.targetSessions != null);
  if (!plannedWeeks.length) return undefined;
  const completed = plannedWeeks.reduce(
    (sum, week) =>
      sum + Math.min(week.completedSessions, week.targetSessions ?? 0),
    0,
  );
  const planned = plannedWeeks.reduce(
    (sum, week) => sum + (week.targetSessions ?? 0),
    0,
  );
  return planned > 0 ? completed / planned : undefined;
}

export const weeksWithSessions = (weeks: ConsistencyWeek[]): number =>
  weeks.filter((week) => week.completedSessions > 0).length;
