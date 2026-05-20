import { Check, Minus, Plus } from "lucide-react";
import type { SetEntry } from "@/domain/types";

interface SetRowProps {
  set: SetEntry;
  index: number;
  selected: boolean;
  effortLabel: string;
  onSelect: () => void;
  onToggleComplete: () => void;
  onUpdate: <K extends keyof SetEntry>(field: K, value: SetEntry[K]) => void;
}

export function SetRow({
  set,
  index,
  selected,
  effortLabel,
  onSelect,
  onToggleComplete,
  onUpdate,
}: SetRowProps) {
  const nudge = (field: "weight" | "reps", amount: number) => {
    const next = Math.max(0, Number(set[field]) + amount);
    onUpdate(field, next);
  };

  return (
    <div
      onClick={onSelect}
      className={`grid grid-cols-[40px_1.4fr_1.2fr_1fr_52px] items-stretch border-b border-[#1a1a1a] transition ${
        selected ? "border-blue-600 bg-blue-950/20" : "bg-black"
      }`}
    >
      <div className="flex items-center justify-center border-r border-[#1a1a1a] font-mono text-[11px] font-bold text-neutral-600">
        {index + 1}
      </div>

      <div className="flex items-stretch border-r border-[#1a1a1a]">
        <button
          aria-label="Decrease weight"
          onClick={(event) => {
            event.stopPropagation();
            nudge("weight", -5);
          }}
          className="flex flex-1 items-center justify-center text-neutral-500 transition hover:bg-neutral-900 active:bg-blue-900/40 active:text-blue-400"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <input
          value={set.weight}
          onFocus={(e) => e.target.select()}
          onChange={(event) =>
            onUpdate("weight", Number(event.target.value) || 0)
          }
          className="w-14 bg-black text-center font-mono text-sm font-bold text-neutral-200 outline-none focus:text-white"
        />
        <button
          aria-label="Increase weight"
          onClick={(event) => {
            event.stopPropagation();
            nudge("weight", 5);
          }}
          className="flex flex-1 items-center justify-center text-neutral-500 transition hover:bg-neutral-900 active:bg-blue-900/40 active:text-blue-400"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex items-stretch border-r border-[#1a1a1a]">
        <button
          aria-label="Decrease reps"
          onClick={(event) => {
            event.stopPropagation();
            nudge("reps", -1);
          }}
          className="flex flex-1 items-center justify-center text-neutral-500 transition hover:bg-neutral-900 active:bg-blue-900/40 active:text-blue-400"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <input
          value={set.reps}
          onFocus={(e) => e.target.select()}
          onChange={(event) =>
            onUpdate("reps", Number(event.target.value) || 0)
          }
          className="w-10 bg-black text-center font-mono text-sm font-bold text-neutral-200 outline-none focus:text-white"
        />
        <button
          aria-label="Increase reps"
          onClick={(event) => {
            event.stopPropagation();
            nudge("reps", 1);
          }}
          className="flex flex-1 items-center justify-center text-neutral-500 transition hover:bg-neutral-900 active:bg-blue-900/40 active:text-blue-400"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex items-center justify-center border-r border-[#1a1a1a]">
        <select
          value={set.rpe ?? ""}
          onChange={(event) =>
            onUpdate(
              "rpe",
              event.target.value ? Number(event.target.value) : null,
            )
          }
          className="h-full w-full bg-black text-center font-mono text-[10px] uppercase text-neutral-400 outline-none transition hover:bg-neutral-900 appearance-none"
        >
          <option value="">{effortLabel}</option>
          {[6, 7, 7.5, 8, 8.5, 9, 9.5, 10].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      <button
        aria-label="Toggle set complete"
        onClick={(event) => {
          event.stopPropagation();
          onToggleComplete();
        }}
        className={`flex items-center justify-center transition ${
          set.completed
            ? "bg-emerald-600 text-white"
            : "bg-black text-neutral-700 hover:bg-neutral-950 active:bg-emerald-900/40 active:text-emerald-500"
        }`}
      >
        <Check
          className={`h-5 w-5 ${set.completed ? "stroke-[3px]" : "stroke-[1px]"}`}
        />
      </button>
    </div>
  );
}
