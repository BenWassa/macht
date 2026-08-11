import type { ComponentProps } from "react";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { effectiveTrainingConstraints } from "@/domain/constraints/effective";
import { evaluateExerciseConstraints } from "@/domain/constraints/evaluate";
import { getExerciseById } from "@/domain/exerciseLibrary";
import { WorkoutScreen } from "@/screens/WorkoutScreen";
import { useCustomExerciseStore } from "@/state/useCustomExerciseStore";
import { useInjuryStore } from "@/state/useInjuryStore";
import { useTrainingConstraintStore } from "@/state/useTrainingConstraintStore";
import { useWorkoutStore } from "@/state/useWorkoutStore";

type Props = ComponentProps<typeof WorkoutScreen>;

export function ConstraintAwareWorkoutScreen(props: Props) {
  const userConstraints = useTrainingConstraintStore((state) => state.constraints);
  const legacyInjuries = useInjuryStore((state) => state.injuries);
  const customExercises = useCustomExerciseStore((state) => state.exercises);
  const activeWorkoutList = useWorkoutStore((state) => state.activeWorkoutList);
  const selectedExIndex = useWorkoutStore((state) => state.selectedExIndex);
  const exerciseId = activeWorkoutList[selectedExIndex];
  const exercise = exerciseId
    ? getExerciseById(exerciseId, customExercises)
    : undefined;
  const constraints = effectiveTrainingConstraints(
    userConstraints,
    legacyInjuries,
  );
  const result = exercise
    ? evaluateExerciseConstraints(
        exercise,
        constraints,
        new Date().toISOString().slice(0, 10),
      )
    : undefined;

  return (
    <div className="space-y-4">
      {result && result.level !== "clear" ? (
        <section
          className={`rounded-lg p-4 ${
            result.level === "avoid" ? "bg-negative-soft" : "bg-caution-soft"
          }`}
          role="status"
        >
          <div className="flex items-start gap-3">
            {result.level === "avoid" ? (
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
                  result.level === "avoid" ? "text-negative" : "text-caution"
                }`}
              >
                {result.level === "avoid"
                  ? "Active training constraint"
                  : "Training constraint caution"}
              </p>
              <p className="mt-1 text-sm leading-5 text-text-secondary">
                {exercise?.name} is flagged by {result.matches.length} active constraint
                {result.matches.length === 1 ? "" : "s"}. Use the session's Substitute
                action if you want a different programmed movement.
              </p>
              <p className="mt-2 text-xs leading-5 text-text-muted">
                {result.matches.map((match) => match.label).join(" · ")}
              </p>
            </div>
          </div>
        </section>
      ) : null}
      <WorkoutScreen {...props} />
    </div>
  );
}
