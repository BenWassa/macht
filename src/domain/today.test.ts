import { describe, expect, it } from "vitest";
import type { Mesocycle } from "@/domain/training/types";
import type { SessionLog, TemplatePlan } from "@/domain/types";
import { buildTodayModel } from "./today";

const template: TemplatePlan = {
  id: "upper",
  name: "Upper",
  notes: "",
  exercises: ["leg_press", "hamstring_curl"],
};

const session = (
  id: string,
  date: string,
  e1rm: number,
  duration = "42m",
): SessionLog => ({
  id,
  date,
  template: "Upper",
  duration,
  volume: 1000,
  sets: 6,
  adapted: false,
  isMinimumSession: false,
  exerciseSnapshots: [
    {
      exerciseId: "leg_press",
      e1rm,
      sets: [],
    },
  ],
});

describe("Today model", () => {
  it("builds useful legacy context from real history", () => {
    const model = buildTodayModel({
      sessions: [
        session("new", "2026-08-10", 220, "46m"),
        session("old", "2026-08-03", 210, "42m"),
      ],
      legacyTemplate: template,
      today: new Date("2026-08-10T12:00:00Z"),
      weeklyTarget: 3,
    });

    expect(model.sessionName).toBe("Upper");
    expect(model.exerciseNames).toEqual(["Leg Press", "Hamstring Curl"]);
    expect(model.estimatedDurationMinutes).toBe(44);
    expect(model.completedThisWeek).toBe(1);
    expect(model.program.label).toBe("Current rotation");
    expect(model.recentProgress?.delta).toBe(10);
  });

  it("uses active mesocycle session and week context when available", () => {
    const mesocycle: Mesocycle = {
      id: "meso-1",
      programId: "program-1",
      index: 2,
      name: "Build 2",
      status: "active",
      createdAt: "2026-08-01T00:00:00Z",
      accumulationWeeks: 3,
      includesDeload: true,
      weeks: [
        {
          id: "week-1",
          mesocycleId: "meso-1",
          index: 1,
          phase: "accumulation",
          sessions: [
            {
              id: "session-1",
              weekId: "week-1",
              index: 1,
              name: "Upper A",
              targetDurationMinutes: 55,
              status: "planned",
              prescriptions: [
                {
                  id: "rx-1",
                  plannedSessionId: "session-1",
                  exerciseId: "leg_press",
                  order: 1,
                  targetMuscleIds: ["quads"],
                  plannedSetCount: 3,
                  repRange: { min: 8, max: 12 },
                  source: "program_initial",
                  sets: [],
                },
              ],
            },
          ],
        },
      ],
    };

    const model = buildTodayModel({
      sessions: [],
      legacyTemplate: template,
      activeMesocycle: mesocycle,
      today: new Date("2026-08-10T12:00:00Z"),
    });

    expect(model.sessionName).toBe("Upper A");
    expect(model.estimatedDurationMinutes).toBe(55);
    expect(model.program.label).toBe("Build 2");
    expect(model.program.detail).toBe("Week 1 of 1");
    expect(model.program.phase).toBe("accumulation");
  });
});
