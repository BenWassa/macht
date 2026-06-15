import type { SessionLog } from "./types";

export function brzyckiE1rm(weight: number, reps: number): number {
  if (reps <= 0) return 0;
  if (reps === 1) return Math.round(weight);
  return Math.round(weight * (36 / (37 - reps)));
}

export interface DatedE1rm {
  date: string;
  e1rm: number;
}

/** Recorded e1RM points for a lift, oldest first, ordered by session date. */
export function datedE1rmHistory(
  sessions: SessionLog[],
  exerciseId: string,
): DatedE1rm[] {
  return sessions
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .flatMap((session) =>
      (session.exerciseSnapshots ?? [])
        .filter(
          (snapshot) =>
            snapshot.exerciseId === exerciseId &&
            typeof snapshot.e1rm === "number" &&
            snapshot.e1rm > 0,
        )
        .map((snapshot) => ({ date: session.date, e1rm: snapshot.e1rm! })),
    );
}

export function deriveE1rmHistory(
  sessions: SessionLog[],
  exerciseId: string,
): number[] {
  return datedE1rmHistory(sessions, exerciseId)
    .map((point) => point.e1rm)
    .slice(-12);
}
