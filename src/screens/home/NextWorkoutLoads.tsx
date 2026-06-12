import {
  buildProgressionForecast,
  type ProgressionForecastTarget,
} from "@/domain/progressionForecast";
import { useCustomExerciseStore } from "@/state/useCustomExerciseStore";
import { useHistoryStore } from "@/state/useHistoryStore";
import { useSettingsStore } from "@/state/useSettingsStore";

const deltaTone = (target: ProgressionForecastTarget) => {
  if (target.state === "progress" || target.state === "add-rep") {
    return "text-emerald-400";
  }
  if (target.state === "deload" || target.state === "rust") {
    return "text-blue-300";
  }
  return "text-neutral-500";
};

export function NextWorkoutLoads({
  exercises,
  templateName,
  isNextSession,
}: {
  exercises: string[];
  templateName: string;
  isNextSession: boolean;
}) {
  const sessions = useHistoryStore((state) => state.sessions);
  const settings = useSettingsStore();
  const customExercises = useCustomExerciseStore((state) => state.exercises);

  const forecast = buildProgressionForecast(
    exercises,
    sessions,
    settings,
    customExercises,
  );
  if (!forecast.primaryTarget) return null;

  return (
    <div className="w-full border-t border-edge pt-5">
      <div className="mb-3">
        <span className="block font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-500">
          {isNextSession ? "Next session forecast" : "Next load forecast"}
        </span>
        {!isNextSession && (
          <span className="mt-1 block truncate font-mono text-[10px] text-neutral-600">
            Upcoming: {templateName}
          </span>
        )}
      </div>

      <div className="border-2 border-neutral-800 bg-black p-4">
        <div className="flex items-start justify-between gap-3 border-b border-edge pb-3">
          <div className="min-w-0">
            <span className="block font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-blue-400">
              Primary target
            </span>
            <span className="mt-1 block truncate font-mono text-xs font-bold uppercase text-neutral-200">
              {forecast.primaryTarget.exerciseName}
            </span>
          </div>
          <span className="shrink-0 border border-edge bg-neutral-950 px-2 py-1 font-mono text-[8px] font-bold uppercase tracking-widest text-neutral-500">
            {forecast.primaryTarget.state}
          </span>
        </div>

        <div className="py-5">
          <span
            className={`block font-mono text-4xl font-black uppercase tracking-tight ${deltaTone(
              forecast.primaryTarget,
            )}`}
          >
            {forecast.primaryTarget.delta}
          </span>
          <span className="mt-2 block font-mono text-sm font-bold text-neutral-300">
            {forecast.primaryTarget.target}
          </span>
        </div>

        <div className="border-t border-edge pt-3">
          <span className="block font-mono text-[10px] font-bold uppercase tracking-widest text-neutral-300">
            {forecast.primaryTarget.tactic}
          </span>
          <span className="mt-1 block font-mono text-[10px] leading-relaxed text-neutral-600">
            {forecast.primaryTarget.reason}
          </span>
        </div>
      </div>

      {forecast.subordinateTargets.length > 0 && (
        <div className="mt-3 border border-edge bg-[#050505]">
          <div className="border-b border-edge px-3 py-2">
            <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-neutral-500">
              Subordinate targets
            </span>
          </div>
          <ul className="divide-y divide-edge">
            {forecast.subordinateTargets.map((target) => (
              <li
                key={target.exerciseId}
                className="flex items-center justify-between gap-3 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <span className="block truncate font-mono text-[11px] font-bold uppercase text-neutral-300">
                    {target.exerciseName}
                  </span>
                  <span className="mt-0.5 block truncate font-mono text-[9px] uppercase tracking-wider text-neutral-600">
                    {target.tactic}
                  </span>
                </div>
                <div className="shrink-0 text-right">
                  <span
                    className={`block font-mono text-[11px] font-black uppercase ${deltaTone(
                      target,
                    )}`}
                  >
                    {target.delta}
                  </span>
                  <span className="mt-0.5 block font-mono text-[10px] text-neutral-500">
                    {target.target}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
