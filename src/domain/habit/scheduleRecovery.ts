import type { IsoDate, PlannedSessionId } from "@/domain/shared/ids";
import { repairScheduleAfterMissedSession } from "@/domain/training/scheduling";
import type { Mesocycle, PlannedSession } from "@/domain/training/types";
import type {
  MissedSessionRecovery,
  ScheduleRecoveryChoice,
} from "./types";

const DAY_MS = 86_400_000;

const parseDate = (date: IsoDate): Date => new Date(`${date}T00:00:00Z`);
const isoDate = (date: Date): IsoDate => date.toISOString().slice(0, 10);

const addDays = (date: IsoDate, days: number): IsoDate =>
  isoDate(new Date(parseDate(date).getTime() + days * DAY_MS));

const daysBetween = (from: IsoDate, to: IsoDate): number =>
  Math.max(
    0,
    Math.floor((parseDate(to).getTime() - parseDate(from).getTime()) / DAY_MS),
  );

const datedSessions = (mesocycle: Mesocycle): PlannedSession[] =>
  mesocycle.weeks
    .flatMap((week) => week.sessions)
    .filter((session) => session.plannedDate)
    .sort(
      (a, b) =>
        (a.plannedDate ?? "").localeCompare(b.plannedDate ?? "") ||
        a.index - b.index,
    );

function nextOpenDate(mesocycle: Mesocycle, asOfDate: IsoDate): IsoDate {
  const occupied = new Set(
    datedSessions(mesocycle)
      .filter(
        (session) =>
          session.status === "planned" || session.status === "moved",
      )
      .flatMap((session) => (session.plannedDate ? [session.plannedDate] : [])),
  );
  for (let offset = 1; offset <= 14; offset += 1) {
    const candidate = addDays(asOfDate, offset);
    if (!occupied.has(candidate)) return candidate;
  }
  return addDays(asOfDate, 1);
}

export function findMissedSessionRecovery(
  mesocycle: Mesocycle | undefined,
  asOfDate: IsoDate,
): MissedSessionRecovery | undefined {
  if (!mesocycle) return undefined;
  const missed = datedSessions(mesocycle).find(
    (session) =>
      (session.status === "planned" || session.status === "moved") &&
      Boolean(session.plannedDate && session.plannedDate < asOfDate),
  );
  if (!missed?.plannedDate) return undefined;
  return {
    plannedSessionId: missed.id,
    sessionName: missed.name,
    plannedDate: missed.plannedDate,
    daysOverdue: daysBetween(missed.plannedDate, asOfDate),
    suggestedMoveDate: nextOpenDate(mesocycle, asOfDate),
  };
}

function markSkipped(
  mesocycle: Mesocycle,
  plannedSessionId: PlannedSessionId,
): Mesocycle {
  return {
    ...mesocycle,
    weeks: mesocycle.weeks.map((week) => ({
      ...week,
      sessions: week.sessions.map((session) =>
        session.id === plannedSessionId
          ? { ...session, status: "skipped" as const }
          : session,
      ),
    })),
  };
}

export function applyScheduleRecovery(
  mesocycle: Mesocycle,
  recovery: MissedSessionRecovery,
  choice: ScheduleRecoveryChoice,
  asOfDate: IsoDate,
): Mesocycle {
  if (choice === "skip") {
    return markSkipped(mesocycle, recovery.plannedSessionId);
  }
  return repairScheduleAfterMissedSession(
    mesocycle,
    recovery.plannedSessionId,
    choice === "train_today" ? asOfDate : recovery.suggestedMoveDate,
  );
}
