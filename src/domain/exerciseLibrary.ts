import { EXERCISE_LIBRARY } from "@/domain/exercises";
import type { CustomExercise, Exercise } from "@/domain/types";

export function getAllExercises(
  customExercises: CustomExercise[] = [],
): Exercise[] {
  return [...EXERCISE_LIBRARY, ...customExercises];
}

export function getExerciseById(
  exerciseId: string,
  customExercises: CustomExercise[] = [],
): Exercise | undefined {
  return getAllExercises(customExercises).find(
    (exercise) => exercise.id === exerciseId,
  );
}

export function normalizeExerciseName(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

const WORD_ALIASES: Record<string, string> = {
  db: "dumbbell",
  dumbell: "dumbbell",
  dumbells: "dumbbell",
  dumbbells: "dumbbell",
  bicep: "biceps",
  curls: "curl",
};

const canonicalTokens = (name: string): string[] =>
  normalizeExerciseName(name)
    .replace(/[^a-z0-9 ]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => WORD_ALIASES[word] ?? word);

const editDistance = (a: string, b: string): number => {
  const prev = Array.from({ length: b.length + 1 }, (_, index) => index);
  const next = Array.from({ length: b.length + 1 }, () => 0);
  for (let i = 1; i <= a.length; i += 1) {
    next[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      next[j] = Math.min(
        prev[j] + 1,
        next[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    prev.splice(0, prev.length, ...next);
  }
  return prev[b.length];
};

const similarity = (a: string, b: string): number => {
  const longest = Math.max(a.length, b.length);
  if (longest === 0) return 1;
  return 1 - editDistance(a, b) / longest;
};

export function findSimilarExerciseName(
  name: string,
  exercises: Exercise[],
): string | null {
  const tokens = canonicalTokens(name);
  const canonical = tokens.join(" ");
  const tokenKey = [...tokens].sort().join(" ");

  for (const exercise of exercises) {
    const exerciseTokens = canonicalTokens(exercise.name);
    const exerciseCanonical = exerciseTokens.join(" ");
    const exerciseTokenKey = [...exerciseTokens].sort().join(" ");
    if (
      canonical === exerciseCanonical ||
      tokenKey === exerciseTokenKey ||
      similarity(canonical, exerciseCanonical) >= 0.86
    ) {
      return exercise.name;
    }
  }

  return null;
}
