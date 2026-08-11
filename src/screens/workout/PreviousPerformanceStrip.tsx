import type { PreviousExerciseSummary } from "@/domain/execution/previousPerformance";
import type { Units } from "@/domain/types";

interface PreviousPerformanceStripProps {
  previous?: PreviousExerciseSummary;
  units: Units;
}

export function PreviousPerformanceStrip({
  previous,
  units,
}: PreviousPerformanceStripProps) {
  if (!previous) {
    return (
      <div className="rounded-md bg-surface-1 px-4 py-3 text-sm text-text-muted">
        No previous performance recorded for this exercise.
      </div>
    );
  }

  return (
    <div className="rounded-md bg-surface-1 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-text-muted">Previous</span>
        <span className="text-xs text-text-muted">{previous.date}</span>
      </div>
      <div className="scrollbar-none mt-2 flex gap-2 overflow-x-auto">
        {previous.sets.map((set, index) => (
          <div
            key={`${set.load}-${set.reps}-${index}`}
            className="min-w-fit rounded-sm bg-inset px-3 py-2 text-sm text-text-secondary"
          >
            <span className="metric font-semibold text-text">
              {set.load} {units} × {set.reps}
            </span>
            {set.effort ? (
              <span className="ml-2 text-xs text-text-muted">
                @ {set.effort.value}
                {set.effort.scale ? ` ${set.effort.scale}` : ""}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
