import { describe, expect, it } from "vitest";
import { migratePersistedActiveWorkout } from "./workoutPersistence";

describe("workout persistence migration", () => {
  it("converts an active legacy session into a resumable v2 free-play workout", () => {
    const migrated = migratePersistedActiveWorkout({
      workoutActive: true,
      workoutName: "Legacy upper",
      workoutDuration: 600,
      startedAt: Date.parse("2026-08-11T12:00:00.000Z"),
      activeWorkoutList: ["bench_press"],
      workoutSets: {
        bench_press: [
          {
            id: 1,
            weight: 100,
            reps: 8,
            rpe: 8,
            completed: true,
            last: "-",
          },
        ],
      },
      exerciseNotes: { bench_press: "Recovered note" },
    });

    expect(migrated.activeV2Workout).toMatchObject({
      name: "Legacy upper",
      state: "active",
      source: "freeplay",
      startedAt: "2026-08-11T12:00:00.000Z",
      exercisePerformances: [
        {
          exerciseId: "bench_press",
          note: "Recovered note",
          sets: [
            {
              completed: true,
              actualLoad: 100,
              actualReps: 8,
            },
          ],
        },
      ],
    });
    expect(migrated.workoutSets).toEqual({});
  });

  it("leaves an existing v2 active workout unchanged", () => {
    const activeV2Workout = {
      id: "workout-v2",
      name: "Planned",
      date: "2026-08-11",
      state: "active" as const,
      exercisePerformances: [],
      adaptedDuringSession: false,
      source: "planned" as const,
    };
    const persisted = {
      workoutActive: true,
      activeV2Workout,
    };

    expect(migratePersistedActiveWorkout(persisted)).toBe(persisted);
  });
});
