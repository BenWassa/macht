import { Download, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { createBackupV2, parseBackup } from "@/data/backup";
import type { Settings } from "@/domain/types";
import { useCustomExerciseStore } from "@/state/useCustomExerciseStore";
import { useExecutionHistoryStore } from "@/state/useExecutionHistoryStore";
import { useHistoryStore } from "@/state/useHistoryStore";
import { useInjuryStore } from "@/state/useInjuryStore";
import { useProgramStore } from "@/state/useProgramStore";
import { useProgressionStore } from "@/state/useProgressionStore";
import { useSettingsStore } from "@/state/useSettingsStore";
import { useTrainingConstraintStore } from "@/state/useTrainingConstraintStore";

const settingsSnapshot = (): Settings => {
  const state = useSettingsStore.getState();
  return {
    units: state.units,
    defaultRest: state.defaultRest,
    rpeMode: state.rpeMode,
    haptics: state.haptics,
    audioCue: state.audioCue,
  };
};

export function BackupPanel() {
  const legacyHistory = useHistoryStore((state) => state.sessions);
  const hydrateHistory = useHistoryStore((state) => state.hydrateHistory);
  const workouts = useExecutionHistoryStore((state) => state.workouts);
  const hydrateWorkouts = useExecutionHistoryStore((state) => state.hydrateWorkouts);
  const programs = useProgramStore((state) => state.programs);
  const mesocycles = useProgramStore((state) => state.mesocycles);
  const activeProgramId = useProgramStore((state) => state.activeProgramId);
  const hydrateProgramData = useProgramStore((state) => state.hydrateProgramData);
  const setActiveProgram = useProgramStore((state) => state.setActiveProgram);
  const progressionDecisions = useProgressionStore((state) => state.decisions);
  const hydrateDecisions = useProgressionStore((state) => state.hydrateDecisions);
  const trainingConstraints = useTrainingConstraintStore((state) => state.constraints);
  const hydrateConstraints = useTrainingConstraintStore(
    (state) => state.hydrateConstraints,
  );
  const customExercises = useCustomExerciseStore((state) => state.exercises);
  const hydrateCustomExercises = useCustomExerciseStore(
    (state) => state.hydrateExercises,
  );
  const hydrateSettings = useSettingsStore((state) => state.hydrateSettings);
  const hydrateLegacyInjuries = useInjuryStore((state) => state.hydrateInjuries);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const exportBackup = () => {
    setError("");
    setMessage("");
    const backup = createBackupV2({
      legacyHistory,
      workouts,
      programs,
      mesocycles,
      activeProgramId,
      progressionDecisions,
      trainingConstraints,
      settings: settingsSnapshot(),
      customExercises,
    });
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `macht_backup_${backup.exportedAt.replace(/[:.]/g, "-")}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setMessage("Backup exported.");
  };

  const importBackup = async (file: File) => {
    setError("");
    setMessage("");
    try {
      const restored = parseBackup(JSON.parse(await file.text()));
      if (!window.confirm("Replace current Macht training data with this backup?")) {
        return;
      }

      hydrateHistory(restored.legacyHistory);
      hydrateWorkouts(restored.workouts);
      hydrateProgramData(restored.programs, restored.mesocycles);
      setActiveProgram(restored.activeProgramId);
      hydrateDecisions(restored.progressionDecisions);
      hydrateConstraints(restored.trainingConstraints);
      hydrateSettings(restored.settings);
      hydrateCustomExercises(restored.customExercises);
      hydrateLegacyInjuries(restored.legacyInjuries);
      setMessage(
        restored.sourceVersion === 1
          ? "Legacy backup restored. Previous injury entries were migrated into training constraints."
          : "Backup restored.",
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Invalid backup file.");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-4 border-t border-divider p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div>
        <span className="block text-sm font-bold text-text">Backup</span>
        <span className="mt-1 block text-xs leading-5 text-text-muted">
          Export or restore programs, workouts, adaptive decisions, constraints, settings, and legacy history.
        </span>
        {error ? (
          <span role="alert" className="mt-2 block text-xs font-medium text-danger">
            {error}
          </span>
        ) : null}
        {message ? (
          <span role="status" className="mt-2 block text-xs font-medium text-positive">
            {message}
          </span>
        ) : null}
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={exportBackup}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md bg-surface-2 px-4 text-sm font-semibold text-text-secondary transition hover:bg-surface-3 hover:text-text sm:flex-none"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Export
        </button>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md bg-surface-2 px-4 text-sm font-semibold text-text-secondary transition hover:bg-surface-3 hover:text-text sm:flex-none"
        >
          <Upload className="h-4 w-4" aria-hidden="true" />
          Import
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".json,application/json"
          className="sr-only"
          aria-label="Import Macht backup file"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void importBackup(file);
          }}
        />
      </div>
    </div>
  );
}
