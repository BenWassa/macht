import { create } from "zustand";
import { persist } from "zustand/middleware";
import { EXERCISE_LIBRARY } from "@/domain/exercises";
import { findSimilarExerciseName } from "@/domain/exerciseLibrary";
import type { CustomExercise } from "@/domain/types";
import { demoStorageKey } from "@/lib/demoMode";

interface CreateExerciseInput {
  name: string;
  target: string;
  defaultWeight?: number;
  defaultReps?: number;
}

type CreateExerciseResult =
  | { ok: true; exercise: CustomExercise }
  | { ok: false; error: string };

interface CustomExerciseState {
  exercises: CustomExercise[];
  addExercise: (input: CreateExerciseInput) => CreateExerciseResult;
  removeExercise: (exerciseId: string) => void;
  hydrateExercises: (exercises: CustomExercise[]) => void;
}

const toExerciseId = (name: string): string =>
  `custom_${name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")}_${Date.now().toString(36)}`;

export const useCustomExerciseStore = create<CustomExerciseState>()(
  persist(
    (set, get) => ({
      exercises: [],
      addExercise: ({ name, target, defaultWeight, defaultReps }) => {
        const cleanName = name.trim().replace(/\s+/g, " ");
        const cleanTarget = target.trim().replace(/\s+/g, " ");
        const cleanWeight = Math.max(0, Math.round(defaultWeight ?? 20));
        const cleanReps = Math.max(1, Math.round(defaultReps || 8));
        if (!cleanName || !cleanTarget) {
          return { ok: false, error: "Name and target required" };
        }

        const similarName = findSimilarExerciseName(cleanName, [
          ...EXERCISE_LIBRARY,
          ...get().exercises,
        ]);
        if (similarName) {
          return { ok: false, error: `Similar to ${similarName}` };
        }

        const exercise: CustomExercise = {
          id: toExerciseId(cleanName),
          name: cleanName,
          target: cleanTarget,
          tags: [],
          loadMode: "external",
          defaultWeight: cleanWeight,
          defaultReps: cleanReps,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ exercises: [...state.exercises, exercise] }));
        return { ok: true, exercise };
      },
      removeExercise: (exerciseId) =>
        set((state) => ({
          exercises: state.exercises.filter((exercise) => exercise.id !== exerciseId),
        })),
      hydrateExercises: (exercises) => set({ exercises }),
    }),
    { name: demoStorageKey("macht_custom_exercises") },
  ),
);
