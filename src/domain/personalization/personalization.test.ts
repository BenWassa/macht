import { describe, expect, it } from "vitest";
import type { ProgressionDecision } from "@/domain/progression/types";
import type {
  ExercisePrescription,
  Mesocycle,
} from "@/domain/training/types";
import { personalizationConfidence } from "./confidence";
import { buildExerciseResponseProfiles } from "./exerciseResponse";
import { buildPersonalTrainingModel } from "./model";
import { personalizeProgressionDecision } from "./personalizedRecommendation";
import { buildSchedulePattern } from "./schedulePatterns";
import { buildSessionDurationPattern } from "./sessionPatterns";
import { buildMuscleVolumeResponseProfiles } from "./volumeResponse";

const prescription: ExercisePrescription = {
  id: "rx-1",
  plannedSessionId: "session-1",
  programExerciseSlotId: "slot-1",
  exerciseId: "incline_db_press",
  order: 1,
  targetMuscleIds: ["chest"],
  plannedSetCount: 3,
  repRange: { min: 8, max: 12 },
  targetRep: 10,
  targetEffort: { scale: "RIR", value: 2 },
  source: "program_initial",
  sets: [],
};

const decision = (
  id: string,
  type: ProgressionDecision["decision"],
  patch: Partial<ProgressionDecision> = {},
): ProgressionDecision => ({
  id,
  createdAt: `2026-08-${String(Number(id.replace(/\D/g, "")) + 1).padStart(2, "0")}T12:00:00Z`,
  exerciseId: "incline_db_press",
  sourcePrescriptionId: "rx-1",
  decision: type,
  reasons: type === "remove_set" ? ["workload_limit_reached"] : ["rep_target_reached"],
  evidence: {
    plannedWorkingSets: 3,
    recovery: "recovered",
    stimulus: "adequate",
    workload: "appropriate",
    sessionDurationMinutes: 55,
  },
  delta:
    type === "add_set"
      ? { setCountDelta: 1, nextSetCount: 4 }
      : type === "add_rep"
        ? { repTargetDelta: 1, nextRepTarget: 11 }
        : type === "remove_set"
          ? { setCountDelta: -1, nextSetCount: 2 }
          : {},
  userDisposition: "auto_applied",
  ...patch,
});

const mesocycle = (statuses: Array<"completed" | "skipped" | "planned"> = ["completed"]): Mesocycle => ({
  id: "meso-1",
  programId: "program-1",
  index: 1,
  status: "active",
  createdAt: "2026-08-01T00:00:00Z",
  startDate: "2026-08-03",
  accumulationWeeks: 1,
  includesDeload: false,
  weeks: [
    {
      id: "week-1",
      mesocycleId: "meso-1",
      index: 1,
      phase: "accumulation",
      sessions: statuses.map((status, index) => ({
        id: `session-${index + 1}`,
        weekId: "week-1",
        index: index + 1,
        name: `Session ${index + 1}`,
        plannedDate: `2026-08-${String(3 + index).padStart(2, "0")}`,
        targetDurationMinutes: 60,
        status,
        prescriptions: [prescription],
      })),
    },
  ],
});

describe("personalization confidence", () => {
  it("requires repeated evidence before a signal becomes established", () => {
    expect(personalizationConfidence(2)).toBe("insufficient");
    expect(personalizationConfidence(3)).toBe("emerging");
    expect(personalizationConfidence(5)).toBe("emerging");
    expect(personalizationConfidence(6)).toBe("established");
  });
});

describe("exercise response profiles", () => {
  it("keeps sparse exercise history explicitly insufficient", () => {
    const profile = buildExerciseResponseProfiles([
      decision("1", "add_rep"),
      decision("2", "add_rep"),
    ])[0];
    expect(profile.confidence).toBe("insufficient");
    expect(profile.pattern).toBe("insufficient");
    expect(profile.evidenceCount).toBe(2);
  });

  it("identifies repeated fatigue only after established evidence", () => {
    const profile = buildExerciseResponseProfiles([
      decision("1", "remove_set"),
      decision("2", "remove_set"),
      decision("3", "remove_set"),
      decision("4", "maintain", { reasons: ["recovery_incomplete"] }),
      decision("5", "add_rep"),
      decision("6", "maintain"),
    ])[0];
    expect(profile.confidence).toBe("established");
    expect(profile.pattern).toBe("fatigue_limited");
    expect(profile.fatigueInterventionRate).toBeGreaterThanOrEqual(0.35);
  });
});

