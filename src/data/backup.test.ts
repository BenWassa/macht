import { describe, expect, it } from "vitest";
import type { MachtBackupV1 } from "./backup";
import { createBackupV2, parseBackup } from "./backup";

const settings = {
  units: "lbs" as const,
  defaultRest: 90,
  rpeMode: "RPE" as const,
  haptics: true,
  audioCue: false,
};

describe("Macht backup", () => {
  it("round-trips the complete v2 durable payload", () => {
    const backup = createBackupV2({
      legacyHistory: [],
      workouts: [],
      programs: [],
      mesocycles: [],
      progressionDecisions: [],
      trainingConstraints: [
        {
          id: "constraint-1",
          label: "Temporary pressing limit",
          level: "caution",
          source: "user",
          createdAt: "2026-08-10T12:00:00Z",
          active: true,
          exerciseIds: ["bench_press"],
          blockedTags: [],
          cautionTags: ["pressing"],
        },
      ],
      settings,
      customExercises: [],
      exportedAt: "2026-08-10T22:00:00Z",
    });

    expect(parseBackup(JSON.parse(JSON.stringify(backup)))).toEqual({
      sourceVersion: 2,
      legacyHistory: [],
      workouts: [],
      programs: [],
      mesocycles: [],
      progressionDecisions: [],
      trainingConstraints: backup.trainingConstraints,
      settings,
      customExercises: [],
      legacyInjuries: [],
    });
  });

  it("restores v1 backups and translates injuries into generic constraints", () => {
    const legacy: MachtBackupV1 = {
      version: 1,
      exportedAt: "2025-01-01T00:00:00Z",
      history: [],
      injuries: [
        {
          id: "legacy-shoulder",
          name: "Shoulder limitation",
          severity: "caution",
          forbiddenTags: ["overhead"],
          cautionTags: ["pressing"],
          notes: "Temporary",
          dateAdded: "2025-01-01",
        },
      ],
      settings,
      customExercises: [],
    };

    const restored = parseBackup(legacy);
    expect(restored.sourceVersion).toBe(1);
    expect(restored.workouts).toEqual([]);
    expect(restored.trainingConstraints[0]).toMatchObject({
      id: "legacy:legacy-shoulder",
      label: "Shoulder limitation",
      source: "legacy_injury",
      active: true,
      blockedTags: ["overhead"],
    });
    expect(restored.legacyInjuries).toEqual(legacy.injuries);
  });

  it("rejects unsupported or incomplete payloads", () => {
    expect(() => parseBackup({ version: 3 })).toThrow(/Unsupported/);
    expect(() => parseBackup({ version: 2, workouts: [] })).toThrow(/missing/i);
  });
});
