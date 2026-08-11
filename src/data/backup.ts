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
import type { LegacyMachtBackupV1 } from "@/data/schema/v1";

export const MACHT_BACKUP_VERSION = 2 as const;

export interface MachtBackupV2 {
  version: typeof MACHT_BACKUP_VERSION;
  exportedAt: string;
  programs: Program[];
  mesocycles: Mesocycle[];
  activeProgramId?: ProgramId;
  workouts: WorkoutSession[];
  progressionDecisions: ProgressionDecision[];
  trainingConstraints: TrainingConstraint[];
  settings: Settings;
  customExercises: CustomExercise[];
  legacyHistory: SessionLog[];
  legacyInjuries: ExerciseInjury[];
}

export interface BackupHydrationPayload {
  programs: Program[];
  mesocycles: Mesocycle[];
  activeProgramId?: ProgramId;
  workouts: WorkoutSession[];
  progressionDecisions: ProgressionDecision[];
  trainingConstraints: TrainingConstraint[];
  settings: Settings;
  customExercises: CustomExercise[];
  legacyHistory: SessionLog[];
  legacyInjuries: ExerciseInjury[];
}

export type ParsedBackup =
  | { ok: true; sourceVersion: 1 | 2; payload: BackupHydrationPayload }
  | { ok: false; error: string };

export interface CreateBackupInput extends BackupHydrationPayload {
  exportedAt?: string;
}

export const createMachtBackupV2 = ({
  exportedAt = new Date().toISOString(),
  ...payload
}: CreateBackupInput): MachtBackupV2 => ({
  version: MACHT_BACKUP_VERSION,
  exportedAt,
  ...payload,
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isObjectArray = (value: unknown): boolean =>
  Array.isArray(value) && value.every(isRecord);

const isSettings = (value: unknown): value is Settings => {
  if (!isRecord(value)) return false;
  return (
    (value.units === "lbs" || value.units === "kgs") &&
    typeof value.defaultRest === "number" &&
    Number.isFinite(value.defaultRest) &&
    value.defaultRest >= 0 &&
    (value.rpeMode === "RPE" || value.rpeMode === "RIR") &&
    typeof value.haptics === "boolean" &&
    typeof value.audioCue === "boolean"
  );
};

const hasStringIds = (value: unknown): boolean =>
  isObjectArray(value) &&
  (value as Record<string, unknown>[]).every(
    (item) => typeof item.id === "string" && item.id.length > 0,
  );

const validateV2 = (value: Record<string, unknown>): value is MachtBackupV2 =>
  value.version === MACHT_BACKUP_VERSION &&
  typeof value.exportedAt === "string" &&
  hasStringIds(value.programs) &&
  hasStringIds(value.mesocycles) &&
  (value.activeProgramId == null || typeof value.activeProgramId === "string") &&
  hasStringIds(value.workouts) &&
  hasStringIds(value.progressionDecisions) &&
  hasStringIds(value.trainingConstraints) &&
  isSettings(value.settings) &&
  hasStringIds(value.customExercises) &&
  hasStringIds(value.legacyHistory) &&
  hasStringIds(value.legacyInjuries);

const validateV1 = (
  value: Record<string, unknown>,
): value is LegacyMachtBackupV1 =>
  value.version === 1 &&
  typeof value.exportedAt === "string" &&
  hasStringIds(value.history) &&
  hasStringIds(value.injuries) &&
  isSettings(value.settings) &&
  (value.customExercises == null || hasStringIds(value.customExercises));

const payloadFromV2 = (backup: MachtBackupV2): BackupHydrationPayload => ({
  programs: backup.programs,
  mesocycles: backup.mesocycles,
  activeProgramId: backup.activeProgramId,
  workouts: backup.workouts,
  progressionDecisions: backup.progressionDecisions,
  trainingConstraints: backup.trainingConstraints,
  settings: backup.settings,
  customExercises: backup.customExercises,
  legacyHistory: backup.legacyHistory,
  legacyInjuries: backup.legacyInjuries,
});

const payloadFromV1 = (backup: LegacyMachtBackupV1): BackupHydrationPayload => ({
  programs: [],
  mesocycles: [],
  activeProgramId: undefined,
  workouts: [],
  progressionDecisions: [],
  trainingConstraints: [],
  settings: backup.settings,
  customExercises: backup.customExercises ?? [],
  legacyHistory: backup.history,
  legacyInjuries: backup.injuries,
});

export function parseMachtBackupText(text: string): ParsedBackup {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: "Backup is not valid JSON." };
  }

  if (!isRecord(parsed)) {
    return { ok: false, error: "Backup root must be an object." };
  }
  if (parsed.version === MACHT_BACKUP_VERSION && validateV2(parsed)) {
    return { ok: true, sourceVersion: 2, payload: payloadFromV2(parsed) };
  }
  if (parsed.version === 1 && validateV1(parsed)) {
    return { ok: true, sourceVersion: 1, payload: payloadFromV1(parsed) };
  }
  if (parsed.version !== 1 && parsed.version !== MACHT_BACKUP_VERSION) {
    return { ok: false, error: "Unsupported Macht backup version." };
  }
  return { ok: false, error: "Backup is incomplete or contains invalid data." };
}
