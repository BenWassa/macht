import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { effectiveTrainingConstraints } from "@/domain/constraints/effective";
import type {
  TrainingConstraint,
  TrainingConstraintLevel,
} from "@/domain/constraints/types";
import { getAllExercises } from "@/domain/exerciseLibrary";
import { useCustomExerciseStore } from "@/state/useCustomExerciseStore";
import { useInjuryStore } from "@/state/useInjuryStore";
import { useTrainingConstraintStore } from "@/state/useTrainingConstraintStore";

interface DraftConstraint {
  label: string;
  level: TrainingConstraintLevel;
  exerciseIds: string[];
  expiresOn: string;
  notes: string;
}

const emptyDraft = (): DraftConstraint => ({
  label: "",
  level: "caution",
  exerciseIds: [],
  expiresOn: "",
  notes: "",
});

const levelCopy: Record<TrainingConstraintLevel, string> = {
  avoid: "Avoid",
  caution: "Caution",
};

export function TrainingConstraintsManager() {
  const legacyInjuries = useInjuryStore((state) => state.injuries);
  const constraints = useTrainingConstraintStore((state) => state.constraints);
  const addConstraint = useTrainingConstraintStore((state) => state.addConstraint);
  const removeConstraint = useTrainingConstraintStore((state) => state.removeConstraint);
  const setConstraintActive = useTrainingConstraintStore(
    (state) => state.setConstraintActive,
  );
  const customExercises = useCustomExerciseStore((state) => state.exercises);
  const exercises = useMemo(
    () =>
      getAllExercises(customExercises).sort((a, b) => a.name.localeCompare(b.name)),
    [customExercises],
  );
  const effective = useMemo(
    () => effectiveTrainingConstraints(constraints, legacyInjuries),
    [constraints, legacyInjuries],
  );
  const [draft, setDraft] = useState<DraftConstraint>(emptyDraft);
  const [showForm, setShowForm] = useState(false);

  const save = () => {
    const label = draft.label.trim();
    if (!label) return;
    const constraint: TrainingConstraint = {
      id: crypto.randomUUID(),
      label,
      level: draft.level,
      source: "user",
      createdAt: new Date().toISOString(),
      active: true,
      exerciseIds: [...draft.exerciseIds],
      blockedTags: [],
      cautionTags: [],
      notes: draft.notes.trim() || undefined,
      expiresOn: draft.expiresOn || undefined,
    };
    addConstraint(constraint);
    setDraft(emptyDraft());
    setShowForm(false);
  };

  return (
    <section className="surface-card overflow-hidden">
      <div className="flex items-start justify-between gap-3 p-4 sm:p-5">
        <div>
          <h2 className="text-lg font-bold text-text">Training constraints</h2>
          <p className="mt-1 text-sm leading-5 text-text-muted">
            Optional temporary limits or movement preferences used to flag planned
            exercises and suggest alternatives.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => setShowForm((value) => !value)}
          className="shrink-0"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add
        </Button>
      </div>

      {showForm ? (
        <div className="space-y-4 border-t border-divider bg-surface-2 p-4 sm:p-5">
          <label className="block">
            <span className="text-xs font-semibold text-text-muted">Label</span>
            <input
              value={draft.label}
              onChange={(event) =>
                setDraft((current) => ({ ...current, label: event.target.value }))
              }
              placeholder="e.g. Avoid overhead pressing this week"
              className="mt-2 min-h-11 w-full rounded-sm bg-inset px-3 text-sm text-text outline-none placeholder:text-text-muted focus:ring-2 focus:ring-signal-strong"
            />
          </label>

          <fieldset>
            <legend className="text-xs font-semibold text-text-muted">Level</legend>
            <div className="mt-2 grid grid-cols-2 gap-1 rounded-md bg-inset p-1">
              {(["caution", "avoid"] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  aria-pressed={draft.level === level}
                  onClick={() =>
                    setDraft((current) => ({ ...current, level }))
                  }
                  className={`min-h-10 rounded-sm text-sm font-semibold transition ${
                    draft.level === level
                      ? level === "avoid"
                        ? "bg-negative-soft text-negative"
                        : "bg-caution-soft text-caution"
                      : "text-text-muted"
                  }`}
                >
                  {levelCopy[level]}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="block">
            <span className="text-xs font-semibold text-text-muted">
              Specific exercises · optional
            </span>
            <select
              multiple
              value={draft.exerciseIds}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  exerciseIds: Array.from(event.target.selectedOptions).map(
                    (option) => option.value,
                  ),
                }))
              }
              className="mt-2 h-36 w-full rounded-sm bg-inset p-2 text-sm text-text outline-none focus:ring-2 focus:ring-signal-strong"
            >
              {exercises.map((exercise) => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-text-muted">
              Leave empty if this is only a note. Imported legacy rules may still use
              movement categories internally.
            </p>
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold text-text-muted">
                End date · optional
              </span>
              <input
                type="date"
                value={draft.expiresOn}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    expiresOn: event.target.value,
                  }))
                }
                className="mt-2 min-h-11 w-full rounded-sm bg-inset px-3 text-sm text-text outline-none focus:ring-2 focus:ring-signal-strong"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-text-muted">Notes</span>
              <input
                value={draft.notes}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, notes: event.target.value }))
                }
                placeholder="Optional context"
                className="mt-2 min-h-11 w-full rounded-sm bg-inset px-3 text-sm text-text outline-none placeholder:text-text-muted focus:ring-2 focus:ring-signal-strong"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setDraft(emptyDraft());
                setShowForm(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={save} disabled={!draft.label.trim()}>
              Save constraint
            </Button>
          </div>
        </div>
      ) : null}

      <div className="border-t border-divider">
        {effective.length ? (
          effective.map((constraint) => {
            const imported = constraint.source === "legacy_injury";
            const exerciseNames = constraint.exerciseIds
              .map((id) => exercises.find((exercise) => exercise.id === id)?.name)
              .filter((name): name is string => Boolean(name));
            return (
              <details key={constraint.id} className="group border-b border-divider last:border-0">
                <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-4 sm:px-5">
                  <span
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                      !constraint.active
                        ? "bg-text-disabled"
                        : constraint.level === "avoid"
                          ? "bg-negative"
                          : "bg-caution"
                    }`}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-text">
                      {constraint.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-text-muted">
                      {constraint.active ? levelCopy[constraint.level] : "Inactive"}
                      {imported ? " · Imported legacy rule" : ""}
                      {constraint.expiresOn ? ` · through ${constraint.expiresOn}` : ""}
                    </span>
                  </span>
                  <ChevronDown
                    className="h-4 w-4 shrink-0 text-text-muted transition group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <div className="space-y-3 bg-surface-2 px-4 pb-4 pt-1 sm:px-5">
                  {exerciseNames.length ? (
                    <p className="text-xs leading-5 text-text-secondary">
                      Exercises: {exerciseNames.join(", ")}
                    </p>
                  ) : null}
                  {constraint.notes ? (
                    <p className="text-xs leading-5 text-text-muted">
                      {constraint.notes}
                    </p>
                  ) : null}
                  {imported &&
                  (constraint.blockedTags.length || constraint.cautionTags.length) ? (
                    <p className="text-xs leading-5 text-text-muted">
                      This imported record keeps its existing movement-category rules for
                      compatibility. New constraints can be managed with specific exercises.
                    </p>
                  ) : null}
                  {!imported ? (
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        onClick={() =>
                          setConstraintActive(constraint.id, !constraint.active)
                        }
                        className="flex-1"
                      >
                        {constraint.active ? "Disable" : "Enable"}
                      </Button>
                      <button
                        type="button"
                        aria-label={`Delete ${constraint.label}`}
                        onClick={() => removeConstraint(constraint.id)}
                        className="flex min-h-11 min-w-11 items-center justify-center rounded-md bg-negative-soft text-negative"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  ) : null}
                </div>
              </details>
            );
          })
        ) : (
          <p className="px-4 py-5 text-sm text-text-muted sm:px-5">
            No active training constraints.
          </p>
        )}
      </div>
    </section>
  );
}
