import type { Exercise } from "@/domain/types";
import type {
  ConstraintMatch,
  ExerciseConstraintResult,
  TrainingConstraint,
} from "./types";

const intersects = (left: string[], right: string[]) =>
  left.some((value) => right.includes(value));

const constraintActiveOn = (
  constraint: TrainingConstraint,
  date?: string,
): boolean =>
  constraint.active &&
  (!date || !constraint.expiresOn || constraint.expiresOn >= date);

function matchConstraint(
  exercise: Exercise,
  constraint: TrainingConstraint,
): ConstraintMatch | undefined {
  const explicitExercise = constraint.exerciseIds.includes(exercise.id);
  const blockedMovement = intersects(constraint.blockedTags, exercise.tags);
  const cautionMovement = intersects(constraint.cautionTags, exercise.tags);
  if (!explicitExercise && !blockedMovement && !cautionMovement) return undefined;

  const reasons: string[] = [];
  if (explicitExercise) reasons.push("exercise");
  if (blockedMovement) reasons.push("movement");
  if (cautionMovement) reasons.push("movement_caution");
  const level =
    explicitExercise || blockedMovement ? constraint.level : "caution";
  return {
    constraintId: constraint.id,
    label: constraint.label,
    level,
    reasons,
  };
}

export function evaluateExerciseConstraints(
  exercise: Exercise,
  constraints: TrainingConstraint[],
  date?: string,
): ExerciseConstraintResult {
  const matches = constraints
    .filter((constraint) => constraintActiveOn(constraint, date))
    .map((constraint) => matchConstraint(exercise, constraint))
    .filter((match): match is ConstraintMatch => Boolean(match));
  const level = matches.some((match) => match.level === "avoid")
    ? "avoid"
    : matches.some((match) => match.level === "caution")
      ? "caution"
      : "clear";
  return { exerciseId: exercise.id, level, matches };
}

export function permittedExerciseIds(
  exercises: Exercise[],
  constraints: TrainingConstraint[],
  date?: string,
): string[] {
  return exercises
    .filter(
      (exercise) =>
        evaluateExerciseConstraints(exercise, constraints, date).level !==
        "avoid",
    )
    .map((exercise) => exercise.id);
}
