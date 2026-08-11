import { describe, expect, it } from "vitest";
import type { PersonalTrainingModel } from "@/domain/personalization/types";
import type {
  ExercisePrescription,
  Mesocycle,
  MesocycleWeek,
  Program,
} from "@/domain/training/types";
import type { ExercisePerformance, WorkoutSession } from "./types";
import { applyWorkoutProgression } from "./applyWorkoutProgression";

const prescription = (
  id: string,
  slotId: string,
  plannedSessionId: string,
): ExercisePrescription => ({
  id,
  plannedSessionId,
  programExerciseSlotId: slotId,
  exerciseId: "incline_db_press",
  order: slotId === "slot-a" ? 1 : 2,
  targetMuscleIds: ["chest"],
  plannedSetCount: 3,
  repRange: { min: 8, max: 12 },
  targetRep: 10,
  targetEffort: { scale: "RIR", value: 2 },
  recommendedLoad: 30,
  source: "program_initial",
  sets: [0, 1, 2].map((index) => ({
    id: `${id}:set:${index}`,
    exercisePrescriptionId: id,
    index,
    type: "working",
    targetLoad: 30,
    repRange: { min: 8, max: 12 },
    targetReps: 10,
    targetEffort: { scale: "RIR", value: 2 },
  })),
});

const week = (
  index: number,
  phase: MesocycleWeek["phase"] = "accumulation",
): MesocycleWeek => {
  const sessionId = `session-${index}`;
  return {
    id: `week-${index}`,
    mesocycleId: "meso-1",
    index,
    phase,
    targetEffort: { scale: "RIR", value: index === 1 ? 3 : 2.5 },
    sessions: [
      {
        id: sessionId,
        weekId: `week-${index}`,
        index: 1,
        name: `Upper ${index}`,
        targetDurationMinutes: 60,
        status: "planned",
        prescriptions: [
          prescription(`rx-a-${index}`, "slot-a", sessionId),
          prescription(`rx-b-${index}`, "slot-b", sessionId),
        ],
      },
    ],
  };
};

const program: Program = {
  id: "program-1",
  name: "Adaptive upper",
  goal: "hypertrophy",
  createdAt: "2026-08-10T20:00:00Z",
  updatedAt: "2026-08-10T20:00:00Z",
  sessionsPerWeek: 2,
  defaultSessionDurationMinutes: 60,
  musclePriorities: { chest: "grow" },
  sessionTemplates: [],
  activeMesocycleId: "meso-1",
};

const mesocycle = (
  secondPhase: MesocycleWeek["phase"] = "accumulation",
  includeSecondWeek = true,
): Mesocycle => ({
  id: "meso-1",
  programId: "program-1",
  index: 1,
  status: "active",
  createdAt: "2026-08-10T20:00:00Z",
  accumulationWeeks: secondPhase === "deload" ? 1 : 2,
  includesDeload: secondPhase === "deload",
  weeks: includeSecondWeek ? [week(1), week(2, secondPhase)] : [week(1)],
});

const performance = (
  prescriptionId: string,
  reps = [10, 10, 10],
  feedback?: ExercisePerformance["feedback"],
): ExercisePerformance => ({
  id: `performance-${prescriptionId}`,
  exerciseId: "incline_db_press",
  prescriptionId,
  order: 1,
  sets: reps.map((actualReps, index) => ({
    id: `set-${index}`,
    index,
    completed: true,
    actualLoad: 30,
    actualReps,
    actualEffort: { scale: "RIR", value: 2 },
  })),
  feedback,
});

const workout = (
  patch: Partial<WorkoutSession> = {},
): WorkoutSession => ({
  id: "workout-1",
  plannedSessionId: "session-1",
  programId: "program-1",
  mesocycleId: "meso-1",
  weekId: "week-1",
  name: "Upper 1",
  date: "2026-08-11",
  startedAt: "2026-08-11T00:00:00Z",
  finishedAt: "2026-08-11T01:00:00Z",
  durationSeconds: 3600,
  state: "completed",
  exercisePerformances: [performance("rx-a-1")],
  adaptedDuringSession: false,
  source: "planned",
  ...patch,
});

