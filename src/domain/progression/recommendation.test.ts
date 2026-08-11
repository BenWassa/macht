import { describe, expect, it } from "vitest";
import type { ExercisePerformance } from "@/domain/execution/types";
import type { ExercisePrescription } from "@/domain/training/types";
import { effortTargetForWeek } from "./effortProgression";
import { explainProgressionDecision } from "./explanation";
import { recommendProgression } from "./recommendation";
import { recommendVolumeProgression } from "./volumeProgression";

const prescription = (
  patch: Partial<ExercisePrescription> = {},
): ExercisePrescription => ({
  id: "rx-1",
  plannedSessionId: "session-plan-1",
  exerciseId: "incline_db_press",
  order: 0,
  targetMuscleIds: ["chest"],
  plannedSetCount: 3,
  repRange: { min: 8, max: 12 },
  targetRep: 10,
  targetEffort: { scale: "RIR", value: 2 },
  recommendedLoad: 30,
  source: "program_initial",
  sets: [0, 1, 2].map((index) => ({
    id: `set-rx-${index}`,
    exercisePrescriptionId: "rx-1",
    index,
    type: "working",
    targetLoad: 30,
    repRange: { min: 8, max: 12 },
    targetReps: 10,
    targetEffort: { scale: "RIR", value: 2 },
  })),
  ...patch,
});

const performance = (
  reps: number[],
  effort: number | null = 2,
): ExercisePerformance => ({
  id: "perf-1",
  exerciseId: "incline_db_press",
  prescriptionId: "rx-1",
  order: 0,
  sets: reps.map((actualReps, index) => ({
    id: `set-perf-${index}`,
    index,
    completed: true,
    actualLoad: 30,
    actualReps,
    ...(effort == null
      ? {}
      : { actualEffort: { scale: "RIR" as const, value: effort } }),
  })),
});

const recommend = (
  rx: ExercisePrescription,
  perf: ExercisePerformance,
  patch: Partial<Parameters<typeof recommendProgression>[0]> = {},
) =>
  recommendProgression({
    decisionId: "decision-1",
    createdAt: "2026-08-10T20:00:00-04:00",
    prescription: rx,
    performance: perf,
    musclePriority: "grow",
    availableLoadIncrement: 2.5,
    mesocycleWeek: 2,
    mesocyclePhase: "accumulation",
    baseEffortTarget: { scale: "RIR", value: 3 },
    ...patch,
  });

describe("effortTargetForWeek", () => {
  it("progresses effort gradually while keeping an accumulation reserve", () => {
    expect(
      effortTargetForWeek({
        scale: "RIR",
        startingValue: 3,
        weekIndex: 3,
        phase: "accumulation",
      }),
    ).toEqual({ scale: "RIR", value: 2 });

    expect(
      effortTargetForWeek({
        scale: "RIR",
        startingValue: 2,
        weekIndex: 8,
        phase: "accumulation",
      }).value,
    ).toBe(1);
  });

  it("makes deload effort materially easier", () => {
    expect(
      effortTargetForWeek({
        scale: "RPE",
        startingValue: 8,
        weekIndex: 5,
        phase: "deload",
      }),
    ).toEqual({ scale: "RPE", value: 6 });
  });
});

