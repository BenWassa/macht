import { describe, expect, it } from "vitest";
import { applyWorkoutProgression } from "@/domain/execution/applyWorkoutProgression";
import {
  completeWorkout,
  createPlannedWorkout,
  toggleSetPerformance,
  updateSetPerformance,
} from "@/domain/execution/plannedWorkout";
import { findNextPlannedSession } from "./activeSession";
import { activateProgramMesocycle } from "./programActivation";
import { createStarterProgram } from "./starterProgram";

const ids = {
  workout: () => "workout-1",
  exercise: (prescription: { id: string }) => `performance:${prescription.id}`,
  set: (prescription: { id: string }) => `performance:${prescription.id}`,
};

describe("v2 Program flow", () => {
  it("uses one prescription from Program through Today, execution, and next-slot progression", () => {
    const program = createStarterProgram({
      id: "program-1",
      name: "Flow test",
      createdAt: "2026-08-11T01:30:00Z",
      sessionsPerWeek: 3,
      sessionDurationMinutes: 60,
    });
    const activation = activateProgramMesocycle({
      program,
      existingMesocycles: [],
      mesocycleId: "meso-1",
      createdAt: "2026-08-11T01:31:00Z",
      startDate: "2026-08-11",
      accumulationWeeks: 4,
    });
    const next = findNextPlannedSession(activation.mesocycle)!;
    const sourcePrescription = next.session.prescriptions[0];
    let workout = createPlannedWorkout({
      plannedSession: next.session,
      context: {
        programId: activation.program.id,
        mesocycleId: activation.mesocycle.id,
      },
      startedAt: "2026-08-11T12:00:00Z",
      ids,
    });
    const performance = workout.exercisePerformances[0];

    expect(performance.prescriptionId).toBe(sourcePrescription.id);
    expect(performance.prescription?.programExerciseSlotId).toBe(
      sourcePrescription.programExerciseSlotId,
    );

    for (const set of performance.sets) {
      workout = updateSetPerformance(workout, performance.id, set.id, {
        actualLoad: 30,
        actualReps: sourcePrescription.targetRep,
        actualEffort: sourcePrescription.targetEffort,
      });
      workout = toggleSetPerformance(
        workout,
        performance.id,
        set.id,
        "2026-08-11T12:05:00Z",
      ).session;
    }
    workout = completeWorkout(workout, "2026-08-11T12:45:00Z", 2700);

    const progression = applyWorkoutProgression({
      workout,
      program: activation.program,
      mesocycle: activation.mesocycle,
      availableLoadIncrement: 2.5,
      decisionId: () => "decision-1",
    });
    const nextOccurrence = progression.mesocycle.weeks[1].sessions[0].prescriptions.find(
      (prescription) =>
        prescription.programExerciseSlotId ===
        sourcePrescription.programExerciseSlotId,
    )!;

    expect(progression.decisions[0]).toMatchObject({
      sourcePrescriptionId: sourcePrescription.id,
      decision: "add_rep",
      userDisposition: "auto_applied",
      delta: {
        nextLoad: 30,
        nextRepTarget: (sourcePrescription.targetRep ?? 8) + 1,
      },
    });
    expect(nextOccurrence.recommendedLoad).toBe(30);
    expect(nextOccurrence.targetRep).toBe((sourcePrescription.targetRep ?? 8) + 1);
    expect(nextOccurrence.progressionDecisionId).toBe("decision-1");
  });

  it("keeps an activated cycle unchanged when the reusable Program definition is edited", () => {
    const program = createStarterProgram({
      id: "program-1",
      name: "History test",
      createdAt: "2026-08-11T01:30:00Z",
    });
    const activation = activateProgramMesocycle({
      program,
      existingMesocycles: [],
      mesocycleId: "meso-1",
      createdAt: "2026-08-11T01:31:00Z",
      startDate: "2026-08-11",
    });
    const originalName = activation.mesocycle.weeks[0].sessions[0].name;
    const editedProgram = {
      ...activation.program,
      sessionTemplates: activation.program.sessionTemplates.map((template, index) =>
        index === 0 ? { ...template, name: "Future cycle session" } : template,
      ),
    };

    expect(editedProgram.sessionTemplates[0].name).toBe("Future cycle session");
    expect(activation.mesocycle.weeks[0].sessions[0].name).toBe(originalName);
  });
});
