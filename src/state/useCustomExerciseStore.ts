import { create } from "zustand";
import { persist } from "zustand/middleware";
import { EXERCISE_LIBRARY } from "@/domain/exercises";
import { normalizeExerciseName } from "@/domain/exerciseLibrary";
import type { CustomExercise } from "@/domain/types";

interface CreateExerciseInput {
  name: string;
  target: string;
}

type CreateExerciseResult =
  | { ok: true; exercise: CustomExercise }
  | { ok: false; error: string };

interface CustomExerciseState {
  exercises: CustomExercise[];
  addExercise: (input: CreateExerciseInput) => CreateExerciseResult;
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
      addExercise: ({ name, target }) => {
        const cleanName = name.trim().replace(/\s+/g, " ");
        const cleanTarget = target.trim().replace(/\s+/g, " ");
        if (!cleanName || !cleanTarget) {
          return { ok: false, error: "Name and target required" };
        }

        const normalized = normalizeExerciseName(cleanName);
        const duplicateStatic = EXERCISE_LIBRARY.some(
          (exercise) => normalizeExerciseName(exercise.name) === normalized,
        );
        const duplicateCustom = get().exercises.some(
          (exercise) => normalizeExerciseName(exercise.name) === normalized,
        );
        if (duplicateStatic || duplicateCustom) {
          return { ok: false, error: "Exercise already exists" };
        }

        const exercise: CustomExercise = {
          id: toExerciseId(cleanName),
          name: cleanName,
          target: cleanTarget,
          tags: [],
          loadMode: "external",
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ exercises: [...state.exercises, exercise] }));
        return { ok: true, exercise };
      },
      hydrateExercises: (exercises) => set({ exercises }),
    }),
    { name: "macht_custom_exercises" },
  ),
);
