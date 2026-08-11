import type { MusclePriority } from "@/domain/exercises/muscles";
import type { MuscleId } from "@/domain/shared/ids";
import type {
  EffortTarget,
  Program,
  ProgramExerciseSlot,
} from "./types";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const MUSCLE_RULES: Array<{ pattern: RegExp; muscleId: MuscleId }> = [
  { pattern: /chest/i, muscleId: "chest" },
  { pattern: /lat|back/i, muscleId: "back" },
  { pattern: /shoulder|delt|rotator|scap/i, muscleId: "shoulders" },
  { pattern: /bicep|tricep|arm/i, muscleId: "arms" },
  { pattern: /quad/i, muscleId: "quads" },
  { pattern: /hamstring/i, muscleId: "hamstrings" },
  { pattern: /glute/i, muscleId: "glutes" },
  { pattern: /calf|calves/i, muscleId: "calves" },
  { pattern: /core|anti-rotation|abdom/i, muscleId: "core" },
];

export function inferTargetMuscles(
  targetLabel: string,
  fallback: MuscleId[] = [],
): MuscleId[] {
  const inferred = MUSCLE_RULES.filter(({ pattern }) => pattern.test(targetLabel)).map(
    ({ muscleId }) => muscleId,
  );
  return inferred.length ? [...new Set(inferred)] : [...fallback];
}

const mapSlot = (
  program: Program,
  templateId: string,
  slotId: string,
  mutate: (slot: ProgramExerciseSlot) => ProgramExerciseSlot,
): Program => ({
  ...program,
  sessionTemplates: program.sessionTemplates.map((template) =>
    template.id !== templateId
      ? template
      : {
          ...template,
          exerciseSlots: template.exerciseSlots.map((slot) =>
            slot.id === slotId ? mutate(slot) : slot,
          ),
        },
  ),
});

export function setProgramMusclePriority(
  program: Program,
  muscleId: MuscleId,
  priority: MusclePriority,
): Program {
  return {
    ...program,
    musclePriorities: { ...program.musclePriorities, [muscleId]: priority },
  };
}

export function renameProgramSession(
  program: Program,
  templateId: string,
  name: string,
): Program {
  return {
    ...program,
    sessionTemplates: program.sessionTemplates.map((template) =>
      template.id === templateId
        ? { ...template, name: name.trim() || template.name }
        : template,
    ),
  };
}

export function replaceProgramSlotExercise(
  program: Program,
  templateId: string,
  slotId: string,
  exerciseId: string,
  targetLabel: string,
): Program {
  return mapSlot(program, templateId, slotId, (slot) => ({
    ...slot,
    exerciseId,
    targetMuscleIds: inferTargetMuscles(targetLabel, slot.targetMuscleIds),
    allowedSubstitutionExerciseIds: [],
  }));
}

export interface SlotTrainingPatch {
  baseSetCount?: number;
  repMin?: number;
  repMax?: number;
  targetEffort?: EffortTarget;
  restSeconds?: number;
}

export function updateProgramSlotTraining(
  program: Program,
  templateId: string,
  slotId: string,
  patch: SlotTrainingPatch,
): Program {
  return mapSlot(program, templateId, slotId, (slot) => {
    const min = Math.max(1, patch.repMin ?? slot.repRange.min);
    const max = Math.max(min, patch.repMax ?? slot.repRange.max);
    const startingRepTarget = clamp(slot.startingRepTarget ?? min, min, max);
    return {
      ...slot,
      baseSetCount: clamp(
        Math.round(patch.baseSetCount ?? slot.baseSetCount),
        1,
        6,
      ),
      repRange: { min, max },
      startingRepTarget,
      targetEffort: patch.targetEffort ?? slot.targetEffort,
      restSeconds: clamp(
        Math.round(patch.restSeconds ?? slot.restSeconds ?? 90),
        30,
        300,
      ),
    };
  });
}

export function addProgramSlot(
  program: Program,
  templateId: string,
  slotId: string,
  exerciseId: string,
  targetLabel: string,
): Program {
  return {
    ...program,
    sessionTemplates: program.sessionTemplates.map((template) => {
      if (template.id !== templateId) return template;
      const order = template.exerciseSlots.length + 1;
      return {
        ...template,
        exerciseSlots: [
          ...template.exerciseSlots,
          {
            id: slotId,
            exerciseId,
            order,
            targetMuscleIds: inferTargetMuscles(targetLabel),
            baseSetCount: 2,
            repRange: { min: 8, max: 12 },
            startingRepTarget: 8,
            targetEffort: { scale: "RIR", value: 3 },
            restSeconds: 90,
            allowedSubstitutionExerciseIds: [],
            estimatedMinutesPerSet: 3.5,
          },
        ],
      };
    }),
  };
}

export function removeProgramSlot(
  program: Program,
  templateId: string,
  slotId: string,
): Program {
  return {
    ...program,
    sessionTemplates: program.sessionTemplates.map((template) => {
      if (template.id !== templateId || template.exerciseSlots.length <= 1) {
        return template;
      }
      return {
        ...template,
        exerciseSlots: template.exerciseSlots
          .filter((slot) => slot.id !== slotId)
          .map((slot, index) => ({ ...slot, order: index + 1 })),
      };
    }),
  };
}

export function addProgramSubstitution(
  program: Program,
  templateId: string,
  slotId: string,
  exerciseId: string,
): Program {
  return mapSlot(program, templateId, slotId, (slot) => ({
    ...slot,
    allowedSubstitutionExerciseIds: [
      ...new Set([
        ...(slot.allowedSubstitutionExerciseIds ?? []),
        exerciseId,
      ]),
    ].filter((id) => id !== slot.exerciseId),
  }));
}

export function removeProgramSubstitution(
  program: Program,
  templateId: string,
  slotId: string,
  exerciseId: string,
): Program {
  return mapSlot(program, templateId, slotId, (slot) => ({
    ...slot,
    allowedSubstitutionExerciseIds: (
      slot.allowedSubstitutionExerciseIds ?? []
    ).filter((id) => id !== exerciseId),
  }));
}
