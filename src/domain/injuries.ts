import { EXERCISE_LIBRARY } from "./exercises";
import type { ExerciseConflict, ExerciseInjury, TemplatePlan } from "./types";

const ALTERNATIVES: Record<string, string> = {
  bench_press: "floor_press_neutral",
  overhead_press: "landmine_press",
  lat_pulldown_behind: "lat_pulldown_front",
  pull_up: "lat_pulldown_front",
  chin_up: "lat_pulldown_front",
  dip: "tricep_pushdown",
  front_squat: "leg_press",
  squat: "leg_press",
  deadlift: "hip_thrust",
  rowing_machine: "stationary_bike",
  assault_bike_arms: "stationary_bike",
  battle_ropes: "stationary_bike",
  hanging_leg_raise: "reverse_crunch",
  ab_wheel: "dead_bug",
};

export const getAlternativeFor = (exerciseId: string): string | null =>
  ALTERNATIVES[exerciseId] ?? null;

export function getExerciseConflict(
  exerciseId: string,
  injuries: ExerciseInjury[],
): ExerciseConflict | null {
  const exercise = EXERCISE_LIBRARY.find((item) => item.id === exerciseId);
  if (!exercise) return null;

  for (const injury of injuries.filter((item) => !item.clearedDate)) {
    const forbiddenTags = exercise.tags.filter((tag) =>
      injury.forbiddenTags.includes(tag),
    );
    if (forbiddenTags.length > 0) {
      return {
        injuryId: injury.id,
        injury: injury.name,
        level: "avoid",
        tags: forbiddenTags,
        severity: injury.severity,
        alternative: getAlternativeFor(exerciseId),
      };
    }
  }

  for (const injury of injuries.filter((item) => !item.clearedDate)) {
    const cautionTags = exercise.tags.filter((tag) =>
      (injury.cautionTags ?? []).includes(tag),
    );
    if (cautionTags.length > 0) {
      return {
        injuryId: injury.id,
        injury: injury.name,
        level: "caution",
        tags: cautionTags,
        severity: injury.severity,
        alternative: null,
      };
    }
  }

  return null;
}

export function getBlockedExercises(injury: ExerciseInjury): string[] {
  return EXERCISE_LIBRARY.filter((exercise) =>
    exercise.tags.some((tag) => injury.forbiddenTags.includes(tag)),
  ).map((exercise) => exercise.id);
}

export function getRunnableTemplate(
  template: TemplatePlan,
  injuries: ExerciseInjury[],
): TemplatePlan {
  return {
    ...template,
    exercises: template.exercises.filter(
      (exerciseId) => getExerciseConflict(exerciseId, injuries)?.level !== "avoid",
    ),
  };
}
