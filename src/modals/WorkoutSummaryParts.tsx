import { Check } from "lucide-react";
import type { Units } from "@/domain/types";

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[#1a1a1a] bg-black p-2.5">
      <span className="block font-mono text-[9px] uppercase tracking-widest text-neutral-500">
        {label}
      </span>
      <span className="mt-0.5 block font-mono text-xs font-bold text-neutral-200">
        {value}
      </span>
    </div>
  );
}

interface SetLineProps {
  index: number;
  weight: number;
  reps: number;
  completed: boolean;
  units: Units;
  suffix: string;
  editing: boolean;
  onChange: (
    field: "weight" | "reps" | "completed",
    value: number | boolean,
  ) => void;
}

export function SetLine({
  index,
  weight,
  reps,
  completed,
  units,
  suffix,
  editing,
  onChange,
}: SetLineProps) {
  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <span className="w-10 shrink-0 font-mono text-[9px] uppercase tracking-widest text-neutral-500">
          Set {index + 1}
        </span>
        <input
          type="number"
          inputMode="numeric"
          value={weight}
          onChange={(event) => onChange("weight", Number(event.target.value))}
          aria-label={`Set ${index + 1} weight`}
          className="w-16 border border-[#222] bg-black px-2 py-1 text-center font-mono text-xs text-neutral-200 outline-none focus:border-blue-700"
        />
        <span className="font-mono text-[10px] text-neutral-600">×</span>
        <input
          type="number"
          inputMode="numeric"
          value={reps}
          onChange={(event) => onChange("reps", Number(event.target.value))}
          aria-label={`Set ${index + 1} reps`}
          className="w-16 border border-[#222] bg-black px-2 py-1 text-center font-mono text-xs text-neutral-200 outline-none focus:border-blue-700"
        />
        <button
          type="button"
          onClick={() => onChange("completed", !completed)}
          aria-pressed={completed}
          aria-label={`Set ${index + 1} completed`}
          className={`ml-auto flex h-7 w-7 items-center justify-center border transition ${
            completed
              ? "border-emerald-700 bg-emerald-950/40 text-emerald-400"
              : "border-[#222] bg-black text-neutral-600"
          }`}
        >
          <Check className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-between font-mono text-xs ${
        completed ? "text-neutral-200" : "text-neutral-600 line-through"
      }`}
    >
      <span className="text-[9px] uppercase tracking-widest text-neutral-500">
        Set {index + 1}
      </span>
      <span>
        {weight > 0 ? `${weight} ${units} × ` : ""}
        {reps}
        {suffix}
      </span>
    </div>
  );
}
