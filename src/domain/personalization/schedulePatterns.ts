import type { Mesocycle } from "@/domain/training/types";
import { confidenceCopy, personalizationConfidence } from "./confidence";
import type { SchedulePattern, WeekdayPattern } from "./types";

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const weekdayFor = (date: string): number =>
  new Date(`${date}T00:00:00Z`).getUTCDay();

export function buildSchedulePattern(
  mesocycles: Mesocycle[],
  asOfDate: string,
): SchedulePattern {
  const counters = Array.from({ length: 7 }, (_, weekday) => ({
    weekday,
    plannedSessions: 0,
    completedSessions: 0,
    skippedSessions: 0,
  }));

  for (const cycle of mesocycles) {
    for (const week of cycle.weeks) {
      for (const session of week.sessions) {
        if (!session.plannedDate || session.plannedDate > asOfDate) continue;
        const counter = counters[weekdayFor(session.plannedDate)];
        counter.plannedSessions += 1;
        if (session.status === "completed") counter.completedSessions += 1;
        if (session.status === "skipped") counter.skippedSessions += 1;
      }
    }
  }

  const weekdays: WeekdayPattern[] = counters.map((counter) => ({
    ...counter,
    label: weekdayLabels[counter.weekday],
    completionRate:
      counter.plannedSessions > 0
        ? counter.completedSessions / counter.plannedSessions
        : undefined,
  }));
  const evidenceCount = counters.reduce(
    (sum, counter) => sum + counter.plannedSessions,
    0,
  );
  const confidence = personalizationConfidence(evidenceCount);
  const strongerWeekdays = weekdays
    .filter(
      (weekday) =>
        weekday.plannedSessions >= 3 &&
        (weekday.completionRate ?? 0) >= 0.7,
    )
    .sort(
      (a, b) =>
        (b.completionRate ?? 0) - (a.completionRate ?? 0) ||
        b.plannedSessions - a.plannedSessions,
    )
    .map((weekday) => weekday.weekday);
  const weakerWeekdays = weekdays
    .filter(
      (weekday) =>
        weekday.plannedSessions >= 3 &&
        (weekday.completionRate ?? 1) <= 0.4,
    )
    .sort(
      (a, b) =>
        (a.completionRate ?? 1) - (b.completionRate ?? 1) ||
        b.plannedSessions - a.plannedSessions,
    )
    .map((weekday) => weekday.weekday);
  const detail =
    confidence === "established" &&
    strongerWeekdays.length &&
    weakerWeekdays.length
      ? `${weekdayLabels[strongerWeekdays[0]]} has been more reliable than ${weekdayLabels[weakerWeekdays[0]]} for planned sessions. Any schedule suggestion should move an existing session rather than add one.`
      : "There is not yet enough repeated planned-session history to recommend a schedule shift.";

  return {
    evidenceCount,
    confidence,
    weekdays,
    strongerWeekdays,
    weakerWeekdays,
    explanation: `${confidenceCopy(confidence)} ${detail}`,
  };
}
