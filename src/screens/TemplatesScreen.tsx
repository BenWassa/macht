import { AlertTriangle, ChevronRight, Play } from "lucide-react";
import { DEFAULT_TEMPLATE, getExerciseById } from "@/domain/exercises";
import { getExerciseConflict } from "@/domain/injuries";
import type { TabId } from "@/App";
import { useInjuryStore } from "@/state/useInjuryStore";
import { useWorkoutStore } from "@/state/useWorkoutStore";

interface TemplatesScreenProps {
  setActiveTab: (tab: TabId) => void;
}

export function TemplatesScreen({ setActiveTab }: TemplatesScreenProps) {
  const injuries = useInjuryStore((state) => state.injuries);
  const startTemplate = useWorkoutStore((state) => state.startTemplate);
  const conflicts = DEFAULT_TEMPLATE.exercises
    .map((id) => getExerciseConflict(id, injuries))
    .filter(Boolean);

  const start = () => {
    startTemplate(DEFAULT_TEMPLATE);
    setActiveTab("workout");
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <p className="mb-1 font-mono text-[9px] uppercase tracking-widest text-neutral-500">
          Training plans
        </p>
        <h1 className="font-mono text-xl font-bold uppercase tracking-tight">
          Templates
        </h1>
      </div>
      <div className="space-y-4 border border-[#1a1a1a] bg-[#0c0c0c] p-5">
        <div className="flex items-start justify-between gap-4 border-b border-[#1a1a1a] pb-4">
          <div>
            <h2 className="font-mono text-sm font-bold uppercase tracking-tight text-neutral-200">
              {DEFAULT_TEMPLATE.name}
            </h2>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-neutral-500">
              {DEFAULT_TEMPLATE.notes}
            </p>
          </div>
          {conflicts.length > 0 && (
            <span className="border border-blue-900 bg-blue-950/30 px-2 py-1 font-mono text-[8px] font-bold uppercase text-blue-400">
              {conflicts.length} adapted
            </span>
          )}
        </div>
        {conflicts.length > 0 && (
          <div className="flex gap-3 border border-red-950 bg-red-950/20 p-3 text-red-300">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="text-[11px] leading-relaxed text-red-300/80">
              Active injury filters are applied to this plan. Conflicting lifts
              surface substitutes before you start.
            </p>
          </div>
        )}
        <div className="divide-y divide-[#1a1a1a] border border-[#1a1a1a] bg-black">
          {DEFAULT_TEMPLATE.exercises.map((exerciseId) => {
            const exercise = getExerciseById(exerciseId);
            const conflict = getExerciseConflict(exerciseId, injuries);
            return (
              <div
                key={exerciseId}
                className="flex items-center justify-between p-3"
              >
                <div>
                  <p className="font-mono text-xs font-bold uppercase text-neutral-300">
                    {exercise?.name}
                  </p>
                  <p className="mt-0.5 text-[10px] text-neutral-500">
                    {exercise?.target}
                  </p>
                </div>
                {conflict ? (
                  <span className="font-mono text-[8px] uppercase text-red-400">
                    Conflict
                  </span>
                ) : (
                  <ChevronRight className="h-4 w-4 text-neutral-700" />
                )}
              </div>
            );
          })}
        </div>
        <div className="flex gap-2">
          <button
            onClick={start}
            className="flex flex-1 items-center justify-center gap-2 bg-blue-600 py-3 font-mono text-xs font-bold uppercase tracking-widest text-white hover:bg-blue-700"
          >
            <Play className="h-4 w-4" /> Start
          </button>
          <button className="border border-[#222] px-5 py-3 font-mono text-xs font-bold uppercase tracking-widest text-neutral-400 hover:bg-neutral-900">
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}
