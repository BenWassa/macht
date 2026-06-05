import { ArrowLeft, Play, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import { getExerciseById } from "@/domain/exerciseLibrary";
import type { TabId } from "@/App";
import { CustomExerciseForm } from "@/screens/freeplay/CustomExerciseForm";
import { ExercisePicker } from "@/screens/freeplay/ExercisePicker";
import { useCustomExerciseStore } from "@/state/useCustomExerciseStore";
import { useInjuryStore } from "@/state/useInjuryStore";
import { useWorkoutStore } from "@/state/useWorkoutStore";

interface FreePlayScreenProps {
  setActiveTab: (tab: TabId) => void;
}

export function FreePlayScreen({ setActiveTab }: FreePlayScreenProps) {
  const injuries = useInjuryStore((state) => state.injuries);
  const customExercises = useCustomExerciseStore((state) => state.exercises);
  const addCustomExercise = useCustomExerciseStore(
    (state) => state.addExercise,
  );
  const startTemplate = useWorkoutStore((state) => state.startTemplate);
  const [selected, setSelected] = useState<string[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customTarget, setCustomTarget] = useState("");
  const [customWeight, setCustomWeight] = useState(20);
  const [customReps, setCustomReps] = useState(8);
  const [createError, setCreateError] = useState<string | null>(null);

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );

  const createExercise = () => {
    const result = addCustomExercise({
      name: customName,
      target: customTarget,
      defaultWeight: customWeight,
      defaultReps: customReps,
    });
    if (!result.ok) {
      setCreateError(result.error);
      return;
    }
    setSelected((prev) => [...prev, result.exercise.id]);
    setCreateError(null);
    setCustomName("");
    setCustomTarget("");
    setCustomWeight(20);
    setCustomReps(8);
    setShowCreate(false);
  };

  const start = () => {
    if (selected.length === 0) return;
    startTemplate({
      id: "freeplay",
      name: "Free Play",
      notes: "Custom session",
      exercises: selected,
    });
    setActiveTab("workout");
  };

  return (
    <div className="animate-fadeIn pb-28">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="mb-1 font-mono text-[9px] uppercase tracking-widest text-neutral-500">
            Free play
          </p>
          <h1 className="font-mono text-xl font-bold uppercase tracking-tight">
            Build session
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCreate((value) => !value)}
            aria-expanded={showCreate}
            className="flex items-center gap-1.5 border border-edge bg-black px-3 py-2 font-mono text-[9px] font-bold uppercase tracking-widest text-neutral-400 transition hover:text-neutral-200"
          >
            <Plus className="h-3.5 w-3.5" /> New
          </button>
          <button
            onClick={() => setActiveTab("home")}
            className="flex items-center gap-1.5 border border-edge bg-black px-3 py-2 font-mono text-[9px] font-bold uppercase tracking-widest text-neutral-400 transition hover:text-neutral-200"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Cancel
          </button>
        </div>
      </div>

      {showCreate && (
        <CustomExerciseForm
          name={customName}
          target={customTarget}
          defaultWeight={customWeight}
          defaultReps={customReps}
          error={createError}
          onNameChange={setCustomName}
          onTargetChange={setCustomTarget}
          onDefaultWeightChange={setCustomWeight}
          onDefaultRepsChange={setCustomReps}
          onCreate={createExercise}
          onClose={() => setShowCreate(false)}
        />
      )}

      <ExercisePicker
        selectedIds={selectedSet}
        onToggle={toggle}
        injuries={injuries}
      />

      <div className="fixed bottom-16 left-0 right-0 z-30 border-t border-edge bg-[#0c0c0c]/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto w-full max-w-2xl">
          {selected.length > 0 ? (
            <div className="mb-3 flex flex-wrap gap-2">
              {selected.map((id) => {
                const exercise = getExerciseById(id, customExercises);
                return (
                  <button
                    key={id}
                    onClick={() => toggle(id)}
                    className="flex items-center gap-1.5 border border-blue-900 bg-blue-950/30 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-wide text-blue-300 transition hover:bg-blue-950/60"
                  >
                    {exercise?.name ?? id}
                    <X className="h-3 w-3" />
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-neutral-500">
              Pick exercises to build your session
            </p>
          )}
          <button
            onClick={start}
            disabled={selected.length === 0}
            className="flex w-full items-center justify-center gap-2 bg-blue-600 py-3 font-mono text-xs font-bold uppercase tracking-widest text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-500"
          >
            <Play className="h-4 w-4 fill-white" />
            Start session
            {selected.length > 0 && ` · ${selected.length}`}
          </button>
        </div>
      </div>
    </div>
  );
}
