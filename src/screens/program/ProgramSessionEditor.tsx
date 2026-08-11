import { Plus } from "lucide-react";
import { useState } from "react";
import type { SlotTrainingPatch } from "@/domain/training/programEditing";
import type { ProgramSessionTemplate } from "@/domain/training/types";
import type { Exercise } from "@/domain/types";
import { ExerciseSlotEditor } from "./ExerciseSlotEditor";

interface ProgramSessionEditorProps {
  session: ProgramSessionTemplate;
  exercises: Exercise[];
  onRename: (name: string) => void;
  onReplace: (slotId: string, exerciseId: string, targetLabel: string) => void;
  onTrainingChange: (slotId: string, patch: SlotTrainingPatch) => void;
  onAddSubstitution: (slotId: string, exerciseId: string) => void;
  onRemoveSubstitution: (slotId: string, exerciseId: string) => void;
  onRemoveSlot: (slotId: string) => void;
  onAddSlot: (slotId: string, exerciseId: string, targetLabel: string) => void;
}

export function ProgramSessionEditor({
  session,
  exercises,
  onRename,
  onReplace,
  onTrainingChange,
  onAddSubstitution,
  onRemoveSubstitution,
  onRemoveSlot,
  onAddSlot,
}: ProgramSessionEditorProps) {
  const [newExerciseId, setNewExerciseId] = useState("");

  return (
    <section className="surface-card overflow-hidden">
      <div className="border-b border-divider p-4 sm:p-5">
        <label className="block">
          <span className="text-xs font-semibold text-text-muted">
            Session {session.order}
          </span>
          <input
            value={session.name}
            onChange={(event) => onRename(event.target.value)}
            className="mt-1 w-full bg-transparent text-xl font-bold tracking-[-0.025em] text-text outline-none"
          />
        </label>
        <p className="mt-1 text-xs text-text-muted">
          {session.exerciseSlots.length} exercises · {session.targetDurationMinutes ?? "—"} min target
        </p>
      </div>

      <div className="space-y-3 p-3 sm:p-4">
        {session.exerciseSlots.map((slot) => (
          <ExerciseSlotEditor
            key={slot.id}
            slot={slot}
            exercises={exercises}
            canRemove={session.exerciseSlots.length > 1}
            onReplace={(exerciseId, targetLabel) =>
              onReplace(slot.id, exerciseId, targetLabel)
            }
            onTrainingChange={(patch) => onTrainingChange(slot.id, patch)}
            onAddSubstitution={(exerciseId) =>
              onAddSubstitution(slot.id, exerciseId)
            }
            onRemoveSubstitution={(exerciseId) =>
              onRemoveSubstitution(slot.id, exerciseId)
            }
            onRemove={() => onRemoveSlot(slot.id)}
          />
        ))}
      </div>

      <div className="flex gap-2 border-t border-divider p-3 sm:p-4">
        <select
          aria-label={`Exercise to add to ${session.name}`}
          value={newExerciseId}
          onChange={(event) => setNewExerciseId(event.target.value)}
          className="min-h-11 min-w-0 flex-1 rounded-sm bg-inset px-3 text-sm text-text outline-none focus:ring-2 focus:ring-signal-strong"
        >
          <option value="">Add exercise…</option>
          {exercises.map((exercise) => (
            <option key={exercise.id} value={exercise.id}>
              {exercise.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={!newExerciseId}
          onClick={() => {
            const exercise = exercises.find((item) => item.id === newExerciseId);
            if (!exercise) return;
            onAddSlot(
              `${session.id}:user:${crypto.randomUUID()}`,
              exercise.id,
              exercise.target,
            );
            setNewExerciseId("");
          }}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-sm bg-surface-3 px-3 text-sm font-semibold text-text-secondary disabled:opacity-40"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add
        </button>
      </div>
    </section>
  );
}
