import { datedE1rmHistory } from "./e1rm";
import { PROGRESS_LIFTS, getExerciseById } from "./exercises";
import { getExerciseConflict } from "./injuries";
import { suggestNextLoad } from "./progression";
import { monthlyGainPct, projectedE1rm } from "./progressionStats";
import { PROGRESSION } from "./progressionRules";
import { todayIso } from "@/lib/format";
import type {
  CustomExercise,
  ExerciseInjury,
  SessionLog,
  Settings,
} from "./types";

export interface LiftProfile {
  exerciseId: string;
  name: string;
  /** Latest recorded e1RM, or null if the lift has never been logged. */
  current: number | null;
  best: number | null;
  monthPct: number | null;
  /** e1RM implied by the next suggested load. */
  projected: number | null;
  nextWeight: number | null;
  nextReps: number | null;
  /** Suggested load change for the next session, in working weight. */
  loadDelta: number | null;
  paused: boolean;
  hasData: boolean;
}

export interface StrengthProfile {
  lifts: LiftProfile[];
  /** Sum of every lift's latest e1RM (paused lifts included at last known). */
  total: number;
  /** Same sum as of ~28 days ago, or null when there is too little history. */
  totalChangePct: number | null;
  /** Sum of projected next e1RMs (latest where no projection exists). */
  projectedTotal: number;
  /** projectedTotal − total: strength still on the table for next session. */
  headroom: number;
  /** Number of the five lifts with any recorded data. */
  trackedCount: number;
}

function buildLiftProfile(
  exerciseId: string,
  sessions: SessionLog[],
  injuries: ExerciseInjury[],
  settings: Settings,
  customExercises: CustomExercise[],
  today: string,
): LiftProfile {
  const history = datedE1rmHistory(sessions, exerciseId);
  const current = history.length ? history[history.length - 1].e1rm : null;
  const best = history.length
    ? Math.max(...history.map((point) => point.e1rm))
    : null;
  const conflict = getExerciseConflict(exerciseId, injuries);
  const paused = conflict?.level === "avoid";

  const suggestion = paused
    ? null
    : suggestNextLoad(exerciseId, sessions, settings, customExercises, today);
  const projected = paused
    ? null
    : projectedE1rm(exerciseId, sessions, settings, customExercises, today);

  return {
    exerciseId,
    name: getExerciseById(exerciseId)?.name ?? exerciseId,
    current,
    best,
    monthPct: paused ? null : monthlyGainPct(exerciseId, sessions, today),
    projected,
    nextWeight: suggestion?.weight ?? null,
    nextReps: suggestion?.repTarget ?? null,
    loadDelta: suggestion?.deltaFromLast ?? null,
    paused,
    hasData: history.length > 0,
  };
}

/** e1RM for a lift as of `cutoff`, falling back to its earliest point. */
function e1rmAsOf(
  sessions: SessionLog[],
  exerciseId: string,
  cutoff: string,
): number | null {
  const history = datedE1rmHistory(sessions, exerciseId);
  if (history.length === 0) return null;
  const before = history.filter((point) => point.date <= cutoff);
  return before.length ? before[before.length - 1].e1rm : history[0].e1rm;
}

/**
 * The Big Five strength snapshot shown on Home: per-lift e1RM, an overall total,
 * its 28-day trend, and the strength still on the table for the next session.
 */
export function buildStrengthProfile(
  sessions: SessionLog[],
  injuries: ExerciseInjury[],
  settings: Settings,
  customExercises: CustomExercise[] = [],
  today: string = todayIso(),
): StrengthProfile {
  const lifts = PROGRESS_LIFTS.map((exerciseId) =>
    buildLiftProfile(
      exerciseId,
      sessions,
      injuries,
      settings,
      customExercises,
      today,
    ),
  );

  const total = lifts.reduce((sum, lift) => sum + (lift.current ?? 0), 0);
  const projectedTotal = lifts.reduce(
    (sum, lift) => sum + (lift.projected ?? lift.current ?? 0),
    0,
  );

  const cutoff = isoDaysAgo(today, PROGRESSION.capWindowDays);
  const totalPrev = lifts.reduce((sum, lift) => {
    if (!lift.hasData) return sum;
    return sum + (e1rmAsOf(sessions, lift.exerciseId, cutoff) ?? 0);
  }, 0);
  const totalChangePct =
    totalPrev > 0 ? Math.round(((total - totalPrev) / totalPrev) * 1000) / 10 : null;

  return {
    lifts,
    total: Math.round(total),
    totalChangePct,
    projectedTotal: Math.round(projectedTotal),
    headroom: Math.round(projectedTotal - total),
    trackedCount: lifts.filter((lift) => lift.hasData).length,
  };
}

function isoDaysAgo(today: string, days: number): string {
  const ms = Date.parse(today) - days * 86_400_000;
  return new Date(ms).toISOString().slice(0, 10);
}
