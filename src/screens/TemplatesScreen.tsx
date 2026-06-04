import { AlertTriangle, ChevronRight, Play } from "lucide-react";
import { TRAINING_TEMPLATES, getExerciseById } from "@/domain/exercises";
import { getExerciseConflict, getRunnableTemplate } from "@/domain/injuries";
import type { TabId } from "@/App";
import type { ExerciseConflict, TemplatePlan } from "@/domain/types";
import { useInjuryStore } from "@/state/useInjuryStore";
import { useWorkoutStore } from "@/state/useWorkoutStore";

interface TemplatesScreenProps {
  setActiveTab: (tab: TabId) => void;
}

export function TemplatesScreen({ setActiveTab }: TemplatesScreenProps) {
  const injuries = useInjuryStore((state) => state.injuries);
  const startTemplate = useWorkoutStore((state) => state.startTemplate);

  const start = (template: TemplatePlan) => {
    startTemplate(getRunnableTemplate(template, injuries));
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
      <div className="space-y-4">
        {TRAINING_TEMPLATES.map((template) => {
          const conflicts = template.exercises
            .map((id) => getExerciseConflict(id, injuries))
            .filter((conflict): conflict is ExerciseConflict =>
              Boolean(conflict),
            );
          const avoidCount = conflicts.filter(
            (conflict) => conflict.level === "avoid",
          ).length;
          const cautionCount = conflicts.filter(
            (conflict) => conflict.level === "caution",
          ).length;
          const runnable = getRunnableTemplate(template, injuries);

          return (
            <div
              key={template.id}
              className="space-y-4 border border-[#1a1a1a] bg-[#0c0c0c] p-5"
            >
              <div className="flex items-start justify-between gap-4 border-b border-[#1a1a1a] pb-4">
                <div>
                  <h2 className="font-mono text-sm font-bold uppercase tracking-tight text-neutral-200">
                    {template.name}
                  </h2>
                  <p className="mt-1 max-w-xl text-xs leading-relaxed text-neutral-500">
                    {template.notes}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  {template.isMinimumSession && (
                    <span className="border border-blue-900 bg-blue-950/30 px-2 py-1 font-mono text-[8px] font-bold uppercase text-blue-400">
                      Min
                    </span>
                  )}
                  {avoidCount > 0 && (
                    <span className="border border-red-900 bg-red-950/30 px-2 py-1 font-mono text-[8px] font-bold uppercase text-red-400">
                      {avoidCount} hidden
                    </span>
                  )}
                  {cautionCount > 0 && (
                    <span className="border border-yellow-900 bg-yellow-950/30 px-2 py-1 font-mono text-[8px] font-bold uppercase text-yellow-400">
                      {cautionCount} caution
                    </span>
                  )}
                </div>
              </div>
              {avoidCount > 0 && (
                <div className="flex gap-3 border border-red-950 bg-red-950/20 p-3 text-red-300">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p className="text-[11px] leading-relaxed text-red-300/80">
                    Active avoid filters removed conflicting lifts before this
                    plan can start.
                  </p>
                </div>
              )}
              <div className="divide-y divide-[#1a1a1a] border border-[#1a1a1a] bg-black">
                {runnable.exercises.map((exerciseId) => {
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
                      {conflict?.level === "caution" ? (
                        <span className="font-mono text-[8px] uppercase text-yellow-400">
                          Caution
                        </span>
                      ) : (
                        <ChevronRight className="h-4 w-4 text-neutral-700" />
                      )}
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => start(template)}
                disabled={runnable.exercises.length === 0}
                className="flex w-full items-center justify-center gap-2 bg-blue-600 py-3 font-mono text-xs font-bold uppercase tracking-widest text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-500"
              >
                <Play className="h-4 w-4" /> Start
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
