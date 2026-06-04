import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_TEMPLATE } from "@/domain/exercises";
import type { SetEntry, TemplatePlan, WorkoutSets } from "@/domain/types";

const makeDefaultSets = (last = "-"): SetEntry[] => [
  { id: 1, weight: 80, reps: 8, rpe: null, completed: false, last },
  { id: 2, weight: 80, reps: 8, rpe: null, completed: false, last },
  { id: 3, weight: 75, reps: 10, rpe: null, completed: false, last },
];

const seedSets = (exercises: string[]): WorkoutSets =>
  exercises.reduce<WorkoutSets>((acc, id) => {
    acc[id] = makeDefaultSets();
    return acc;
  }, {});

interface WorkoutState {
  workoutActive: boolean;
  workoutName: string;
  workoutDuration: number;
  startedAt: number | null;
  activeWorkoutList: string[];
  workoutSets: WorkoutSets;
  selectedExIndex: number;
  selectedSetIndex: number;
  isMinimumSession: boolean;
  deloadWeights: Record<string, number>;
  tick: () => void;
  startTemplate: (template?: TemplatePlan, deloadWeights?: Record<string, number>) => void;
  endSession: () => void;
  setSelectedExIndex: (index: number) => void;
  setSelectedSetIndex: (index: number) => void;
  setIsMinimumSession: (value: boolean) => void;
  toggleComplete: (exerciseId: string, setIndex: number) => boolean;
  updateSetField: <K extends keyof SetEntry>(exerciseId: string, setIndex: number, field: K, value: SetEntry[K]) => void;
  substituteExercise: (targetId: string, subId: string) => void;
  applyDeloadWeight: (exerciseId: string, weight: number) => void;
  appendSet: (exerciseId: string) => void;
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set) => ({
      workoutActive: false,
      workoutName: DEFAULT_TEMPLATE.name,
      workoutDuration: 0,
      startedAt: null,
      activeWorkoutList: DEFAULT_TEMPLATE.exercises,
      workoutSets: seedSets(DEFAULT_TEMPLATE.exercises),
      selectedExIndex: 0,
      selectedSetIndex: 0,
      isMinimumSession: false,
      deloadWeights: {},
      tick: () =>
        set((state) => {
          if (!state.workoutActive || !state.startedAt) return state;
          return { workoutDuration: Math.floor((Date.now() - state.startedAt) / 1000) };
        }),
      startTemplate: (template = DEFAULT_TEMPLATE, deloadWeights = {}) =>
        set({
          workoutActive: true,
          workoutName: template.name,
          workoutDuration: 0,
          startedAt: Date.now(),
          activeWorkoutList: template.exercises,
          workoutSets: template.exercises.reduce<WorkoutSets>((acc, exerciseId) => {
            const weight = deloadWeights[exerciseId] ?? 80;
            acc[exerciseId] = [
              { id: 1, weight, reps: 8, rpe: null, completed: false, last: "-" },
              { id: 2, weight, reps: 8, rpe: null, completed: false, last: "-" },
              { id: 3, weight: Math.max(0, weight - 5), reps: 10, rpe: null, completed: false, last: "-" },
            ];
            return acc;
          }, {}),
          selectedExIndex: 0,
          selectedSetIndex: 0,
          isMinimumSession: Boolean(template.isMinimumSession),
          deloadWeights,
        }),
      endSession: () =>
        set({
          workoutActive: false,
          workoutDuration: 0,
          startedAt: null,
          selectedExIndex: 0,
          selectedSetIndex: 0,
          isMinimumSession: false,
        }),
      setSelectedExIndex: (selectedExIndex) => set({ selectedExIndex, selectedSetIndex: 0 }),
      setSelectedSetIndex: (selectedSetIndex) => set({ selectedSetIndex }),
      setIsMinimumSession: (isMinimumSession) => set({ isMinimumSession }),
      toggleComplete: (exerciseId, setIndex) => {
        let completedNow = false;
        set((state) => {
          const sets = state.workoutSets[exerciseId] ?? [];
          const next = sets.map((entry, i) => {
            if (i !== setIndex) return entry;
            completedNow = !entry.completed;
            return { ...entry, completed: completedNow };
          });
          return { workoutSets: { ...state.workoutSets, [exerciseId]: next } };
        });
        return completedNow;
      },
      updateSetField: (exerciseId, setIndex, field, value) =>
        set((state) => {
          const sets = state.workoutSets[exerciseId] ?? [];
          return {
            workoutSets: {
              ...state.workoutSets,
              [exerciseId]: sets.map((entry, i) =>
                i === setIndex ? { ...entry, [field]: value } : entry,
              ),
            },
          };
        }),
      substituteExercise: (targetId, subId) =>
        set((state) => {
          const index = state.activeWorkoutList.indexOf(targetId);
          if (index === -1) return state;
          const list = [...state.activeWorkoutList];
          list[index] = subId;
          return {
            activeWorkoutList: list,
            selectedExIndex: index,
            selectedSetIndex: 0,
            workoutSets: {
              ...state.workoutSets,
              [subId]: state.workoutSets[subId] ?? makeDefaultSets(),
            },
          };
        }),
      applyDeloadWeight: (exerciseId, weight) =>
        set((state) => ({
          deloadWeights: { ...state.deloadWeights, [exerciseId]: weight },
        })),
      appendSet: (exerciseId) =>
        set((state) => {
          const sets = state.workoutSets[exerciseId] ?? [];
          const prev = sets[sets.length - 1];
          const next: SetEntry = prev
            ? { id: prev.id + 1, weight: prev.weight, reps: prev.reps, rpe: null, completed: false, last: "-" }
            : { id: 1, weight: 80, reps: 8, rpe: null, completed: false, last: "-" };
          return { workoutSets: { ...state.workoutSets, [exerciseId]: [...sets, next] } };
        }),
    }),
    { name: "macht_workout" },
  ),
);