describe("volume-response guard", () => {
  const fatigueDecision = (id: string): ProgressionDecision =>
    decision(id, "remove_set", {
      evidence: {
        plannedWorkingSets: 3,
        recovery: "meaningful_fatigue",
        stimulus: "adequate",
        workload: "too_much",
        sessionDurationMinutes: 65,
      },
    });

  it("does not expose a fatigue ceiling with emerging evidence", () => {
    const profiles = buildMuscleVolumeResponseProfiles(
      [fatigueDecision("1"), fatigueDecision("2"), decision("3", "maintain")],
      [mesocycle()],
    );
    const chest = profiles.find((profile) => profile.muscleId === "chest")!;
    expect(chest.confidence).toBe("emerging");
    expect(chest.repeatedFatigueAtOrAboveSets).toBeUndefined();
  });

  it("suppresses only an add-set proposal after established repeated fatigue", () => {
    const history = [
      fatigueDecision("1"),
      fatigueDecision("2"),
      decision("3", "maintain"),
      decision("4", "maintain"),
      decision("5", "add_rep"),
      decision("6", "maintain"),
    ];
    const model = buildPersonalTrainingModel({
      decisions: history,
      mesocycles: [mesocycle()],
      asOfDate: "2026-08-20",
      generatedAt: "2026-08-20T12:00:00Z",
    });
    const base = decision("7", "add_set", {
      delta: {
        setCountDelta: 1,
        nextSetCount: 4,
        nextTargetEffort: { scale: "RIR", value: 1.5 },
      },
    });
    const result = personalizeProgressionDecision(base, prescription, model);

    expect(result.baseDecision).toBe(base);
    expect(result.adjustment).toMatchObject({
      kind: "suppress_volume_increase",
      confidence: "established",
      muscleIds: ["chest"],
    });
    expect(result.finalDecision.decision).toBe("maintain");
    expect(result.finalDecision.delta.nextSetCount).toBeUndefined();
    expect(result.finalDecision.delta.nextTargetEffort).toEqual({
      scale: "RIR",
      value: 1.5,
    });
  });

  it("leaves rep progression unchanged even when a fatigue guard exists", () => {
    const history = [
      fatigueDecision("1"),
      fatigueDecision("2"),
      decision("3", "maintain"),
      decision("4", "maintain"),
      decision("5", "maintain"),
      decision("6", "maintain"),
    ];
    const model = buildPersonalTrainingModel({
      decisions: history,
      mesocycles: [mesocycle()],
      asOfDate: "2026-08-20",
    });
    const base = decision("7", "add_rep");
    const result = personalizeProgressionDecision(base, prescription, model);
    expect(result.finalDecision).toBe(base);
    expect(result.adjustment).toBeUndefined();
  });
});

describe("session and schedule patterns", () => {
  it("counts one session once when multiple exercise decisions share the same finish time", () => {
    const sharedTime = "2026-08-10T13:00:00Z";
    const pattern = buildSessionDurationPattern([
      decision("1", "maintain", {
        createdAt: sharedTime,
        evidence: { sessionDurationMinutes: 60, workload: "appropriate" },
      }),
      decision("2", "add_rep", {
        createdAt: sharedTime,
        evidence: { sessionDurationMinutes: 60, workload: "appropriate" },
      }),
      decision("3", "maintain", {
        createdAt: "2026-08-11T13:00:00Z",
        evidence: { sessionDurationMinutes: 65, workload: "too_much" },
      }),
    ]);
    expect(pattern.observations).toBe(2);
    expect(pattern.confidence).toBe("insufficient");
  });

  it("identifies stronger and weaker weekdays only after repeated planned history", () => {
    const cycle: Mesocycle = {
      ...mesocycle(),
      weeks: [
        {
          id: "week-1",
          mesocycleId: "meso-1",
          index: 1,
          phase: "accumulation",
          sessions: [
            ["2026-07-06", "completed"],
            ["2026-07-08", "skipped"],
            ["2026-07-13", "completed"],
            ["2026-07-15", "skipped"],
            ["2026-07-20", "completed"],
            ["2026-07-22", "completed"],
            ["2026-07-27", "completed"],
            ["2026-07-29", "skipped"],
          ].map(([plannedDate, status], index) => ({
            id: `schedule-${index}`,
            weekId: "week-1",
            index: index + 1,
            name: "Scheduled",
            plannedDate,
            targetDurationMinutes: 60,
            status: status as "completed" | "skipped",
            prescriptions: [],
          })),
        },
      ],
    };
    const pattern = buildSchedulePattern([cycle], "2026-08-01");
    expect(pattern.confidence).toBe("established");
    expect(pattern.strongerWeekdays).toContain(1);
    expect(pattern.weakerWeekdays).toContain(3);
    expect(pattern.explanation).toContain("move an existing session rather than add one");
  });
});
