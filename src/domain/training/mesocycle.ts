import { effortTargetForWeek } from "@/domain/progression/effortProgression";
import type { IsoDate, MesocycleId } from "@/domain/shared/ids";
import { validateProgram } from "./program";
import { datesForTrainingWeek, defaultWeekdays } from "./scheduling";
import { allocateSetsWithinDuration } from "./sessionBudget";
import type {
  EffortTarget,
  ExercisePrescription,
  Mesocycle,
  Program,
  ProgramExerciseSlot,
  PlannedSession,
  WeekPhase,
} from "./types";

export interface GenerateMesocycleInput {
  program: Program;
  mesocycleId: MesocycleId;
  index: number;
  createdAt: string;
  startDate?: IsoDate;
  accumulationWeeks: number;
  includesDeload?: boolean;
  startingEffort?: EffortTarget;
  name?: string;
}

const id = (...parts: Array<string | number>) => parts.join(":");

function buildPrescription(
  slot: ProgramExerciseSlot,
  plannedSessionId: string,
  setCount: number,
  effort: EffortTarget,
): ExercisePrescription {
  const prescriptionId = id(plannedSessionId, "slot", slot.id);
  const targetRep = slot.startingRepTarget ?? slot.repRange.min;
  return {
    id: prescriptionId,
    plannedSessionId,
    programExerciseSlotId: slot.id,
    exerciseId: slot.exerciseId,
    order: slot.order,
    targetMuscleIds: slot.targetMuscleIds,
    plannedSetCount: setCount,
    repRange: slot.repRange,
    targetRep,
    targetEffort: effort,
    recommendedLoad: slot.startingLoad,
    restSeconds: slot.restSeconds,
    substitutionFamilyId: slot.substitutionFamilyId,
    allowedSubstitutionExerciseIds: slot.allowedSubstitutionExerciseIds
      ? [...slot.allowedSubstitutionExerciseIds]
      : undefined,
    source: "program_initial",
    sets: Array.from({ length: setCount }, (_, setIndex) => ({
      id: id(prescriptionId, "set", setIndex + 1),
      exercisePrescriptionId: prescriptionId,
      index: setIndex + 1,
      type: "working" as const,
      targetLoad: slot.startingLoad,
      repRange: slot.repRange,
      targetReps: targetRep,
      targetEffort: effort,
    })),
  };
}

function weekPhase(index: number, accumulationWeeks: number): WeekPhase {
  return index <= accumulationWeeks ? "accumulation" : "deload";
}

export function generateMesocycle(input: GenerateMesocycleInput): Mesocycle {
  const issues = validateProgram(input.program);
  if (issues.length) throw new Error(`Cannot generate mesocycle: ${issues.join("; ")}`);
  if (input.accumulationWeeks < 2 || input.accumulationWeeks > 8) {
    throw new Error("accumulationWeeks must be between 2 and 8");
  }

  const includesDeload = input.includesDeload ?? true;
  const weekCount = input.accumulationWeeks + (includesDeload ? 1 : 0);
  const startingEffort = input.startingEffort ?? { scale: "RIR", value: 3 };
  const weekdays = input.program.preferredWeekdays ?? defaultWeekdays(input.program.sessionsPerWeek);
  const templates = [...input.program.sessionTemplates].sort((a, b) => a.order - b.order);

  const weeks = Array.from({ length: weekCount }, (_, zeroIndex) => {
    const weekIndex = zeroIndex + 1;
    const phase = weekPhase(weekIndex, input.accumulationWeeks);
    const weekId = id(input.mesocycleId, "week", weekIndex);
    const effort = effortTargetForWeek({
      ...startingEffort,
      startingValue: startingEffort.value,
      weekIndex,
      phase,
    });
    const dates = input.startDate
      ? datesForTrainingWeek(input.startDate, weekIndex, weekdays)
      : [];

    const sessions: PlannedSession[] = templates.map((template, sessionIndex) => {
      const sessionId = id(weekId, "session", template.id);
      const duration = template.targetDurationMinutes ?? input.program.defaultSessionDurationMinutes;
      const allocated = allocateSetsWithinDuration(template.exerciseSlots, duration, input.program.musclePriorities);
      const prescriptions = template.exerciseSlots.map((slot) => {
        const baseCount = allocated.get(slot.id) ?? slot.baseSetCount;
        const setCount = phase === "deload" ? Math.max(1, Math.ceil(baseCount / 2)) : baseCount;
        return buildPrescription(slot, sessionId, setCount, effort);
      });
      return {
        id: sessionId,
        weekId,
        index: sessionIndex + 1,
        name: template.name,
        plannedDate: dates[sessionIndex],
        targetDurationMinutes: duration,
        status: "planned",
        prescriptions,
      };
    });
    return { id: weekId, mesocycleId: input.mesocycleId, index: weekIndex, phase, targetEffort: effort, sessions };
  });

  return {
    id: input.mesocycleId,
    programId: input.program.id,
    index: input.index,
    name: input.name,
    status: "planned",
    createdAt: input.createdAt,
    startDate: input.startDate,
    accumulationWeeks: input.accumulationWeeks,
    includesDeload,
    weeks,
  };
}
