import { getExerciseById } from "@/domain/exercises";
import { getExerciseConflict } from "@/domain/injuries";
import type { ExerciseInjury } from "@/domain/types";

interface ExerciseTabsProps {
  exercises: string[];
  selectedIndex: number;
  injuries: ExerciseInjury[];
  onSelect: (index: number) => void;
}

export function ExerciseTabs({
  exercises,
  selectedIndex,
  injuries,
  onSelect,
}: ExerciseTabsProps) {
  const total = exercises.length;
  const current = total > 0 ? selectedIndex + 1 : 0;

  return (
    <div className="mb-5">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-500">
          Activities
        </span>
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-neutral-400">
          {current}/{total}
        </span>
      </div>
      <div
        className="flex overflow-x-auto border-b border-edge bg-black scrollbar-none"
        role="tablist"
      >
        {exercises.map((exerciseId, index) => {
          const exercise = getExerciseById(exerciseId);
          const conflict = getExerciseConflict(exerciseId, injuries);
          const isActive = selectedIndex === index;
          const status =
            conflict?.level === "avoid"
              ? "Avoid"
              : conflict?.level === "caution"
                ? "Caution"
                : exercise?.target;

          return (
            <button
              key={`${exerciseId}-${index}`}
              onClick={() => onSelect(index)}
              role="tab"
              aria-selected={isActive}
              className={`relative min-w-[150px] shrink-0 border-r border-edge px-5 py-3.5 text-left transition ${isActive ? "bg-blue-950/20" : "hover:bg-canvas"}`}
            >
              <span
                className={`block truncate font-mono text-xs font-bold uppercase tracking-tight ${isActive ? "text-blue-400" : "text-neutral-400"}`}
              >
                {exercise?.name}
              </span>
              <span
                className={`mt-1 block font-mono text-[10px] uppercase tracking-wider ${conflict?.level === "avoid" ? "font-bold text-red-500" : conflict?.level === "caution" ? "font-bold text-yellow-500" : isActive ? "text-blue-500/60" : "text-neutral-500"}`}
              >
                {status}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
