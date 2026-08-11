import { Award, Dumbbell } from "lucide-react";
import type {
  ExerciseBest,
  ProgressRecord,
} from "@/domain/progress/model";
import type { Units } from "@/domain/types";

interface RecordsProgressViewProps {
  bests: ExerciseBest[];
  records: ProgressRecord[];
  units: Units;
}

export function RecordsProgressView({
  bests,
  records,
  units,
}: RecordsProgressViewProps) {
  return (
    <div className="space-y-5">
      <section className="surface-card p-4 sm:p-5">
        <div>
          <h2 className="text-lg font-bold text-text">All-time exercise bests</h2>
          <p className="mt-1 text-sm text-text-muted">
            Current best estimates and completed top loads from your own history.
          </p>
        </div>
        {bests.length ? (
          <div className="mt-4 divide-y divide-divider">
            {bests.map((exercise) => (
              <div
                key={exercise.exerciseId}
                className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-text">
                    {exercise.exerciseName}
                  </p>
                  <p className="mt-0.5 text-xs text-text-muted">
                    latest {exercise.latestDate}
                  </p>
                </div>
                <div className="text-right">
                  <p className="metric text-sm font-bold text-text">
                    {exercise.bestE1rm == null
                      ? "—"
                      : `${exercise.bestE1rm.toFixed(1)} ${units}`}
                  </p>
                  <p className="text-[10px] text-text-muted">est. strength</p>
                </div>
                <div className="text-right">
                  <p className="metric text-sm font-bold text-text">
                    {exercise.bestLoad == null
                      ? "—"
                      : `${exercise.bestLoad.toFixed(0)} ${units}`}
                  </p>
                  <p className="text-[10px] text-text-muted">top load</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-text-muted">No completed exercise history yet.</p>
        )}
      </section>

      <section className="surface-card p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-positive" aria-hidden="true" />
          <h2 className="text-lg font-bold text-text">Record timeline</h2>
        </div>
        <p className="mt-1 text-sm text-text-muted">
          The first logged exposure establishes a baseline. Later all-time improvements are
          recorded here.
        </p>
        {records.length ? (
          <div className="mt-4 space-y-3">
            {records.map((record) => {
              const improvement = record.value - record.previousBest;
              return (
                <div
                  key={`${record.workoutId}-${record.exerciseId}-${record.type}`}
                  className="rounded-md bg-surface-2 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-text">
                        {record.exerciseName}
                      </p>
                      <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-text-muted">
                        <Dumbbell className="h-3.5 w-3.5" aria-hidden="true" />
                        {record.type === "e1rm" ? "Estimated strength" : "Top load"}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="metric text-base font-bold text-positive">
                        {record.value.toFixed(record.type === "e1rm" ? 1 : 0)} {units}
                      </p>
                      <p className="metric mt-0.5 text-xs text-text-muted">
                        +{improvement.toFixed(record.type === "e1rm" ? 1 : 0)}
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-text-muted">{record.date}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-4 text-sm text-text-muted">
            No post-baseline records yet.
          </p>
        )}
      </section>
    </div>
  );
}
