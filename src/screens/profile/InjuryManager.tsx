import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useInjuryStore } from "@/state/useInjuryStore";
import type { ExerciseInjury } from "@/domain/types";

interface InjuryManagerProps {
  onEdit: (injury: ExerciseInjury) => void;
  onAdd: () => void;
}

export function InjuryManager({ onEdit, onAdd }: InjuryManagerProps) {
  const injuries = useInjuryStore((state) => state.injuries);
  const removeInjury = useInjuryStore((state) => state.removeInjury);
  const clearInjury = useInjuryStore((state) => state.clearInjury);
  const [showPast, setShowPast] = useState(false);

  const active = injuries.filter((injury) => !injury.clearedDate);
  const past = injuries.filter((injury) => injury.clearedDate);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-2">
        <h2 className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
          Active injuries
        </h2>
        <button
          onClick={onAdd}
          className="border border-blue-900/40 bg-blue-950/15 px-2 py-1 font-mono text-[9px] text-blue-400 hover:text-blue-300"
        >
          + Log injury
        </button>
      </div>
      <div className="space-y-3">
        {active.map((injury) => (
          <div
            key={injury.id}
            className="flex items-start justify-between border border-[#1a1a1a] bg-[#0c0c0c] p-4"
          >
            <button
              onClick={() => onEdit(injury)}
              className="space-y-2 text-left"
            >
              <div className="flex items-center space-x-2">
                <span
                  className={`border px-1.5 font-mono text-[8px] font-bold uppercase ${injury.severity === "avoid" ? "border-red-900 bg-red-950 text-red-400" : "border-yellow-900 bg-yellow-950 text-yellow-500"}`}
                >
                  {injury.severity === "avoid" ? "Avoid" : "Caution"}
                </span>
                <h3 className="font-mono text-xs font-bold uppercase tracking-tight text-neutral-200">
                  {injury.name}
                </h3>
              </div>
              <p className="text-xs leading-relaxed text-neutral-500">
                {injury.notes}
              </p>
              <div className="flex flex-wrap gap-1 pt-1">
                {injury.forbiddenTags.map((tag) => (
                  <span
                    key={tag}
                    className="border border-[#1a1a1a] bg-black px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider text-neutral-400"
                  >
                    {tag.replace(/_/g, " ")}
                  </span>
                ))}
                {(injury.cautionTags ?? []).map((tag) => (
                  <span
                    key={tag}
                    className="border border-yellow-950 bg-yellow-950/20 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider text-yellow-500"
                  >
                    {tag.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => clearInjury(injury.id)}
                className="font-mono text-[9px] uppercase text-emerald-400"
              >
                Clear
              </button>
              <button
                onClick={() => removeInjury(injury.id)}
                className="p-1 text-neutral-500 hover:text-red-400"
                aria-label="Delete injury"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {active.length === 0 && (
          <div className="border border-dashed border-[#1a1a1a] bg-black p-6 text-center">
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">
              No injuries logged
            </span>
          </div>
        )}
      </div>
      {past.length > 0 && (
        <div className="space-y-2">
          <button
            onClick={() => setShowPast(!showPast)}
            className="font-mono text-[10px] uppercase tracking-widest text-neutral-500"
          >
            Past injuries ({past.length})
          </button>
          {showPast &&
            past.map((injury) => (
              <div
                key={injury.id}
                className="border border-[#1a1a1a] bg-black p-3 font-mono text-[10px] text-neutral-500"
              >
                {injury.name} / cleared {injury.clearedDate}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
