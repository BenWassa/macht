import { todayIso } from "@/lib/format";
import { floorToLoadable, roundToLoadable } from "@/lib/loadability";
import { getExercisePrescription } from "./prescriptions";
import {
  PROGRESSION,
  daysBetween,
  incrementFor,
  liftHistory,
  missedPrescription,
  repRange,
  toppedOut,
} from "./progressionRules";
import type { CustomExercise, SessionLog, Settings } from "./types";

export type SuggestionBasis =
  | "progress"
  | "repeat"
  | "add-rep"
  | "deload"
  | "rust";

export interface LoadSuggestion {
  weight: number;
  basis: SuggestionBasis;
  deltaFromLast: number;
  repTarget: number;
  lastWeight: number;
  lastReps: number;
  lastSummary: string;
}

/**
 * Next working load for a lift, derived purely from saved session history
 * (double progression with a frequency-aware monthly cap). Returns null for
 * unloaded exercises or fewer than two logged performances.
 */
export function suggestNextLoad(
  exerciseId: string,
  sessions: SessionLog[],
  settings: Settings,
  customExercises: CustomExercise[] = [],
  today: string = todayIso(),
): LoadSuggestion | null {
  const prescription = getExercisePrescription(exerciseId, customExercises);
  if (prescription.loadMode !== "external") return null;
  const history = liftHistory(exerciseId, sessions);
  if (history.length < 2) return null;

  const { units, rpeMode } = settings;
  const range = repRange(exerciseId, customExercises);
  const last = history[history.length - 1];
  const lastWeight = last.top.weight;
  const clampReps = (reps: number) =>
    Math.min(Math.max(reps, range.min), range.max);
  const base = {
    lastWeight,
    lastReps: last.top.reps,
    lastSummary: `${lastWeight}×${last.top.reps}${
      last.top.rpe != null ? ` @${last.top.rpe}` : ""
    }`,
  };
  const repeat = (basis: SuggestionBasis): LoadSuggestion => ({
    ...base,
    weight: lastWeight,
    basis,
    deltaFromLast: 0,
    repTarget: clampReps(last.top.reps),
  });

  const gap = daysBetween(last.date, today);
  if (gap > PROGRESSION.rustDecayDays) {
    const weight = roundToLoadable(
      lastWeight * PROGRESSION.rustDecayFactor,
      units,
    );
    return {
      ...base,
      weight,
      basis: "rust",
      deltaFromLast: weight - lastWeight,
      repTarget: clampReps(last.top.reps),
    };
  }
  if (gap > PROGRESSION.rustRepeatDays) return repeat("rust");

  if (missedPrescription(last, range.min, rpeMode)) {
    const prev = history[history.length - 2];
    if (!missedPrescription(prev, range.min, rpeMode)) return repeat("repeat");
    const weight = roundToLoadable(
      lastWeight * (1 - PROGRESSION.deloadPct),
      units,
    );
    return {
      ...base,
      weight,
      basis: "deload",
      deltaFromLast: weight - lastWeight,
      repTarget: range.min,
    };
  }

  if (!toppedOut(last, range.max, rpeMode)) {
    return {
      ...base,
      weight: lastWeight,
      basis: "add-rep",
      deltaFromLast: 0,
      repTarget: Math.min(range.max, last.top.reps + 1),
    };
  }

  let weight = roundToLoadable(
    lastWeight + incrementFor(exerciseId, units, customExercises),
    units,
  );
  const inWindow = history.filter(
    (perf) => daysBetween(perf.date, today) <= PROGRESSION.capWindowDays,
  );
  const anchor = inWindow[0]?.top.weight ?? lastWeight;
  const cap = floorToLoadable(anchor * (1 + PROGRESSION.capPct), units);
  if (weight > cap) weight = cap;
  if (weight <= lastWeight) return repeat("repeat");
  return {
    ...base,
    weight,
    basis: "progress",
    deltaFromLast: weight - lastWeight,
    repTarget: range.min,
  };
}

export function suggestLoadsForExercises(
  exerciseIds: string[],
  sessions: SessionLog[],
  settings: Settings,
  customExercises: CustomExercise[] = [],
  today: string = todayIso(),
): Record<string, LoadSuggestion> {
  const suggestions: Record<string, LoadSuggestion> = {};
  for (const exerciseId of exerciseIds) {
    const suggestion = suggestNextLoad(
      exerciseId,
      sessions,
      settings,
      customExercises,
      today,
    );
    if (suggestion) suggestions[exerciseId] = suggestion;
  }
  return suggestions;
}