const establishedFatigueModel: PersonalTrainingModel = {
  generatedAt: "2026-08-11T00:00:00Z",
  exerciseResponses: [],
  muscleVolumeResponses: [
    {
      muscleId: "chest",
      evidenceCount: 4,
      confidence: "established",
      observations: 4,
      productiveObservations: 0,
      fatigueLimitedObservations: 3,
      understimulatedObservations: 1,
      repeatedFatigueAtOrAboveSets: 3,
      explanation: "Repeated fatigue has been observed at three working sets.",
    },
  ],
  sessionDuration: {
    evidenceCount: 0,
    confidence: "insufficient",
    observations: 0,
    explanation: "Insufficient evidence.",
  },
  schedule: {
    evidenceCount: 0,
    confidence: "insufficient",
    weekdays: [],
    strongerWeekdays: [],
    weakerWeekdays: [],
    explanation: "Insufficient evidence.",
  },
  establishedSignals: 1,
};

const lowStimulusRecoveredPerformance = () =>
  performance("rx-a-1", [9, 9, 9], {
    id: "feedback-1",
    exerciseId: "incline_db_press",
    recordedAt: "2026-08-11T00:55:00Z",
    recovery: "recovered",
    stimulus: "low",
  });

const nextPrescription = (
  result: ReturnType<typeof applyWorkoutProgression>,
  slotId: string,
) =>
  result.mesocycle.weeks[1].sessions[0].prescriptions.find(
    (item) => item.programExerciseSlotId === slotId,
  )!;

