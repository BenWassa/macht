import { Trophy } from "lucide-react";
import { useMemo } from "react";
import { detectProgressRecords } from "@/domain/progress/exercises";
import { normalizeProgressHistory } from "@/domain/progress/normalize";
import { HabitTodayPanel } from "@/screens/habit/HabitTodayPanel";
import { useCustomExerciseStore } from "@/state/useCustomExerciseStore";
import { useExecutionHistoryStore } from "@/state/useExecutionHistoryStore";
import { useHistoryStore } from "@/state/useHistoryStore";

export function TodayInsights() {
  const legacySessions = useHistoryStore((state) => state.sessions);
  const v2Workouts = useExecutionHistoryStore((state) => state.workouts);
  const customExercises = useCustomExerciseStore((state) => state.exercises);

  const latestRecord = useMemo(() => {
    const history = normalizeProgressHistory(
      v2Workouts,
      legacySessions,
      customExercises,
    );
    return detectProgressRecords(history)[0];
  }, [customExercises, legacySessions, v2Workouts]);

  return (
    <div className="space-y-5">
      <HabitTodayPanel />

      {latestRecord ? (
        <section className="surface-card p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <Trophy
              className="mt-0.5 h-5 w-5 shrink-0 text-positive"
              aria-hidden="true"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text">
                Recent performance record
              </p>
              <p className="mt-1 truncate text-sm text-text-secondary">
                {latestRecord.exerciseName} ·{" "}
                {latestRecord.type === "e1rm"
                  ? "estimated strength"
                  : "top load"}
              </p>
              <p className="metric mt-1 text-xl font-bold text-positive">
                {latestRecord.value.toFixed(
                  latestRecord.type === "e1rm" ? 1 : 0,
                )}
              </p>
              <p className="mt-1 text-xs text-text-muted">
                {latestRecord.date}
              </p>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
