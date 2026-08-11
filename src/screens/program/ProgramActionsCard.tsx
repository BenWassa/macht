import { Play, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ProgramActionsCardProps {
  accumulationWeeks: number;
  includesDeload: boolean;
  workoutActive: boolean;
  onAccumulationWeeksChange: (weeks: number) => void;
  onIncludesDeloadChange: (enabled: boolean) => void;
  onSave: () => void;
  onStartCycle: () => void;
}

export function ProgramActionsCard({
  accumulationWeeks,
  includesDeload,
  workoutActive,
  onAccumulationWeeksChange,
  onIncludesDeloadChange,
  onSave,
  onStartCycle,
}: ProgramActionsCardProps) {
  return (
    <section className="surface-card space-y-4 p-4 sm:p-5">
      <div>
        <h2 className="text-lg font-bold text-text">Next cycle</h2>
        <p className="mt-1 text-sm leading-5 text-text-muted">
          Saving changes updates the reusable program definition. Starting a cycle freezes
          those settings into week-by-week prescriptions.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <span className="text-xs font-semibold text-text-muted">Build weeks</span>
          <div className="mt-2 grid grid-cols-4 gap-1 rounded-md bg-inset p-1">
            {[3, 4, 5, 6].map((weeks) => (
              <button
                key={weeks}
                type="button"
                aria-pressed={accumulationWeeks === weeks}
                onClick={() => onAccumulationWeeksChange(weeks)}
                className={`metric min-h-10 rounded-sm text-sm font-bold transition ${
                  accumulationWeeks === weeks
                    ? "bg-surface-3 text-text"
                    : "text-text-muted"
                }`}
              >
                {weeks}
              </button>
            ))}
          </div>
        </div>

        <label className="flex min-h-16 items-center justify-between gap-3 rounded-md bg-inset px-3">
          <span>
            <span className="block text-sm font-semibold text-text">Deload week</span>
            <span className="block text-xs text-text-muted">Easier final week</span>
          </span>
          <input
            type="checkbox"
            checked={includesDeload}
            onChange={(event) => onIncludesDeloadChange(event.target.checked)}
            className="h-5 w-5 accent-[var(--color-signal)]"
          />
        </label>
      </div>

      {workoutActive ? (
        <p className="text-xs leading-5 text-caution">
          Finish the active workout before starting a new cycle. Program edits can still be saved.
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" onClick={onSave}>
          <Save className="h-4 w-4" aria-hidden="true" />
          Save program
        </Button>
        <Button onClick={onStartCycle} disabled={workoutActive}>
          <Play className="h-4 w-4 fill-current" aria-hidden="true" />
          Start cycle
        </Button>
      </div>
    </section>
  );
}
