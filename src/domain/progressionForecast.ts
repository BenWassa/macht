/* eslint-disable max-lines */
import { getExerciseById } from "@/domain/exerciseLibrary";
import { getExercisePrescription } from "@/domain/prescriptions";
import {
  suggestLoadsForExercises,
  suggestNextLoad,
  type LoadSuggestion,
  type SuggestionBasis,
} from "@/domain/progression";
import { daysBetween, liftHistory } from "@/domain/progressionRules";
import { todayIso } from "@/lib/format";
import type { CustomExercise, SessionLog, Settings } from "@/domain/types";

export type ForecastTactic =
  | "Establishing Baseline"
  | "Systemic Deload"
  | "Ease back in"
  | "Step up load"
  | "Add one rep"
  | "Hold baseline";

export interface ProgressionForecastTarget {
  exerciseId: string;
  exerciseName: string;
  target: string;
  delta: string;
  tactic: ForecastTactic;
  reason: string;
  suggestion: LoadSuggestion | null;
  baselineWeight: number | null;
  baselineReps: number | null;
  state: SuggestionBasis | "baseline";
}

export interface TemplateProgressionForecast {
  primaryTarget: ProgressionForecastTarget | null;
  subordinateTargets: ProgressionForecastTarget[];
}

const COMPOUND_EXTERNAL_LIFTS = new Set([
  "leg_press",
  "belt_squat",
  "hack_squat",
  "split_squat",
  "step_up",
  "walking_lunge",
  "hip_thrust",
  "romanian_deadlift",
  "trap_bar_deadlift",
  "squat",
  "front_squat",
  "deadlift",
  "chest_supported_row",
  "neutral_cable_row",
  "lat_pulldown_front",
  "barbell_row",
  "dumbbell_row",
  "floor_press_neutral",
  "landmine_press",
  "neutral_db_press",
  "bench_press",
  "incline_db_press",
  "overhead_press",
  "lat_pulldown_behind",
  "pull_up",
  "chin_up",
  "dip",
]);

const deltaUnit = (units: Settings["units"]) => (units === "lbs" ? "lb" : "kg");

const signedLoadDelta = (delta: number, units: Settings["units"]) =>
  delta > 0
    ? `+${delta} ${deltaUnit(units)} target`
    : `${delta} ${deltaUnit(units)} target`;

const zeroLoadDelta = (units: Settings["units"]) =>
  `0 ${deltaUnit(units)} target`;

function mapSuggestion(
  suggestion: LoadSuggestion,
  units: Settings["units"],
  daysSinceLast: number | null,
): Pick<
  ProgressionForecastTarget,
  "target" | "delta" | "tactic" | "reason" | "state"
> {
  const target = `${suggestion.weight} ${units} x ${suggestion.repTarget}`;

  if (suggestion.basis === "deload") {
    return {
      target,
      delta: signedLoadDelta(suggestion.deltaFromLast, units),
      tactic: "Systemic Deload",
      reason: "Fatigue mitigation. Based on 2 missed rep targets.",
      state: "deload",
    };
  }

  if (suggestion.basis === "rust") {
    return {
      target,
      delta:
        suggestion.deltaFromLast === 0
          ? zeroLoadDelta(units)
          : signedLoadDelta(suggestion.deltaFromLast, units),
      tactic: "Ease back in",
      reason:
        daysSinceLast == null
          ? "Time gap since last logged session."
          : `Time gap since last logged session. ${daysSinceLast} days elapsed.`,
      state: "rust",
    };
  }

  if (suggestion.basis === "progress") {
    return {
      target,
      delta: signedLoadDelta(suggestion.deltaFromLast, units),
      tactic: "Step up load",
      reason: `Based on last top set: ${suggestion.lastSummary}.`,
      state: "progress",
    };
  }

  if (suggestion.basis === "add-rep") {
    return {
      target,
      delta: "+1 rep target",
      tactic: "Add one rep",
      reason: `Based on last top set: ${suggestion.lastSummary}.`,
      state: "add-rep",
    };
  }

  return {
    target,
    delta: zeroLoadDelta(units),
    tactic: "Hold baseline",
    reason: `Based on last top set: ${suggestion.lastSummary}.`,
    state: "repeat",
  };
}

