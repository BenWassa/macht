import { EXERCISE_LIBRARY } from "./exercises";
import type { Exercise } from "./types";

/** Classic compound lifts pinned at the top of the Free Play picker. */
export const BIG_FIVE: string[] = [
  "squat",
  "bench_press",
  "deadlift",
  "overhead_press",
  "barbell_row",
];

export type SectionKey =
  | "lower"
  | "upper"
  | "core"
  | "conditioning"
  | "shoulder_care";

/** Ordered sections shown below the pinned Big Five row. */
export const EXERCISE_SECTIONS: { key: SectionKey; label: string }[] = [
  { key: "lower", label: "Lower body" },
  { key: "upper", label: "Upper body" },
  { key: "core", label: "Core" },
  { key: "conditioning", label: "Conditioning" },
  { key: "shoulder_care", label: "Shoulder care" },
];

const includesAny = (haystack: string, needles: string[]): boolean =>
  needles.some((needle) => haystack.includes(needle));

/**
 * Classify an exercise into exactly one section. Priority order matters so that
 * exercises with multi-part targets (e.g. "Quads / Core") land in one place.
 */
export function getExerciseCategory(exercise: Exercise): SectionKey {
  const target = exercise.target.toLowerCase();
  const tags = exercise.tags;

  if (
    includesAny(target, ["aerobic", "conditioning"]) ||
    tags.includes("conditioning_safe")
  ) {
    return "conditioning";
  }

  if (includesAny(target, ["rotator", "scapula", "serratus"])) {
    return "shoulder_care";
  }

  if (target.startsWith("core") || tags.includes("core_safe")) {
    return "core";
  }

  if (
    includesAny(target, [
      "quad",
      "hamstring",
      "glute",
      "calf",
      "calves",
      "posterior",
      "leg",
    ])
  ) {
    return "lower";
  }

  return "upper";
}

/**
 * Group the full library by section, excluding the Big Five (those live only in
 * the pinned row).
 */
export function groupLibraryBySection(): Record<SectionKey, Exercise[]> {
  const groups: Record<SectionKey, Exercise[]> = {
    lower: [],
    upper: [],
    core: [],
    conditioning: [],
    shoulder_care: [],
  };

  for (const exercise of EXERCISE_LIBRARY) {
    if (BIG_FIVE.includes(exercise.id)) continue;
    groups[getExerciseCategory(exercise)].push(exercise);
  }

  return groups;
}
