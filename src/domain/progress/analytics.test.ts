import { describe, expect, it } from "vitest";
import type { WorkoutSession } from "@/domain/execution/types";
import type { ProgressionDecision } from "@/domain/progression/types";
import type { Mesocycle } from "@/domain/training/types";
import type { SessionLog } from "@/domain/types";
import { buildConsistencyWeeks, plannedSessionCoverage } from "./consistency";
import { buildMesocycleSummaries } from "./cycles";
import { detectProgressRecords } from "./exercises";
import { buildMuscleProgress } from "./muscles";
import { normalizeProgressHistory } from "./normalize";
import { buildExerciseResponseHistory } from "./responses";

const v2Workout = (
  id: string,
  date: string,
  load: number,
  reps: number,
  patch: Partial<WorkoutSession> = {},
): WorkoutSession => ({
  id,
  plannedSessionId: `planned-${id}`,
  programId: "program-1",
  mesocycleId: "meso-1",
  weekId: "week-1",
  name: "Upper",
  date,
  startedAt: `${date}T12:00:00Z`,
  finishedAt: `${date}T13:00:00Z`,
  durationSeconds: 3600,
  state: "completed",
  adaptedDuringSession: false,
  source: "planned",
  exercisePerformances: [
    {
      id: `performance-${id}`,
      exerciseId: "incline_db_press",
      prescriptionId: `rx-${id}`,
      prescription: {
        exercisePrescriptionId: `rx-${id}`,
        programExerciseSlotId: "slot-press",
        exerciseId: "incline_db_press",
        targetMuscleIds: ["chest", "triceps"],
        plannedSetCount: 1,
        repRange: { min: 5, max: 10 },
        source: "program_initial",
      },
      order: 1,
      sets: [
        {
          id: `set-${id}`,
          index: 0,
          completed: true,
          actualLoad: load,
          actualReps: reps,
          actualEffort: { scale: "RIR", value: 2 },
          prescription: {
            setPrescriptionId: `set-rx-${id}`,
            exercisePrescriptionId: `rx-${id}`,
            type: "working",
            targetLoad: load,
            repRange: { min: 5, max: 10 },
            targetReps: reps,
          },
        },
      ],
    },
  ],
  ...patch,
});

const legacySession = (
  id: string,
  date: string,
  load: number,
  reps: number,
): SessionLog => ({
  id,
  date,
  template: "Legacy upper",
  duration: "45m",
  volume: load * reps,
  sets: 1,
  adapted: false,
  isMinimumSession: false,
  exerciseSnapshots: [
    {
      exerciseId: "incline_db_press",
      sets: [
        {
          id: 1,
          weight: load,
          reps,
          rpe: 8,
          completed: true,
          last: "-",
        },
      ],
    },
  ],
});

describe("Progress analytics", () => {
  it("prefers v2 history and removes its dual-written legacy session by id", () => {
    const history = normalizeProgressHistory(
      [v2Workout("shared", "2026-08-03", 100, 5)],
      [
        legacySession("shared", "2026-08-03", 1, 1),
        legacySession("legacy-only", "2026-08-05", 80, 8),
      ],
    );

    expect(history).toHaveLength(2);
    expect(history.find((workout) => workout.id === "shared")).toMatchObject({
      source: "v2",
      totalVolume: 500,
    });
    expect(history.filter((workout) => workout.id === "shared")).toHaveLength(1);
    expect(history.find((workout) => workout.id === "legacy-only")?.source).toBe(
      "legacy",
    );
  });

  it("treats the first exposure as a baseline and records later improvements", () => {
    const history = normalizeProgressHistory(
      [
        v2Workout("one", "2026-08-01", 100, 5),
        v2Workout("two", "2026-08-08", 105, 5),
      ],
      [],
    );
    const records = detectProgressRecords(history);

    expect(records).toHaveLength(2);
    expect(records.map((record) => record.type).sort()).toEqual([
      "e1rm",
      "load",
    ]);
    expect(records.every((record) => record.workoutId === "two")).toBe(true);
  });

  it("builds rolling weekly session coverage without rewarding sessions beyond the plan", () => {
    const history = normalizeProgressHistory(
      [
        v2Workout("a", "2026-08-03", 100, 5),
        v2Workout("b", "2026-08-05", 100, 5),
        v2Workout("c", "2026-08-07", 100, 5),
        v2Workout("d", "2026-08-08", 100, 5),
        v2Workout("e", "2026-08-10", 100, 5),
      ],
      [],
    );
    const weeks = buildConsistencyWeeks(history, "2026-08-10", 2, 3);

    expect(weeks.map((week) => week.completedSessions)).toEqual([4, 1]);
    expect(plannedSessionCoverage(weeks)).toBeCloseTo(4 / 6);
  });

  it("normalizes biceps and triceps into the Arms training view", () => {
    const history = normalizeProgressHistory(
      [v2Workout("a", "2026-08-08", 100, 5)],
      [],
    );
    const muscles = buildMuscleProgress(
      history,
      "2026-08-10",
      28,
      { chest: "emphasize", arms: "maintain" },
    );

    expect(muscles.find((muscle) => muscle.muscleId === "chest")).toMatchObject({
      targetedSets: 1,
      priority: "emphasize",
    });
    expect(muscles.find((muscle) => muscle.muscleId === "arms")).toMatchObject({
      targetedSets: 1,
      priority: "maintain",
    });
  });

  it("attributes v2 sessions and records to the correct mesocycle", () => {
    const history = normalizeProgressHistory(
      [
        v2Workout("one", "2026-08-01", 100, 5),
        v2Workout("two", "2026-08-08", 105, 5),
      ],
      [],
    );
    const records = detectProgressRecords(history);
    const cycle: Mesocycle = {
      id: "meso-1",
      programId: "program-1",
      index: 1,
      name: "Cycle 1",
      status: "active",
      createdAt: "2026-08-01T00:00:00Z",
      startDate: "2026-08-01",
      accumulationWeeks: 2,
      includesDeload: false,
      weeks: [
        {
          id: "week-1",
          mesocycleId: "meso-1",
          index: 1,
          phase: "accumulation",
          sessions: [
            {
              id: "planned-one",
              weekId: "week-1",
              index: 1,
              name: "Upper",
              targetDurationMinutes: 60,
              status: "completed",
              prescriptions: [],
            },
            {
              id: "planned-two",
              weekId: "week-1",
              index: 2,
              name: "Upper",
              targetDurationMinutes: 60,
              status: "completed",
              prescriptions: [],
            },
          ],
        },
      ],
    };
    const summary = buildMesocycleSummaries([cycle], history, records)[0];

    expect(summary).toMatchObject({
      completedSessions: 2,
      plannedSessions: 2,
      completionRate: 1,
      totalSets: 2,
      records: 2,
    });
  });

  it("turns persisted progression decisions into readable exercise response history", () => {
    const decision: ProgressionDecision = {
      id: "decision-1",
      createdAt: "2026-08-09T12:00:00Z",
      exerciseId: "incline_db_press",
      sourcePrescriptionId: "rx-1",
      decision: "add_rep",
      reasons: ["rep_target_reached", "effort_on_target"],
      evidence: {},
      delta: { nextRepTarget: 9 },
      userDisposition: "auto_applied",
    };
    const history = buildExerciseResponseHistory([decision]);

    expect(history[0].events[0]).toMatchObject({
      decision: "add_rep",
      summary: "Target 9 reps",
    });
    expect(history[0].events[0].reasons[0]).toContain("Rep target");
  });
});
