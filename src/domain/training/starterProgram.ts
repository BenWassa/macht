import type { MusclePriorities } from "@/domain/exercises/muscles";
import type { MuscleId, ProgramId } from "@/domain/shared/ids";
import { createProgram } from "./program";
import type {
  EffortTarget,
  Program,
  ProgramExerciseSlot,
  ProgramSessionTemplate,
} from "./types";

export const PROGRAM_MUSCLES: Array<{ id: MuscleId; name: string }> = [
  { id: "chest", name: "Chest" },
  { id: "back", name: "Back" },
  { id: "shoulders", name: "Shoulders" },
  { id: "arms", name: "Arms" },
  { id: "quads", name: "Quads" },
  { id: "hamstrings", name: "Hamstrings" },
  { id: "glutes", name: "Glutes" },
  { id: "calves", name: "Calves" },
  { id: "core", name: "Core" },
];

export const DEFAULT_MUSCLE_PRIORITIES: MusclePriorities = Object.fromEntries(
  PROGRAM_MUSCLES.map((muscle) => [muscle.id, "grow"]),
);

type SlotBlueprint = Omit<
  ProgramExerciseSlot,
  "id" | "order" | "targetEffort"
> & {
  targetEffort?: EffortTarget;
};

const SLOT_BLUEPRINTS: Record<string, SlotBlueprint> = {
  incline_db_press: {
    exerciseId: "incline_db_press",
    targetMuscleIds: ["chest", "triceps"],
    baseSetCount: 2,
    repRange: { min: 8, max: 12 },
    startingRepTarget: 8,
    restSeconds: 120,
    allowedSubstitutionExerciseIds: [
      "neutral_db_press",
      "bench_press",
      "floor_press_neutral",
    ],
    estimatedMinutesPerSet: 3.5,
  },
  neutral_db_press: {
    exerciseId: "neutral_db_press",
    targetMuscleIds: ["chest", "triceps"],
    baseSetCount: 2,
    repRange: { min: 8, max: 12 },
    startingRepTarget: 8,
    restSeconds: 120,
    allowedSubstitutionExerciseIds: [
      "incline_db_press",
      "bench_press",
      "floor_press_neutral",
    ],
    estimatedMinutesPerSet: 3.5,
  },
  chest_supported_row: {
    exerciseId: "chest_supported_row",
    targetMuscleIds: ["back", "biceps"],
    baseSetCount: 2,
    repRange: { min: 8, max: 12 },
    startingRepTarget: 8,
    restSeconds: 120,
    allowedSubstitutionExerciseIds: [
      "neutral_cable_row",
      "dumbbell_row",
      "barbell_row",
    ],
    estimatedMinutesPerSet: 3.5,
  },
  neutral_cable_row: {
    exerciseId: "neutral_cable_row",
    targetMuscleIds: ["back", "biceps"],
    baseSetCount: 2,
    repRange: { min: 8, max: 12 },
    startingRepTarget: 8,
    restSeconds: 120,
    allowedSubstitutionExerciseIds: [
      "chest_supported_row",
      "dumbbell_row",
      "barbell_row",
    ],
    estimatedMinutesPerSet: 3.5,
  },
  overhead_press: {
    exerciseId: "overhead_press",
    targetMuscleIds: ["shoulders", "triceps"],
    baseSetCount: 2,
    repRange: { min: 8, max: 12 },
    startingRepTarget: 8,
    restSeconds: 120,
    allowedSubstitutionExerciseIds: ["landmine_press", "neutral_db_press"],
    estimatedMinutesPerSet: 3.5,
  },
  landmine_press: {
    exerciseId: "landmine_press",
    targetMuscleIds: ["shoulders", "triceps"],
    baseSetCount: 2,
    repRange: { min: 8, max: 12 },
    startingRepTarget: 8,
    restSeconds: 120,
    allowedSubstitutionExerciseIds: ["overhead_press", "neutral_db_press"],
    estimatedMinutesPerSet: 3.5,
  },
  lat_pulldown_front: {
    exerciseId: "lat_pulldown_front",
    targetMuscleIds: ["back", "biceps"],
    baseSetCount: 2,
    repRange: { min: 8, max: 12 },
    startingRepTarget: 8,
    restSeconds: 120,
    allowedSubstitutionExerciseIds: ["chest_supported_row", "neutral_cable_row"],
    estimatedMinutesPerSet: 3.5,
  },
  face_pull: {
    exerciseId: "face_pull",
    targetMuscleIds: ["shoulders", "back"],
    baseSetCount: 2,
    repRange: { min: 10, max: 15 },
    startingRepTarget: 10,
    restSeconds: 90,
    allowedSubstitutionExerciseIds: ["chest_supported_row", "neutral_cable_row"],
    estimatedMinutesPerSet: 3,
  },
  tricep_pushdown: {
    exerciseId: "tricep_pushdown",
    targetMuscleIds: ["arms"],
    baseSetCount: 2,
    repRange: { min: 10, max: 15 },
    startingRepTarget: 10,
    restSeconds: 75,
    estimatedMinutesPerSet: 2.5,
  },
  dumbbell_biceps_curl: {
    exerciseId: "dumbbell_biceps_curl",
    targetMuscleIds: ["arms"],
    baseSetCount: 2,
    repRange: { min: 10, max: 15 },
    startingRepTarget: 10,
    restSeconds: 75,
    estimatedMinutesPerSet: 2.5,
  },
  leg_press: {
    exerciseId: "leg_press",
    targetMuscleIds: ["quads", "glutes"],
    baseSetCount: 2,
    repRange: { min: 8, max: 12 },
    startingRepTarget: 8,
    restSeconds: 120,
    allowedSubstitutionExerciseIds: ["hack_squat", "belt_squat", "split_squat"],
    estimatedMinutesPerSet: 4,
  },
  hack_squat: {
    exerciseId: "hack_squat",
    targetMuscleIds: ["quads", "glutes"],
    baseSetCount: 2,
    repRange: { min: 8, max: 12 },
    startingRepTarget: 8,
    restSeconds: 120,
    allowedSubstitutionExerciseIds: ["leg_press", "belt_squat", "split_squat"],
    estimatedMinutesPerSet: 4,
  },
  romanian_deadlift: {
    exerciseId: "romanian_deadlift",
    targetMuscleIds: ["hamstrings", "glutes"],
    baseSetCount: 2,
    repRange: { min: 8, max: 12 },
    startingRepTarget: 8,
    restSeconds: 120,
    allowedSubstitutionExerciseIds: ["hip_thrust", "hamstring_curl"],
    estimatedMinutesPerSet: 4,
  },
  hip_thrust: {
    exerciseId: "hip_thrust",
    targetMuscleIds: ["glutes", "hamstrings"],
    baseSetCount: 2,
    repRange: { min: 8, max: 12 },
    startingRepTarget: 8,
    restSeconds: 120,
    allowedSubstitutionExerciseIds: ["glute_bridge", "romanian_deadlift"],
    estimatedMinutesPerSet: 4,
  },
  hamstring_curl: {
    exerciseId: "hamstring_curl",
    targetMuscleIds: ["hamstrings"],
    baseSetCount: 2,
    repRange: { min: 10, max: 15 },
    startingRepTarget: 10,
    restSeconds: 90,
    allowedSubstitutionExerciseIds: ["leg_curl", "romanian_deadlift"],
    estimatedMinutesPerSet: 3,
  },
  leg_extension: {
    exerciseId: "leg_extension",
    targetMuscleIds: ["quads"],
    baseSetCount: 2,
    repRange: { min: 10, max: 15 },
    startingRepTarget: 10,
    restSeconds: 90,
    allowedSubstitutionExerciseIds: ["leg_press", "hack_squat"],
    estimatedMinutesPerSet: 3,
  },
  calf_raise: {
    exerciseId: "calf_raise",
    targetMuscleIds: ["calves"],
    baseSetCount: 2,
    repRange: { min: 10, max: 15 },
    startingRepTarget: 10,
    restSeconds: 75,
    estimatedMinutesPerSet: 2.5,
  },
  dead_bug: {
    exerciseId: "dead_bug",
    targetMuscleIds: ["core"],
    baseSetCount: 2,
    repRange: { min: 8, max: 15 },
    startingRepTarget: 8,
    restSeconds: 60,
    estimatedMinutesPerSet: 2.5,
  },
};

