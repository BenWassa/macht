import { constraintsFromLegacyInjuries } from "@/domain/constraints/legacy";
import type { TrainingConstraint } from "@/domain/constraints/types";
import type { WorkoutSession } from "@/domain/execution/types";
import type { ProgressionDecision } from "@/domain/progression/types";
import type { ProgramId } from "@/domain/shared/ids";
import type { Mesocycle, Program } from "@/domain/training/types";
import type {
  CustomExercise,
  ExerciseInjury,
  SessionLog,
  Settings,
} from "@/domain/types";

export interface MachtBackupV1 {
  version: 1;
  exportedAt: string;
  history: SessionLog[];
  injuries: ExerciseInjury[];
  settings: Settings;
  customExercises?: CustomExercise[];
}

export interface MachtBackupV2 {
  version: 2;
  exportedAt: string;
  legacyHistory: SessionLog[];
  workouts: WorkoutSession[];
  programs: Program[];
  mesocycles: Mesocycle[];
  activeProgramId?: ProgramId;
  progressionDecisions: ProgressionDecision[];
  trainingConstraints: TrainingConstraint[];
  settings: Settings;
  customExercises: CustomExercise[];
}

export interface BackupV2Input {
  legacyHistory: SessionLog[];
  workouts: WorkoutSession[];
  programs: Program[];
  mesocycles: Mesocycle[];
  activeProgramId?: ProgramId;
  progressionDecisions: ProgressionDecision[];
  trainingConstraints: TrainingConstraint[];
  settings: Settings;
  customExercises: CustomExercise[];
  exportedAt?: string;
}

export interface RestorableBackup {
  sourceVersion: 1 | 2;
  legacyHistory: SessionLog[];
  workouts: WorkoutSession[];
  programs: Program[];
  mesocycles: Mesocycle[];
  activeProgramId?: ProgramId;
  progressionDecisions: ProgressionDecision[];
  trainingConstraints: TrainingConstraint[];
  settings: Settings;
  customExercises: CustomExercise[];
  legacyInjuries: ExerciseInjury[];
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const hasArray = (value: Record<string, unknown>, key: string): boolean =>
  Array.isArray(value[key]);

const hasSettings = (value: Record<string, unknown>): boolean =>
  isObject(value.settings) && typeof value.settings.units === "string";

export function createBackupV2(input: BackupV2Input): MachtBackupV2 {
  return {
    version: 2,
    exportedAt: input.exportedAt ?? new Date().toISOString(),
    legacyHistory: input.legacyHistory,
    workouts: input.workouts,
    programs: input.programs,
    mesocycles: input.mesocycles,
    activeProgramId: input.activeProgramId,
    progressionDecisions: input.progressionDecisions,
    trainingConstraints: input.trainingConstraints,
    settings: input.settings,
    customExercises: input.customExercises,
  };
}

export function parseBackup(value: unknown): RestorableBackup {
  if (!isObject(value)) throw new Error("Backup must be a JSON object.");

  if (value.version === 2) {
    const requiredArrays = [
      "legacyHistory",
      "workouts",
      "programs",
      "mesocycles",
      "progressionDecisions",
      "trainingConstraints",
      "customExercises",
    ];
    if (!requiredArrays.every((key) => hasArray(value, key)) || !hasSettings(value)) {
      throw new Error("Backup v2 is missing required Macht training data.");
    }
    const backup = value as unknown as MachtBackupV2;
    return {
      sourceVersion: 2,
      legacyHistory: backup.legacyHistory,
      workouts: backup.workouts,
      programs: backup.programs,
      mesocycles: backup.mesocycles,
      activeProgramId: backup.activeProgramId,
      progressionDecisions: backup.progressionDecisions,
      trainingConstraints: backup.trainingConstraints,
      settings: backup.settings,
      customExercises: backup.customExercises,
      legacyInjuries: [],
    };
  }

  if (value.version === 1) {
    if (
      !hasArray(value, "history") ||
      !hasArray(value, "injuries") ||
      !hasSettings(value)
    ) {
      throw new Error("Backup v1 is missing required Macht data.");
    }
    const backup = value as unknown as MachtBackupV1;
    return {
      sourceVersion: 1,
      legacyHistory: backup.history,
      workouts: [],
      programs: [],
      mesocycles: [],
      activeProgramId: undefined,
      progressionDecisions: [],
      trainingConstraints: constraintsFromLegacyInjuries(backup.injuries),
      settings: backup.settings,
      customExercises: backup.customExercises ?? [],
      legacyInjuries: backup.injuries,
    };
  }

  throw new Error("Unsupported Macht backup version.");
}
