import type { WorkoutSession } from "@/domain/execution/types";
import type { SessionLog } from "@/domain/types";
import type { LegacyMachtBackupV1 } from "./v1";
import {
  MACHT_DATA_SCHEMA_VERSION,
  type MachtDataV2,
  type SettingsV2,
} from "./v2";

export interface MigrationWarning {
  code: "UNPARSED_DURATION" | "MISSING_EXERCISE_SNAPSHOTS";
  sessionId: string;
  message: string;
}

export interface MigrationResultV1ToV2 {
  data: MachtDataV2;
  rollbackArchive: LegacyMachtBackupV1;
  warnings: MigrationWarning[];
}

function parseLegacyDuration(duration: string): number | undefined {
  const minutes = duration.trim().match(/^(\d+)\s*m$/i);
  if (minutes) return Number(minutes[1]) * 60;

  const colon = duration.trim().match(/^(\d+):(\d{2})(?::(\d{2}))?$/);
  if (!colon) return undefined;

  if (colon[3] != null) {
    return Number(colon[1]) * 3600 + Number(colon[2]) * 60 + Number(colon[3]);
  }

  return Number(colon[1]) * 60 + Number(colon[2]);
}

function migrateSession(
  session: SessionLog,
  effortScale: "RPE" | "RIR",
  warnings: MigrationWarning[],
): WorkoutSession {
  const durationSeconds = parseLegacyDuration(session.duration);
  if (durationSeconds == null) {
    warnings.push({
      code: "UNPARSED_DURATION",
      sessionId: session.id,
      message: `Could not parse legacy duration: ${session.duration}`,
    });
  }

  if (!session.exerciseSnapshots) {
    warnings.push({
      code: "MISSING_EXERCISE_SNAPSHOTS",
      sessionId: session.id,
      message: "Legacy session has no exercise snapshots.",
    });
  }

  const exercisePerformances = (session.exerciseSnapshots ?? []).map(
    (snapshot, exerciseIndex) => ({
      id: `${session.id}:exercise:${exerciseIndex}`,
      exerciseId: snapshot.exerciseId,
      order: exerciseIndex,
      sets: snapshot.sets.map((set, setIndex) => ({
        id: `${session.id}:exercise:${exerciseIndex}:set:${setIndex}`,
        index: setIndex,
        completed: set.completed,
        ...(set.completed
          ? {
              actualLoad: set.weight,
              actualReps: set.reps,
              ...(set.rpe != null
                ? {
                    actualEffort: {
                      scale: effortScale,
                      value: set.rpe,
                    },
                  }
                : {}),
            }
          : {}),
      })),
      ...(snapshot.notes ? { note: snapshot.notes } : {}),
    }),
  );

  return {
    id: session.id,
    name: session.template,
    date: session.date,
    ...(durationSeconds != null ? { durationSeconds } : {}),
    state: "completed",
    exercisePerformances,
    adaptedDuringSession: session.adapted,
    source: "legacy_migration",
    ...(session.notes ? { note: session.notes } : {}),
  };
}

function migrateSettings(backup: LegacyMachtBackupV1): SettingsV2 {
  return {
    units: backup.settings.units,
    effortScale: backup.settings.rpeMode,
    defaultRestSeconds: backup.settings.defaultRest,
    defaultSessionDurationMinutes: 60,
    weeklySessionTarget: 3,
    haptics: backup.settings.haptics,
    audioCue: backup.settings.audioCue,
    equipmentIds: [],
  };
}

export function migrateBackupV1ToV2(
  backup: LegacyMachtBackupV1,
  migratedAt: string,
): MigrationResultV1ToV2 {
  const warnings: MigrationWarning[] = [];
  const settings = migrateSettings(backup);
  const workouts = backup.history.map((session) =>
    migrateSession(session, settings.effortScale, warnings),
  );

  return {
    data: {
      version: MACHT_DATA_SCHEMA_VERSION,
      exportedAt: migratedAt,
      settings,
      programs: [],
      mesocycles: [],
      workouts,
      recoveryObservations: [],
      progressionDecisions: [],
      migrationHistory: [
        {
          fromVersion: backup.version,
          migratedAt,
          sourceExportedAt: backup.exportedAt,
        },
      ],
    },
    rollbackArchive: backup,
    warnings,
  };
}