describe("applyWorkoutProgression", () => {
  it("applies rep progression to the next occurrence of the same program slot", () => {
    const result = applyWorkoutProgression({
      workout: workout(),
      program,
      mesocycle: mesocycle(),
      availableLoadIncrement: 2.5,
      decisionId: () => "decision-1",
    });

    expect(result.decisions).toHaveLength(1);
    expect(result.decisions[0]).toMatchObject({
      id: "decision-1",
      decision: "add_rep",
      sourcePrescriptionId: "rx-a-1",
      userDisposition: "auto_applied",
    });
    expect(nextPrescription(result, "slot-a").targetRep).toBe(11);
    expect(nextPrescription(result, "slot-a").progressionDecisionId).toBe(
      "decision-1",
    );
    expect(nextPrescription(result, "slot-b").targetRep).toBe(10);
    expect(nextPrescription(result, "slot-b").source).toBe("program_initial");
  });

  it("can add one set when current recovery and stimulus evidence support more volume", () => {
    const result = applyWorkoutProgression({
      workout: workout({
        exercisePerformances: [lowStimulusRecoveredPerformance()],
        sessionFeedback: { workload: "easy" },
      }),
      program,
      mesocycle: mesocycle(),
      availableLoadIncrement: 2.5,
      decisionId: () => "decision-volume",
    });

    expect(result.decisions[0]).toMatchObject({
      decision: "add_set",
      evidence: {
        recovery: "recovered",
        stimulus: "low",
        workload: "easy",
      },
      delta: { setCountDelta: 1, nextSetCount: 4 },
    });
    expect(nextPrescription(result, "slot-a").plannedSetCount).toBe(4);
  });

  it("suppresses a proposed set increase when established personal fatigue evidence reaches that exposure", () => {
    const result = applyWorkoutProgression({
      workout: workout({
        exercisePerformances: [lowStimulusRecoveredPerformance()],
        sessionFeedback: { workload: "easy" },
      }),
      program,
      mesocycle: mesocycle(),
      availableLoadIncrement: 2.5,
      personalTrainingModel: establishedFatigueModel,
      decisionId: () => "decision-personalized",
    });

    expect(result.decisions[0]).toMatchObject({
      id: "decision-personalized",
      decision: "maintain",
      userDisposition: "auto_applied",
      personalization: {
        baseDecision: "add_set",
        adjustment: "suppress_volume_increase",
        evidenceCount: 4,
        confidence: "established",
        muscleIds: ["chest"],
      },
    });
    expect(result.decisions[0].personalization?.baseDelta).toMatchObject({
      setCountDelta: 1,
      nextSetCount: 4,
    });
    expect(nextPrescription(result, "slot-a").plannedSetCount).toBe(3);
    expect(nextPrescription(result, "slot-a").progressionDecisionId).toBe(
      "decision-personalized",
    );
  });

  it("does not suppress volume progression when personal evidence is still insufficient", () => {
    const insufficientModel: PersonalTrainingModel = {
      ...establishedFatigueModel,
      muscleVolumeResponses: establishedFatigueModel.muscleVolumeResponses.map(
        (profile) => ({
          ...profile,
          evidenceCount: 2,
          confidence: "insufficient" as const,
          repeatedFatigueAtOrAboveSets: undefined,
        }),
      ),
      establishedSignals: 0,
    };
    const result = applyWorkoutProgression({
      workout: workout({
        exercisePerformances: [lowStimulusRecoveredPerformance()],
        sessionFeedback: { workload: "easy" },
      }),
      program,
      mesocycle: mesocycle(),
      availableLoadIncrement: 2.5,
      personalTrainingModel: insufficientModel,
      decisionId: () => "decision-insufficient-model",
    });

    expect(result.decisions[0].decision).toBe("add_set");
    expect(result.decisions[0].personalization).toBeUndefined();
    expect(nextPrescription(result, "slot-a").plannedSetCount).toBe(4);
  });

  it("reduces next-session volume when session workload signals high fatigue", () => {
    const result = applyWorkoutProgression({
      workout: workout({ sessionFeedback: { workload: "too_much" } }),
      program,
      mesocycle: mesocycle(),
      availableLoadIncrement: 2.5,
      decisionId: () => "decision-fatigue",
    });

    expect(result.decisions[0].decision).toBe("remove_set");
    expect(result.decisions[0].reasons).toContain("workload_limit_reached");
    expect(nextPrescription(result, "slot-a").plannedSetCount).toBe(2);
  });

  it("prioritizes the upcoming deload over rep or load progression", () => {
    const result = applyWorkoutProgression({
      workout: workout(),
      program,
      mesocycle: mesocycle("deload"),
      availableLoadIncrement: 2.5,
      decisionId: () => "decision-deload",
    });

    expect(result.decisions[0]).toMatchObject({
      decision: "deload",
      reasons: ["deload_week", "mesocycle_progression"],
    });
    expect(nextPrescription(result, "slot-a").plannedSetCount).toBe(2);
    expect(nextPrescription(result, "slot-a").targetEffort).toEqual({
      scale: "RIR",
      value: 5,
    });
  });

  it("keeps a one-session substitution out of the original slot progression", () => {
    const substituted = {
      ...performance("rx-a-1"),
      exerciseId: "machine_press",
      substitutedFromExerciseId: "incline_db_press",
    };
    const result = applyWorkoutProgression({
      workout: workout({
        exercisePerformances: [substituted],
        adaptedDuringSession: true,
      }),
      program,
      mesocycle: mesocycle(),
      availableLoadIncrement: 2.5,
      decisionId: () => "unused-substitution",
    });

    expect(result.decisions).toEqual([]);
    expect(nextPrescription(result, "slot-a").targetRep).toBe(10);
    expect(nextPrescription(result, "slot-a").source).toBe("program_initial");
  });

  it("records no decision when the completed slot has no future occurrence", () => {
    const result = applyWorkoutProgression({
      workout: workout(),
      program,
      mesocycle: mesocycle("accumulation", false),
      availableLoadIncrement: 2.5,
      decisionId: () => "unused",
    });

    expect(result.decisions).toEqual([]);
    expect(result.mesocycle).toEqual(mesocycle("accumulation", false));
  });
});
