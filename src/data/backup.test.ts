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