describe("recommendProgression", () => {
  it("adds one rep target after all planned sets meet the current target", () => {
    const decision = recommend(prescription(), performance([10, 10, 10]));

    expect(decision.decision).toBe("add_rep");
    expect(decision.delta.nextRepTarget).toBe(11);
    expect(decision.reasons).toContain("rep_target_reached");
    expect(decision.reasons).toContain("effort_on_target");
  });

  it("adds load after the top of the rep range is achieved at acceptable effort", () => {
    const rx = prescription({ targetRep: 12 });
    const decision = recommend(rx, performance([12, 12, 12]));

    expect(decision.decision).toBe("add_load");
    expect(decision.delta).toMatchObject({
      loadDelta: 2.5,
      nextLoad: 32.5,
      nextRepTarget: 8,
    });
  });

  it("holds at the top of the rep range when effort evidence is missing", () => {
    const rx = prescription({ targetRep: 12 });
    const decision = recommend(rx, performance([12, 12, 12], null));

    expect(decision.decision).toBe("maintain");
    expect(decision.reasons).toContain("insufficient_evidence");
  });

  it("holds progression when completed work was harder than prescribed", () => {
    const decision = recommend(prescription(), performance([10, 10, 10], 0));

    expect(decision.decision).toBe("maintain");
    expect(decision.reasons).toContain("effort_too_high");
  });

  it("holds when the planned working-set count was not completed", () => {
    const decision = recommend(prescription(), performance([10, 10]));

    expect(decision.decision).toBe("maintain");
    expect(decision.reasons).toContain("insufficient_evidence");
  });

  it("adds a set only when recovery, stimulus, time, and priority support it", () => {
    const decision = recommend(prescription(), performance([9, 9, 9]), {
      musclePriority: "emphasize",
      recovery: "recovered",
      stimulus: "low",
      workload: "appropriate",
      performanceTrend: 0.02,
      sessionDurationMinutes: 48,
      sessionDurationBudgetMinutes: 60,
    });

    expect(decision.decision).toBe("add_set");
    expect(decision.delta.nextSetCount).toBe(4);
    expect(decision.reasons).toContain("recovery_good");
    expect(decision.reasons).toContain("stimulus_low");
  });

  it("removes one set before pursuing rep/load progression when fatigue is high", () => {
    const decision = recommend(prescription(), performance([10, 10, 10]), {
      recovery: "meaningful_fatigue",
      stimulus: "high",
      workload: "too_much",
      performanceTrend: -0.08,
    });

    expect(decision.decision).toBe("remove_set");
    expect(decision.delta.nextSetCount).toBe(2);
    expect(decision.reasons).toContain("recovery_incomplete");
    expect(decision.reasons).toContain("workload_limit_reached");
  });

  it("does not add volume when the session time budget is already reached", () => {
    const decision = recommend(prescription(), performance([9, 9, 9]), {
      musclePriority: "emphasize",
      recovery: "recovered",
      stimulus: "low",
      workload: "appropriate",
      sessionDurationMinutes: 60,
      sessionDurationBudgetMinutes: 60,
    });

    expect(decision.decision).toBe("maintain");
    expect(decision.reasons).toContain("workload_limit_reached");
  });

  it("prioritizes the mesocycle deload and reduces set count conservatively", () => {
    const decision = recommend(prescription(), performance([12, 12, 12]), {
      mesocycleWeek: 5,
      mesocyclePhase: "deload",
    });

    expect(decision.decision).toBe("deload");
    expect(decision.delta.nextSetCount).toBe(2);
    expect(decision.delta.nextTargetEffort).toEqual({ scale: "RIR", value: 5 });
    expect(decision.reasons).toEqual(["deload_week", "mesocycle_progression"]);
  });

  it("stores the evidence needed to explain and reproduce the decision", () => {
    const decision = recommend(prescription(), performance([10, 10, 10]), {
      recovery: "recovered",
      stimulus: "adequate",
      workload: "appropriate",
      performanceTrend: 0.03,
    });

    expect(decision.evidence).toMatchObject({
      previousLoad: 30,
      previousRepTarget: 10,
      completedWorkingSets: 3,
      plannedWorkingSets: 3,
      minimumCompletedReps: 10,
      maximumCompletedReps: 10,
      repTargetAchieved: true,
      recovery: "recovered",
      stimulus: "adequate",
      workload: "appropriate",
      performanceTrend: 0.03,
      mesocycleWeek: 2,
      mesocyclePhase: "accumulation",
    });
  });

  it("produces UI-ready explanation copy from persisted reasons", () => {
    const decision = recommend(prescription(), performance([10, 10, 10]));
    const explanation = explainProgressionDecision(decision);

    expect(explanation.title).toBe("Target 11 reps");
    expect(explanation.reasons.length).toBeGreaterThan(0);
  });
});

describe("recommendVolumeProgression", () => {
  it("keeps maintain-priority volume stable when recovery is good", () => {
    const result = recommendVolumeProgression({
      currentSetCount: 3,
      musclePriority: "maintain",
      recovery: "recovered",
      stimulus: "low",
      workload: "easy",
    });

    expect(result.decision).toBe("maintain");
    expect(result.delta).toEqual({});
  });
});
