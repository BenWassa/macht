import { Flame, Plus } from "lucide-react";

interface WorkoutActionsBarProps {
  isMinimumSession: boolean;
  onAddExercise: () => void;
  onStartWarmup: () => void;
  onToggleMinimum: () => void;
  onFinish: () => void;
}

export function WorkoutActionsBar({
  isMinimumSession,
  onAddExercise,
  onStartWarmup,
  onToggleMinimum,
  onFinish,
}: WorkoutActionsBarProps) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onAddExercise}
          className="flex items-center gap-1.5 border border-[#222] bg-black px-3 py-2 font-mono text-[9px] font-bold uppercase tracking-widest text-neutral-400 transition hover:text-neutral-200"
        >
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
        <button
          onClick={onStartWarmup}
          aria-label="Start warm-up timer"
          title="Warm-up timer"
          className="flex items-center border border-[#222] bg-black px-3 py-2 text-neutral-400 transition hover:text-orange-400"
        >
          <Flame className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMinimum}
          aria-pressed={isMinimumSession}
          className={`border px-3 py-2 font-mono text-[9px] font-bold uppercase tracking-widest transition ${
            isMinimumSession
              ? "border-blue-700 bg-blue-950 text-blue-300"
              : "border-[#222] bg-black text-neutral-500 hover:text-neutral-300"
          }`}
        >
          Min
        </button>
        <button
          onClick={onFinish}
          className="bg-emerald-600 px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-widest text-white transition hover:bg-emerald-700 active:bg-emerald-800"
        >
          Finish
        </button>
      </div>
    </div>
  );
}
