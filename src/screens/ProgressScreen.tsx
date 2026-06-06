import { SparklineChart } from "@/components/SparklineChart";
import { deriveE1rmHistory } from "@/domain/e1rm";
import { PROGRESS_LIFTS, getExerciseById } from "@/domain/exercises";
import { getExerciseConflict } from "@/domain/injuries";
import { useHistoryStore } from "@/state/useHistoryStore";
import { useInjuryStore } from "@/state/useInjuryStore";
import { useSettingsStore } from "@/state/useSettingsStore";

export function ProgressScreen() {
  const sessions = useHistoryStore((state) => state.sessions);
  const injuries = useInjuryStore((state) => state.injuries);
  const units = useSettingsStore((state) => state.units);

  const liftData = PROGRESS_LIFTS.map((exerciseId) => {
    const history = deriveE1rmHistory(sessions, exerciseId);
    const values = history;
    return {
      exerciseId,
      exercise: getExerciseById(exerciseId),
      values,
      conflict: getExerciseConflict(exerciseId, injuries),
    };
  });

  if (sessions.length === 0) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div>
          <p className="mb-1 font-mono text-[9px] uppercase tracking-widest text-neutral-500">
            Progression
          </p>
          <h1 className="font-mono text-xl font-bold uppercase tracking-tight">
            Strength progress
          </h1>
        </div>
        <div className="border border-dashed border-[#1a1a1a] bg-black p-8 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-neutral-500">
            Log sessions to begin tracking progression.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <p className="mb-1 font-mono text-[9px] uppercase tracking-widest text-neutral-500">
          Progression
        </p>
        <h1 className="font-mono text-xl font-bold uppercase tracking-tight">
          Strength progress
        </h1>
      </div>
      <div className="space-y-6">
        {liftData.map(({ exerciseId, exercise, values, conflict }) => {
          const current = values[values.length - 1] ?? 0;
          const best = Math.max(...values, 0);
          const delta =
            values.length > 1
              ? current - values[Math.max(0, values.length - 6)]
              : 0;
          const paused = conflict?.level === "avoid";
          return (
            <div
              key={exerciseId}
              className="space-y-4 border border-[#1a1a1a] bg-[#0c0c0c] p-5"
            >
              <div className="flex flex-col justify-between gap-2 border-b border-[#1a1a1a] pb-3 sm:flex-row sm:items-center">
                <div>
                  <h3 className="font-mono text-sm font-bold uppercase tracking-tight text-neutral-200">
                    {exercise?.name}
                  </h3>
                  <p className="mt-0.5 font-mono text-[9px] uppercase text-neutral-500">
                    Estimated 1RM · Brzycki
                  </p>
                </div>
                <div className="flex space-x-6 text-right">
                  <div>
                    <span className="block font-mono text-[9px] uppercase text-neutral-500">
                      Current
                    </span>
                    <span className="font-mono text-sm font-bold text-neutral-200">
                      {current || "-"} {current ? units : ""}
                    </span>
                  </div>
                  <div>
                    <span className="block font-mono text-[9px] uppercase text-neutral-500">
                      Best
                    </span>
                    <span className="font-mono text-sm font-bold text-neutral-300">
                      {best || "-"} {best ? units : ""}
                    </span>
                  </div>
                  <div>
                    <span className="block font-mono text-[9px] uppercase text-neutral-500">
                      6-wk
                    </span>
                    <span
                      className={`block font-mono text-sm font-bold ${paused ? "text-neutral-500" : "text-emerald-400"}`}
                    >
                      {paused
                        ? "Paused"
                        : `${delta >= 0 ? "+" : ""}${delta} ${units}`}
                    </span>
                  </div>
                </div>
              </div>
              <div className="relative">
                {paused && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center border border-[#1a1a1a] bg-black/90 p-4 text-center">
                    <span className="border border-red-900 bg-red-950/40 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-red-400">
                      Tracking paused
                    </span>
                    <p className="mt-2 max-w-sm text-[11px] text-neutral-500">
                      {conflict?.injury} affects this lift.
                    </p>
                  </div>
                )}
                <SparklineChart
                  data={values.length ? values : [0, 0]}
                  paused={paused}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
