import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { getExerciseById } from "@/domain/exerciseLibrary";
import { allWorkingSetsComplete } from "@/domain/execution/plannedWorkout";
import { findPreviousExercisePerformance } from "@/domain/execution/previousPerformance";
import { vibrate } from "@/lib/haptics";
import { ExerciseFeedbackCard } from "@/screens/workout/ExerciseFeedbackCard";
import { PlannedExerciseNav } from "@/screens/workout/PlannedExerciseNav";
import { PlannedSetCard } from "@/screens/workout/PlannedSetCard";
import { PlannedSubstitutionModal } from "@/screens/workout/PlannedSubstitutionModal";
import { PlannedWorkoutHeader } from "@/screens/workout/PlannedWorkoutHeader";
import { PreviousPerformanceStrip } from "@/screens/workout/PreviousPerformanceStrip";
import { useCustomExerciseStore } from "@/state/useCustomExerciseStore";
import { useExecutionHistoryStore } from "@/state/useExecutionHistoryStore";
import { useHistoryStore } from "@/state/useHistoryStore";
import { useSettingsStore } from "@/state/useSettingsStore";
import { useToastStore } from "@/state/useToastStore";
import { useWorkoutStore } from "@/state/useWorkoutStore";

interface PlannedWorkoutExecutionProps {
  onFinish: () => void;
  onSetCompleted: (options: {
    advanceAfterRest: boolean;
    restSeconds?: number;
  }) => void;
  onStartWarmup: () => void;
  wakeLockActive: boolean;
  onToggleWakeLock: () => void;
}

const prescriptionSummary = (
  sets: number,
  min: number,
  max: number,
  effort?: { value: number; scale: string },
) =>
  `${sets} sets · ${min}–${max} reps${
    effort ? ` · ${effort.value} ${effort.scale}` : ""
  }`;

