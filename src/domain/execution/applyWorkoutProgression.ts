import type { MusclePriority } from "@/domain/exercises/muscles";
import { recommendProgression } from "@/domain/progression/recommendation";
import type { ProgressionDecision } from "@/domain/progression/types";
import { applyDecisionToNextSlotOccurrence } from "@/domain/training/prescriptionUpdates";
import type {
  ExercisePrescription,
  Mesocycle,
  MesocycleWeek,
  PlannedSession,
  Program,
} from "@/domain/training/types";
import type { WorkoutSession } from "./types";

interface PrescriptionLocation {
  week: MesocycleWeek;
  session: PlannedSession;
  prescription: ExercisePrescription;
}

const priorityRank: Record<MusclePriority, number> = {
  maintain: 0,
  grow: 1,
  emphasize: 2,
};

const prescriptionLocations = (mesocycle: Mesocycle): PrescriptionLocation[] =>
  [...mesocycle.weeks]
    .sort((a, b) => a.index - b.index)
    .flatMap((week) =>
      [...week.sessions]
        .sort((a, b) => a.index - b.index)
        .flatMap((session) =>
          [...session.prescriptions]
            .sort((a, b) => a.order - b.order)
            .map((prescription) => ({ week, session, prescription })),
        ),
    );

const priorityFor = (
  prescription: ExercisePrescription,
  program: Program,
): MusclePriority =>
  prescription.targetMuscleIds.reduce<MusclePriority>((best, muscleId) => {
    const candidate = program.musclePriorities[muscleId] ?? "grow";
    return priorityRank[candidate] > priorityRank[best] ? candidate : best;
  }, "grow");

function findNextOccurrence(
  locations: PrescriptionLocation[],
  sourceIndex: number,
): PrescriptionLocation | undefined {
  const source = locations[sourceIndex]?.prescription;
  if (!source) return undefined;
  return locations.slice(sourceIndex + 1).find(({ prescription }) =>
    source.programExerciseSlotId
      ? prescription.programExerciseSlotId === source.programExerciseSlotId
      : prescription.exerciseId === source.exerciseId,
  );
}

export interface ApplyWorkoutProgressionInput {
  workout: WorkoutSession;
  program: Program;
  mesocycle: Mesocycle;
  availableLoadIncrement: number;
  decisionId?: () => string;
}

export interface ApplyWorkoutProgressionResult {
  mesocycle: Mesocycle;
  decisions: ProgressionDecision[];
}

export function applyWorkoutProgression({
  workout,
  program,
  mesocycle,
  availableLoadIncrement,
  decisionId = () => crypto.randomUUID(),
}: ApplyWorkoutProgressionInput): ApplyWorkoutProgressionResult {
  const locations = prescriptionLocations(mesocycle);
  const startingEffort = [...mesocycle.weeks]
    .sort((a, b) => a.index - b.index)
    .find((week) => week.targetEffort)?.targetEffort;
  const decisions: ProgressionDecision[] = [];
  let updatedMesocycle = mesocycle;

  for (const performance of workout.exercisePerformances) {
    if (!performance.prescriptionId) continue;
    const sourceIndex = locations.findIndex(
      ({ prescription }) => prescription.id === performance.prescriptionId,
    );
    if (sourceIndex < 0) continue;
    const source = locations[sourceIndex];
    const target = findNextOccurrence(locations, sourceIndex);
    if (!target) continue;

    const decision = recommendProgression({
      decisionId: decisionId(),
      createdAt: workout.finishedAt ?? new Date().toISOString(),
      prescription: source.prescription,
      performance,
      musclePriority: priorityFor(source.prescription, program),
      availableLoadIncrement,
      stimulus: performance.feedback?.stimulus,
      workload: workout.sessionFeedback?.workload,
      sessionDurationMinutes:
        workout.durationSeconds != null ? workout.durationSeconds / 60 : undefined,
      sessionDurationBudgetMinutes: source.session.targetDurationMinutes,
      mesocycleWeek: target.week.index,
      mesocyclePhase: target.week.phase,
      baseEffortTarget: startingEffort,
    });
    const appliedDecision: ProgressionDecision = {
      ...decision,
      userDisposition: "auto_applied",
    };
    decisions.push(appliedDecision);
    updatedMesocycle = applyDecisionToNextSlotOccurrence(
      updatedMesocycle,
      source.prescription.id,
      appliedDecision,
    );
  }

  return { mesocycle: updatedMesocycle, decisions };
}
