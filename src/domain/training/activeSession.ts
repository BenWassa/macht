import type { Mesocycle, MesocycleWeek, PlannedSession } from "./types";

export interface NextPlannedSession {
  week: MesocycleWeek;
  session: PlannedSession;
}

export function findNextPlannedSession(
  mesocycle?: Mesocycle,
): NextPlannedSession | undefined {
  if (!mesocycle) return undefined;
  const weeks = [...mesocycle.weeks].sort((a, b) => a.index - b.index);
  for (const week of weeks) {
    const session = [...week.sessions]
      .sort((a, b) => a.index - b.index)
      .find(
        (candidate) =>
          candidate.status === "planned" || candidate.status === "moved",
      );
    if (session) return { week, session };
  }
  return undefined;
}