export function PlannedWorkoutExecution({
  onFinish,
  onSetCompleted,
  onStartWarmup,
  wakeLockActive,
  onToggleWakeLock,
}: PlannedWorkoutExecutionProps) {
  const workout = useWorkoutStore();
  const settings = useSettingsStore();
  const legacyHistory = useHistoryStore((state) => state.sessions);
  const v2History = useExecutionHistoryStore((state) => state.workouts);
  const customExercises = useCustomExerciseStore((state) => state.exercises);
  const showToast = useToastStore((state) => state.show);
  const [showSubstitution, setShowSubstitution] = useState(false);
  const session = workout.activeV2Workout;

  const exercise = session?.exercisePerformances[workout.selectedExIndex];
  const selectedSet =
    exercise?.sets[workout.selectedSetIndex] ?? exercise?.sets[0];
  const exerciseDefinition = exercise
    ? getExerciseById(exercise.exerciseId, customExercises)
    : undefined;
  const previous = useMemo(
    () =>
      exercise && session
        ? findPreviousExercisePerformance(
            exercise.exerciseId,
            v2History,
            legacyHistory,
            session.id,
          )
        : undefined,
    [exercise, legacyHistory, session, v2History],
  );

  if (!session || !exercise || !selectedSet) return null;

  const prescription = exercise.prescription;
  const effortScale =
    prescription?.targetEffort?.scale ??
    selectedSet.prescription?.targetEffort?.scale ??
    settings.rpeMode;
  const activeSetIndex = exercise.sets.findIndex(
    (set) => set.id === selectedSet.id,
  );

  const toggleComplete = () => {
    const completedNow = workout.toggleV2Complete(exercise.id, selectedSet.id);
    if (!completedNow) return;
    const updated = useWorkoutStore.getState().activeV2Workout;
    if (updated && allWorkingSetsComplete(updated)) {
      vibrate([20, 60, 20]);
      showToast("All sets complete · Session ready to finish", {
        label: "Finish",
        onAction: onFinish,
      });
      return;
    }

    vibrate(15);
    const isLastSet = activeSetIndex === exercise.sets.length - 1;
    if (!isLastSet) workout.setSelectedSetIndex(activeSetIndex + 1);
    onSetCompleted({
      advanceAfterRest: isLastSet,
      restSeconds: prescription?.restSeconds,
    });
    showToast(`Set ${activeSetIndex + 1} logged`, {
      label: "Undo",
      onAction: () => workout.toggleV2Complete(exercise.id, selectedSet.id),
    });
  };

  return (
    <div className="animate-rise-in space-y-5">
      <PlannedWorkoutHeader
        sessionName={session.name}
        exerciseName={exerciseDefinition?.name ?? exercise.exerciseId}
        exerciseTarget={exerciseDefinition?.target}
        prescriptionSummary={prescriptionSummary(
          exercise.sets.length,
          prescription?.repRange.min ?? 0,
          prescription?.repRange.max ?? 0,
          prescription?.targetEffort,
        )}
        progressionAdjusted={prescription?.source === "progression_engine"}
        wakeLockActive={wakeLockActive}
        onWarmup={onStartWarmup}
        onSwap={() => setShowSubstitution(true)}
        onToggleWakeLock={onToggleWakeLock}
        onFinish={onFinish}
      />

      <PlannedExerciseNav
        exercises={session.exercisePerformances}
        selectedIndex={workout.selectedExIndex}
        onSelect={workout.setSelectedExIndex}
      />

      <PreviousPerformanceStrip previous={previous} units={settings.units} />

      <div className="scrollbar-none flex gap-2 overflow-x-auto">
        {exercise.sets.map((set, index) => (
          <button
            key={set.id}
            type="button"
            aria-current={set.id === selectedSet.id ? "step" : undefined}
            onClick={() => workout.setSelectedSetIndex(index)}
            className={`metric min-h-11 min-w-11 rounded-sm px-3 text-sm font-semibold transition ${
              set.id === selectedSet.id
                ? "bg-surface-3 text-text"
                : set.completed
                  ? "bg-positive-soft text-positive"
                  : "bg-surface-1 text-text-muted"
            }`}
          >
            {index + 1}
          </button>
        ))}
        <button
          type="button"
          onClick={() => workout.appendV2Set(exercise.id)}
          className="flex min-h-11 min-w-fit items-center gap-1.5 rounded-sm bg-surface-1 px-3 text-sm font-semibold text-text-muted transition hover:bg-surface-3 hover:text-text"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add set
        </button>
      </div>

      <PlannedSetCard
        set={selectedSet}
        units={settings.units}
        effortScale={effortScale}
        onUpdate={(patch) =>
          workout.updateV2Set(exercise.id, selectedSet.id, patch)
        }
        onToggleComplete={toggleComplete}
      />

      <ExerciseFeedbackCard
        feedback={exercise.feedback}
        onUpdate={(patch) => workout.updateV2ExerciseFeedback(exercise.id, patch)}
      />

      <label className="block">
        <span className="mb-2 block text-xs font-semibold text-text-muted">
          Exercise notes
        </span>
        <textarea
          rows={2}
          value={exercise.note ?? ""}
          onChange={(event) =>
            workout.setV2ExerciseNote(exercise.id, event.target.value)
          }
          placeholder="Form cues or observations"
          className="w-full resize-none rounded-md bg-surface-1 p-3 text-sm text-text outline-none placeholder:text-text-muted focus:ring-2 focus:ring-signal-strong"
        />
      </label>

      {showSubstitution ? (
        <PlannedSubstitutionModal
          currentExerciseId={exercise.exerciseId}
          allowedExerciseIds={prescription?.allowedSubstitutionExerciseIds}
          onSelect={(replacementExerciseId) =>
            workout.substituteV2Exercise(exercise.id, replacementExerciseId)
          }
          onClose={() => setShowSubstitution(false)}
        />
      ) : null}
    </div>
  );
}
