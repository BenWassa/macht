import type { ExerciseId } from "@/domain/shared/ids";
import type { ProgressionDecision } from "@/domain/progression/types";
import type { ExercisePrescription, Mesocycle, SetPrescription } from "./types";

function rebuildSets(
  prescription: ExercisePrescription,
  setCount: number,
  load: number | undefined,
  reps: number | undefined,
): SetPrescription[] {
  return Array.from({ length: setCount }, (_, index) => ({
    id: `${prescription.id}:set:${index + 1}`,
    exercisePrescriptionId: prescription.id,
    index: index + 1,
    type: prescription.sets[index]?.type ?? "working",
    targetLoad: load,
    repRange: prescription.repRange,
    targetReps: reps,
    targetEffort: prescription.targetEffort,
  }));
}

export function applyProgressionDecision(
  prescription: ExercisePrescription,
  decision: ProgressionDecision,
): ExercisePrescription {
  const setCount = decision.delta.nextSetCount ?? prescription.plannedSetCount;
  const load = decision.delta.nextLoad ?? prescription.recommendedLoad;
  const reps = decision.delta.nextRepTarget ?? prescription.targetRep;
  const targetEffort = decision.delta.nextTargetEffort ?? prescription.targetEffort;
  const exerciseId = decision.delta.replacementExerciseId ?? prescription.exerciseId;
  const next = {
    ...prescription,
    exerciseId,
    plannedSetCount: setCount,
    recommendedLoad: load,
    targetRep: reps,
    targetEffort,
    source: "progression_engine" as const,
    progressionDecisionId: decision.id,
  };
  return {
    ...next,
    sets: rebuildSets(next, setCount, load, reps).map((set) => ({
      ...set,
      targetEffort,
    })),
  };
}

export function applyDecisionToNextSlotOccurrence(
  mesocycle: Mesocycle,
  sourcePrescriptionId: string,
  decision: ProgressionDecision,
): Mesocycle {
  const ordered = mesocycle.weeks.flatMap((week) =>
    week.sessions.flatMap((session) => session.prescriptions),
  );
  const sourceIndex = ordered.findIndex((item) => item.id === sourcePrescriptionId);
  if (sourceIndex < 0) return mesocycle;
  const source = ordered[sourceIndex];
  const next = ordered.slice(sourceIndex + 1).find((item) =>
    source.programExerciseSlotId
      ? item.programExerciseSlotId === source.programExerciseSlotId
      : item.exerciseId === source.exerciseId,
  );
  if (!next) return mesocycle;

  return {
    ...mesocycle,
    weeks: mesocycle.weeks.map((week) => ({
      ...week,
      sessions: week.sessions.map((session) => ({
        ...session,
        prescriptions: session.prescriptions.map((prescription) =>
          prescription.id === next.id
            ? applyProgressionDecision(prescription, decision)
            : prescription,
        ),
      })),
    })),
  };
}

export function substituteSlotFromWeek(
  mesocycle: Mesocycle,
  programExerciseSlotId: string,
  replacementExerciseId: ExerciseId,
  fromWeekIndex: number,
): Mesocycle {
  return {
    ...mesocycle,
    weeks: mesocycle.weeks.map((week) => ({
      ...week,
      sessions: week.sessions.map((session) => ({
        ...session,
        prescriptions: session.prescriptions.map((prescription) =>
          week.index >= fromWeekIndex &&
          prescription.programExerciseSlotId === programExerciseSlotId
            ? { ...prescription, exerciseId: replacementExerciseId, source: "user_override" as const }
            : prescription,
        ),
      })),
    })),
  };
}