interface SessionBlueprint {
  name: string;
  exercises: string[];
}

const upperA: SessionBlueprint = {
  name: "Upper A",
  exercises: [
    "incline_db_press",
    "chest_supported_row",
    "overhead_press",
    "lat_pulldown_front",
    "tricep_pushdown",
    "dumbbell_biceps_curl",
  ],
};
const upperB: SessionBlueprint = {
  name: "Upper B",
  exercises: [
    "neutral_db_press",
    "neutral_cable_row",
    "landmine_press",
    "lat_pulldown_front",
    "face_pull",
    "dumbbell_biceps_curl",
  ],
};
const lowerA: SessionBlueprint = {
  name: "Lower A",
  exercises: [
    "leg_press",
    "romanian_deadlift",
    "hamstring_curl",
    "calf_raise",
    "dead_bug",
  ],
};
const lowerB: SessionBlueprint = {
  name: "Lower B",
  exercises: [
    "hack_squat",
    "hip_thrust",
    "leg_extension",
    "hamstring_curl",
    "calf_raise",
  ],
};
const fullA: SessionBlueprint = {
  name: "Full A",
  exercises: [
    "leg_press",
    "incline_db_press",
    "chest_supported_row",
    "romanian_deadlift",
    "face_pull",
  ],
};
const fullB: SessionBlueprint = {
  name: "Full B",
  exercises: [
    "hack_squat",
    "neutral_db_press",
    "neutral_cable_row",
    "hip_thrust",
    "dumbbell_biceps_curl",
  ],
};
const fullC: SessionBlueprint = {
  name: "Full C",
  exercises: [
    "leg_press",
    "landmine_press",
    "lat_pulldown_front",
    "hamstring_curl",
    "tricep_pushdown",
  ],
};

