import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useCustomExerciseStore } from "@/state/useCustomExerciseStore";
import { useProgramStore } from "@/state/useProgramStore";

export function CustomExercisesPanel() {
  const exercises = useCustomExerciseStore((state) => state.exercises);
  const addExercise = useCustomExerciseStore((state) => state.addExercise);
  const removeExercise = useCustomExerciseStore((state) => state.removeExercise);
  const programs = useProgramStore((state) => state.programs);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [defaultWeight, setDefaultWeight] = useState(20);
  const [defaultReps, setDefaultReps] = useState(8);
  const [error, setError] = useState("");

  const usedExerciseIds = new Set(
    programs.flatMap((program) =>
      program.sessionTemplates.flatMap((session) =>
        session.exerciseSlots.flatMap((slot) => [
          slot.exerciseId,
          ...(slot.allowedSubstitutionExerciseIds ?? []),
        ]),
      ),
    ),
  );

  const create = () => {
    const result = addExercise({
      name,
      target,
      defaultWeight,
      defaultReps,
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setName("");
    setTarget("");
    setDefaultWeight(20);
    setDefaultReps(8);
    setError("");
  };

  return (
    <section className="surface-card space-y-4 p-4 sm:p-5">
      <div>
        <h2 className="text-base font-bold text-text">Custom exercises</h2>
        <p className="mt-1 text-sm leading-6 text-text-muted">
          Add movements that are missing from the built-in library. They become available
          in Program exercise and substitution pickers.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium text-text-secondary">
          Name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-1 min-h-11 w-full rounded-sm bg-surface-2 px-3 text-text outline-none focus:ring-2 focus:ring-signal-strong"
            placeholder="e.g. Cable press"
          />
        </label>
        <label className="text-sm font-medium text-text-secondary">
          Target
          <input
            value={target}
            onChange={(event) => setTarget(event.target.value)}
            className="mt-1 min-h-11 w-full rounded-sm bg-surface-2 px-3 text-text outline-none focus:ring-2 focus:ring-signal-strong"
            placeholder="e.g. Chest"
          />
        </label>
        <label className="text-sm font-medium text-text-secondary">
          Default load
          <input
            type="number"
            min="0"
            inputMode="decimal"
            value={defaultWeight}
            onChange={(event) =>
              setDefaultWeight(Math.max(0, Number(event.target.value) || 0))
            }
            className="metric mt-1 min-h-11 w-full rounded-sm bg-surface-2 px-3 text-text outline-none focus:ring-2 focus:ring-signal-strong"
          />
        </label>
        <label className="text-sm font-medium text-text-secondary">
          Default reps
          <input
            type="number"
            min="1"
            inputMode="numeric"
            value={defaultReps}
            onChange={(event) =>
              setDefaultReps(Math.max(1, Math.round(Number(event.target.value) || 1)))
            }
            className="metric mt-1 min-h-11 w-full rounded-sm bg-surface-2 px-3 text-text outline-none focus:ring-2 focus:ring-signal-strong"
          />
        </label>
      </div>

      {error ? (
        <p role="alert" className="text-xs text-negative">
          {error}
        </p>
      ) : null}

      <Button onClick={create} className="w-full sm:w-auto">
        <Plus className="h-4 w-4" aria-hidden="true" />
        Add exercise
      </Button>

      {exercises.length ? (
        <div className="space-y-2 border-t border-divider pt-4">
          {exercises.map((exercise) => {
            const inUse = usedExerciseIds.has(exercise.id);
            return (
              <div
                key={exercise.id}
                className="flex min-h-14 items-center justify-between gap-3 rounded-md bg-surface-2 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-text">
                    {exercise.name}
                  </p>
                  <p className="truncate text-xs text-text-muted">{exercise.target}</p>
                </div>
                <button
                  type="button"
                  disabled={inUse}
                  aria-label={
                    inUse
                      ? `${exercise.name} is used in a saved program`
                      : `Remove ${exercise.name}`
                  }
                  title={inUse ? "Remove it from saved programs first" : undefined}
                  onClick={() => removeExercise(exercise.id)}
                  className="flex min-h-11 min-w-11 items-center justify-center rounded-sm bg-surface-3 text-text-muted transition hover:text-negative disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
