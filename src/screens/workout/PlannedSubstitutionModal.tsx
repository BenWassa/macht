import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { getAllExercises, getExerciseById } from "@/domain/exerciseLibrary";
import { useModalA11y } from "@/hooks/useModalA11y";
import { useCustomExerciseStore } from "@/state/useCustomExerciseStore";

interface PlannedSubstitutionModalProps {
  currentExerciseId: string;
  allowedExerciseIds?: string[];
  onSelect: (exerciseId: string) => void;
  onClose: () => void;
}

export function PlannedSubstitutionModal({
  currentExerciseId,
  allowedExerciseIds,
  onSelect,
  onClose,
}: PlannedSubstitutionModalProps) {
  const customExercises = useCustomExerciseStore((state) => state.exercises);
  const containerRef = useModalA11y<HTMLDivElement>(onClose);
  const [query, setQuery] = useState("");
  const current = getExerciseById(currentExerciseId, customExercises);
  const normalized = query.trim().toLowerCase();

  const candidates = useMemo(() => {
    const allowed = allowedExerciseIds?.length
      ? new Set(allowedExerciseIds)
      : null;
    const all = getAllExercises(customExercises).filter(
      (exercise) =>
        exercise.id !== currentExerciseId && (!allowed || allowed.has(exercise.id)),
    );
    const filtered = normalized
      ? all.filter(
          (exercise) =>
            exercise.name.toLowerCase().includes(normalized) ||
            exercise.target.toLowerCase().includes(normalized),
        )
      : all;
    return [...filtered].sort((a, b) => {
      const aSameTarget = current?.target && a.target === current.target ? 1 : 0;
      const bSameTarget = current?.target && b.target === current.target ? 1 : 0;
      if (aSameTarget !== bSameTarget) return bSameTarget - aSameTarget;
      return a.name.localeCompare(b.name);
    });
  }, [
    allowedExerciseIds,
    current?.target,
    currentExerciseId,
    customExercises,
    normalized,
  ]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-3 sm:items-center">
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="substitution-dialog-title"
        className="surface-raised flex max-h-[82vh] w-full max-w-md flex-col overflow-hidden"
      >
        <header className="flex items-start justify-between gap-4 border-b border-divider p-4">
          <div>
            <h3 id="substitution-dialog-title" className="text-lg font-bold text-text">
              Swap exercise
            </h3>
            <p className="mt-1 text-sm text-text-muted">
              Current · {current?.name ?? currentExerciseId}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close substitution picker"
            onClick={onClose}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-sm text-text-muted hover:bg-surface-3 hover:text-text"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        <div className="border-b border-divider p-4">
          <label className="relative block">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
              aria-hidden="true"
            />
            <span className="sr-only">Search replacement exercises</span>
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search exercises or muscles"
              className="min-h-11 w-full rounded-sm bg-inset pl-10 pr-3 text-sm text-text outline-none placeholder:text-text-muted focus:ring-2 focus:ring-signal-strong"
            />
          </label>
        </div>

        <div className="overflow-y-auto p-2">
          {candidates.length ? (
            candidates.map((exercise) => (
              <button
                key={exercise.id}
                type="button"
                onClick={() => {
                  onSelect(exercise.id);
                  onClose();
                }}
                className="flex min-h-14 w-full items-center justify-between gap-4 rounded-sm px-3 py-2 text-left transition hover:bg-surface-3"
              >
                <span className="font-semibold text-text">{exercise.name}</span>
                <span className="text-xs text-text-muted">{exercise.target}</span>
              </button>
            ))
          ) : (
            <p className="p-6 text-center text-sm text-text-muted">
              No allowed replacement matches this search.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
