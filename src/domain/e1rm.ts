import type { SessionLog } from './types';

export function brzyckiE1rm(weight: number, reps: number): number {
  if (reps <= 0) return 0;
  if (reps === 1) return Math.round(weight);
  return Math.round(weight * (36 / (37 - reps)));
}

export function deriveE1rmHistory(sessions: SessionLog[], exerciseId: string): number[] {
  return sessions
    .slice()
    .reverse()
    .flatMap((session) => session.exerciseSnapshots?.filter((snapshot) => snapshot.exerciseId === exerciseId) ?? [])
    .map((snapshot) => snapshot.e1rm)
    .filter((value): value is number => typeof value === 'number' && value > 0)
    .slice(-12);
}
