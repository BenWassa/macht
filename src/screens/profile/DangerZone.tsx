import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useCustomExerciseStore } from "@/state/useCustomExerciseStore";
import { useExecutionHistoryStore } from "@/state/useExecutionHistoryStore";
import { useHistoryStore } from "@/state/useHistoryStore";
import { useInjuryStore } from "@/state/useInjuryStore";
import { useProgramStore } from "@/state/useProgramStore";
import { useProgressionStore } from "@/state/useProgressionStore";
import { useTrainingConstraintStore } from "@/state/useTrainingConstraintStore";
import { useWorkoutStore } from "@/state/useWorkoutStore";

type ConfirmStep = "idle" | "confirming";

export function DangerZone() {
  const workoutActive = useWorkoutStore((state) => state.workoutActive);
  const [step, setStep] = useState<ConfirmStep>("idle");

  const clearTrainingData = () => {
    if (workoutActive) return;
    useProgramStore.getState().hydrateProgramData([], []);
    useProgramStore.getState().setActiveProgram(undefined);
    useExecutionHistoryStore.getState().hydrateWorkouts([]);
    useProgressionStore.getState().hydrateDecisions([]);
    useTrainingConstraintStore.getState().hydrateConstraints([]);
    useCustomExerciseStore.getState().hydrateExercises([]);
    useHistoryStore.getState().hydrateHistory([]);
    useInjuryStore.getState().hydrateInjuries([]);
    setStep("idle");
  };

  return (
    <section className="rounded-md bg-negative-soft p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-md">
          <h2 className="text-sm font-bold text-negative">Clear training data</h2>
          <p className="mt-1 text-xs leading-5 text-text-secondary">
            Permanently removes saved programs, cycles, completed workouts, adaptive
            decisions, constraints, custom exercises, and retained legacy training history.
            App settings are kept.
          </p>
          {workoutActive ? (
            <p className="mt-2 text-xs font-semibold text-caution">
              Finish the active session before clearing local training data.
            </p>
          ) : null}
        </div>

        {step === "idle" ? (
          <Button
            variant="destructive"
            disabled={workoutActive}
            onClick={() => setStep("confirming")}
          >
            Clear data
          </Button>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-negative">
              Delete all training data?
            </span>
            <Button variant="secondary" onClick={() => setStep("idle")}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={clearTrainingData}>
              Yes, delete
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
