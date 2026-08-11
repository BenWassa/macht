import { describe, expect, it } from "vitest";
import { findSubstitutionCandidates } from "@/domain/exercises/substitutions";
import type { ProgressionDecision } from "@/domain/progression/types";
import { generateMesocycle } from "./mesocycle";
import { createProgram } from "./program";
import {
  applyDecisionToNextSlotOccurrence,
  substituteSlotFromWeek,
} from "./prescriptionUpdates";
import { repairScheduleAfterMissedSession } from "./scheduling";
import { allocateSetsWithinDuration } from "./sessionBudget";
import type { ProgramExerciseSlot } from "./types";

const pressSlot: ProgramExerciseSlot = {
  id: "press-slot",
  exerciseId: "incline-db-press",
  order: 1,
  targetMuscleIds: ["chest"],
  baseSetCount: 3,
  repRange: { min: 8, max: 12 },
  startingRepTarget: 10,
  startingLoad: 30,
  substitutionFamilyId: "press",
  allowedSubstitutionExerciseIds: ["machine-press", "db-press"],
};

const rowSlot: ProgramExerciseSlot = {
  id: "row-slot",
  exerciseId: "cable-row",
  order: 2,
  targetMuscleIds: ["back"],
  baseSetCount: 3,
  repRange: { min: 8, max: 12 },
  startingRepTarget: 10,
};

function program() {
  return createProgram({
    id: "program-1",
    name: "Four-week build",
    goal: "hypertrophy",
    createdAt: "2026-08-10T20:00:00Z",
    sessionsPerWeek: 2,
    defaultSessionDurationMinutes: 45,
    musclePriorities: { chest: "emphasize", back: "grow" },
    preferredWeekdays: [1, 4],
    availableEquipment: ["dumbbell", "machine"],
    sessionTemplates: [
      { id: "upper-a", name: "Upper A", order: 1, exerciseSlots: [pressSlot, rowSlot] },
      { id: "upper-b", name: "Upper B", order: 2, exerciseSlots: [pressSlot, rowSlot] },
    ],
  });
}

function mesocycle() {
  return generateMesocycle({
    program: program(),
    mesocycleId: "meso-1",
    index: 1,
    createdAt: "2026-08-10T20:00:00Z",
    startDate: "2026-08-31",
    accumulationWeeks: 3,
    includesDeload: true,
    startingEffort: { scale: "RIR", value: 3 },
  });
}

describe("program and mesocycle generation", () => {
  it("builds accumulation weeks plus a deload with stable slot identity", () => {
    const result = mesocycle();
    expect(result.weeks).toHaveLength(4);
    expect(result.weeks.map((week) => week.phase)).toEqual([
      "accumulation",
      "accumulation",
      "accumulation",
      "deload",
    ]);
    expect(result.weeks[0].sessions.map((session) => session.plannedDate)).toEqual([
      "2026-08-31",
      "2026-09-03",
    ]);
    expect(result.weeks[1].targetEffort?.value).toBe(2.5);
    expect(result.weeks[3].sessions[0].prescriptions[0].plannedSetCount).toBe(2);
    expect(result.weeks[0].sessions[0].prescriptions[0].programExerciseSlotId).toBe("press-slot");
  });

  it("uses the time budget to reduce lower-priority work first", () => {
    const maintainSlot = { ...rowSlot, id: "maintain", targetMuscleIds: ["triceps"] };
    const counts = allocateSetsWithinDuration(
      [pressSlot, maintainSlot],
      17.5,
      { chest: "emphasize", triceps: "maintain" },
    );
    expect(counts.get("press-slot")).toBe(3);
    expect(counts.get("maintain")).toBe(2);
  });

  it("repairs a missed session while preserving sequence", () => {
    const source = mesocycle();
    const missedId = source.weeks[0].sessions[0].id;
    const repaired = repairScheduleAfterMissedSession(source, missedId, "2026-09-03");
    expect(repaired.weeks[0].sessions[0].plannedDate).toBe("2026-09-03");
    expect(repaired.weeks[0].sessions[1].plannedDate).toBe("2026-09-04");
    expect(repaired.weeks[1].sessions[0].plannedDate).toBe("2026-09-07");
  });
});

describe("adaptive prescriptions", () => {
  it("applies a progression decision only to the next occurrence of the same slot", () => {
    const source = mesocycle();
    const first = source.weeks[0].sessions[0].prescriptions[0];
    const decision: ProgressionDecision = {
      id: "decision-1",
      createdAt: "2026-09-01T00:00:00Z",
      exerciseId: first.exerciseId,
      sourcePrescriptionId: first.id,
      decision: "add_rep",
      reasons: ["rep_target_reached"],
      evidence: {},
      delta: { repTargetDelta: 1, nextRepTarget: 11 },
      userDisposition: "pending",
    };
    const updated = applyDecisionToNextSlotOccurrence(source, first.id, decision);
    expect(updated.weeks[1].sessions[0].prescriptions[0].targetRep).toBe(11);
    expect(updated.weeks[1].sessions[0].prescriptions[0].source).toBe("progression_engine");
    expect(updated.weeks[2].sessions[0].prescriptions[0].targetRep).toBe(10);
  });

  it("supports a user substitution from a selected week onward", () => {
    const updated = substituteSlotFromWeek(mesocycle(), "press-slot", "machine-press", 2);
    expect(updated.weeks[0].sessions[0].prescriptions[0].exerciseId).toBe("incline-db-press");
    expect(updated.weeks[1].sessions[0].prescriptions[0].exerciseId).toBe("machine-press");
    expect(updated.weeks[3].sessions[1].prescriptions[0].exerciseId).toBe("machine-press");
  });

  it("filters substitution candidates by family, allow-list, and equipment", () => {
    const candidates = findSubstitutionCandidates(
      pressSlot,
      [
        { exerciseId: "machine-press", substitutionFamilyId: "press", equipment: ["machine"] },
        { exerciseId: "db-press", substitutionFamilyId: "press", equipment: ["dumbbell"] },
        { exerciseId: "machine-row", substitutionFamilyId: "row", equipment: ["machine"] },
      ],
      ["machine"],
    );
    expect(candidates.map((candidate) => candidate.exerciseId)).toEqual(["machine-press"]);
  });
});
