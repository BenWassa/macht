import { describe, expect, it } from "vitest";
import type { ProgressionDecision } from "@/domain/progression/types";
import type {
  ProgressRecord,
  ProgressWorkout,
} from "@/domain/progress/model";
import type { Mesocycle } from "@/domain/training/types";
import { finalizeMesocycleState } from "./cycleState";
import { buildTrainingMilestones } from "./milestones";
import {
  applyScheduleRecovery,
  findMissedSessionRecovery,
} from "./scheduleRecovery";
import { rollingPlanStatus, weeklyPlanStatus } from "./weeklyPlan";

const workout = (id: string, date: string): ProgressWorkout => ({
  id,
  date,
  name: "Planned session",
  source: "v2",
  programId: "program-1",
  mesocycleId: "meso-1",
  weekId: "week-1",
  totalSets: 6,
  totalVolume: 1000,
  exercises: [],
});

const cycle = (): Mesocycle => ({
  id: "meso-1",
  programId: "program-1",
  index: 1,
  status: "active",
  createdAt: "2026-08-01T00:00:00Z",
  startDate: "2026-08-03",
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
          id: "session-a",
          weekId: "week-1",
          index: 1,
          name: "Full A",
          plannedDate: "2026-08-03",
          targetDurationMinutes: 60,
          status: "planned",
          prescriptions: [],
        },
        {
          id: "session-b",
          weekId: "week-1",
          index: 2,
          name: "Full B",
          plannedDate: "2026-08-05",
          targetDurationMinutes: 60,
          status: "planned",
          prescriptions: [],
        },
      ],
    },
    {
      id: "week-2",
      mesocycleId: "meso-1",
      index: 2,
      phase: "accumulation",
      sessions: [
        {
          id: "session-c",
          weekId: "week-2",
          index: 1,
          name: "Full C",
          plannedDate: "2026-08-10",
          targetDurationMinutes: 60,
          status: "planned",
          prescriptions: [],
        },
      ],
    },
  ],
});

describe("weekly plan status", () => {
  it("caps coverage at the chosen weekly plan even when extra sessions were completed", () => {
    const workouts = [
      workout("a", "2026-08-03"),
      workout("b", "2026-08-04"),
      workout("c", "2026-08-05"),
      workout("d", "2026-08-06"),
    ];
    const status = weeklyPlanStatus(workouts, "2026-08-06", 3);

    expect(status).toMatchObject({
      plannedSessions: 3,
      completedSessions: 4,
      remainingSessions: 0,
      coverage: 1,
      planMet: true,
    });
  });

  it("reports rolling coverage without requiring consecutive completed weeks", () => {
    const workouts = [
      workout("a", "2026-07-20"),
      workout("b", "2026-07-21"),
      workout("c", "2026-07-22"),
      workout("d", "2026-08-03"),
      workout("e", "2026-08-04"),
      workout("f", "2026-08-05"),
    ];
    const status = rollingPlanStatus(workouts, "2026-08-10", 3, 4);

    expect(status.weeksMet).toBe(2);
    expect(status.completedPlannedSessions).toBe(6);
    expect(status.coverage).toBeCloseTo(0.5);
  });
});

describe("missed-session recovery", () => {
  it("finds the earliest overdue planned session and a future open day", () => {
    const recovery = findMissedSessionRecovery(cycle(), "2026-08-06");

    expect(recovery).toMatchObject({
      plannedSessionId: "session-a",
      sessionName: "Full A",
      plannedDate: "2026-08-03",
      daysOverdue: 3,
    });
    expect(recovery?.suggestedMoveDate).toBe("2026-08-07");
  });

  it("moves an overdue session to today and preserves later session order", () => {
    const source = cycle();
    const recovery = findMissedSessionRecovery(source, "2026-08-06")!;
    const repaired = applyScheduleRecovery(
      source,
      recovery,
      "train_today",
      "2026-08-06",
    );
    const sessions = repaired.weeks.flatMap((week) => week.sessions);

    expect(sessions[0].plannedDate).toBe("2026-08-06");
    expect(sessions[1].plannedDate! >= sessions[0].plannedDate!).toBe(true);
    expect(sessions[2].plannedDate! >= sessions[1].plannedDate!).toBe(true);
  });

  it("can mark the missed session skipped while leaving later dates intact", () => {
    const source = cycle();
    const recovery = findMissedSessionRecovery(source, "2026-08-06")!;
    const skipped = applyScheduleRecovery(
      source,
      recovery,
      "skip",
      "2026-08-06",
    );

    expect(skipped.weeks[0].sessions[0].status).toBe("skipped");
    expect(skipped.weeks[0].sessions[1].plannedDate).toBe("2026-08-05");
  });
});

describe("cycle state", () => {
  it("completes an active cycle only after every session has a terminal outcome", () => {
    const source = cycle();
    const partial = {
      ...source,
      weeks: source.weeks.map((week) => ({
        ...week,
        sessions: week.sessions.map((session) =>
          session.id === "session-a"
            ? { ...session, status: "completed" as const }
            : session,
        ),
      })),
    };
    expect(finalizeMesocycleState(partial).status).toBe("active");

    const finished = {
      ...partial,
      weeks: partial.weeks.map((week) => ({
        ...week,
        sessions: week.sessions.map((session) => ({
          ...session,
          status: session.id === "session-c" ? ("skipped" as const) : ("completed" as const),
        })),
      })),
    };
    expect(finalizeMesocycleState(finished).status).toBe("completed");
  });
});

describe("real training milestones", () => {
  it("tracks real events and does not require a daily or consecutive-week streak", () => {
    const workouts = [
      workout("a", "2026-07-20"),
      workout("b", "2026-07-21"),
      workout("c", "2026-07-22"),
      workout("d", "2026-08-03"),
      workout("e", "2026-08-04"),
      workout("f", "2026-08-05"),
      workout("g", "2026-08-10"),
      workout("h", "2026-08-11"),
      workout("i", "2026-08-12"),
      workout("j", "2026-08-17"),
      workout("k", "2026-08-18"),
      workout("l", "2026-08-19"),
    ];
    const record: ProgressRecord = {
      workoutId: "d",
      date: "2026-08-03",
      exerciseId: "incline_db_press",
      exerciseName: "Incline Dumbbell Press",
      type: "load",
      value: 35,
      previousBest: 32.5,
    };
    const decision: ProgressionDecision = {
      id: "decision-1",
      createdAt: "2026-08-04T12:00:00Z",
      exerciseId: "incline_db_press",
      decision: "add_rep",
      reasons: ["rep_target_reached"],
      evidence: {},
      delta: { nextRepTarget: 9 },
      userDisposition: "auto_applied",
    };
    const completedCycle = {
      ...cycle(),
      status: "completed" as const,
    };
    const rolling = rollingPlanStatus(workouts, "2026-08-19", 3, 5);
    const milestones = buildTrainingMilestones({
      workouts,
      records: [record],
      decisions: [decision],
      mesocycles: [completedCycle],
      rollingPlan: rolling,
    });

    expect(
      milestones.filter((milestone) => milestone.achieved).map((milestone) => milestone.type),
    ).toEqual([
      "first_planned_session",
      "first_performance_record",
      "first_adaptive_change",
      "first_completed_cycle",
      "four_planned_weeks",
    ]);
  });
});
