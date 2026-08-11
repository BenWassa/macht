import type { IsoDate, IsoDateTime, MesocycleId } from "@/domain/shared/ids";
import { generateMesocycle } from "./mesocycle";
import type { Mesocycle, Program } from "./types";

export interface ActivateProgramInput {
  program: Program;
  existingMesocycles: Mesocycle[];
  mesocycleId: MesocycleId;
  createdAt: IsoDateTime;
  startDate: IsoDate;
  accumulationWeeks?: number;
  includesDeload?: boolean;
  name?: string;
}

export interface ActivateProgramResult {
  program: Program;
  mesocycle: Mesocycle;
  mesocycles: Mesocycle[];
}

export function activateProgramMesocycle({
  program,
  existingMesocycles,
  mesocycleId,
  createdAt,
  startDate,
  accumulationWeeks = 4,
  includesDeload = true,
  name,
}: ActivateProgramInput): ActivateProgramResult {
  const previousForProgram = existingMesocycles.filter(
    (item) => item.programId === program.id,
  );
  const nextIndex =
    Math.max(0, ...previousForProgram.map((item) => item.index)) + 1;
  const generated = generateMesocycle({
    program,
    mesocycleId,
    index: nextIndex,
    createdAt,
    startDate,
    accumulationWeeks,
    includesDeload,
    name: name ?? `${program.name} · Cycle ${nextIndex}`,
  });
  const mesocycle: Mesocycle = { ...generated, status: "active" };
  const archived = existingMesocycles
    .filter((item) => item.id !== mesocycleId)
    .map((item) =>
      item.programId === program.id && item.status === "active"
        ? { ...item, status: "archived" as const }
        : item,
    );
  const updatedProgram: Program = {
    ...program,
    activeMesocycleId: mesocycle.id,
    updatedAt: createdAt,
  };

  return {
    program: updatedProgram,
    mesocycle,
    mesocycles: [...archived, mesocycle],
  };
}
