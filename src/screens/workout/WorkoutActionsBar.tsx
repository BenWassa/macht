import { Flame, Lock, Plus } from "lucide-react";

interface WorkoutActionsBarProps {
  isMinimumSession: boolean;
  wakeLockActive: boolean;
  onAddExercise: () => void;
  onStartWarmup: () => void;
  onToggleMinimum: () => void;
  onToggleWakeLock: () => void;
  onFinish: () => void;
}

export function WorkoutActionsBar({
  isMinimumSession,
  wakeLockActive,
  onAddExercise,
  onStartWarmup,
  onToggleMinimum,
  onToggleWakeLock,
  onFinish,
}: WorkoutActionsBarProps) {
  return (
    <div className="mb-5 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={onAddExercise}
            className="flex items-center gap-1.5 border border-[#222] bg-black px-3 py-2 font-mono text-[9px] font-bold uppercase tracking-widest text-neutral-400 transition hover:text-neutral-200"
          >
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
          <button
            onClick={onStartWarmup}
            className="flex items-center gap-1.5 border border-[#222] bg-black px-3 py-2 font-mono text-[9px] font-bold uppercase tracking-widest text-neutral-400 transition hover:text-orange-400"
          >
            <Flame className="h-3.5 w-3.5" /> Warm up
          </button>
          <button
            onClick={onToggleWakeLock}
            aria-pressed={wakeLockActive}
            title={wakeLockActive ? "Screen lock on — tap to disable" : "Screen lock off — tap to keep screen on"}
            className={`flex items-center gap-1.5 border px-3 py-2 font-mono text-[9px] font-bold uppercase tracking-widest transition ${
              wakeLockActive
                ? "border-blue-900/60 bg-blue-950/20 text-blue-400 hover:text-blue-300"
                : "border-[#222] bg-black text-neutral-600 hover:text-neutral-400"
            }`}
          >
            <Lock className="h-3.5 w-3.5" />
            {wakeLockActive ? "Screen on" : "Lock"}
          </button>
        </div>
        <div className="flex items-center gap-2">
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
    </div>
  );
}
