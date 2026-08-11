import { Check, Minus, Plus } from "lucide-react";
import type { SetPerformance } from "@/domain/execution/types";
import type { SetPerformancePatch } from "@/domain/execution/plannedWorkout";
import type { EffortScale } from "@/domain/training/types";
import type { Units } from "@/domain/types";

interface PlannedSetCardProps {
  set: SetPerformance;
  units: Units;
  effortScale: EffortScale;
  onUpdate: (patch: SetPerformancePatch) => void;
  onToggleComplete: () => void;
}

const effortValues: Record<EffortScale, number[]> = {
  RIR: [4, 3, 2.5, 2, 1.5, 1, 0.5, 0],
  RPE: [6, 7, 7.5, 8, 8.5, 9, 9.5, 10],
};

const targetText = (set: SetPerformance, units: Units) => {
  const target = set.prescription;
  if (!target) return "User-added set";
  const pieces: string[] = [];
  if (target.targetLoad != null) pieces.push(`${target.targetLoad} ${units}`);
  if (target.targetReps != null) pieces.push(`${target.targetReps} reps`);
  else if (target.repRange) pieces.push(`${target.repRange.min}–${target.repRange.max} reps`);
  if (target.targetEffort) {
    pieces.push(`${target.targetEffort.value} ${target.targetEffort.scale}`);
  }
  return pieces.join(" · ");
};

export function PlannedSetCard({
  set,
  units,
  effortScale,
  onUpdate,
  onToggleComplete,
}: PlannedSetCardProps) {
  const loadStep = units === "kgs" ? 1.25 : 2.5;
  const load = set.actualLoad ?? 0;
  const reps = set.actualReps ?? 0;
  const effort =
    set.actualEffort?.scale === effortScale ? set.actualEffort.value : undefined;

  return (
    <section className="surface-raised overflow-hidden">
      <div className="border-b border-divider px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-text">Set {set.index + 1}</span>
          <span className="text-xs text-text-muted">Target · {targetText(set, units)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px bg-divider">
        <div className="bg-surface-2 p-4">
          <label className="text-xs font-medium text-text-muted" htmlFor={`load-${set.id}`}>
            Load ({units})
          </label>
          <input
            id={`load-${set.id}`}
            inputMode="decimal"
            value={load}
            onFocus={(event) => event.currentTarget.select()}
            onChange={(event) =>
              onUpdate({ actualLoad: Math.max(0, Number(event.target.value) || 0) })
            }
            className="metric mt-1 w-full bg-transparent text-4xl font-bold text-text outline-none"
          />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              aria-label={`Decrease load by ${loadStep} ${units}`}
              onClick={() => onUpdate({ actualLoad: Math.max(0, load - loadStep) })}
              className="min-h-11 rounded-sm bg-surface-3 text-text-secondary transition active:translate-y-px"
            >
              <Minus className="mx-auto h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label={`Increase load by ${loadStep} ${units}`}
              onClick={() => onUpdate({ actualLoad: load + loadStep })}
              className="min-h-11 rounded-sm bg-surface-3 text-text-secondary transition active:translate-y-px"
            >
              <Plus className="mx-auto h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="bg-surface-2 p-4">
          <label className="text-xs font-medium text-text-muted" htmlFor={`reps-${set.id}`}>
            Reps
          </label>
          <input
            id={`reps-${set.id}`}
            inputMode="numeric"
            value={reps}
            onFocus={(event) => event.currentTarget.select()}
            onChange={(event) =>
              onUpdate({ actualReps: Math.max(0, Math.round(Number(event.target.value) || 0)) })
            }
            className="metric mt-1 w-full bg-transparent text-4xl font-bold text-text outline-none"
          />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              aria-label="Decrease reps"
              onClick={() => onUpdate({ actualReps: Math.max(0, reps - 1) })}
              className="min-h-11 rounded-sm bg-surface-3 text-text-secondary transition active:translate-y-px"
            >
              <Minus className="mx-auto h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Increase reps"
              onClick={() => onUpdate({ actualReps: reps + 1 })}
              className="min-h-11 rounded-sm bg-surface-3 text-text-secondary transition active:translate-y-px"
            >
              <Plus className="mx-auto h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-divider bg-surface-1 p-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-text-muted">Effort · {effortScale}</span>
          {set.prescription?.targetEffort ? (
            <span className="text-xs text-text-secondary">
              Target {set.prescription.targetEffort.value} {set.prescription.targetEffort.scale}
            </span>
          ) : null}
        </div>
        <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            aria-pressed={effort == null}
            onClick={() => onUpdate({ actualEffort: undefined })}
            className={`min-h-11 min-w-11 rounded-sm px-3 text-sm font-semibold transition ${
              effort == null
                ? "bg-surface-3 text-text"
                : "bg-inset text-text-muted"
            }`}
          >
            —
          </button>
          {effortValues[effortScale].map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={effort === value}
              onClick={() => onUpdate({ actualEffort: { scale: effortScale, value } })}
              className={`metric min-h-11 min-w-11 rounded-sm px-3 text-sm font-semibold transition ${
                effort === value
                  ? "bg-signal-soft text-signal-strong"
                  : "bg-inset text-text-secondary"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        aria-pressed={set.completed}
        onClick={onToggleComplete}
        className={`flex min-h-14 w-full items-center justify-center gap-2 border-t border-divider px-4 text-base font-bold transition active:translate-y-px ${
          set.completed
            ? "bg-positive-soft text-positive"
            : "bg-signal text-[var(--color-on-signal)]"
        }`}
      >
        <Check className="h-5 w-5" aria-hidden="true" />
        {set.completed ? "Set complete" : "Complete set"}
      </button>
    </section>
  );
}
