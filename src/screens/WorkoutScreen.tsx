import { AlertTriangle } from "lucide-react";
import { PlateVisualizer } from "@/components/PlateVisualizer";
import { SetRow } from "@/components/SetRow";
import { getExerciseById } from "@/domain/exercises";
import { getExerciseConflict } from "@/domain/injuries";
import { getExercisePrescription } from "@/domain/prescriptions";
import type { SetEntry } from "@/domain/types";
import { useWakeLock } from "@/hooks/useWakeLock";
import { vibrate } from "@/lib/haptics";
import { useInjuryStore } from "@/state/useInjuryStore";
import { useSettingsStore } from "@/state/useSettingsStore";
import { useToastStore } from "@/state/useToastStore";
import { useWorkoutStore } from "@/state/useWorkoutStore";

interface WorkoutScreenProps {
  onFinish: () => void;
  onSetCompleted: () => void;
}

export function WorkoutScreen({ onFinish, onSetCompleted }: WorkoutScreenProps) {
  const settings = useSettingsStore();
  const injuries = useInjuryStore((state) => state.injuries);
  const workout = useWorkoutStore();
  const showToast = useToastStore((state) => state.show);

  useWakeLock(workout.workoutActive);

  if (!workout.workoutActive) {
    return (
      <div className="animate-fadeIn">
        <div className="mb-10">
          <p className="mb-1 font-mono text-[9px] uppercase tracking-widest text-neutral-500">
            Active workout
          </p>
          <h1 className="font-mono text-xl font-bold uppercase tracking-tight">Session</h1>
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
  const selectedPrescription = getExercisePrescription(selectedExerciseId);
  const conflict = getExerciseConflict(selectedExerciseId, injuries);

  const toggleComplete = (exerciseId: string, setIndex: number) => {
    const completedNow = workout.toggleComplete(exerciseId, setIndex);
    if (completedNow) {
      vibrate(15);
      onSetCompleted();
      showToast(`Set ${setIndex + 1} logged`, {
        label: "Undo",
        onAction: () => workout.toggleComplete(exerciseId, setIndex),
      });
    }
  };

  const updateSet = <K extends keyof SetEntry>(setIndex: number, field: K, value: SetEntry[K]) => {
    workout.updateSetField(selectedExerciseId, setIndex, field, value);
  };

  return (
    <div className="animate-fadeIn">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h1 className="truncate font-mono text-xl font-bold uppercase tracking-tight">
          {workout.workoutName}
        </h1>
        <div className="flex shrink-0 items-center gap-3">
          <button
            onClick={() => workout.setIsMinimumSession(!workout.isMinimumSession)}
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

      <div
        className="mb-5 flex overflow-x-auto border-b border-edge bg-black scrollbar-none"
        role="tablist"
      >
        {workout.activeWorkoutList.map((exerciseId, index) => {
          const exercise = getExerciseById(exerciseId);
          const exerciseConflict = getExerciseConflict(exerciseId, injuries);
          const isActive = workout.selectedExIndex === index;
          return (
            <button
              key={`${exerciseId}-${index}`}
              onClick={() => workout.setSelectedExIndex(index)}
              role="tab"
              aria-selected={isActive}
              className={`relative min-w-[150px] shrink-0 border-r border-edge px-5 py-3.5 text-left transition ${isActive ? "bg-blue-950/20" : "hover:bg-canvas"}`}
            >
              <span className={`block truncate font-mono text-xs font-bold uppercase tracking-tight ${isActive ? "text-blue-400" : "text-neutral-400"}`}>
                {exercise?.name}
              </span>
              <span className={`mt-1 block font-mono text-[10px] uppercase tracking-wider ${
                exerciseConflict?.level === "avoid"
                  ? "font-bold text-red-500"
                  : exerciseConflict?.level === "caution"
                    ? "font-bold text-yellow-500"
                    : isActive
                      ? "text-blue-500/60"
                      : "text-neutral-500"
              }`}>
                {exerciseConflict?.level === "avoid"
                  ? "Avoid"
                  : exerciseConflict?.level === "caution"
                    ? "Caution"
                    : exercise?.target}
              </span>
              {isActive && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-500" />}
            </button>
          );
        })}
      </div>

      {conflict && (
        <div
          className={`mb-6 space-y-3 border p-4 ${
            conflict.level === "avoid"
              ? "border-red-900 bg-red-950/20"
              : "border-yellow-900 bg-yellow-950/20"
          }`}
        >
          <div
            className={`flex gap-3 ${
              conflict.level === "avoid" ? "text-red-300" : "text-yellow-300"
            }`}
          >
            <AlertTriangle
              className={`mt-0.5 h-4 w-4 shrink-0 ${
                conflict.level === "avoid" ? "text-red-400" : "text-yellow-400"
              }`}
            />
            <p
              className={`font-mono text-xs leading-relaxed ${
                conflict.level === "avoid" ? "text-red-300" : "text-yellow-300"
              }`}
            >
              Injury {conflict.level}: {conflict.injury}.{" "}
              {conflict.tags.join(", ").replace(/_/g, " ")}.
            </p>
          </div>
          {conflict.level === "avoid" && conflict.alternative && (
            <button
              onClick={() => workout.substituteExercise(selectedExerciseId, conflict.alternative!)}
              className="border border-red-900 bg-black px-4 py-3 font-mono text-xs font-bold uppercase text-red-300 transition hover:bg-red-950/30 active:bg-red-950/50"
            >
              Use {getExerciseById(conflict.alternative)?.name} instead
            </button>
          )}
        </div>
      )}

      <div className="mb-3">
        <div className="mb-3 border border-[#1a1a1a] bg-black px-3 py-2">
          <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-500">
            Plan
          </span>
          <p className="mt-1 font-mono text-xs font-bold uppercase tracking-tight text-neutral-300">
            {selectedPrescription.planned}
          </p>
        </div>
        <div className="mb-2 grid grid-cols-[40px_1.4fr_1.2fr_1fr_64px] border-b border-edge pb-3 font-mono text-[11px] font-bold uppercase tracking-widest text-neutral-500">
          <span className="text-center">#</span>
          <span className="text-center">
            {selectedPrescription.loadMode === "external" ? "Load" : "Mode"}
          </span>
          <span className="text-center">{selectedPrescription.metricLabel}</span>
          <span className="text-center">{settings.rpeMode}</span>
          <span className="text-center">Done</span>
        </div>
        <div className="border-x border-t border-edge">
          {selectedSets.map((set, index) => (
            <SetRow
              key={set.id}
              set={set}
              index={index}
              selected={workout.selectedSetIndex === index}
              effortLabel={settings.rpeMode}
              units={settings.units}
              loadMode={selectedPrescription.loadMode}
              loadDisplay={selectedPrescription.loadDisplay}
              metric={selectedPrescription.metric}
              onSelect={() => workout.setSelectedSetIndex(index)}
              onToggleComplete={() => toggleComplete(selectedExerciseId, index)}
              onUpdate={(field, value) => updateSet(index, field, value)}
            />
          ))}
        </div>
        <button
          onClick={() => workout.appendSet(selectedExerciseId)}
          className="mt-1 w-full border border-dashed border-[#1a1a1a] py-2.5 font-mono text-[10px] uppercase tracking-widest text-neutral-600 transition hover:border-[#252525] hover:text-neutral-400"
        >
          + Repeat last set
        </button>
      </div>

      <div className="mb-3 flex items-baseline justify-between gap-3 border-t border-edge pt-2.5">
        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
          Last time
        </span>
        <span className="truncate font-mono text-xs text-neutral-400">
          {selectedSet?.last ?? "—"}
        </span>
      </div>

      {selectedSet &&
        selectedPrescription.showPlateVisualizer &&
        selectedSet.weight > 0 && (
        <PlateVisualizer weight={selectedSet.weight} units={settings.units} />
      )}
    </div>
  );
}
