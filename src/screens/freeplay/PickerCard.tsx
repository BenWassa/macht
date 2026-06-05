import { Check } from "lucide-react";
import type { Exercise, ExerciseConflict } from "@/domain/types";

interface PickerItemProps {
  exercise: Exercise;
  conflict: ExerciseConflict | null;
  selected: boolean;
  locked: boolean;
  onToggle: (id: string) => void;
}

const conflictLabel = (conflict: ExerciseConflict | null) =>
  conflict ? (conflict.level === "avoid" ? "Avoid" : "Caution") : null;

const conflictColor = (conflict: ExerciseConflict) =>
  conflict.level === "avoid" ? "text-red-500" : "text-yellow-500";

function CheckBadge() {
  return (
    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600">
      <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
    </span>
  );
}

export function PickerCard({
  exercise,
  conflict,
  selected,
  locked,
  onToggle,
}: PickerItemProps) {
  return (
    <button
      type="button"
      onClick={() => !locked && onToggle(exercise.id)}
      disabled={locked}
      aria-pressed={selected}
      className={`relative flex h-24 w-28 shrink-0 flex-col justify-between border p-2.5 text-left transition ${
        selected
          ? "border-blue-700 bg-blue-950/30"
          : "border-edge bg-canvas hover:bg-[#141414]"
      } ${locked ? "cursor-not-allowed opacity-50" : ""}`}
    >
      {selected && (
        <span className="absolute right-1.5 top-1.5">
          <CheckBadge />
        </span>
      )}
      <span
        className={`line-clamp-3 pr-4 font-mono text-[11px] font-bold uppercase leading-tight tracking-tight ${
          selected ? "text-blue-300" : "text-neutral-300"
        }`}
      >
        {exercise.name}
      </span>
      {conflict ? (
        <span
          className={`font-mono text-[8px] font-bold uppercase tracking-widest ${conflictColor(conflict)}`}
        >
          {conflictLabel(conflict)}
        </span>
      ) : (
        <span className="truncate font-mono text-[9px] uppercase tracking-wider text-neutral-500">
          {exercise.target}
        </span>
      )}
    </button>
  );
}

export function PickerRow({
  exercise,
  conflict,
  selected,
  locked,
  onToggle,
}: PickerItemProps) {
  return (
    <button
      type="button"
      onClick={() => !locked && onToggle(exercise.id)}
      disabled={locked}
      aria-pressed={selected}
      className={`flex w-full items-center justify-between border-b border-edge p-3 text-left transition ${
        selected ? "bg-blue-950/20" : "hover:bg-canvas"
      } ${locked ? "cursor-not-allowed opacity-50" : ""}`}
    >
      <div className="min-w-0">
        <p
          className={`truncate font-mono text-xs font-bold uppercase ${
            selected ? "text-blue-300" : "text-neutral-300"
          }`}
        >
          {exercise.name}
        </p>
        <p className="mt-0.5 truncate text-[10px] text-neutral-500">
          {exercise.target}
        </p>
      </div>
      <div className="ml-3 flex shrink-0 items-center gap-2">
        {conflict && (
          <span
            className={`font-mono text-[8px] font-bold uppercase tracking-widest ${conflictColor(conflict)}`}
          >
            {conflictLabel(conflict)}
          </span>
        )}
        {selected && <CheckBadge />}
      </div>
    </button>
  );
}
