import { Plus } from "lucide-react";
import type { SetEntry } from "@/domain/types";

interface SetNavigatorProps {
  sets: SetEntry[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onAppendSet: () => void;
}

export function SetNavigator({
  sets,
  selectedIndex,
  onSelect,
  onAppendSet,
}: SetNavigatorProps) {
  return (
    <div className="mb-3 border border-[#1a1a1a] bg-black p-2">
      <div className="mb-2">
        <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-500">
          Sets
        </span>
      </div>
      <div className="scrollbar-none flex gap-1 overflow-x-auto">
        {sets.map((set, index) => {
          const selected = selectedIndex === index;
          const completed = set.completed;
          return (
            <button
              key={set.id}
              type="button"
              onClick={() => onSelect(index)}
              aria-pressed={selected}
              className={`min-w-12 border px-3 py-2 font-mono text-xs font-bold transition ${
                selected
                  ? completed
                    ? "border-blue-500 bg-emerald-600 text-white"
                    : "border-blue-600 bg-blue-950/30 text-white"
                  : completed
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-[#1a1a1a] bg-[#070707] text-neutral-500 hover:border-[#252525] hover:text-neutral-300"
              }`}
            >
              {index + 1}
            </button>
          );
        })}
        <button
          type="button"
          onClick={onAppendSet}
          aria-label="Repeat last set"
          className="flex min-w-12 items-center justify-center border border-dashed border-blue-800/70 bg-blue-950/20 px-3 py-2 text-blue-400 transition hover:border-blue-600 hover:bg-blue-950/40 hover:text-blue-300"
        >
          <Plus className="h-4 w-4 stroke-[2.5px]" />
        </button>
      </div>
    </div>
  );
}
