import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  appendSetPerformance,
  createPlannedWorkout,
  substituteExercisePerformance,
  toggleSetPerformance,
  updateExerciseFeedback,
  updateExerciseNote,
  updateSetPerformance,
} from "@/domain/execution/plannedWorkout";
import { DEFAULT_TEMPLATE } from "@/domain/exercises";
import { buildWorkoutSets } from "@/domain/workoutPrefill";
import { demoStorageKey } from "@/lib/demoMode";
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
      activeV2Workout: null,
      selectedExIndex: 0,
      selectedSetIndex: 0,
      isMinimumSession: false,
      adaptedDuringSession: false,
      deloadWeights: {},
      loadSuggestions: {},
      exerciseNotes: {},
      setExerciseNote: (exerciseId, note) =>
        set((state) => ({
          exerciseNotes: { ...state.exerciseNotes, [exerciseId]: note },
        })),
      tick: () =>
        set((state) => {
          if (!state.workoutActive || !state.startedAt) return state;
          return {
            workoutDuration: Math.floor((Date.now() - state.startedAt) / 1000),
          };
        }),
      startTemplate: (template = DEFAULT_TEMPLATE, deloadWeights = {}) => {
        const loadSuggestions = suggestForTemplate(template);
        set((state) => {
          if (state.workoutActive) return {};
          return {
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
            activeV2Workout: null,
            selectedExIndex: 0,
            selectedSetIndex: 0,
            isMinimumSession: Boolean(template.isMinimumSession),
            adaptedDuringSession: false,
            deloadWeights,
            loadSuggestions,
          };
        });
      },
      startPlannedSession: (plannedSession, context) =>
        set((state) => {
          if (state.workoutActive) return {};
          const startedAt = new Date().toISOString();
          const activeV2Workout = createPlannedWorkout({
            plannedSession,
            context,
            startedAt,
          });
          return {
            workoutActive: true,
            workoutName: plannedSession.name,
            workoutDuration: 0,
            startedAt: Date.now(),
            activeWorkoutList: activeV2Workout.exercisePerformances.map(
              (exercise) => exercise.exerciseId,
            ),
            workoutSets: {},
            activeV2Workout,
            selectedExIndex: 0,
            selectedSetIndex: 0,
            isMinimumSession: false,
            adaptedDuringSession: false,
            deloadWeights: {},
            loadSuggestions: {},
            exerciseNotes: {},
          };
        }),
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
          exerciseNotes: {},
          activeV2Workout: null,
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
      updateV2Set: (exercisePerformanceId, setPerformanceId, patch) =>
        set((state) => ({
          activeV2Workout: state.activeV2Workout
            ? updateSetPerformance(
                state.activeV2Workout,
                exercisePerformanceId,
                setPerformanceId,
                patch,
              )
            : null,
        })),
      updateV2ExerciseFeedback: (exercisePerformanceId, patch) =>
        set((state) => ({
          activeV2Workout: state.activeV2Workout
            ? updateExerciseFeedback(
                state.activeV2Workout,
                exercisePerformanceId,
                patch,
                new Date().toISOString(),
              )
            : null,
        })),
      appendV2Set: (exercisePerformanceId) =>
        set((state) => {
          if (!state.activeV2Workout) return {};
          const exercise = state.activeV2Workout.exercisePerformances.find(
            (item) => item.id === exercisePerformanceId,
          );
          const selectedSetIndex = exercise?.sets.length ?? state.selectedSetIndex;
          return {
            activeV2Workout: appendSetPerformance(
              state.activeV2Workout,
              exercisePerformanceId,
              crypto.randomUUID(),
            ),
            adaptedDuringSession: true,
            selectedSetIndex,
          };
        }),
      toggleV2Complete: (exercisePerformanceId, setPerformanceId) => {
        let completedNow = false;
        set((state) => {
          if (!state.activeV2Workout) return state;
          const result = toggleSetPerformance(
            state.activeV2Workout,
            exercisePerformanceId,
            setPerformanceId,
            new Date().toISOString(),
          );
          completedNow = result.completedNow;
          return { activeV2Workout: result.session };
        });
        return completedNow;
      },
      setV2ExerciseNote: (exercisePerformanceId, note) =>
        set((state) => ({
          activeV2Workout: state.activeV2Workout
            ? updateExerciseNote(
                state.activeV2Workout,
                exercisePerformanceId,
                note,
              )
            : null,
        })),
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
      substituteV2Exercise: (exercisePerformanceId, replacementExerciseId) =>
        set((state) => {
          if (!state.activeV2Workout) return state;
          const activeV2Workout = substituteExercisePerformance(
            state.activeV2Workout,
            exercisePerformanceId,
            replacementExerciseId,
          );
          return {
            activeV2Workout,
            adaptedDuringSession: activeV2Workout.adaptedDuringSession,
            activeWorkoutList: activeV2Workout.exercisePerformances.map(
              (exercise) => exercise.exerciseId,
            ),
          };
        }),
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
    { name: demoStorageKey("macht_workout") },
  ),
);
