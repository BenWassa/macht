import { create } from 'zustand';
import { DEFAULT_TEMPLATE } from '@/domain/exercises';
import type { SetEntry, TemplatePlan, WorkoutSets } from '@/domain/types';

// SPLIT TRIGGER: if this file exceeds 160 lines, extract useWorkoutCursor.ts
// containing: selectedExIndex, selectedSetIndex, setSelectedExIndex, setSelectedSetIndex.

const makeDefaultSets = (last = '-'): SetEntry[] => [
  { id: 1, weight: 80, reps: 8, rpe: null, completed: false, last },
  { id: 2, weight: 80, reps: 8, rpe: null, completed: false, last },
  { id: 3, weight: 75, reps: 10, rpe: null, completed: false, last },
];

const seedSets = (exercises: string[]): WorkoutSets =>
  exercises.reduce<WorkoutSets>((acc, exerciseId) => {
    acc[exerciseId] = makeDefaultSets();
    return acc;
  }, {});

interface WorkoutState {
  workoutActive: boolean;
  workoutName: string;
  workoutDuration: number;
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
}

export const useWorkoutStore = create<WorkoutState>()((set) => ({
  workoutActive: false,
  workoutName: DEFAULT_TEMPLATE.name,
  workoutDuration: 0,
  activeWorkoutList: DEFAULT_TEMPLATE.exercises,
  workoutSets: seedSets(DEFAULT_TEMPLATE.exercises),
  selectedExIndex: 0,
  selectedSetIndex: 0,
  isMinimumSession: false,
  deloadWeights: {},
  tick: () => set((state) => (state.workoutActive ? { workoutDuration: state.workoutDuration + 1 } : state)),
  startTemplate: (template = DEFAULT_TEMPLATE, deloadWeights = {}) =>
    set({
      workoutActive: true,
      workoutName: template.name,
      workoutDuration: 0,
      activeWorkoutList: template.exercises,
      workoutSets: template.exercises.reduce<WorkoutSets>((acc, exerciseId) => {
        const weight = deloadWeights[exerciseId] ?? 80;
        acc[exerciseId] = [
          { id: 1, weight, reps: 8, rpe: null, completed: false, last: '-' },
          { id: 2, weight, reps: 8, rpe: null, completed: false, last: '-' },
          { id: 3, weight: Math.max(0, weight - 5), reps: 10, rpe: null, completed: false, last: '-' },
        ];
        return acc;
      }, {}),
      selectedExIndex: 0,
      selectedSetIndex: 0,
      isMinimumSession: false,
      deloadWeights,
    }),
  endSession: () =>
    set({
      workoutActive: false,
      workoutDuration: 0,
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
      const nextSets = sets.map((entry, index) => {
        if (index !== setIndex) return entry;
        completedNow = !entry.completed;
        return { ...entry, completed: completedNow };
      });
      return { workoutSets: { ...state.workoutSets, [exerciseId]: nextSets } };
    });
    return completedNow;
  },
  updateSetField: (exerciseId, setIndex, field, value) =>
    set((state) => {
      const sets = state.workoutSets[exerciseId] ?? [];
      return {
        workoutSets: {
          ...state.workoutSets,
          [exerciseId]: sets.map((entry, index) => (index === setIndex ? { ...entry, [field]: value } : entry)),
        },
      };
    }),
  substituteExercise: (targetId, subId) =>
    set((state) => {
      const index = state.activeWorkoutList.indexOf(targetId);
      if (index === -1) return state;
      const activeWorkoutList = [...state.activeWorkoutList];
      activeWorkoutList[index] = subId;
      return {
        activeWorkoutList,
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
}));