const sessionsFor = (sessionsPerWeek: 2 | 3 | 4 | 5 | 6): SessionBlueprint[] => {
  switch (sessionsPerWeek) {
    case 2:
      return [fullA, fullB];
    case 3:
      return [fullA, fullB, fullC];
    case 4:
      return [upperA, lowerA, upperB, lowerB];
    case 5:
      return [upperA, lowerA, fullA, upperB, lowerB];
    case 6:
      return [upperA, lowerA, fullA, upperB, lowerB, fullB];
  }
};

const buildSession = (
  blueprint: SessionBlueprint,
  index: number,
  durationMinutes: number,
  effort: EffortTarget,
): ProgramSessionTemplate => {
  const templateId = `session-${index + 1}`;
  return {
    id: templateId,
    name: blueprint.name,
    order: index + 1,
    targetDurationMinutes: durationMinutes,
    exerciseSlots: blueprint.exercises.map((exerciseId, exerciseIndex) => {
      const source = SLOT_BLUEPRINTS[exerciseId];
      if (!source) throw new Error(`Missing starter blueprint for ${exerciseId}`);
      return {
        ...source,
        id: `${templateId}:${exerciseId}:${exerciseIndex + 1}`,
        order: exerciseIndex + 1,
        targetEffort: source.targetEffort ?? effort,
        targetMuscleIds: [...source.targetMuscleIds],
        repRange: { ...source.repRange },
        allowedSubstitutionExerciseIds: source.allowedSubstitutionExerciseIds
          ? [...source.allowedSubstitutionExerciseIds]
          : undefined,
      };
    }),
  };
};

export interface CreateStarterProgramInput {
  id: ProgramId;
  name: string;
  createdAt: string;
  sessionsPerWeek?: 2 | 3 | 4 | 5 | 6;
  sessionDurationMinutes?: number;
  musclePriorities?: MusclePriorities;
  startingEffort?: EffortTarget;
}

export function createStarterProgram({
  id,
  name,
  createdAt,
  sessionsPerWeek = 3,
  sessionDurationMinutes = 60,
  musclePriorities = DEFAULT_MUSCLE_PRIORITIES,
  startingEffort = { scale: "RIR", value: 3 },
}: CreateStarterProgramInput): Program {
  const priorities = {
    ...DEFAULT_MUSCLE_PRIORITIES,
    ...musclePriorities,
  };
  const sessionTemplates = sessionsFor(sessionsPerWeek).map(
    (blueprint, index) =>
      buildSession(blueprint, index, sessionDurationMinutes, startingEffort),
  );

  return createProgram({
    id,
    name: name.trim() || "My Program",
    goal: "hypertrophy",
    createdAt,
    sessionsPerWeek,
    defaultSessionDurationMinutes: sessionDurationMinutes,
    musclePriorities: priorities,
    sessionTemplates,
  });
}

export function replaceStarterExercise(
  program: Program,
  templateId: string,
  slotId: string,
  exerciseId: string,
): Program {
  const source = SLOT_BLUEPRINTS[exerciseId];
  const fallback = program.sessionTemplates
    .flatMap((template) => template.exerciseSlots)
    .find((slot) => slot.id === slotId);
  const nextSource = source ?? fallback;
  if (!nextSource) return program;

  return {
    ...program,
    sessionTemplates: program.sessionTemplates.map((template) =>
      template.id !== templateId
        ? template
        : {
            ...template,
            exerciseSlots: template.exerciseSlots.map((slot) =>
              slot.id !== slotId
                ? slot
                : {
                    ...slot,
                    ...nextSource,
                    id: slot.id,
                    exerciseId,
                    order: slot.order,
                    targetEffort: slot.targetEffort,
                    targetMuscleIds: [...nextSource.targetMuscleIds],
                    repRange: { ...nextSource.repRange },
                    allowedSubstitutionExerciseIds:
                      nextSource.allowedSubstitutionExerciseIds
                        ? [...nextSource.allowedSubstitutionExerciseIds]
                        : undefined,
                  },
            ),
          },
    ),
  };
}
