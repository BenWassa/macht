import { AlertTriangle } from 'lucide-react';
import { PlateVisualizer } from '@/components/PlateVisualizer';
import { SetRow } from '@/components/SetRow';
import { getExerciseById } from '@/domain/exercises';
import { getExerciseConflict } from '@/domain/injuries';
import type { SetEntry } from '@/domain/types';
import { useInjuryStore } from '@/state/useInjuryStore';
import { useSettingsStore } from '@/state/useSettingsStore';
import { useWorkoutStore } from '@/state/useWorkoutStore';

interface WorkoutScreenProps {
  onFinish: () => void;
  onSetCompleted: () => void;
}

export function WorkoutScreen({ onFinish, onSetCompleted }: WorkoutScreenProps) {
  const settings = useSettingsStore();
  const injuries = useInjuryStore((state) => state.injuries);
  const workout = useWorkoutStore();

  if (!workout.workoutActive) {
    return (
      <div className="animate-fadeIn">
        <div className="mb-10">
          <p className="mb-1 font-mono text-[9px] uppercase tracking-widest text-neutral-500">Active workout</p>
          <h1 className="font-mono text-xl font-bold uppercase tracking-tight">Session</h1>
        </div>
        <div className="border border-dashed border-[#1a1a1a] bg-[#080808] p-8 text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">No session active. Go to Plans to start.</p>
        </div>
      </div>
    );
  }

  const selectedExerciseId = workout.activeWorkoutList[workout.selectedExIndex];
  const selectedSets = workout.workoutSets[selectedExerciseId] ?? [];
  const selectedSet = selectedSets[workout.selectedSetIndex] ?? selectedSets[0];
  const conflict = getExerciseConflict(selectedExerciseId, injuries);

  const toggleComplete = (exerciseId: string, setIndex: number) => {
    const completedNow = workout.toggleComplete(exerciseId, setIndex);
    if (completedNow) onSetCompleted();
  };

  const updateSet = <K extends keyof SetEntry>(setIndex: number, field: K, value: SetEntry[K]) => {
    workout.updateSetField(selectedExerciseId, setIndex, field, value);
  };

  return (
    <div className="animate-fadeIn">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="mb-1 font-mono text-[9px] uppercase tracking-widest text-neutral-500">Active workout</p>
          <h1 className="font-mono text-xl font-bold uppercase tracking-tight">{workout.workoutName}</h1>
        </div>
        <button onClick={onFinish} className="shrink-0 bg-emerald-600 px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest text-white transition hover:bg-emerald-700 active:bg-emerald-800">Finish</button>
      </div>

      <div className="mb-6 flex items-center justify-between px-0.5">
        <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-600">Minimum session</span>
        <button
          onClick={() => workout.setIsMinimumSession(!workout.isMinimumSession)}
          className={`h-5 w-10 border p-0.5 transition ${workout.isMinimumSession ? 'border-blue-700 bg-blue-950' : 'border-[#222] bg-black'}`}
          aria-label="Toggle minimum session"
        >
          <span className={`block h-3 w-3 bg-neutral-200 transition-transform ${workout.isMinimumSession ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {workout.activeWorkoutList.map((exerciseId, index) => {
          const exercise = getExerciseById(exerciseId);
          const hasConflict = getExerciseConflict(exerciseId, injuries);
          return (
            <button
              key={`${exerciseId}-${index}`}
              onClick={() => workout.setSelectedExIndex(index)}
              className={`min-w-32 shrink-0 border px-3 py-2 text-left transition ${
                workout.selectedExIndex === index ? 'border-blue-800 bg-blue-950/20' : 'border-[#1a1a1a] bg-[#0c0c0c]'
              }`}
            >
              <span className="block truncate font-mono text-[10px] font-bold uppercase text-neutral-300">{exercise?.name}</span>
              <span className={`mt-1 block font-mono text-[8px] uppercase ${hasConflict ? 'text-red-400' : 'text-neutral-600'}`}>{hasConflict ? 'Conflict' : exercise?.target}</span>
            </button>
          );
        })}
      </div>

      {conflict && (
        <div className="mb-6 space-y-3 border border-red-900 bg-red-950/20 p-3">
          <div className="flex gap-3 text-red-300">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
            <p className="font-mono text-[11px] leading-relaxed text-red-300">Injury conflict: {conflict.injury}. {conflict.tags.join(', ').replace(/_/g, ' ')}.</p>
          </div>
          {conflict.alternative && (
            <button
              onClick={() => workout.substituteExercise(selectedExerciseId, conflict.alternative!)}
              className="border border-red-900 bg-black px-3 py-2 font-mono text-[10px] font-bold uppercase text-red-300 transition hover:bg-red-950/30 active:bg-red-950/50"
            >
              Use {getExerciseById(conflict.alternative)?.name} instead
            </button>
          )}
        </div>
      )}

      <div className="mb-10">
        <div className="mb-1 grid grid-cols-[40px_1.4fr_1.2fr_1fr_52px] border-b border-[#1a1a1a] pb-2 font-mono text-[9px] font-bold uppercase tracking-widest text-neutral-600">
          <span className="text-center">#</span>
          <span className="text-center">Weight</span>
          <span className="text-center">Reps</span>
          <span className="text-center">{settings.rpeMode}</span>
          <span />
        </div>
        <div className="border-x border-t border-[#1a1a1a]">
          {selectedSets.map((set, index) => (
            <SetRow
              key={set.id}
              set={set}
              index={index}
              selected={workout.selectedSetIndex === index}
              effortLabel={settings.rpeMode}
              onSelect={() => workout.setSelectedSetIndex(index)}
              onToggleComplete={() => toggleComplete(selectedExerciseId, index)}
              onUpdate={(field, value) => updateSet(index, field, value)}
            />
          ))}
        </div>
      </div>

      <div className="mb-4 border-t border-[#1a1a1a] pt-4">
        <span className="mb-1 block font-mono text-[9px] uppercase tracking-widest text-neutral-600">Last time</span>
        <p className="font-mono text-xs text-neutral-400">{selectedSet?.last ?? '—'}</p>
      </div>

      {selectedSet && <PlateVisualizer weight={selectedSet.weight} units={settings.units} />}
    </div>
  );
}
