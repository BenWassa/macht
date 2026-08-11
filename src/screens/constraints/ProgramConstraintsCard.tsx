import { AlertTriangle, ShieldCheck } from "lucide-react";
import { useMemo } from "react";
import { effectiveTrainingConstraints } from "@/domain/constraints/effective";
import { assessProgramConstraints } from "@/domain/constraints/program";
import type { Program } from "@/domain/training/types";
import { todayIso } from "@/lib/format";
import { useCustomExerciseStore } from "@/state/useCustomExerciseStore";
import { useInjuryStore } from "@/state/useInjuryStore";
import { useTrainingConstraintStore } from "@/state/useTrainingConstraintStore";

interface ProgramConstraintsCardProps {
  program: Program;
}

export function ProgramConstraintsCard({ program }: ProgramConstraintsCardProps) {
  const userConstraints = useTrainingConstraintStore((state) => state.constraints);
  const legacyInjuries = useInjuryStore((state) => state.injuries);
  const customExercises = useCustomExerciseStore((state) => state.exercises);
  const constraints = useMemo(
    () => effectiveTrainingConstraints(userConstraints, legacyInjuries),
    [legacyInjuries, userConstraints],
  );
  const assessment = useMemo(
    () => assessProgramConstraints(program, constraints, customExercises, todayIso()),
    [constraints, customExercises, program],
  );
  const flagged = assessment.slots.filter(
    (slot) => slot.result.level !== "clear",
  );

  if (!flagged.length) {
    return (
      <section className="rounded-lg bg-positive-soft p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck
            className="mt-0.5 h-5 w-5 shrink-0 text-positive"
            aria-hidden="true"
          />
          <div>
            <h2 className="text-sm font-bold text-text">Constraint check clear</h2>
            <p className="mt-1 text-xs leading-5 text-text-secondary">
              No active training constraint currently flags an exercise in this Program.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-lg bg-caution-soft p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <AlertTriangle
          className="mt-0.5 h-5 w-5 shrink-0 text-caution"
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold text-text">Program constraint check</h2>
          <p className="mt-1 text-xs leading-5 text-text-secondary">
            {assessment.avoidCount} avoid · {assessment.cautionCount} caution. Review the
            flagged exercises before generating the next cycle.
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {flagged.slice(0, 8).map((slot) => (
          <div
            key={`${slot.templateId}:${slot.slotId}`}
            className="rounded-md bg-surface-1/70 px-3 py-2.5"
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className="truncate text-sm font-semibold text-text">
                {slot.exerciseName}
              </span>
              <span
                className={`shrink-0 text-xs font-bold ${
                  slot.result.level === "avoid" ? "text-negative" : "text-caution"
                }`}
              >
                {slot.result.level === "avoid" ? "Avoid" : "Caution"}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-text-muted">{slot.templateName}</p>
            {slot.result.matches.length ? (
              <p className="mt-1 text-xs leading-5 text-text-secondary">
                {slot.result.matches.map((match) => match.label).join(" · ")}
              </p>
            ) : null}
          </div>
        ))}
      </div>

      {flagged.length > 8 ? (
        <p className="mt-3 text-xs text-text-muted">
          +{flagged.length - 8} additional flagged slot
          {flagged.length - 8 === 1 ? "" : "s"}
        </p>
      ) : null}
    </section>
  );
}
