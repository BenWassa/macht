import { describe, expect, it } from "vitest";
import { createStarterProgram } from "./starterProgram";
import {
  addProgramSlot,
  addProgramSubstitution,
  inferTargetMuscles,
  removeProgramSlot,
  removeProgramSubstitution,
  renameProgramSession,
  replaceProgramSlotExercise,
  setProgramMusclePriority,
  updateProgramSlotTraining,
} from "./programEditing";

const program = () =>
  createStarterProgram({
    id: "program-1",
    name: "Editor test",
    createdAt: "2026-08-11T01:30:00Z",
    sessionsPerWeek: 3,
  });

describe("programEditing", () => {
  it("infers normalized program muscle ids from exercise target copy", () => {
    expect(inferTargetMuscles("Chest / Triceps")).toEqual(["chest", "arms"]);
    expect(inferTargetMuscles("Lats / Upper back / Biceps")).toEqual([
      "back",
      "arms",
    ]);
    expect(inferTargetMuscles("Quads / Glutes")).toEqual(["quads", "glutes"]);
  });

  it("updates muscle priority and session name immutably", () => {
    const source = program();
    const template = source.sessionTemplates[0];
    const prioritized = setProgramMusclePriority(source, "chest", "emphasize");
    const renamed = renameProgramSession(prioritized, template.id, "Monday build");

    expect(source.musclePriorities.chest).toBe("grow");
    expect(renamed.musclePriorities.chest).toBe("emphasize");
    expect(renamed.sessionTemplates[0].name).toBe("Monday build");
  });

  it("replaces an exercise without changing its stable slot identity", () => {
    const source = program();
    const template = source.sessionTemplates[0];
    const slot = template.exerciseSlots[1];
    const updated = replaceProgramSlotExercise(
      source,
      template.id,
      slot.id,
      "neutral_cable_row",
      "Upper back / Biceps",
    );
    const replacement = updated.sessionTemplates[0].exerciseSlots[1];

    expect(replacement.id).toBe(slot.id);
    expect(replacement.exerciseId).toBe("neutral_cable_row");
    expect(replacement.targetMuscleIds).toEqual(["back", "arms"]);
    expect(replacement.allowedSubstitutionExerciseIds).toEqual([]);
  });

  it("clamps set, rep, effort, and rest editing to valid program values", () => {
    const source = program();
    const template = source.sessionTemplates[0];
    const slot = template.exerciseSlots[0];
    const updated = updateProgramSlotTraining(source, template.id, slot.id, {
      baseSetCount: 9,
      repMin: 12,
      repMax: 8,
      targetEffort: { scale: "RIR", value: 12 },
      restSeconds: 900,
    });
    const result = updated.sessionTemplates[0].exerciseSlots[0];

    expect(result.baseSetCount).toBe(6);
    expect(result.repRange).toEqual({ min: 12, max: 12 });
    expect(result.startingRepTarget).toBe(12);
    expect(result.targetEffort).toEqual({ scale: "RIR", value: 6 });
    expect(result.restSeconds).toBe(300);
  });

  it("bounds RPE targets independently from RIR targets", () => {
    const source = program();
    const template = source.sessionTemplates[0];
    const slot = template.exerciseSlots[0];
    const updated = updateProgramSlotTraining(source, template.id, slot.id, {
      targetEffort: { scale: "RPE", value: 2 },
    });

    expect(updated.sessionTemplates[0].exerciseSlots[0].targetEffort).toEqual({
      scale: "RPE",
      value: 5,
    });
  });

  it("adds and removes slots while preserving sequential order", () => {
    const source = program();
    const template = source.sessionTemplates[0];
    const added = addProgramSlot(
      source,
      template.id,
      "custom-slot",
      "tricep_pushdown",
      "Triceps",
    );
    const addedSlots = added.sessionTemplates[0].exerciseSlots;
    const last = addedSlots[addedSlots.length - 1];
    expect(last).toMatchObject({
      id: "custom-slot",
      exerciseId: "tricep_pushdown",
      order: addedSlots.length,
      targetMuscleIds: ["arms"],
      baseSetCount: 2,
    });

    const removed = removeProgramSlot(added, template.id, "custom-slot");
    expect(removed.sessionTemplates[0].exerciseSlots.map((slot) => slot.order)).toEqual(
      removed.sessionTemplates[0].exerciseSlots.map((_, index) => index + 1),
    );
  });

  it("adds unique substitutions and removes them explicitly", () => {
    const source = program();
    const template = source.sessionTemplates[0];
    const slot = template.exerciseSlots[0];
    const added = addProgramSubstitution(
      addProgramSubstitution(source, template.id, slot.id, "bench_press"),
      template.id,
      slot.id,
      "bench_press",
    );
    expect(
      added.sessionTemplates[0].exerciseSlots[0].allowedSubstitutionExerciseIds?.filter(
        (id) => id === "bench_press",
      ),
    ).toHaveLength(1);

    const removed = removeProgramSubstitution(
      added,
      template.id,
      slot.id,
      "bench_press",
    );
    expect(
      removed.sessionTemplates[0].exerciseSlots[0].allowedSubstitutionExerciseIds,
    ).not.toContain("bench_press");
  });
});
