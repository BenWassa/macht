import type { IsoDate, PlannedSessionId } from "@/domain/shared/ids";
import type { Mesocycle, PlannedSession } from "./types";

const DAY_MS = 86_400_000;

function parseDate(date: IsoDate): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

function isoDate(date: Date): IsoDate {
  return date.toISOString().slice(0, 10);
}

function addDays(date: IsoDate, days: number): IsoDate {
  return isoDate(new Date(parseDate(date).getTime() + days * DAY_MS));
}

function maxDate(a: IsoDate, b: IsoDate): IsoDate {
  return a >= b ? a : b;
}

export function defaultWeekdays(sessionsPerWeek: 2 | 3 | 4 | 5 | 6): number[] {
  const defaults: Record<number, number[]> = {
    2: [1, 4],
    3: [1, 3, 5],
    4: [1, 2, 4, 5],
    5: [1, 2, 3, 5, 6],
    6: [1, 2, 3, 4, 5, 6],
  };
  return defaults[sessionsPerWeek];
}

export function datesForTrainingWeek(
  cycleStartDate: IsoDate,
  weekIndex: number,
  weekdays: number[],
): IsoDate[] {
  const startDay = parseDate(cycleStartDate).getUTCDay();
  const offsets = weekdays
    .map((weekday) => (weekday - startDay + 7) % 7)
    .sort((a, b) => a - b);
  const weekOffset = Math.max(0, weekIndex - 1) * 7;
  return offsets.map((offset) => addDays(cycleStartDate, weekOffset + offset));
}

function flattenSessions(mesocycle: Mesocycle): PlannedSession[] {
  return mesocycle.weeks.flatMap((week) =>
    [...week.sessions].sort((a, b) => a.index - b.index),
  );
}

export function repairScheduleAfterMissedSession(
  mesocycle: Mesocycle,
  missedSessionId: PlannedSessionId,
  earliestDate: IsoDate,
): Mesocycle {
  const ordered = flattenSessions(mesocycle);
  const missedIndex = ordered.findIndex((session) => session.id === missedSessionId);
  if (missedIndex < 0) return mesocycle;

  const replacements = new Map<PlannedSessionId, PlannedSession>();
  let cursor = maxDate(ordered[missedIndex].plannedDate ?? earliestDate, earliestDate);

  for (let index = missedIndex; index < ordered.length; index += 1) {
    const session = ordered[index];
    const original = session.plannedDate;
    const nextDate = original ? maxDate(original, cursor) : cursor;
    const changed = original !== nextDate;
    replacements.set(session.id, {
      ...session,
      plannedDate: nextDate,
      ...(changed && original ? { movedFromDate: original } : {}),
      ...(changed ? { status: "moved" as const } : {}),
    });
    cursor = addDays(nextDate, 1);
  }

  return {
    ...mesocycle,
    weeks: mesocycle.weeks.map((week) => ({
      ...week,
      sessions: week.sessions.map((session) => replacements.get(session.id) ?? session),
    })),
  };
}
