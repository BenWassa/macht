import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useCustomExerciseStore } from "@/state/useCustomExerciseStore";
import { useExecutionHistoryStore } from "@/state/useExecutionHistoryStore";
import { useHistoryStore } from "@/state/useHistoryStore";
import { useInjuryStore } from "@/state/useInjuryStore";
import { useProgramStore } from "@/state/useProgramStore";
import { useProgressionStore } from "@/state/useProgressionStore";
import { useSettingsStore } from "@/state/useSettingsStore";
import { useTrainingConstraintStore } from "@/state/useTrainingConstraintStore";
import { useWorkoutStore } from "@/state/useWorkoutStore";

type ConfirmStep = "idle" | "confirming";

export function DangerZone() {
  const clearLegacySessions = useHistoryStore((state) => state.clearSessions);
  const clearV2Workouts = useExecutionHistoryStore((state) => state.clearWorkouts);
  const hydrateProgramData = useProgramStore((state) => state.hydrateProgramData);
  const setActiveProgram = useProgramStore((state) => state.setActiveProgram);
  const hydrateDecisions = useProgressionStore((state) => state.hydrateDecisions);
  const hydrateConstraints = useTrainingConstraintStore(
    (state) => state.hydrateConstraints,
  );
  const hydrateCustomExercises = useCustomExerciseStore(
    (state) => state.hydrateExercises,
  );
  const hydrateSettings = useSettingsStore((state) => state.hydrateSettings);
  const clearAllInjuries = useInjuryStore((state) => state.clearAllInjuries);
  const endSession = useWorkoutStore((state) => state.endSession);
  const [step, setStep] = useState<ConfirmStep>("idle");

  function handleClearAll() {
    endSession();
    clearLegacySessions();
    clearV2Workouts();
    hydrateProgramData([], []);
    setActiveProgram(undefined);
    hydrateDecisions([]);
    hydrateConstraints([]);
    hydrateCustomExercises([]);
    clearAllInjuries();
    hydrateSettings({
      units: "lbs",
      defaultRest: 90,
      rpeMode: "RPE",
      haptics: true,
      audioCue: false,
    });
    setStep("idle");
  }

  return (
    <section className="surface-card overflow-hidden border border-negative/20">
      <div className="border-b border-negative/15 px-4 py-3 sm:px-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-negative">
          Danger zone
        </p>
      </div>
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <h2 className="text-sm font-bold text-text">Clear all local data</h2>
          <p className="mt-1 max-w-md text-xs leading-5 text-text-muted">
            Permanently remove workouts, legacy history, Programs, cycles, adaptive decisions,
            constraints, custom exercises, and legacy injury data from this device. Settings
            return to defaults.
          </p>
        </div>

        {step === "idle" ? (
          <button
            type="button"
            onClick={() => setStep("confirming")}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-negative-soft px-4 text-sm font-semibold text-negative transition hover:brightness-110"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Clear all
          </button>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-semibold text-negative">
              Confirm deletion
            </span>
            <button
              type="button"
              onClick={() => setStep("idle")}
              className="min-h-11 rounded-md bg-surface-2 px-4 text-sm font-semibold text-text-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="min-h-11 rounded-md bg-negative px-4 text-sm font-bold text-bg"
            >
              Delete everything
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
