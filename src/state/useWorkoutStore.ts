import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_TEMPLATE } from "@/domain/exercises";
import { buildWorkoutSets } from "@/domain/workoutPrefill";
import {
  addWorkoutExercise,
  appendWorkoutSet,
  substituteWorkoutExercise,
  toggleSetCompletion,
  updateWorkoutSet,
} from "@/state/workoutMutations";
import {
  customExercises,
  suggestFor,
  suggestForTemplate,
} from "@/state/workoutSuggestions";
import type { WorkoutState } from "@/state/workoutTypes";

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set) => ({
      workoutActive: false,
      workoutName: DEFAULT_TEMPLATE.name,
      workoutDuration: 0,
      startedAt: null,
      activeWorkoutList: DEFAULT_TEMPLATE.exercises,
      workoutSets: buildWorkoutSets(DEFAULT_TEMPLATE.exercises),
      selectedExIndex: 0,
      selectedSetIndex: 0,
      isMinimumSession: false,
      adaptedDuringSession: false,
      deloadWeights: {},
      loadSuggestions: {},
      tick: () =>
        set((state) => {
          if (!state.workoutActive || !state.startedAt) return state;
          return {
            workoutDuration: Math.floor((Date.now() - state.startedAt) / 1000),
          };
        }),
      startTemplate: (template = DEFAULT_TEMPLATE, deloadWeights = {}) => {
        const loadSuggestions = suggestForTemplate(template);
        set({
          workoutActive: true,
          workoutName: template.name,
          workoutDuration: 0,
          startedAt: Date.now(),
          activeWorkoutList: template.exercises,
          workoutSets: buildWorkoutSets(
            template.exercises,
            deloadWeights,
            customExercises(),
            loadSuggestions,
          ),
          selectedExIndex: 0,
          selectedSetIndex: 0,
          isMinimumSession: Boolean(template.isMinimumSession),
          adaptedDuringSession: false,
          deloadWeights,
          loadSuggestions,
        });
      },
      endSession: () =>
        set({
          workoutActive: false,
          workoutDuration: 0,
          startedAt: null,
          selectedExIndex: 0,
          selectedSetIndex: 0,
          isMinimumSession: false,
          adaptedDuringSession: false,
          loadSuggestions: {},
        }),
      setSelectedExIndex: (selectedExIndex) =>
        set({ selectedExIndex, selectedSetIndex: 0 }),
      setSelectedSetIndex: (selectedSetIndex) => set({ selectedSetIndex }),
      setIsMinimumSession: (isMinimumSession) => set({ isMinimumSession }),
      toggleComplete: (exerciseId, setIndex) => {
        let completedNow = false;
        set((state) => {
          const next = toggleSetCompletion(state, exerciseId, setIndex);
          completedNow = next.completedNow;
          return { workoutSets: next.workoutSets };
        });
        return completedNow;
      },
      updateSetField: (exerciseId, setIndex, field, value) =>
        set((state) =>
          updateWorkoutSet(state, exerciseId, setIndex, field, value),
        ),
      substituteExercise: (targetId, subId) =>
        set((state) =>
          substituteWorkoutExercise(
            state,
            targetId,
            subId,
            customExercises(),
            suggestFor(subId),
          ),
        ),
      addExercise: (exerciseId) =>
        set((state) =>
          addWorkoutExercise(
            state,
            exerciseId,
            customExercises(),
            suggestFor(exerciseId),
          ),
        ),
      applyDeloadWeight: (exerciseId, weight) =>
        set((state) => ({
          deloadWeights: { ...state.deloadWeights, [exerciseId]: weight },
        })),
      appendSet: (exerciseId) =>
        set((state) => appendWorkoutSet(state, exerciseId, customExercises())),
    }),
    { name: "macht_workout" },
  ),
);
