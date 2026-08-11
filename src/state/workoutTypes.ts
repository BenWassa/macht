import type { WorkoutSession } from "@/domain/execution/types";
import type {
  PlannedWorkoutContext,
  SetPerformancePatch,
} from "@/domain/execution/plannedWorkout";
import type { LoadSuggestion } from "@/domain/progression";
import type {
  ExercisePerformanceId,
  SetPerformanceId,
} from "@/domain/shared/ids";
import type { PlannedSession } from "@/domain/training/types";
import type { SetEntry, TemplatePlan, WorkoutSets } from "@/domain/types";

export interface WorkoutState {
  workoutActive: boolean;
  workoutName: string;
  workoutDuration: number;
  startedAt: number | null;
  activeWorkoutList: string[];
  workoutSets: WorkoutSets;
  activeV2Workout: WorkoutSession | null;
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
  startPlannedSession: (
    plannedSession: PlannedSession,
    context: PlannedWorkoutContext,
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
  updateV2Set: (
    exercisePerformanceId: ExercisePerformanceId,
    setPerformanceId: SetPerformanceId,
    patch: SetPerformancePatch,
  ) => void;
  appendV2Set: (exercisePerformanceId: ExercisePerformanceId) => void;
  toggleV2Complete: (
    exercisePerformanceId: ExercisePerformanceId,
    setPerformanceId: SetPerformanceId,
  ) => boolean;
  setV2ExerciseNote: (
    exercisePerformanceId: ExercisePerformanceId,
    note: string,
  ) => void;
  substituteExercise: (targetId: string, subId: string) => void;
  substituteV2Exercise: (
    exercisePerformanceId: ExercisePerformanceId,
    replacementExerciseId: string,
  ) => void;
  addExercise: (exerciseId: string) => void;
  applyDeloadWeight: (exerciseId: string, weight: number) => void;
  appendSet: (exerciseId: string) => void;
}
