import { describe, expect, it } from "vitest";
import { createStarterProgram } from "@/domain/training/starterProgram";
import type { TrainingConstraint } from "./types";
import {
  assessProgramConstraints,
  constraintSafeSubstitutionIds,
} from "./program";

const constraint = (
  exerciseIds: string[],
  level: "avoid" | "caution" = "avoid",
): TrainingConstraint => ({
  id: `${level}:${exerciseIds.join(",")}`,
  label: "Temporary training limit",
  level,
  source: "user",
  createdAt: "2026-08-11T00:00:00Z",
  active: true,
  exerciseIds,
  blockedTags: [],
  cautionTags: [],
});

const program = () =>
  createStarterProgram({
    id: "program-1",
    name: "Constraint test",
    createdAt: "2026-08-11T00:00:00Z",
    sessionsPerWeek: 3,
  });

describe("Program training constraints", () => {
  it("reports avoid and caution slots without mutating the Program", () => {
    const source = program();
    const firstExercise = source.sessionTemplates[0].exerciseSlots[0].exerciseId;
    const secondExercise = source.sessionTemplates[0].exerciseSlots[1].exerciseId;
    const assessment = assessProgramConstraints(source, [
      constraint([firstExercise], "avoid"),
      constraint([secondExercise], "caution"),
    ]);

    expect(assessment.avoidCount).toBeGreaterThan(0);
    expect(assessment.cautionCount).toBeGreaterThan(0);
    expect(
      assessment.slots.find((slot) => slot.exerciseId === firstExercise)?.result
        .level,
    ).toBe("avoid");
    expect(source.sessionTemplates[0].exerciseSlots[0].exerciseId).toBe(
      firstExercise,
    );
  });

  it("filters actively avoided alternatives while preserving clear alternatives", () => {
    const source = program();
    const slot = source.sessionTemplates
      .flatMap((template) => template.exerciseSlots)
      .find((candidate) =>
        candidate.allowedSubstitutionExerciseIds?.length,
      )!;
    const alternatives = slot.allowedSubstitutionExerciseIds!;
    const blocked = alternatives[0];
    const safe = constraintSafeSubstitutionIds(
      slot,
      [constraint([blocked])],
    );

    expect(safe).not.toContain(blocked);
    expect(safe).toEqual(alternatives.slice(1));
  });

  it("includes an expired avoid rule when no date is supplied, but ignores it after expiry", () => {
    const source = program();
    const exerciseId = source.sessionTemplates[0].exerciseSlots[0].exerciseId;
    const expired: TrainingConstraint = {
      ...constraint([exerciseId]),
      expiresOn: "2026-08-01",
    };

    expect(assessProgramConstraints(source, [expired]).avoidCount).toBeGreaterThan(0);
    expect(
      assessProgramConstraints(source, [expired], [], "2026-08-11").avoidCount,
    ).toBe(0);
  });
});
