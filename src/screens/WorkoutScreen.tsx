import { useState } from "react";
import { PlateVisualizer } from "@/components/PlateVisualizer";
import { getExerciseConflict } from "@/domain/injuries";
import { AddExerciseModal } from "@/modals/AddExerciseModal";
import { getExercisePrescription } from "@/domain/prescriptions";
import type { SetEntry } from "@/domain/types";
import { useWakeLock } from "@/hooks/useWakeLock";
import { useWorkoutMediaSession } from "@/hooks/useWorkoutMediaSession";
import { vibrate } from "@/lib/haptics";
import { ExerciseTabs } from "@/screens/workout/ExerciseTabs";
import { WorkoutActionsBar } from "@/screens/workout/WorkoutActionsBar";
import { InjuryConflictBanner } from "@/screens/workout/InjuryConflictBanner";
import { PlannedWorkoutExecution } from "@/screens/workout/PlannedWorkoutExecution";
import { WorkoutSetTable } from "@/screens/workout/WorkoutSetTable";
import { useCustomExerciseStore } from "@/state/useCustomExerciseStore";
import { useInjuryStore } from "@/state/useInjuryStore";
import { useSettingsStore } from "@/state/useSettingsStore";
import { useToastStore } from "@/state/useToastStore";
import { useWorkoutStore } from "@/state/useWorkoutStore";

interface WorkoutScreenProps {
  onFinish: () => void;
  onSetCompleted: (options: {
    advanceAfterRest: boolean;
    restSeconds?: number;
  }) => void;
  onStartWarmup: () => void;
}

export function WorkoutScreen({
  onFinish,
  onSetCompleted,
  onStartWarmup,
}: WorkoutScreenProps) {
  const settings = useSettingsStore();
  const customExercises = useCustomExerciseStore((state) => state.exercises);
  const injuries = useInjuryStore((state) => state.injuries);
  const workout = useWorkoutStore();
  const showToast = useToastStore((state) => state.show);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [wakeLockEnabled, setWakeLockEnabled] = useState(true);

  useWakeLock(workout.workoutActive && wakeLockEnabled);
  useWorkoutMediaSession(workout.workoutActive ? workout.workoutName : "");

  if (!workout.workoutActive) {
    return (
      <div className="animate-rise-in space-y-5">
        <header>
          <p className="text-sm font-medium text-text-muted">Session</p>
          <h1 className="mt-1 text-3xl font-bold tracking-[-0.04em] text-text">
            No workout active
          </h1>
        </header>
        <div className="surface-card p-6 text-sm text-text-muted">
          Start today&apos;s planned workout from Today or choose a legacy plan from Program.
        </div>
      </div>
    );
  }

  if (workout.activeV2Workout) {
    return (
      <PlannedWorkoutExecution
        onFinish={onFinish}
        onSetCompleted={onSetCompleted}
        onStartWarmup={onStartWarmup}
        wakeLockActive={wakeLockEnabled}
        onToggleWakeLock={() => setWakeLockEnabled((value) => !value)}
      />
    );
  }

  const selectedExerciseId = workout.activeWorkoutList[workout.selectedExIndex];
  const selectedSets = workout.workoutSets[selectedExerciseId] ?? [];
  const selectedSet = selectedSets[workout.selectedSetIndex] ?? selectedSets[0];
  const selectedPrescription = getExercisePrescription(
    selectedExerciseId,
    customExercises,
  );
  const conflict = getExerciseConflict(selectedExerciseId, injuries);
  const lastSetText = selectedSet?.last;
  const showLastSet =
    lastSetText && lastSetText !== "-" && /[×x@]/.test(lastSetText);

  const toggleComplete = (exerciseId: string, setIndex: number) => {
    const completedNow = workout.toggleComplete(exerciseId, setIndex);
    if (completedNow) {
      const { workoutSets, activeWorkoutList } = useWorkoutStore.getState();
      const allSetsComplete = activeWorkoutList.every((id) =>
        (workoutSets[id] ?? []).every((set) => set.completed),
      );
      if (allSetsComplete) {
        vibrate([20, 60, 20]);
        showToast("All sets complete · Session done", {
          label: "Finish",
          onAction: onFinish,
        });
      } else {
        vibrate(15);
        const advanceAfterRest = setIndex === selectedSets.length - 1;
        onSetCompleted({ advanceAfterRest });
        showToast(`Set ${setIndex + 1} logged`, {
          label: "Undo",
          onAction: () => workout.toggleComplete(exerciseId, setIndex),
        });
      }
    }
    return completedNow;
  };

  const updateSet = <K extends keyof SetEntry>(
    setIndex: number,
    field: K,
    value: SetEntry[K],
  ) => workout.updateSetField(selectedExerciseId, setIndex, field, value);

  return (
    <div className="animate-fadeIn">
      <WorkoutActionsBar
        isMinimumSession={workout.isMinimumSession}
        wakeLockActive={wakeLockEnabled}
        onAddExercise={() => setShowAddExercise(true)}
        onStartWarmup={onStartWarmup}
        onToggleMinimum={() =>
          workout.setIsMinimumSession(!workout.isMinimumSession)
        }
        onToggleWakeLock={() => setWakeLockEnabled((prev) => !prev)}
        onFinish={onFinish}
      />

      <ExerciseTabs
        exercises={workout.activeWorkoutList}
        selectedIndex={workout.selectedExIndex}
        injuries={injuries}
        onSelect={workout.setSelectedExIndex}
      />

      {conflict && (
        <InjuryConflictBanner
          conflict={conflict}
          exerciseId={selectedExerciseId}
          onSubstitute={workout.substituteExercise}
        />
      )}

      <WorkoutSetTable
        sets={selectedSets}
        selectedSetIndex={workout.selectedSetIndex}
        prescription={selectedPrescription}
        settings={settings}
        suggestion={workout.loadSuggestions?.[selectedExerciseId]}
        onSelectSet={workout.setSelectedSetIndex}
        onToggleComplete={(index) => toggleComplete(selectedExerciseId, index)}
        onUpdateSet={updateSet}
        onAppendSet={() => workout.appendSet(selectedExerciseId)}
      />

      {showLastSet && (
        <div className="mb-3 flex items-baseline justify-between gap-3 border-t border-edge pt-2.5">
          <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
            Last time
          </span>
          <span className="truncate font-mono text-xs text-neutral-400">
            {lastSetText}
          </span>
        </div>
      )}

      <div className="mb-3 border-t border-edge pt-2.5">
        <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-neutral-500">
          Notes
        </label>
        <textarea
          value={workout.exerciseNotes[selectedExerciseId] ?? ""}
          onChange={(e) =>
            workout.setExerciseNote(selectedExerciseId, e.target.value)
          }
          placeholder="Form cues, observations, upgrades..."
          rows={2}
          className="w-full resize-none border border-edge bg-black p-2 font-mono text-[11px] text-neutral-300 placeholder-neutral-700 focus:border-neutral-600 focus:outline-none"
        />
      </div>

      {selectedSet &&
        selectedPrescription.showPlateVisualizer &&
        selectedSet.weight > 0 && (
          <PlateVisualizer weight={selectedSet.weight} units={settings.units} />
        )}

      {showAddExercise && (
        <AddExerciseModal onClose={() => setShowAddExercise(false)} />
      )}
    </div>
  );
}