export function isEligiblePrimaryTarget(
  exerciseId: string,
  customExercises: CustomExercise[] = [],
): boolean {
  return (
    getExercisePrescription(exerciseId, customExercises).loadMode ===
      "external" && COMPOUND_EXTERNAL_LIFTS.has(exerciseId)
  );
}

export function buildProgressionForecastTarget(
  exerciseId: string,
  sessions: SessionLog[],
  settings: Settings,
  customExercises: CustomExercise[] = [],
  today: string = todayIso(),
  suggestionOverride?: LoadSuggestion | null,
): ProgressionForecastTarget | null {
  const prescription = getExercisePrescription(exerciseId, customExercises);
  if (prescription.loadMode !== "external") return null;

  const exerciseName =
    getExerciseById(exerciseId, customExercises)?.name ?? exerciseId;
  const history = liftHistory(exerciseId, sessions);
  const suggestion =
    suggestionOverride === undefined
      ? suggestNextLoad(exerciseId, sessions, settings, customExercises, today)
      : suggestionOverride;
  const last = history[history.length - 1];
  const baselineWeight = suggestion?.lastWeight ?? last?.top.weight ?? null;
  const baselineReps = suggestion?.lastReps ?? last?.top.reps ?? null;

  if (!suggestion) {
    return {
      exerciseId,
      exerciseName,
      target: "Establishing Baseline",
      delta: zeroLoadDelta(settings.units),
      tactic: "Establishing Baseline",
      reason: "Forecasting requires 2 data points.",
      suggestion: null,
      baselineWeight,
      baselineReps,
      state: "baseline",
    };
  }

  const daysSinceLast = last ? daysBetween(last.date, today) : null;
  return {
    exerciseId,
    exerciseName,
    ...mapSuggestion(suggestion, settings.units, daysSinceLast),
    suggestion,
    baselineWeight,
    baselineReps,
  };
}

export function buildProgressionForecast(
  exerciseIds: string[],
  sessions: SessionLog[],
  settings: Settings,
  customExercises: CustomExercise[] = [],
  today: string = todayIso(),
): TemplateProgressionForecast {
  const suggestions = suggestLoadsForExercises(
    exerciseIds,
    sessions,
    settings,
    customExercises,
    today,
  );
  const targets = exerciseIds.flatMap((exerciseId) => {
    const target = buildProgressionForecastTarget(
      exerciseId,
      sessions,
      settings,
      customExercises,
      today,
      suggestions[exerciseId] ?? null,
    );
    return target ? [target] : [];
  });
  const suggestedTargets = targets.filter((target) => target.suggestion);
  const primaryTarget =
    suggestedTargets.find((target) =>
      isEligiblePrimaryTarget(target.exerciseId, customExercises),
    ) ??
    suggestedTargets[0] ??
    targets.find((target) =>
      isEligiblePrimaryTarget(target.exerciseId, customExercises),
    ) ??
    targets[0] ??
    null;

  return {
    primaryTarget,
    subordinateTargets: primaryTarget
      ? targets.filter(
          (target) => target.exerciseId !== primaryTarget.exerciseId,
        )
      : targets,
  };
}

export function buildSuggestionForecastTarget(
  suggestion: LoadSuggestion,
  units: Settings["units"],
): Pick<
  ProgressionForecastTarget,
  "target" | "delta" | "tactic" | "reason" | "baselineWeight" | "baselineReps"
> {
  return {
    ...mapSuggestion(suggestion, units, null),
    baselineWeight: suggestion.lastWeight,
    baselineReps: suggestion.lastReps,
  };
}
