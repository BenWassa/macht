import { todayIso } from "@/lib/format";
import { brzyckiE1rm } from "./e1rm";
import { suggestNextLoad } from "./progression";
import { PROGRESSION, daysBetween, liftHistory } from "./progressionRules";
import type { CustomExercise, SessionLog, Settings } from "./types";

/** Consecutive sessions (counting back from the latest) where the top working
 *  weight increased over the previous performance. */
export function progressionStreak(
  exerciseId: string,
  sessions: SessionLog[],
): number {
  const weights = liftHistory(exerciseId, sessions).map(
    (perf) => perf.top.weight,
  );
  let streak = 0;
  for (let i = weights.length - 1; i > 0 && weights[i] > weights[i - 1]; i--) {
    streak += 1;
  }
  return streak;
}

/** Percent change in top working weight over the trailing 28 days, or null
 *  with fewer than two performances in the window. */
export function monthlyGainPct(
  exerciseId: string,
  sessions: SessionLog[],
  today: string = todayIso(),
): number | null {
  const inWindow = liftHistory(exerciseId, sessions).filter(
    (perf) => daysBetween(perf.date, today) <= PROGRESSION.capWindowDays,
  );
  if (inWindow.length < 2) return null;
  const first = inWindow[0].top.weight;
  const last = inWindow[inWindow.length - 1].top.weight;
  if (first <= 0) return null;
  return Math.round(((last - first) / first) * 100);
}

/** e1RM implied by the next suggested load, for the sparkline projection. */
export function projectedE1rm(
  exerciseId: string,
  sessions: SessionLog[],
  settings: Settings,
  customExercises: CustomExercise[] = [],
  today: string = todayIso(),
): number | null {
  const suggestion = suggestNextLoad(
    exerciseId,
    sessions,
    settings,
    customExercises,
    today,
  );
  if (!suggestion) return null;
  return brzyckiE1rm(suggestion.weight, Math.min(suggestion.repTarget, 10));
}
