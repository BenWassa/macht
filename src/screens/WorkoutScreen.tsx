import { useState } from "react";
import { PlateVisualizer } from "@/components/PlateVisualizer";
import { getExerciseConflict } from "@/domain/injuries";
import { AddExerciseModal } from "@/modals/AddExerciseModal";
import { getExercisePrescription } from "@/domain/prescriptions";
import type { SetEntry } from "@/domain/types";
import { useWakeLock } from "@/hooks/useWakeLock";
import { vibrate } from "@/lib/haptics";
import { ExerciseTabs } from "@/screens/workout/ExerciseTabs";
import { WorkoutActionsBar } from "@/screens/workout/WorkoutActionsBar";
import { InjuryConflictBanner } from "@/screens/workout/InjuryConflictBanner";
import { WorkoutSetTable } from "@/screens/workout/WorkoutSetTable";
import { useCustomExerciseStore } from "@/state/useCustomExerciseStore";
import { useInjuryStore } from "@/state/useInjuryStore";
import { useSettingsStore } from "@/state/useSettingsStore";
import { useToastStore } from "@/state/useToastStore";
import { useWorkoutStore } from "@/state/useWorkoutStore";

interface WorkoutScreenProps {
  onFinish: () => void;
  onSetCompleted: (options: { advanceAfterRest: boolean }) => void;
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

  useWakeLock(workout.workoutActive);

  if (!workout.workoutActive) {
    return (
      <div className="animate-fadeIn">
        <div className="mb-10">
          <p className="mb-1 font-mono text-[9px] uppercase tracking-widest text-neutral-500">
            Active workout
          </p>
          <h1 className="font-mono text-xl font-bold uppercase tracking-tight">
            Session
          </h1>
        </div>
        <div className="border border-dashed border-edge bg-well p-8 text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
            No session active. Go to Plans to start.
          </p>
        </div>
      </div>
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
        onAddExercise={() => setShowAddExercise(true)}
        onStartWarmup={onStartWarmup}
        onToggleMinimum={() =>
          workout.setIsMinimumSession(!workout.isMinimumSession)
        }
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
