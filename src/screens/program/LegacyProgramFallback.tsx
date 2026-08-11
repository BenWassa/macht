import { ChevronDown } from "lucide-react";
import { TRAINING_TEMPLATES } from "@/domain/exercises";
import { getRunnableTemplate } from "@/domain/injuries";
import type { TabId } from "@/App";
import { useInjuryStore } from "@/state/useInjuryStore";
import { useWorkoutStore } from "@/state/useWorkoutStore";

interface LegacyProgramFallbackProps {
  setActiveTab: (tab: TabId) => void;
}

export function LegacyProgramFallback({
  setActiveTab,
}: LegacyProgramFallbackProps) {
  const injuries = useInjuryStore((state) => state.injuries);
  const workoutActive = useWorkoutStore((state) => state.workoutActive);
  const startTemplate = useWorkoutStore((state) => state.startTemplate);

  return (
    <details className="surface-card group overflow-hidden">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-4 text-sm font-semibold text-text-secondary sm:px-5">
        Legacy plans
        <ChevronDown
          className="h-4 w-4 transition group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="border-t border-divider p-3 sm:p-4">
        <p className="mb-3 text-xs leading-5 text-text-muted">
          Temporary fallback for existing local data. New adaptive programming uses the builder above.
        </p>
        <div className="space-y-2">
          {TRAINING_TEMPLATES.map((template) => {
            const runnable = getRunnableTemplate(template, injuries);
            return (
              <div
                key={template.id}
                className="flex items-center justify-between gap-3 rounded-md bg-surface-2 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-text">
                    {template.name}
                  </p>
                  <p className="mt-0.5 text-xs text-text-muted">
                    {runnable.exercises.length} exercises
                  </p>
                </div>
                <button
                  type="button"
                  disabled={workoutActive || runnable.exercises.length === 0}
                  onClick={() => {
                    startTemplate(runnable);
                    setActiveTab("workout");
                  }}
                  className="min-h-10 shrink-0 rounded-sm bg-surface-3 px-3 text-xs font-semibold text-text-secondary disabled:opacity-40"
                >
                  Start
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </details>
  );
}
