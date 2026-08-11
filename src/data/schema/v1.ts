import type {
  CustomExercise,
  ExerciseInjury,
  SessionLog,
  Settings,
} from "@/domain/types";

export const LEGACY_MACHT_DATA_SCHEMA_VERSION = 1 as const;

export interface LegacyMachtBackupV1 {
  version: typeof LEGACY_MACHT_DATA_SCHEMA_VERSION;
  exportedAt: string;
  history: SessionLog[];
  injuries: ExerciseInjury[];
  settings: Settings;
  customExercises?: CustomExercise[];
}
