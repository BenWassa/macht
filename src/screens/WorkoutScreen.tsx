import { useEffect, useState } from "react";
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

  // Media Session API — enables lock-screen "next set" button on mobile
  useEffect(() => {
    if (!workout.workoutActive || !("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: workout.workoutName,
      artist: "Macht",
    });
    const markSetDone = () => {
      const { activeWorkoutList, selectedExIndex, selectedSetIndex, workoutSets } =
        useWorkoutStore.getState();
      const exerciseId = activeWorkoutList[selectedExIndex];
      if (!exerciseId) return;
      const sets = workoutSets[exerciseId] ?? [];
      if (sets[selectedSetIndex] && !sets[selectedSetIndex].completed) {
        workout.toggleComplete(exerciseId, selectedSetIndex);
      }
    };
    navigator.mediaSession.setActionHandler("play", markSetDone);
    navigator.mediaSession.setActionHandler("pause", markSetDone);
    navigator.mediaSession.setActionHandler("nexttrack", () => {
      const { activeWorkoutList, selectedExIndex } = useWorkoutStore.getState();
      if (selectedExIndex < activeWorkoutList.length - 1) {
        workout.setSelectedExIndex(selectedExIndex + 1);
      }
    });
    navigator.mediaSession.setActionHandler("previoustrack", () => {
      const { selectedExIndex } = useWorkoutStore.getState();
      if (selectedExIndex > 0) {
        workout.setSelectedExIndex(selectedExIndex - 1);
      }
    });
    return () => {
      navigator.mediaSession.setActionHandler("play", null);
      navigator.mediaSession.setActionHandler("pause", null);
      navigator.mediaSession.setActionHandler("nexttrack", null);
      navigator.mediaSession.setActionHandler("previoustrack", null);
    };
  }, [workout.workoutActive, workout.workoutName]);

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
