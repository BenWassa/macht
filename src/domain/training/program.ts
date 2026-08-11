import type {
  Program,
  ProgramExerciseSlot,
  ProgramSessionTemplate,
} from "./types";

export interface CreateProgramInput extends Omit<Program, "updatedAt"> {
  updatedAt?: string;
}

const unique = <T>(values: T[]) => new Set(values).size === values.length;

function validateSlot(slot: ProgramExerciseSlot, path: string): string[] {
  const issues: string[] = [];
  if (!slot.id) issues.push(`${path}: slot id is required`);
  if (!slot.exerciseId) issues.push(`${path}: exercise id is required`);
  if (slot.baseSetCount < 1) issues.push(`${path}: baseSetCount must be >= 1`);
  if (slot.repRange.min < 1 || slot.repRange.max < slot.repRange.min) {
    issues.push(`${path}: invalid rep range`);
  }
  if (
    slot.startingRepTarget != null &&
    (slot.startingRepTarget < slot.repRange.min ||
      slot.startingRepTarget > slot.repRange.max)
  ) {
    issues.push(`${path}: startingRepTarget must be inside rep range`);
  }
  return issues;
}

function validateTemplate(
  template: ProgramSessionTemplate,
  index: number,
): string[] {
  const path = `sessionTemplates[${index}]`;
  const issues: string[] = [];
  if (!template.id) issues.push(`${path}: template id is required`);
  if (!template.name.trim()) issues.push(`${path}: name is required`);
  if (template.exerciseSlots.length === 0) {
    issues.push(`${path}: at least one exercise slot is required`);
  }
  template.exerciseSlots.forEach((slot, slotIndex) => {
    issues.push(...validateSlot(slot, `${path}.exerciseSlots[${slotIndex}]`));
  });
  return issues;
}

export function validateProgram(program: Program): string[] {
  const issues: string[] = [];
  if (!program.name.trim()) issues.push("name is required");
  if (program.defaultSessionDurationMinutes <= 0) {
    issues.push("defaultSessionDurationMinutes must be > 0");
  }
  if (program.sessionTemplates.length !== program.sessionsPerWeek) {
    issues.push("sessionTemplates must match sessionsPerWeek");
  }
  if (!unique(program.sessionTemplates.map((template) => template.id))) {
    issues.push("session template ids must be unique");
  }
  const slotIds = program.sessionTemplates.flatMap((template) =>
    template.exerciseSlots.map((slot) => slot.id),
  );
  if (!unique(slotIds)) {
    issues.push("exercise slot ids must be unique across the program");
  }
  if (program.preferredWeekdays) {
    const days = program.preferredWeekdays;
    if (days.length !== program.sessionsPerWeek) {
      issues.push("preferredWeekdays must match sessionsPerWeek");
    }
    if (!unique(days) || days.some((day) => day < 0 || day > 6)) {
      issues.push("preferredWeekdays must be unique values from 0 through 6");
    }
  }
  program.sessionTemplates.forEach((template, index) => {
    issues.push(...validateTemplate(template, index));
  });
  return issues;
}

function assertValid(program: Program): Program {
  const issues = validateProgram(program);
  if (issues.length) throw new Error(`Invalid program: ${issues.join("; ")}`);
  return program;
}

export function createProgram(input: CreateProgramInput): Program {
  return assertValid({ ...input, updatedAt: input.updatedAt ?? input.createdAt });
}

export function updateProgram(
  program: Program,
  patch: Partial<Omit<Program, "id" | "createdAt">>,
  updatedAt: string,
): Program {
  return assertValid({ ...program, ...patch, updatedAt });
}
