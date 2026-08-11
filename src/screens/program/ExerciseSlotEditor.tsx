import { Minus, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import type { SlotTrainingPatch } from "@/domain/training/programEditing";
import type { ProgramExerciseSlot } from "@/domain/training/types";
import type { Exercise } from "@/domain/types";

interface ExerciseSlotEditorProps {
  slot: ProgramExerciseSlot;
  exercises: Exercise[];
  canRemove: boolean;
  onReplace: (exerciseId: string, targetLabel: string) => void;
  onTrainingChange: (patch: SlotTrainingPatch) => void;
  onAddSubstitution: (exerciseId: string) => void;
  onRemoveSubstitution: (exerciseId: string) => void;
  onRemove: () => void;
}

const inputClass =
  "min-h-10 w-full rounded-sm bg-inset px-2 text-sm font-semibold text-text outline-none focus:ring-2 focus:ring-signal-strong";

export function ExerciseSlotEditor({
  slot,
  exercises,
  canRemove,
  onReplace,
  onTrainingChange,
  onAddSubstitution,
  onRemoveSubstitution,
  onRemove,
}: ExerciseSlotEditorProps) {
  const [alternative, setAlternative] = useState("");
  const current = exercises.find((exercise) => exercise.id === slot.exerciseId);
  const alternatives = (slot.allowedSubstitutionExerciseIds ?? [])
    .map((id) => exercises.find((exercise) => exercise.id === id))
    .filter((exercise): exercise is Exercise => Boolean(exercise));
  const targetEffort = slot.targetEffort ?? { scale: "RIR" as const, value: 3 };

  return (
    <div className="rounded-md bg-surface-2 p-3 sm:p-4">
      <div className="flex items-start gap-2">
        <label className="min-w-0 flex-1">
          <span className="sr-only">Exercise</span>
          <select
            value={slot.exerciseId}
            onChange={(event) => {
              const next = exercises.find(
                (exercise) => exercise.id === event.target.value,
              );
              if (next) onReplace(next.id, next.target);
            }}
            className={`${inputClass} text-base`}
          >
            {exercises.map((exercise) => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.name}
              </option>
            ))}
          </select>
          <span className="mt-1 block text-xs text-text-muted">
            {current?.target ?? slot.targetMuscleIds.join(" · ")}
          </span>
        </label>
        <button
          type="button"
          aria-label="Remove exercise"
          disabled={!canRemove}
          onClick={onRemove}
          className="flex min-h-10 min-w-10 items-center justify-center rounded-sm text-text-muted transition hover:bg-negative-soft hover:text-negative disabled:pointer-events-none disabled:opacity-30"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <span className="text-[11px] font-semibold text-text-muted">Sets</span>
          <div className="mt-1 flex min-h-10 items-center rounded-sm bg-inset">
            <button
              type="button"
              aria-label="Remove one planned set"
              onClick={() =>
                onTrainingChange({ baseSetCount: slot.baseSetCount - 1 })
              }
              className="flex min-h-10 min-w-9 items-center justify-center text-text-muted"
            >
              <Minus className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <span className="metric flex-1 text-center text-sm font-bold text-text">
              {slot.baseSetCount}
            </span>
            <button
              type="button"
              aria-label="Add one planned set"
              onClick={() =>
                onTrainingChange({ baseSetCount: slot.baseSetCount + 1 })
              }
              className="flex min-h-10 min-w-9 items-center justify-center text-text-muted"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <label>
          <span className="text-[11px] font-semibold text-text-muted">Rep range</span>
          <div className="mt-1 flex items-center gap-1">
            <input
              aria-label="Minimum reps"
              inputMode="numeric"
              value={slot.repRange.min}
              onChange={(event) =>
                onTrainingChange({ repMin: Number(event.target.value) || 1 })
              }
              className={`${inputClass} metric text-center`}
            />
            <span className="text-text-muted">–</span>
            <input
              aria-label="Maximum reps"
              inputMode="numeric"
              value={slot.repRange.max}
              onChange={(event) =>
                onTrainingChange({ repMax: Number(event.target.value) || 1 })
              }
              className={`${inputClass} metric text-center`}
            />
          </div>
        </label>

        <div>
          <span className="text-[11px] font-semibold text-text-muted">Effort</span>
          <div className="mt-1 flex gap-1">
            <input
              aria-label="Effort target"
              inputMode="decimal"
              value={targetEffort.value}
              onChange={(event) =>
                onTrainingChange({
                  targetEffort: {
                    ...targetEffort,
                    value: Number(event.target.value) || 0,
                  },
                })
              }
              className={`${inputClass} metric text-center`}
            />
            <select
              aria-label="Effort scale"
              value={targetEffort.scale}
              onChange={(event) =>
                onTrainingChange({
                  targetEffort: {
                    scale: event.target.value as "RIR" | "RPE",
                    value: event.target.value === "RIR" ? 3 : 7,
                  },
                })
              }
              className={`${inputClass} w-20 px-1 text-xs`}
            >
              <option value="RIR">RIR</option>
              <option value="RPE">RPE</option>
            </select>
          </div>
        </div>

        <label>
          <span className="text-[11px] font-semibold text-text-muted">Rest</span>
          <select
            value={slot.restSeconds ?? 90}
            onChange={(event) =>
              onTrainingChange({ restSeconds: Number(event.target.value) })
            }
            className={`${inputClass} mt-1`}
          >
            {[60, 75, 90, 120, 150, 180].map((seconds) => (
              <option key={seconds} value={seconds}>
                {seconds}s
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 border-t border-divider pt-3">
        <span className="text-[11px] font-semibold text-text-muted">
          Allowed substitutions
        </span>
        {alternatives.length ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {alternatives.map((exercise) => (
              <button
                key={exercise.id}
                type="button"
                onClick={() => onRemoveSubstitution(exercise.id)}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-inset px-3 text-xs font-medium text-text-secondary"
              >
                {exercise.name}
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-1 text-xs text-text-muted">No automatic alternatives set.</p>
        )}
        <div className="mt-2 flex gap-2">
          <select
            aria-label="Add substitution"
            value={alternative}
            onChange={(event) => setAlternative(event.target.value)}
            className={`${inputClass} flex-1`}
          >
            <option value="">Choose alternative…</option>
            {exercises
              .filter(
                (exercise) =>
                  exercise.id !== slot.exerciseId &&
                  !slot.allowedSubstitutionExerciseIds?.includes(exercise.id),
              )
              .map((exercise) => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.name}
                </option>
              ))}
          </select>
          <button
            type="button"
            disabled={!alternative}
            onClick={() => {
              if (!alternative) return;
              onAddSubstitution(alternative);
              setAlternative("");
            }}
            className="min-h-10 rounded-sm bg-surface-3 px-3 text-xs font-semibold text-text-secondary disabled:opacity-40"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
