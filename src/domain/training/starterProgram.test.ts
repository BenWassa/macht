import { describe, expect, it } from "vitest";
import { activateProgramMesocycle } from "./programActivation";
import {
  createStarterProgram,
  DEFAULT_MUSCLE_PRIORITIES,
  replaceStarterExercise,
} from "./starterProgram";
import type { Mesocycle } from "./types";

const build = (sessionsPerWeek: 2 | 3 | 4 | 5 | 6 = 3) =>
  createStarterProgram({
    id: "program-1",
    name: "Base Build",
    createdAt: "2026-08-11T01:15:00Z",
    sessionsPerWeek,
    sessionDurationMinutes: 60,
  });

describe("createStarterProgram", () => {
  it.each([2, 3, 4, 5, 6] as const)(
    "builds a validated %i-session program with globally unique slots",
    (sessionsPerWeek) => {
      const program = build(sessionsPerWeek);
      const slots = program.sessionTemplates.flatMap(
        (template) => template.exerciseSlots,
      );

      expect(program.sessionsPerWeek).toBe(sessionsPerWeek);
      expect(program.sessionTemplates).toHaveLength(sessionsPerWeek);
      expect(new Set(slots.map((slot) => slot.id)).size).toBe(slots.length);
      expect(slots.every((slot) => slot.baseSetCount === 2)).toBe(true);
      expect(
        slots.every(
          (slot) =>
            slot.targetEffort?.scale === "RIR" && slot.targetEffort.value === 3,
        ),
      ).toBe(true);
      expect(slots.every((slot) => slot.startingLoad == null)).toBe(true);
    },
  );

  it("defaults to a sustainable three-session structure and Grow priorities", () => {
    const program = createStarterProgram({
      id: "program-1",
      name: "",
      createdAt: "2026-08-11T01:15:00Z",
    });

    expect(program.name).toBe("My Program");
    expect(program.sessionsPerWeek).toBe(3);
    expect(program.defaultSessionDurationMinutes).toBe(60);
    expect(program.musclePriorities).toEqual(DEFAULT_MUSCLE_PRIORITIES);
  });

  it("preserves explicit muscle priorities and replaces one slot without changing its identity", () => {
    const original = createStarterProgram({
      id: "program-1",
      name: "Priority build",
      createdAt: "2026-08-11T01:15:00Z",
      musclePriorities: { chest: "emphasize", calves: "maintain" },
    });
    const template = original.sessionTemplates[0];
    const slot = template.exerciseSlots[1];
    const updated = replaceStarterExercise(
      original,
      template.id,
      slot.id,
      "neutral_cable_row",
    );
    const replacement = updated.sessionTemplates[0].exerciseSlots[1];

    expect(updated.musclePriorities).toMatchObject({
      chest: "emphasize",
      calves: "maintain",
    });
    expect(replacement.id).toBe(slot.id);
    expect(replacement.exerciseId).toBe("neutral_cable_row");
    expect(replacement.repRange).toEqual({ min: 8, max: 12 });
  });
});

describe("activateProgramMesocycle", () => {
  it("creates an active cycle, archives the prior active cycle, and updates the program pointer", () => {
    const program = build();
    const oldCycle: Mesocycle = {
      id: "meso-old",
      programId: program.id,
      index: 1,
      name: "Old cycle",
      status: "active",
      createdAt: "2026-07-01T00:00:00Z",
      startDate: "2026-07-01",
      accumulationWeeks: 4,
      includesDeload: true,
      weeks: [],
    };
    const result = activateProgramMesocycle({
      program,
      existingMesocycles: [oldCycle],
      mesocycleId: "meso-new",
      createdAt: "2026-08-11T01:20:00Z",
      startDate: "2026-08-11",
      accumulationWeeks: 4,
    });

    expect(result.program.activeMesocycleId).toBe("meso-new");
    expect(result.program.updatedAt).toBe("2026-08-11T01:20:00Z");
    expect(result.mesocycle).toMatchObject({
      id: "meso-new",
      index: 2,
      status: "active",
      accumulationWeeks: 4,
      includesDeload: true,
    });
    expect(result.mesocycle.weeks).toHaveLength(5);
    expect(result.mesocycles.find((item) => item.id === "meso-old")?.status).toBe(
      "archived",
    );
  });

  it("does not alter cycles belonging to another program", () => {
    const program = build();
    const other: Mesocycle = {
      id: "other-meso",
      programId: "other-program",
      index: 4,
      status: "active",
      createdAt: "2026-08-01T00:00:00Z",
      accumulationWeeks: 3,
      includesDeload: false,
      weeks: [],
    };
    const result = activateProgramMesocycle({
      program,
      existingMesocycles: [other],
      mesocycleId: "meso-new",
      createdAt: "2026-08-11T01:20:00Z",
      startDate: "2026-08-11",
    });

    expect(result.mesocycles.find((item) => item.id === "other-meso")).toEqual(
      other,
    );
  });
});
