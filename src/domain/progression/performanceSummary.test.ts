import { describe, expect, it } from "vitest";
import type { ExercisePerformance } from "@/domain/execution/types";
import type { ExercisePrescription } from "@/domain/training/types";
import { summarizePerformance } from "./performanceSummary";

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
  recommendedLoad: 30,
  source: "program_initial",
  sets: [0, 1, 2].map((index) => ({
    id: `rx-set-${index}`,
    exercisePrescriptionId: "rx-1",
    index,
    type: "working",
    targetLoad: 30,
    repRange: { min: 8, max: 12 },
    targetReps: 10,
    targetEffort: { scale: "RIR", value: 2 },
  })),
};

const prescribedSet = (index: number) => ({
  id: `perf-${index}`,
  index,
  completed: true,
  actualLoad: 30,
  actualReps: 10,
  actualEffort: { scale: "RIR" as const, value: 2 },
  prescription: {
    setPrescriptionId: `rx-set-${index}`,
    exercisePrescriptionId: "rx-1",
    type: "working" as const,
    targetLoad: 30,
    repRange: { min: 8, max: 12 },
    targetReps: 10,
    targetEffort: { scale: "RIR" as const, value: 2 },
  },
});

describe("summarizePerformance provenance", () => {
  it("ignores an unprescribed user-added set when evaluating the planned target", () => {
    const performance: ExercisePerformance = {
      id: "perf-exercise",
      exerciseId: "incline_db_press",
      prescriptionId: "rx-1",
      order: 1,
      sets: [
        prescribedSet(0),
        prescribedSet(1),
        prescribedSet(2),
        {
          id: "extra-set",
          index: 3,
          completed: true,
          actualLoad: 30,
          actualReps: 3,
          actualEffort: { scale: "RIR", value: 0 },
        },
      ],
    };

    const summary = summarizePerformance(prescription, performance);
    expect(summary.completedWorkingSets).toBe(3);
    expect(summary.minimumCompletedReps).toBe(10);
    expect(summary.allSetsMeetTarget).toBe(true);
    expect(summary.effortStatus).toBe("on_target");
  });
});
