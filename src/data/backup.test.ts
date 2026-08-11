import { describe, expect, it } from "vitest";
import type { LegacyMachtBackupV1 } from "@/data/schema/v1";
import {
  createMachtBackupV2,
  parseMachtBackupText,
} from "./backup";

const settings = {
  units: "lbs" as const,
  defaultRest: 90,
  rpeMode: "RIR" as const,
  haptics: true,
  audioCue: false,
};

describe("Macht backup", () => {
  it("round-trips the complete v2 backup envelope", () => {
    const backup = createMachtBackupV2({
      exportedAt: "2026-08-11T12:00:00.000Z",
      programs: [],
      mesocycles: [],
      activeProgramId: undefined,
      workouts: [],
      progressionDecisions: [],
      trainingConstraints: [],
      settings,
      customExercises: [],
      legacyHistory: [],
      legacyInjuries: [],
    });

    const parsed = parseMachtBackupText(JSON.stringify(backup));

    expect(parsed).toEqual({
      ok: true,
      sourceVersion: 2,
      payload: {
        programs: [],
        mesocycles: [],
        activeProgramId: undefined,
        workouts: [],
        progressionDecisions: [],
        trainingConstraints: [],
        settings,
        customExercises: [],
        legacyHistory: [],
        legacyInjuries: [],
      },
    });
  });

  it("round-trips representative v2 source-of-truth records", () => {
    const program = {
      id: "program-1",
      name: "Three day",
      goal: "hypertrophy" as const,
      createdAt: "2026-08-01T12:00:00.000Z",
      updatedAt: "2026-08-10T12:00:00.000Z",
      sessionsPerWeek: 3 as const,
      defaultSessionDurationMinutes: 60,
      musclePriorities: { chest: "grow" as const },
      sessionTemplates: [],
      activeMesocycleId: "meso-1",
    };
    const mesocycle = {
      id: "meso-1",
      programId: "program-1",
      index: 1,
      status: "active" as const,
      createdAt: "2026-08-01T12:00:00.000Z",
      accumulationWeeks: 4,
      includesDeload: true,
      weeks: [],
    };
    const workout = {
      id: "workout-1",
      programId: "program-1",
      mesocycleId: "meso-1",
      name: "Upper",
      date: "2026-08-10",
      startedAt: "2026-08-10T18:00:00.000Z",
      finishedAt: "2026-08-10T18:45:00.000Z",
      durationSeconds: 2700,
      state: "completed" as const,
      exercisePerformances: [],
      adaptedDuringSession: false,
      source: "planned" as const,
    };
    const decision = {
      id: "decision-1",
      createdAt: "2026-08-10T18:45:00.000Z",
      exerciseId: "bench_press",
      decision: "maintain" as const,
      reasons: ["insufficient_evidence" as const],
      evidence: { completedWorkingSets: 3 },
      delta: {},
      userDisposition: "auto_applied" as const,
    };
    const constraint = {
      id: "constraint-1",
      label: "Temporary caution",
      level: "caution" as const,
      source: "user" as const,
      createdAt: "2026-08-09T12:00:00.000Z",
      active: true,
      exerciseIds: ["bench_press"],
      blockedTags: [],
      cautionTags: [],
    };
    const customExercise = {
      id: "custom_press",
      name: "Custom press",
      target: "Chest",
      tags: [],
      loadMode: "external" as const,
      defaultWeight: 20,
      defaultReps: 8,
      createdAt: "2026-08-01T12:00:00.000Z",
    };

    const backup = createMachtBackupV2({
      exportedAt: "2026-08-11T12:00:00.000Z",
      programs: [program],
      mesocycles: [mesocycle],
      activeProgramId: program.id,
      workouts: [workout],
      progressionDecisions: [decision],
      trainingConstraints: [constraint],
      settings,
      customExercises: [customExercise],
      legacyHistory: [],
      legacyInjuries: [],
    });
    const parsed = parseMachtBackupText(JSON.stringify(backup));

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.sourceVersion).toBe(2);
    expect(parsed.payload).toEqual({
      programs: [program],
      mesocycles: [mesocycle],
      activeProgramId: program.id,
      workouts: [workout],
      progressionDecisions: [decision],
      trainingConstraints: [constraint],
      settings,
      customExercises: [customExercise],
      legacyHistory: [],
      legacyInjuries: [],
    });
  });

  it("accepts a v1 backup and keeps its historical records", () => {
    const legacy: LegacyMachtBackupV1 = {
      version: 1,
      exportedAt: "2026-08-01",
      history: [
        {
          id: "legacy-session",
          date: "2026-07-31",
          template: "Upper",
          duration: "45m",
          volume: 1000,
          sets: 6,
          adapted: false,
          isMinimumSession: false,
        },
      ],
      injuries: [],
      settings,
      customExercises: [],
    };

    const parsed = parseMachtBackupText(JSON.stringify(legacy));

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.sourceVersion).toBe(1);
    expect(parsed.payload.legacyHistory).toEqual(legacy.history);
    expect(parsed.payload.workouts).toEqual([]);
    expect(parsed.payload.programs).toEqual([]);
  });

  it("rejects malformed data before a caller can hydrate stores", () => {
    const result = parseMachtBackupText(
      JSON.stringify({
        version: 2,
        exportedAt: "2026-08-11T12:00:00.000Z",
        programs: "not-an-array",
      }),
    );

    expect(result).toEqual({
      ok: false,
      error: "Backup is incomplete or contains invalid data.",
    });
  });

  it("rejects unsupported backup versions", () => {
    expect(parseMachtBackupText('{"version":99}')).toEqual({
      ok: false,
      error: "Unsupported Macht backup version.",
    });
  });
});
