import { Check, Minus, Plus } from "lucide-react";
import type { ExerciseLoadMode, ExerciseMetric } from "@/domain/prescriptions";
import type { SetEntry, Units } from "@/domain/types";
import { useLongPress } from "@/hooks/useLongPress";
import { loadabilityDelta } from "@/lib/loadability";

interface SetRowProps {
  set: SetEntry;
  selected: boolean;
  units: Units;
  loadMode: ExerciseLoadMode;
  loadDisplay: string;
  metric: ExerciseMetric;
  onSelect: () => void;
  onToggleComplete: () => void;
  onUpdate: <K extends keyof SetEntry>(field: K, value: SetEntry[K]) => void;
}

export function SetRow({
  set,
  selected,
  units,
  loadMode,
  loadDisplay,
  metric,
  onSelect,
  onToggleComplete,
  onUpdate,
}: SetRowProps) {
  const metricStep = metric === "reps" ? 1 : 5;
  const nudge = (field: "weight" | "reps", amount: number) => {
    onUpdate(field, Math.max(0, Number(set[field]) + amount));
  };

  const wDec = useLongPress(() => nudge("weight", -5));
  const wInc = useLongPress(() => nudge("weight", 5));
  const rDec = useLongPress(() => nudge("reps", -metricStep));
  const rInc = useLongPress(() => nudge("reps", metricStep));

  const delta = loadabilityDelta(set.weight, units);
  const showLoadControls = loadMode === "external";

  return (
    <div
      onClick={onSelect}
      className={`grid min-h-[64px] grid-cols-[1.45fr_1.2fr_64px] items-stretch border-b border-[#1a1a1a] transition ${
        selected ? "border-blue-600 bg-blue-950/20" : "bg-black"
      }`}
    >
      <div className="relative flex items-stretch border-r border-[#1a1a1a]">
        {showLoadControls ? (
          <>
            <button
              aria-label="Decrease weight"
              {...wDec}
              onClick={(e) => e.stopPropagation()}
              className="flex flex-1 items-center justify-center text-neutral-500 transition hover:bg-neutral-900 active:bg-blue-900/40 active:text-blue-400"
            >
              <Minus className="h-4 w-4" />
            </button>
            <input
              value={set.weight}
              onFocus={(e) => e.target.select()}
              onChange={(e) => onUpdate("weight", Number(e.target.value) || 0)}
              className="w-14 bg-black text-center font-mono text-sm font-bold text-neutral-200 outline-none focus:text-white"
            />
            <button
              aria-label="Increase weight"
              {...wInc}
              onClick={(e) => e.stopPropagation()}
              className="flex flex-1 items-center justify-center text-neutral-500 transition hover:bg-neutral-900 active:bg-blue-900/40 active:text-blue-400"
            >
              <Plus className="h-4 w-4" />
            </button>
            {delta > 0 && (
              <span className="pointer-events-none absolute bottom-0.5 right-1 font-mono text-[8px] text-neutral-700">
                ·{delta}
              </span>
            )}
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center px-2 font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-500">
            {loadDisplay}
          </div>
        )}
      </div>

      <div className="flex items-stretch border-r border-[#1a1a1a]">
        <button
          aria-label={`Decrease ${metric}`}
          {...rDec}
          onClick={(e) => e.stopPropagation()}
          className="flex flex-1 items-center justify-center text-neutral-500 transition hover:bg-neutral-900 active:bg-blue-900/40 active:text-blue-400"
        >
          <Minus className="h-4 w-4" />
        </button>
        <input
          value={set.reps}
          onFocus={(e) => e.target.select()}
          onChange={(e) => onUpdate("reps", Number(e.target.value) || 0)}
          className="w-10 bg-black text-center font-mono text-sm font-bold text-neutral-200 outline-none focus:text-white"
        />
        <button
          aria-label={`Increase ${metric}`}
          {...rInc}
          onClick={(e) => e.stopPropagation()}
          className="flex flex-1 items-center justify-center text-neutral-500 transition hover:bg-neutral-900 active:bg-blue-900/40 active:text-blue-400"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <button
        aria-label="Toggle set complete"
        aria-pressed={set.completed}
        onClick={(e) => {
          e.stopPropagation();
          onToggleComplete();
        }}
        className={`flex items-center justify-center transition ${
          set.completed
            ? "bg-emerald-600 text-white active:bg-emerald-700"
            : "bg-black text-neutral-600 hover:bg-neutral-950 active:bg-emerald-900/40 active:text-emerald-500"
        }`}
      >
        <Check
          className={`h-6 w-6 ${set.completed ? "stroke-[3px]" : "stroke-[1.5px]"}`}
        />
      </button>
    </div>
  );
}
