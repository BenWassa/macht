import { X } from "lucide-react";
import { useMemo } from "react";
import { useModalA11y } from "@/hooks/useModalA11y";
import type { CreateExerciseResult } from "@/screens/freeplay/CreateExercisePrompt";
import { ExercisePicker } from "@/screens/freeplay/ExercisePicker";
import { useCustomExerciseStore } from "@/state/useCustomExerciseStore";
import { useInjuryStore } from "@/state/useInjuryStore";
import { useWorkoutStore } from "@/state/useWorkoutStore";

interface AddExerciseModalProps {
  onClose: () => void;
}

const EMPTY = new Set<string>();

export function AddExerciseModal({ onClose }: AddExerciseModalProps) {
  const injuries = useInjuryStore((state) => state.injuries);
  const addCustomExercise = useCustomExerciseStore(
    (state) => state.addExercise,
  );
  const activeWorkoutList = useWorkoutStore((state) => state.activeWorkoutList);
  const addExercise = useWorkoutStore((state) => state.addExercise);
  const containerRef = useModalA11y<HTMLDivElement>(onClose);

  const disabledIds = useMemo(
    () => new Set(activeWorkoutList),
    [activeWorkoutList],
  );

  const createExercise = (
    name: string,
    target: string,
  ): CreateExerciseResult => {
    const result = addCustomExercise({ name, target });
    if (!result.ok) return result;
    addExercise(result.exercise.id);
    return { ok: true };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <div
        ref={containerRef}
        className="flex max-h-[85vh] w-full max-w-md flex-col border border-[#1a1a1a] bg-[#0c0c0c]"
      >
        <div className="flex items-center justify-between border-b border-[#1a1a1a] p-4">
          <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-neutral-300">
            Add exercise
          </h3>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto p-4">
          <ExercisePicker
            selectedIds={EMPTY}
            onToggle={addExercise}
            injuries={injuries}
            disabledIds={disabledIds}
            allowCreate
            onCreateExercise={createExercise}
          />
        </div>
        <div className="border-t border-[#1a1a1a] p-4">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 py-3 font-mono text-xs font-bold uppercase tracking-widest text-white transition hover:bg-blue-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
