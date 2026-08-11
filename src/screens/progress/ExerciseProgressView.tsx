import { useMemo, useState } from "react";
import { buildExerciseTrend } from "@/domain/progress/exercises";
import type {
  ExerciseBest,
  ProgressWorkout,
} from "@/domain/progress/model";
import type { ExerciseResponseHistory } from "@/domain/progress/responses";
import type { Units } from "@/domain/types";
import { TrendChart } from "./TrendChart";

interface ExerciseProgressViewProps {
  workouts: ProgressWorkout[];
  exercises: ExerciseBest[];
  responses: ExerciseResponseHistory[];
  units: Units;
}

type Metric = "e1rm" | "load";

const responseLabel = (decision: string) =>
  decision.replace(/_/g, " ").replace(/^./, (letter) => letter.toUpperCase());

export function ExerciseProgressView({
  workouts,
  exercises,
  responses,
  units,
}: ExerciseProgressViewProps) {
  const [selectedId, setSelectedId] = useState(exercises[0]?.exerciseId ?? "");
  const [metric, setMetric] = useState<Metric>("e1rm");
  const selected =
    exercises.find((exercise) => exercise.exerciseId === selectedId) ?? exercises[0];
  const trend = useMemo(
    () => (selected ? buildExerciseTrend(workouts, selected.exerciseId) : []),
    [selected, workouts],
  );
  const response = responses.find(
    (item) => item.exerciseId === selected?.exerciseId,
  );
  const chartPoints = trend.flatMap((point) => {
    const value = metric === "e1rm" ? point.e1rm : point.maxLoad;
    return value == null ? [] : [{ date: point.date, value }];
  });
  const latest = trend[trend.length - 1];
  const previous = trend[trend.length - 2];

  if (!selected) {
    return (
      <div className="surface-card p-6 text-center text-sm text-text-muted">
        Complete an exercise to begin its performance history.
      </div>
    );
  }

  const latestValue = metric === "e1rm" ? latest?.e1rm : latest?.maxLoad;
  const previousValue = metric === "e1rm" ? previous?.e1rm : previous?.maxLoad;
  const delta =
    latestValue != null && previousValue != null
      ? latestValue - previousValue
      : undefined;

  return (
    <div className="space-y-5">
      <section className="surface-card p-4 sm:p-5">
        <label className="block">
          <span className="text-xs font-semibold text-text-muted">Exercise</span>
          <select
            value={selected.exerciseId}
            onChange={(event) => setSelectedId(event.target.value)}
            className="mt-2 min-h-11 w-full rounded-sm bg-inset px-3 text-base font-semibold text-text outline-none focus:ring-2 focus:ring-signal-strong"
          >
            {exercises.map((exercise) => (
              <option key={exercise.exerciseId} value={exercise.exerciseId}>
                {exercise.exerciseName}
              </option>
            ))}
          </select>
        </label>

        <div className="mt-5 flex gap-1 rounded-md bg-inset p-1">
          {([
            ["e1rm", "Estimated strength"],
            ["load", "Top load"],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={metric === id}
              onClick={() => setMetric(id)}
              className={`min-h-10 flex-1 rounded-sm px-3 text-sm font-semibold transition ${
                metric === id
                  ? "bg-surface-3 text-text shadow-card"
                  : "text-text-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-md bg-surface-2 p-3">
            <p className="text-xs text-text-muted">Latest</p>
            <p className="metric mt-1 text-xl font-bold text-text">
              {latestValue == null ? "—" : latestValue.toFixed(metric === "e1rm" ? 1 : 0)}
              {latestValue == null ? "" : ` ${units}`}
            </p>
          </div>
          <div className="rounded-md bg-surface-2 p-3">
            <p className="text-xs text-text-muted">Change</p>
            <p
              className={`metric mt-1 text-xl font-bold ${
                delta != null && delta > 0 ? "text-positive" : "text-text"
              }`}
            >
              {delta == null
                ? "—"
                : `${delta > 0 ? "+" : ""}${delta.toFixed(metric === "e1rm" ? 1 : 0)}`}
            </p>
          </div>
          <div className="rounded-md bg-surface-2 p-3">
            <p className="text-xs text-text-muted">Exposures</p>
            <p className="metric mt-1 text-xl font-bold text-text">{trend.length}</p>
          </div>
        </div>

        <div className="mt-4">
          <TrendChart
            points={chartPoints}
            label={`${selected.exerciseName} ${metric === "e1rm" ? "estimated strength" : "top load"}`}
            unit={` ${units}`}
            series={metric === "e1rm" ? "performance" : "load"}
          />
        </div>
      </section>

      <section className="surface-card p-4 sm:p-5">
        <h2 className="text-lg font-bold text-text">Programming response</h2>
        <p className="mt-1 text-sm text-text-muted">
          Recent changes the adaptive engine made after this exercise.
        </p>
        {response?.events.length ? (
          <div className="mt-4 space-y-3">
            {response.events.slice(0, 6).map((event) => (
              <div key={event.id} className="rounded-md bg-surface-2 p-3">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-semibold text-text">{event.summary}</span>
                  <span className="text-xs text-text-muted">{event.date}</span>
                </div>
                <p className="mt-1 text-xs font-medium text-info">
                  {responseLabel(event.decision)}
                </p>
                <p className="mt-1 text-xs leading-5 text-text-muted">
                  {event.reasons[0] ?? "Decision recorded from completed performance."}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-text-muted">
            No adaptive decisions recorded for this exercise yet.
          </p>
        )}
      </section>
    </div>
  );
}
