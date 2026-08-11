import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { applyWorkoutProgression } from "@/domain/execution/applyWorkoutProgression";
import { toLegacySessionLog, v2WorkoutSummary } from "@/domain/execution/legacyBridge";
import { completeWorkout } from "@/domain/execution/plannedWorkout";
import type { WorkoutSession } from "@/domain/execution/types";
import type { SessionWorkload } from "@/domain/feedback/types";
import { buildPersonalTrainingModel } from "@/domain/personalization/model";
import type { SessionLog } from "@/domain/types";
import { useModalA11y } from "@/hooks/useModalA11y";
import { formatTime, todayIso } from "@/lib/format";
import { useCustomExerciseStore } from "@/state/useCustomExerciseStore";
import { useExecutionHistoryStore } from "@/state/useExecutionHistoryStore";
import { useHistoryStore } from "@/state/useHistoryStore";
import { useProgramStore } from "@/state/useProgramStore";
import { useProgressionStore } from "@/state/useProgressionStore";
import { useSettingsStore } from "@/state/useSettingsStore";
import { useWorkoutStore } from "@/state/useWorkoutStore";

interface SavedSummary {
  duration: string;
  sets: number;
  volume: number;
  targetsModified: boolean;
  personalRecords: number;
  recommendationsApplied: number;
  personalizationsApplied: number;
}

interface FinishSessionModalProps {
  onClose: () => void;
  onSaved: (summary: SavedSummary) => void;
}

const WORKLOAD_OPTIONS: Array<{ value: SessionWorkload; label: string }> = [
  { value: "easy", label: "Easy" },
  { value: "appropriate", label: "On target" },
  { value: "pushing_limit", label: "Near limit" },
  { value: "too_much", label: "Too much" },
];

const countPrs = (session: SessionLog, history: SessionLog[]): number =>
  (session.exerciseSnapshots ?? []).filter((snapshot) => {
    if (!snapshot.e1rm) return false;
    const previousBest = Math.max(
      0,
      ...history.flatMap((item) =>
        (item.exerciseSnapshots ?? [])
          .filter((prior) => prior.exerciseId === snapshot.exerciseId)
          .map((prior) => prior.e1rm ?? 0),
      ),
    );
    return previousBest > 0 && snapshot.e1rm > previousBest;
  }).length;

const v2TargetsModified = (workout: WorkoutSession): boolean =>
  workout.exercisePerformances.some((exercise) =>
    exercise.sets.some((set) => {
      if (!set.completed) return false;
      if (!set.prescription) return true;
      return (
        (set.prescription.targetLoad != null &&
          set.actualLoad !== set.prescription.targetLoad) ||
        (set.prescription.targetReps != null &&
          set.actualReps !== set.prescription.targetReps)
      );
    }),
  );

export function FinishSessionModal({
  onClose,
  onSaved,
}: FinishSessionModalProps) {
  const legacySessions = useHistoryStore((state) => state.sessions);
  const v2History = useExecutionHistoryStore((state) => state.workouts);
  const addV2Workout = useExecutionHistoryStore((state) => state.addWorkout);
  const programs = useProgramStore((state) => state.programs);
  const mesocycles = useProgramStore((state) => state.mesocycles);
  const upsertMesocycle = useProgramStore((state) => state.upsertMesocycle);
  const completePlannedSession = useProgramStore(
    (state) => state.completePlannedSession,
  );
  const decisions = useProgressionStore((state) => state.decisions);
  const addDecisions = useProgressionStore((state) => state.addDecisions);
  const customExercises = useCustomExerciseStore((state) => state.exercises);
  const units = useSettingsStore((state) => state.units);
  const workout = useWorkoutStore();
  const containerRef = useModalA11y<HTMLDivElement>(onClose);
  const [workload, setWorkload] = useState<SessionWorkload | undefined>();
  const active = workout.activeV2Workout;

  if (!active) return null;

  const save = () => {
    const withFeedback: WorkoutSession = {
      ...active,
      sessionFeedback: workload
        ? {
            workload,
            durationPressure:
              workload === "pushing_limit" || workload === "too_much",
          }
        : active.sessionFeedback,
    };
    const completed = completeWorkout(
      withFeedback,
      new Date().toISOString(),
      workout.workoutDuration,
    );
    const legacyView = toLegacySessionLog(completed);
    const previousHistory = [
      ...v2History.map(toLegacySessionLog),
      ...legacySessions,
    ];
    const summary = v2WorkoutSummary(completed);
    const personalRecords = countPrs(legacyView, previousHistory);
    const targetsModified = v2TargetsModified(completed);
    let recommendationsApplied = 0;
    let personalizationsApplied = 0;

    const program = programs.find((item) => item.id === completed.programId);
    const mesocycle = mesocycles.find((item) => item.id === completed.mesocycleId);
    if (program && mesocycle) {
      const personalTrainingModel = buildPersonalTrainingModel({
        decisions,
        mesocycles,
        customExercises,
        asOfDate: todayIso(),
        generatedAt: completed.finishedAt ?? new Date().toISOString(),
      });
      const progression = applyWorkoutProgression({
        workout: completed,
        program,
        mesocycle,
        availableLoadIncrement: units === "kgs" ? 1.25 : 2.5,
        personalTrainingModel,
      });
      recommendationsApplied = progression.decisions.length;
      personalizationsApplied = progression.decisions.filter(
        (decision) => decision.personalization,
      ).length;
      if (progression.decisions.length) {
        addDecisions(progression.decisions);
        upsertMesocycle(progression.mesocycle);
      }
    }

    addV2Workout(completed);
    if (completed.plannedSessionId) {
      completePlannedSession(completed.plannedSessionId);
    }
    workout.endSession();
    onSaved({
      duration: legacyView.duration,
      sets: summary.sets,
      volume: summary.volume,
      targetsModified,
      personalRecords,
      recommendationsApplied,
      personalizationsApplied,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-3 sm:items-center">
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="finish-session-dialog-title"
        className="surface-raised w-full max-w-sm space-y-5 p-5"
      >
        <div>
          <h3
            id="finish-session-dialog-title"
            className="text-xl font-bold tracking-[-0.03em] text-text"
          >
            Finish session
          </h3>
          <p className="mt-1 text-sm text-text-muted">
            {formatTime(workout.workoutDuration)} elapsed
          </p>
        </div>

        <fieldset>
          <legend className="text-sm font-semibold text-text-secondary">
            How demanding was the session?
          </legend>
          <p className="mt-1 text-xs text-text-muted">
            Optional. This helps future volume decisions.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {WORKLOAD_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={workload === option.value}
                onClick={() =>
                  setWorkload((current) =>
                    current === option.value ? undefined : option.value,
                  )
                }
                className={`min-h-11 rounded-sm px-3 text-sm font-semibold transition ${
                  workload === option.value
                    ? "bg-signal-soft text-signal-strong"
                    : "bg-surface-3 text-text-secondary"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={save} className="flex-1">
            Save session
          </Button>
        </div>
      </div>
    </div>
  );
}
