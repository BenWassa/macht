import { evaluateExerciseConstraints } from "@/domain/constraints/evaluate";
import type {
  ExerciseConstraintResult,
  TrainingConstraint,
} from "@/domain/constraints/types";
import { getExerciseById } from "@/domain/exerciseLibrary";
import type { Program, ProgramExerciseSlot } from "@/domain/training/types";
import type { CustomExercise } from "@/domain/types";

export interface ProgramSlotConstraintAssessment {
  templateId: string;
  templateName: string;
  slotId: string;
  exerciseId: string;
  exerciseName: string;
  result: ExerciseConstraintResult;
}

export interface ProgramConstraintAssessment {
  slots: ProgramSlotConstraintAssessment[];
  avoidCount: number;
  cautionCount: number;
  clearCount: number;
}

export function assessProgramConstraints(
  program: Program,
  constraints: TrainingConstraint[],
  customExercises: CustomExercise[] = [],
  date?: string,
): ProgramConstraintAssessment {
  const slots = program.sessionTemplates.flatMap((template) =>
    template.exerciseSlots.map((slot) => {
      const exercise = getExerciseById(slot.exerciseId, customExercises);
      const result = exercise
        ? evaluateExerciseConstraints(exercise, constraints, date)
        : {
            exerciseId: slot.exerciseId,
            level: "clear" as const,
            matches: [],
          };
      return {
        templateId: template.id,
        templateName: template.name,
        slotId: slot.id,
        exerciseId: slot.exerciseId,
        exerciseName: exercise?.name ?? slot.exerciseId,
        result,
      };
    }),
  );
  return {
    slots,
    avoidCount: slots.filter((slot) => slot.result.level === "avoid").length,
    cautionCount: slots.filter((slot) => slot.result.level === "caution").length,
    clearCount: slots.filter((slot) => slot.result.level === "clear").length,
  };
}

export function constraintSafeSubstitutionIds(
  slot: ProgramExerciseSlot,
  constraints: TrainingConstraint[],
  customExercises: CustomExercise[] = [],
  date?: string,
): string[] {
  return (slot.allowedSubstitutionExerciseIds ?? []).filter((exerciseId) => {
    const exercise = getExerciseById(exerciseId, customExercises);
    if (!exercise) return false;
    return evaluateExerciseConstraints(exercise, constraints, date).level !== "avoid";
  });
}
