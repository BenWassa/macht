import { AlertTriangle, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { effectiveTrainingConstraints } from "@/domain/constraints/effective";
import { evaluateExerciseConstraints } from "@/domain/constraints/evaluate";
import { getExerciseById } from "@/domain/exerciseLibrary";
import { useWakeLock } from "@/hooks/useWakeLock";
import { useWorkoutMediaSession } from "@/hooks/useWorkoutMediaSession";
import { PlannedWorkoutExecution } from "@/screens/workout/PlannedWorkoutExecution";
import { useCustomExerciseStore } from "@/state/useCustomExerciseStore";
import { useInjuryStore } from "@/state/useInjuryStore";
import { useTrainingConstraintStore } from "@/state/useTrainingConstraintStore";
import { useWorkoutStore } from "@/state/useWorkoutStore";

interface WorkoutScreenProps {
  onFinish: () => void;
  onSetCompleted: (options: {
    advanceAfterRest: boolean;
    restSeconds?: number;
  }) => void;
  onStartWarmup: () => void;
}

export function WorkoutScreen({
  onFinish,
  onSetCompleted,
  onStartWarmup,
}: WorkoutScreenProps) {
  const workout = useWorkoutStore();
  const userConstraints = useTrainingConstraintStore((state) => state.constraints);
  const legacyInjuries = useInjuryStore((state) => state.injuries);
  const customExercises = useCustomExerciseStore((state) => state.exercises);
  const [wakeLockEnabled, setWakeLockEnabled] = useState(true);

  useWakeLock(workout.workoutActive && wakeLockEnabled);
  useWorkoutMediaSession(workout.workoutActive ? workout.workoutName : "");

  if (!workout.workoutActive) {
    return (
      <div className="animate-rise-in space-y-5">
        <header>
          <p className="text-sm font-medium text-text-muted">Session</p>
          <h1 className="mt-1 text-3xl font-bold tracking-[-0.04em] text-text">
            No workout active
          </h1>
        </header>
        <div className="surface-card p-6 text-sm text-text-muted">
          Start the next planned workout from Today.
        </div>
      </div>
    );
  }

  const session = workout.activeV2Workout;
  if (!session) {
    return (
      <div className="surface-card p-6 text-sm leading-6 text-text-secondary" role="status">
        This saved session is being upgraded to the current workout format. Reload the app
        once; the persisted session data will remain on this device.
      </div>
    );
  }

  const currentPerformance = session.exercisePerformances[workout.selectedExIndex];
  const exercise = currentPerformance
    ? getExerciseById(currentPerformance.exerciseId, customExercises)
    : undefined;
  const constraints = effectiveTrainingConstraints(
    userConstraints,
    legacyInjuries,
  );
  const constraintResult = exercise
    ? evaluateExerciseConstraints(
        exercise,
        constraints,
        new Date().toISOString().slice(0, 10),
      )
    : undefined;

  return (
    <div className="space-y-4">
      {constraintResult && constraintResult.level !== "clear" ? (
        <section
          className={`rounded-lg p-4 ${
            constraintResult.level === "avoid"
              ? "bg-negative-soft"
              : "bg-caution-soft"
          }`}
          role="status"
        >
          <div className="flex items-start gap-3">
            {constraintResult.level === "avoid" ? (
              <ShieldAlert
                className="mt-0.5 h-5 w-5 shrink-0 text-negative"
                aria-hidden="true"
              />
            ) : (
              <AlertTriangle
                className="mt-0.5 h-5 w-5 shrink-0 text-caution"
                aria-hidden="true"
              />
            )}
            <div className="min-w-0">
              <p
                className={`text-sm font-bold ${
                  constraintResult.level === "avoid"
                    ? "text-negative"
                    : "text-caution"
                }`}
              >
                {constraintResult.level === "avoid"
                  ? "Active training constraint"
                  : "Training constraint caution"}
              </p>
              <p className="mt-1 text-sm leading-5 text-text-secondary">
                {exercise?.name} is flagged by {constraintResult.matches.length} active
                constraint{constraintResult.matches.length === 1 ? "" : "s"}. Use
                Substitute if you want a different programmed movement.
              </p>
              <p className="mt-2 text-xs leading-5 text-text-muted">
                {constraintResult.matches.map((match) => match.label).join(" · ")}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <PlannedWorkoutExecution
        onFinish={onFinish}
        onSetCompleted={onSetCompleted}
        onStartWarmup={onStartWarmup}
        wakeLockActive={wakeLockEnabled}
        onToggleWakeLock={() => setWakeLockEnabled((value) => !value)}
      />
    </div>
  );
}
