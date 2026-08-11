import { describe, expect, it } from "vitest";
import type { ExerciseInjury } from "@/domain/types";
import { evaluateExerciseConstraints, permittedExerciseIds } from "./evaluate";
import { constraintFromLegacyInjury } from "./legacy";
import type { TrainingConstraint } from "./types";

const exercise = {
  id: "incline_db_press",
  name: "Incline Dumbbell Press",
  target: "Chest / Triceps",
  tags: ["anterior_shoulder_load", "return_to_pressing"],
};

const constraint = (
  patch: Partial<TrainingConstraint> = {},
): TrainingConstraint => ({
  id: "constraint-1",
  label: "Temporary pressing limit",
  level: "avoid",
  source: "user",
  createdAt: "2026-08-11T00:00:00Z",
  active: true,
  exerciseIds: [],
  blockedTags: ["anterior_shoulder_load"],
  cautionTags: [],
  ...patch,
});

describe("training constraints", () => {
  it("marks a blocked movement as avoid without injury-specific logic", () => {
    const result = evaluateExerciseConstraints(exercise, [constraint()]);
    expect(result.level).toBe("avoid");
    expect(result.matches[0]).toMatchObject({
      label: "Temporary pressing limit",
      reasons: ["movement"],
    });
  });

  it("supports caution-only movement tags", () => {
    const result = evaluateExerciseConstraints(exercise, [
      constraint({
        level: "caution",
        blockedTags: [],
        cautionTags: ["return_to_pressing"],
      }),
    ]);
    expect(result.level).toBe("caution");
  });

  it("ignores inactive or expired constraints", () => {
    expect(
      evaluateExerciseConstraints(exercise, [constraint({ active: false })]).level,
    ).toBe("clear");
    expect(
      evaluateExerciseConstraints(
        exercise,
        [constraint({ expiresOn: "2026-08-01" })],
        "2026-08-11",
      ).level,
    ).toBe("clear");
  });

  it("filters only avoid-level exercises from a permitted exercise list", () => {
    const clear = {
      id: "leg_press",
      name: "Leg Press",
      target: "Quads / Glutes",
      tags: ["lower_body_primary"],
    };
    expect(
      permittedExerciseIds([exercise, clear], [constraint()]),
    ).toEqual(["leg_press"]);
  });
});

describe("legacy injury migration", () => {
  it("preserves legacy behavior and metadata in a generic constraint", () => {
    const legacy: ExerciseInjury = {
      id: "shoulder-1",
      name: "Shoulder limitation",
      severity: "avoid",
      forbiddenTags: ["overhead_load"],
      cautionTags: ["return_to_pressing"],
      notes: "Temporary training note",
      dateAdded: "2026-07-01",
      targetReturn: "2026-09-01",
    };
    expect(constraintFromLegacyInjury(legacy)).toEqual({
      id: "legacy:shoulder-1",
      label: "Shoulder limitation",
      level: "avoid",
      source: "legacy_injury",
      createdAt: "2026-07-01T00:00:00Z",
      active: true,
      exerciseIds: [],
      blockedTags: ["overhead_load"],
      cautionTags: ["return_to_pressing"],
      notes: "Temporary training note",
      expiresOn: "2026-09-01",
    });
  });

  it("maps cleared legacy records to inactive constraints", () => {
    const legacy: ExerciseInjury = {
      id: "cleared",
      name: "Old limitation",
      severity: "monitor",
      forbiddenTags: [],
      notes: "",
      dateAdded: "2026-06-01",
      clearedDate: "2026-07-01",
    };
    expect(constraintFromLegacyInjury(legacy)).toMatchObject({
      level: "caution",
      active: false,
    });
  });
});
