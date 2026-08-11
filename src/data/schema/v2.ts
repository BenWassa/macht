import type { RecoveryObservation } from "@/domain/feedback/types";
import type { WorkoutSession } from "@/domain/execution/types";
import type { ProgressionDecision } from "@/domain/progression/types";
import type { IsoDateTime } from "@/domain/shared/ids";
import type { Mesocycle, Program } from "@/domain/training/types";

export const MACHT_DATA_SCHEMA_VERSION = 2 as const;

export interface SettingsV2 {
  units: "lbs" | "kgs";
  effortScale: "RPE" | "RIR";
  defaultRestSeconds: number;
  defaultSessionDurationMinutes: number;
  weeklySessionTarget: 2 | 3 | 4 | 5 | 6;
  haptics: boolean;
  audioCue: boolean;
  equipmentIds: string[];
}

export interface MigrationRecord {
  fromVersion: number;
  migratedAt: IsoDateTime;
  sourceExportedAt?: string;
}

export interface MachtDataV2 {
  version: typeof MACHT_DATA_SCHEMA_VERSION;
  exportedAt: IsoDateTime;
  settings: SettingsV2;
  programs: Program[];
  mesocycles: Mesocycle[];
  workouts: WorkoutSession[];
  activeWorkout?: WorkoutSession;
  recoveryObservations: RecoveryObservation[];
  progressionDecisions: ProgressionDecision[];
  migrationHistory: MigrationRecord[];
}

export function createEmptyMachtDataV2(
  exportedAt: IsoDateTime,
  settings: SettingsV2,
): MachtDataV2 {
  return {
    version: MACHT_DATA_SCHEMA_VERSION,
    exportedAt,
    settings,
    programs: [],
    mesocycles: [],
    workouts: [],
    recoveryObservations: [],
    progressionDecisions: [],
    migrationHistory: [],
  };
}
