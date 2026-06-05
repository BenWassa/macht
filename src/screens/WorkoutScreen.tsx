import { Plus } from "lucide-react";
import { useState } from "react";
import { PlateVisualizer } from "@/components/PlateVisualizer";
import { getExerciseConflict } from "@/domain/injuries";
import { AddExerciseModal } from "@/modals/AddExerciseModal";
import { getExercisePrescription } from "@/domain/prescriptions";
import type { SetEntry } from "@/domain/types";
import { useWakeLock } from "@/hooks/useWakeLock";
import { vibrate } from "@/lib/haptics";
import { ExerciseTabs } from "@/screens/workout/ExerciseTabs";
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
}

export function WorkoutScreen({ onFinish, onSetCompleted }: WorkoutScreenProps) {
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
  const selectedPrescription = getExercisePrescription(selectedExerciseId, customExercises);
  const conflict = getExerciseConflict(selectedExerciseId, injuries);
  const lastSetText = selectedSet?.last;
  const showLastSet =
    lastSetText && lastSetText !== "-" && /[×x@]/.test(lastSetText);

  const toggleComplete = (exerciseId: string, setIndex: number) => {
    const completedNow = workout.toggleComplete(exerciseId, setIndex);
    if (completedNow) {
      vibrate(15);
      const advanceAfterRest = setIndex === selectedSets.length - 1;
      onSetCompleted({ advanceAfterRest });
      showToast(`Set ${setIndex + 1} logged`, {
        label: "Undo",
        onAction: () => workout.toggleComplete(exerciseId, setIndex),
      });
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
      <div className="mb-5 flex items-center justify-between">
        <button
          onClick={() => setShowAddExercise(true)}
          className="flex items-center gap-1.5 border border-[#222] bg-black px-3 py-2 font-mono text-[9px] font-bold uppercase tracking-widest text-neutral-400 transition hover:text-neutral-200"
        >
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              workout.setIsMinimumSession(!workout.isMinimumSession)
            }
            aria-pressed={workout.isMinimumSession}
            className={`border px-3 py-2 font-mono text-[9px] font-bold uppercase tracking-widest transition ${
              workout.isMinimumSession
                ? "border-blue-700 bg-blue-950 text-blue-300"
                : "border-[#222] bg-black text-neutral-500 hover:text-neutral-300"
            }`}
          >
            Min
          </button>
          <button
            onClick={onFinish}
            className="bg-emerald-600 px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-widest text-white transition hover:bg-emerald-700 active:bg-emerald-800"
          >
            Finish
          </button>
        </div>
      </div>

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
