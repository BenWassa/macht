import { getExerciseById } from "@/domain/exercises";
import { suggestLoadsForExercises } from "@/domain/progression";
import type { LoadSuggestion } from "@/domain/progression";
import { useCustomExerciseStore } from "@/state/useCustomExerciseStore";
import { useHistoryStore } from "@/state/useHistoryStore";
import { useSettingsStore } from "@/state/useSettingsStore";

function DeltaChip({ suggestion }: { suggestion: LoadSuggestion }) {
  const { basis, deltaFromLast } = suggestion;
  if (basis === "add-rep") {
    return (
      <span className="font-mono text-[9px] font-bold text-emerald-400">
        ▲ +1 rep
      </span>
    );
  }
  if (deltaFromLast > 0) {
    return (
      <span className="font-mono text-[9px] font-bold text-emerald-400">
        ▲ +{deltaFromLast}
      </span>
    );
  }
  if (deltaFromLast < 0) {
    return (
      <span className="font-mono text-[9px] font-bold text-neutral-500">
        ▼ {deltaFromLast}
      </span>
    );
  }
  return <span className="font-mono text-[9px] text-neutral-600">=</span>;
}

export function NextWorkoutLoads({ exercises }: { exercises: string[] }) {
  const sessions = useHistoryStore((state) => state.sessions);
  const settings = useSettingsStore();
  const customExercises = useCustomExerciseStore((state) => state.exercises);

  const suggestions = suggestLoadsForExercises(
    exercises,
    sessions,
    settings,
    customExercises,
  );
  const rows = exercises.filter((id) => suggestions[id]);
  if (rows.length === 0) return null;

  const nameOf = (id: string) =>
    (getExerciseById(id) ?? customExercises.find((item) => item.id === id))
      ?.name ?? id;

  return (
    <div className="w-full border-t border-edge pt-4">
      <span className="mb-2 block font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-500">
        Suggested loads
      </span>
      <ul className="divide-y divide-edge border border-edge bg-black">
        {rows.map((id) => (
          <li
            key={id}
            className="flex items-baseline justify-between gap-3 px-3 py-2"
          >
            <span className="truncate font-mono text-[11px] uppercase text-neutral-300">
              {nameOf(id)}
            </span>
            <span className="flex shrink-0 items-baseline gap-2">
              <DeltaChip suggestion={suggestions[id]} />
              <span className="font-mono text-xs font-bold text-neutral-200">
                {suggestions[id].weight} {settings.units}
              </span>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[10px] leading-relaxed text-neutral-600">
        A guide, not gospel — go heavier if you feel strong, lighter if you feel
        beat up.
      </p>
    </div>
  );
}
