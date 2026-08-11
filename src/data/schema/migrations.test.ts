import { describe, expect, it } from "vitest";
import type { SessionLog, Settings } from "@/domain/types";
import type { LegacyMachtBackupV1 } from "./v1";
import { migrateBackupV1ToV2 } from "./migrations";

const LEGACY_SETTINGS: Settings = {
  units: "lbs",
  defaultRest: 90,
  rpeMode: "RIR",
  haptics: true,
  audioCue: false,
};

const session = (patch: Partial<SessionLog> = {}): SessionLog => ({
  id: "session-1",
  date: "2026-06-12",
  template: "Upper A",
  duration: "42m",
  volume: 12_000,
  sets: 2,
  adapted: false,
  isMinimumSession: false,
  exerciseSnapshots: [
    {
      exerciseId: "incline_db_press",
      notes: "Strong today",
      sets: [
        {
          id: 1,
          weight: 70,
          reps: 10,
          rpe: 2,
          completed: true,
          last: "65×10 @2",
        },
        {
          id: 2,
          weight: 70,
          reps: 10,
          rpe: null,
          completed: false,
          last: "65×9 @2",
        },
      ],
    },
  ],
  ...patch,
});

const backup = (history: SessionLog[]): LegacyMachtBackupV1 => ({
  version: 1,
  exportedAt: "2026-06-12",
  history,
  injuries: [],
  settings: LEGACY_SETTINGS,
  customExercises: [],
});

describe("migrateBackupV1ToV2", () => {
  it("preserves completed load, reps, effort, date, exercise identity, and duration", () => {
    const source = backup([session()]);
    const result = migrateBackupV1ToV2(source, "2026-08-10T20:00:00-04:00");

    expect(result.data.version).toBe(2);
    expect(result.data.workouts).toHaveLength(1);

    const workout = result.data.workouts[0];
    expect(workout).toMatchObject({
      id: "session-1",
      name: "Upper A",
      date: "2026-06-12",
      durationSeconds: 2520,
      state: "completed",
      source: "legacy_migration",
    });

    const exercise = workout.exercisePerformances[0];
    expect(exercise.exerciseId).toBe("incline_db_press");
    expect(exercise.note).toBe("Strong today");

    expect(exercise.sets[0]).toMatchObject({
      completed: true,
      actualLoad: 70,
      actualReps: 10,
      actualEffort: { scale: "RIR", value: 2 },
    });
  });

  it("does not misclassify incomplete prefilled sets as actual performance", () => {
    const result = migrateBackupV1ToV2(
      backup([session()]),
      "2026-08-10T20:00:00-04:00",
    );

    const incomplete = result.data.workouts[0].exercisePerformances[0].sets[1];
    expect(incomplete.completed).toBe(false);
    expect(incomplete.actualLoad).toBeUndefined();
    expect(incomplete.actualReps).toBeUndefined();
    expect(incomplete.actualEffort).toBeUndefined();
  });

  it("keeps the complete source backup as a rollback archive", () => {
    const source = backup([session()]);
    const result = migrateBackupV1ToV2(source, "2026-08-10T20:00:00-04:00");

    expect(result.rollbackArchive).toBe(source);
    expect(result.rollbackArchive.history[0].volume).toBe(12_000);
    expect(result.rollbackArchive.history[0].exerciseSnapshots?.[0].sets[1].last).toBe(
      "65×9 @2",
    );
  });

  it("parses legacy clock durations", () => {
    const source = backup([
      session({ id: "a", duration: "1:02:03" }),
      session({ id: "b", duration: "42:30" }),
    ]);
    const result = migrateBackupV1ToV2(source, "2026-08-10T20:00:00-04:00");

    expect(result.data.workouts[0].durationSeconds).toBe(3723);
    expect(result.data.workouts[1].durationSeconds).toBe(2550);
    expect(result.warnings).toHaveLength(0);
  });

  it("warns instead of inventing data when legacy fields cannot be reconstructed", () => {
    const source = backup([
      session({
        duration: "unknown",
        exerciseSnapshots: undefined,
      }),
    ]);
    const result = migrateBackupV1ToV2(source, "2026-08-10T20:00:00-04:00");

    expect(result.data.workouts[0].durationSeconds).toBeUndefined();
    expect(result.data.workouts[0].exercisePerformances).toEqual([]);
    expect(result.warnings.map((warning) => warning.code)).toEqual([
      "UNPARSED_DURATION",
      "MISSING_EXERCISE_SNAPSHOTS",
    ]);
  });

  it("maps legacy user settings without changing units or effort scale", () => {
    const result = migrateBackupV1ToV2(
      backup([]),
      "2026-08-10T20:00:00-04:00",
    );

    expect(result.data.settings).toMatchObject({
      units: "lbs",
      effortScale: "RIR",
      defaultRestSeconds: 90,
      haptics: true,
      audioCue: false,
    });
  });
});
