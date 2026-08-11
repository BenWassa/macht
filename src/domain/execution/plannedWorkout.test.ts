import { describe, expect, it } from "vitest";
import type { PlannedSession } from "@/domain/training/types";
import {
  allWorkingSetsComplete,
  completeWorkout,
  createPlannedWorkout,
  substituteExercisePerformance,
  toggleSetPerformance,
  updateExerciseNote,
  updateSetPerformance,
} from "./plannedWorkout";

const plannedSession: PlannedSession = {
  id: "planned-1",
  weekId: "week-1",
  index: 1,
  name: "Upper A",
  targetDurationMinutes: 55,
  status: "planned",
  prescriptions: [
    {
      id: "rx-press",
      plannedSessionId: "planned-1",
      programExerciseSlotId: "slot-press-a",
      exerciseId: "incline_db_press",
      order: 1,
      targetMuscleIds: ["chest"],
      plannedSetCount: 2,
      repRange: { min: 8, max: 12 },
      targetRep: 10,
      targetEffort: { scale: "RIR", value: 2 },
      recommendedLoad: 30,
      restSeconds: 120,
      source: "progression_engine",
      progressionDecisionId: "decision-1",
      sets: [
        {
          id: "set-rx-1",
          exercisePrescriptionId: "rx-press",
          index: 0,
          type: "working",
          targetLoad: 30,
          repRange: { min: 8, max: 12 },
          targetReps: 10,
          targetEffort: { scale: "RIR", value: 2 },
        },
        {
          id: "set-rx-2",
          exercisePrescriptionId: "rx-press",
          index: 1,
          type: "working",
          targetLoad: 30,
          repRange: { min: 8, max: 12 },
          targetReps: 10,
          targetEffort: { scale: "RIR", value: 2 },
        },
      ],
    },
  ],
};

const ids = {
  workout: () => "workout-1",
  exercise: () => "performance-1",
  set: (set: { id: string }) => `performance-${set.id}`,
};

describe("planned workout execution", () => {
  it("creates an active workout with immutable prescription snapshots", () => {
    const workout = createPlannedWorkout({
      plannedSession,
      context: { programId: "program-1", mesocycleId: "meso-1" },
      startedAt: "2026-08-11T00:45:00.000Z",
      ids,
    });

    expect(workout.source).toBe("planned");
    expect(workout.plannedSessionId).toBe("planned-1");
    expect(workout.exercisePerformances[0].prescription).toMatchObject({
      exercisePrescriptionId: "rx-press",
      programExerciseSlotId: "slot-press-a",
      recommendedLoad: 30,
      restSeconds: 120,
      progressionDecisionId: "decision-1",
    });
    expect(workout.exercisePerformances[0].sets[0]).toMatchObject({
      actualLoad: 30,
      actualReps: 10,
      completed: false,
      prescription: {
        setPrescriptionId: "set-rx-1",
        targetLoad: 30,
        targetReps: 10,
        targetEffort: { scale: "RIR", value: 2 },
      },
    });
  });

  it("updates actual performance without mutating the prescription snapshot", () => {
    const original = createPlannedWorkout({
      plannedSession,
      context: { programId: "program-1", mesocycleId: "meso-1" },
      startedAt: "2026-08-11T00:45:00.000Z",
      ids,
    });
    const exercise = original.exercisePerformances[0];
    const set = exercise.sets[0];
    const updated = updateSetPerformance(original, exercise.id, set.id, {
      actualLoad: 32.5,
      actualReps: 9,
      actualEffort: { scale: "RIR", value: 1.5 },
    });

    expect(updated.exercisePerformances[0].sets[0]).toMatchObject({
      actualLoad: 32.5,
      actualReps: 9,
      actualEffort: { scale: "RIR", value: 1.5 },
    });
    expect(updated.exercisePerformances[0].sets[0].prescription).toMatchObject({
      targetLoad: 30,
      targetReps: 10,
      targetEffort: { scale: "RIR", value: 2 },
    });
  });

  it("supports complete and undo without losing entered performance", () => {
    const original = createPlannedWorkout({
      plannedSession,
      context: { programId: "program-1", mesocycleId: "meso-1" },
      startedAt: "2026-08-11T00:45:00.000Z",
      ids,
    });
    const exercise = original.exercisePerformances[0];
    const set = exercise.sets[0];
    const completed = toggleSetPerformance(
      original,
      exercise.id,
      set.id,
      "2026-08-11T00:47:00.000Z",
    );
    expect(completed.completedNow).toBe(true);
    expect(completed.session.exercisePerformances[0].sets[0].completedAt).toBe(
      "2026-08-11T00:47:00.000Z",
    );

    const undone = toggleSetPerformance(
      completed.session,
      exercise.id,
      set.id,
      "2026-08-11T00:48:00.000Z",
    );
    expect(undone.completedNow).toBe(false);
    expect(undone.session.exercisePerformances[0].sets[0].completedAt).toBeUndefined();
    expect(undone.session.exercisePerformances[0].sets[0].actualLoad).toBe(30);
  });

  it("tracks notes, substitutions, completion and final timing", () => {
    let workout = createPlannedWorkout({
      plannedSession,
      context: { programId: "program-1", mesocycleId: "meso-1" },
      startedAt: "2026-08-11T00:45:00.000Z",
      ids,
    });
    const exerciseId = workout.exercisePerformances[0].id;
    workout = updateExerciseNote(workout, exerciseId, "Keep elbows tucked");
    workout = substituteExercisePerformance(workout, exerciseId, "machine_press");
    for (const set of workout.exercisePerformances[0].sets) {
      workout = toggleSetPerformance(
        workout,
        exerciseId,
        set.id,
        "2026-08-11T00:50:00.000Z",
      ).session;
    }

    expect(workout.exercisePerformances[0]).toMatchObject({
      exerciseId: "machine_press",
      substitutedFromExerciseId: "incline_db_press",
      note: "Keep elbows tucked",
    });
    expect(workout.adaptedDuringSession).toBe(true);
    expect(allWorkingSetsComplete(workout)).toBe(true);

    const finished = completeWorkout(
      workout,
      "2026-08-11T01:40:00.000Z",
      3300,
    );
    expect(finished.state).toBe("completed");
    expect(finished.durationSeconds).toBe(3300);
  });
});
