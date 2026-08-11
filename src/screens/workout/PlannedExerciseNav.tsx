import { Check } from "lucide-react";
import { getExerciseById } from "@/domain/exerciseLibrary";
import type { ExercisePerformance } from "@/domain/execution/types";
import { useCustomExerciseStore } from "@/state/useCustomExerciseStore";

interface PlannedExerciseNavProps {
  exercises: ExercisePerformance[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function PlannedExerciseNav({
  exercises,
  selectedIndex,
  onSelect,
}: PlannedExerciseNavProps) {
  const customExercises = useCustomExerciseStore((state) => state.exercises);

  return (
    <nav aria-label="Workout exercises" className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      {exercises.map((exercise, index) => {
        const name =
          getExerciseById(exercise.exerciseId, customExercises)?.name ?? exercise.exerciseId;
        const complete =
          exercise.sets.length > 0 && exercise.sets.every((set) => set.completed);
        const completedCount = exercise.sets.filter((set) => set.completed).length;
        return (
          <button
            key={exercise.id}
            type="button"
            aria-current={selectedIndex === index ? "step" : undefined}
            onClick={() => onSelect(index)}
            className={`min-h-14 min-w-[10rem] rounded-md px-3 py-2 text-left transition ${
              selectedIndex === index
                ? "bg-surface-3 text-text shadow-card"
                : "bg-surface-1 text-text-secondary"
            }`}
          >
            <span className="flex items-center justify-between gap-3">
              <span className="truncate text-sm font-semibold">{name}</span>
              {complete ? (
                <Check className="h-4 w-4 shrink-0 text-positive" aria-hidden="true" />
              ) : null}
            </span>
            <span className="mt-1 block text-xs text-text-muted">
              {completedCount}/{exercise.sets.length} sets
            </span>
          </button>
        );
      })}
    </nav>
  );
}
