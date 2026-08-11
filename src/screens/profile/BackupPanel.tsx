import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  createMachtBackupV2,
  parseMachtBackupText,
} from "@/data/backup";
import { useCustomExerciseStore } from "@/state/useCustomExerciseStore";
import { useExecutionHistoryStore } from "@/state/useExecutionHistoryStore";
import { useHistoryStore } from "@/state/useHistoryStore";
import { useInjuryStore } from "@/state/useInjuryStore";
import { useProgramStore } from "@/state/useProgramStore";
import { useProgressionStore } from "@/state/useProgressionStore";
import { useSettingsStore } from "@/state/useSettingsStore";
import { useTrainingConstraintStore } from "@/state/useTrainingConstraintStore";
import { useWorkoutStore } from "@/state/useWorkoutStore";

export function BackupPanel() {
  const programs = useProgramStore((state) => state.programs);
  const mesocycles = useProgramStore((state) => state.mesocycles);
  const activeProgramId = useProgramStore((state) => state.activeProgramId);
  const workouts = useExecutionHistoryStore((state) => state.workouts);
  const progressionDecisions = useProgressionStore((state) => state.decisions);
  const trainingConstraints = useTrainingConstraintStore(
    (state) => state.constraints,
  );
  const settings = useSettingsStore();
  const customExercises = useCustomExerciseStore((state) => state.exercises);
  const legacyHistory = useHistoryStore((state) => state.sessions);
  const legacyInjuries = useInjuryStore((state) => state.injuries);
  const workoutActive = useWorkoutStore((state) => state.workoutActive);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const exportBackup = () => {
    setError("");
    setReceipt("");
    if (workoutActive) {
      setError("Finish the active session before exporting a backup.");
      return;
    }
    const backup = createMachtBackupV2({
      programs,
      mesocycles,
      activeProgramId,
      workouts,
      progressionDecisions,
      trainingConstraints,
      settings: {
        units: settings.units,
        defaultRest: settings.defaultRest,
        rpeMode: settings.rpeMode,
        haptics: settings.haptics,
        audioCue: settings.audioCue,
      },
      customExercises,
      legacyHistory,
      legacyInjuries,
    });
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `macht_backup_${backup.exportedAt.slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setReceipt("Backup exported with current programs, workouts, and training history.");
  };

  const applyBackup = (text: string) => {
    setError("");
    setReceipt("");
    if (workoutActive) {
      setError("Finish the active session before restoring a backup.");
      return;
    }

    const parsed = parseMachtBackupText(text);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }
    if (!window.confirm("This will replace current saved training data. Continue?")) {
      return;
    }

    const prior = {
      programs: useProgramStore.getState().programs,
      mesocycles: useProgramStore.getState().mesocycles,
      activeProgramId: useProgramStore.getState().activeProgramId,
      workouts: useExecutionHistoryStore.getState().workouts,
      decisions: useProgressionStore.getState().decisions,
      constraints: useTrainingConstraintStore.getState().constraints,
      settings: useSettingsStore.getState(),
      customExercises: useCustomExerciseStore.getState().exercises,
      legacyHistory: useHistoryStore.getState().sessions,
      legacyInjuries: useInjuryStore.getState().injuries,
    };
    const payload = parsed.payload;

    try {
      useProgramStore
        .getState()
        .hydrateProgramData(payload.programs, payload.mesocycles);
      useProgramStore.getState().setActiveProgram(payload.activeProgramId);
      useExecutionHistoryStore.getState().hydrateWorkouts(payload.workouts);
      useProgressionStore
        .getState()
        .hydrateDecisions(payload.progressionDecisions);
      useTrainingConstraintStore
        .getState()
        .hydrateConstraints(payload.trainingConstraints);
      useSettingsStore.getState().hydrateSettings(payload.settings);
      useCustomExerciseStore
        .getState()
        .hydrateExercises(payload.customExercises);
      useHistoryStore.getState().hydrateHistory(payload.legacyHistory);
      useInjuryStore.getState().hydrateInjuries(payload.legacyInjuries);
      setReceipt(
        parsed.sourceVersion === 1
          ? "Legacy backup restored. Historical records were retained and v2 training data starts empty."
          : "Backup restored successfully.",
      );
    } catch {
      useProgramStore
        .getState()
        .hydrateProgramData(prior.programs, prior.mesocycles);
      useProgramStore.getState().setActiveProgram(prior.activeProgramId);
      useExecutionHistoryStore.getState().hydrateWorkouts(prior.workouts);
      useProgressionStore.getState().hydrateDecisions(prior.decisions);
      useTrainingConstraintStore.getState().hydrateConstraints(prior.constraints);
      useSettingsStore.getState().hydrateSettings(prior.settings);
      useCustomExerciseStore
        .getState()
        .hydrateExercises(prior.customExercises);
      useHistoryStore.getState().hydrateHistory(prior.legacyHistory);
      useInjuryStore.getState().hydrateInjuries(prior.legacyInjuries);
      setError("Restore failed. Previous local data was restored.");
    }
  };

  return (
    <section className="surface-card space-y-4 p-4 sm:p-5">
      <div>
        <h2 className="text-base font-bold text-text">Backup and restore</h2>
        <p className="mt-1 text-sm leading-6 text-text-muted">
          Export a local JSON backup containing programs, cycles, completed workouts,
          adaptive decisions, constraints, settings, and retained legacy history.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" onClick={exportBackup} disabled={workoutActive}>
          Export backup
        </Button>
        <Button
          variant="secondary"
          onClick={() => inputRef.current?.click()}
          disabled={workoutActive}
        >
          Restore backup
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          aria-label="Choose Macht backup file"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            void file.text().then(applyBackup).catch(() => {
              setError("Could not read that backup file.");
            });
          }}
        />
      </div>

      {workoutActive ? (
        <p className="text-xs leading-5 text-caution">
          Backup actions are paused while a session is active so in-progress work stays
          untouched.
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="text-xs leading-5 text-negative">
          {error}
        </p>
      ) : null}
      {receipt ? (
        <p role="status" className="text-xs leading-5 text-positive">
          {receipt}
        </p>
      ) : null}
    </section>
  );
}
