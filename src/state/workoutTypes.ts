import type { LoadSuggestion } from "@/domain/progression";
import type { SetEntry, TemplatePlan, WorkoutSets } from "@/domain/types";

export interface WorkoutState {
  workoutActive: boolean;
  workoutName: string;
  workoutDuration: number;
  startedAt: number | null;
  activeWorkoutList: string[];
  workoutSets: WorkoutSets;
  selectedExIndex: number;
  selectedSetIndex: number;
  isMinimumSession: boolean;
  adaptedDuringSession: boolean;
  deloadWeights: Record<string, number>;
  loadSuggestions: Record<string, LoadSuggestion>;
  exerciseNotes: Record<string, string>;
  setExerciseNote: (exerciseId: string, note: string) => void;
  tick: () => void;
  startTemplate: (
    template?: TemplatePlan,
    deloadWeights?: Record<string, number>,
  ) => void;
  endSession: () => void;
  setSelectedExIndex: (index: number) => void;
  setSelectedSetIndex: (index: number) => void;
  setIsMinimumSession: (value: boolean) => void;
  toggleComplete: (exerciseId: string, setIndex: number) => boolean;
  updateSetField: <K extends keyof SetEntry>(
    exerciseId: string,
    setIndex: number,
    field: K,
    value: SetEntry[K],
  ) => void;
  substituteExercise: (targetId: string, subId: string) => void;
  addExercise: (exerciseId: string) => void;
  applyDeloadWeight: (exerciseId: string, weight: number) => void;
  appendSet: (exerciseId: string) => void;
}
