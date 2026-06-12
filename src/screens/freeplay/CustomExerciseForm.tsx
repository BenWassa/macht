import { Plus, X } from "lucide-react";
import { useEffect } from "react";

const TARGETS = [
  "Biceps",
  "Triceps",
  "Chest",
  "Back",
  "Shoulders",
  "Quads",
  "Hamstrings",
  "Glutes",
  "Calves",
  "Core",
  "Conditioning",
];

interface CustomExerciseFormProps {
  name: string;
  target: string;
  defaultWeight: number;
  defaultReps: number;
  error: string | null;
  onNameChange: (name: string) => void;
  onTargetChange: (target: string) => void;
  onDefaultWeightChange: (weight: number) => void;
  onDefaultRepsChange: (reps: number) => void;
  onCreate: () => void;
  onClose: () => void;
}

export function CustomExerciseForm({
  name,
  target,
  defaultWeight,
  defaultReps,
  error,
  onNameChange,
  onTargetChange,
  onDefaultWeightChange,
  onDefaultRepsChange,
  onCreate,
  onClose,
}: CustomExerciseFormProps) {
  useEffect(() => {
    const prior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => void (document.body.style.overflow = prior);
  }, []);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-sm border border-[#1a1a1a] bg-[#0c0c0c]"
      >
        <div className="flex items-center justify-between border-b border-[#1a1a1a] p-4">
          <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-neutral-300">
            New exercise
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close new exercise"
            className="text-neutral-500 hover:text-neutral-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4 p-4">
          <input
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="Exercise name"
            className="w-full border border-edge bg-[#070707] px-3 py-2 font-mono text-xs uppercase tracking-wide text-neutral-200 placeholder:text-neutral-600 focus:border-blue-800 focus:outline-none"
          />
          <div>
            <span className="mb-2 block font-mono text-[9px] uppercase tracking-widest text-neutral-500">
              Primary target
            </span>
            <div className="mb-2 flex flex-wrap gap-1.5">
              {TARGETS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => onTargetChange(item)}
                  className={`border px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-wider transition ${
                    target === item
                      ? "border-blue-700 bg-blue-950 text-blue-300"
                      : "border-[#222] bg-black text-neutral-500 hover:text-neutral-300"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
            <input
              value={target}
              onChange={(event) => onTargetChange(event.target.value)}
              placeholder="Custom target"
              className="w-full border border-edge bg-[#070707] px-3 py-2 font-mono text-xs uppercase tracking-wide text-neutral-200 placeholder:text-neutral-600 focus:border-blue-800 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label>
              <span className="mb-1 block font-mono text-[9px] uppercase tracking-widest text-neutral-500">
                Weight
              </span>
              <input
                type="number"
                min="0"
                value={defaultWeight}
                onChange={(event) =>
                  onDefaultWeightChange(Number(event.target.value))
                }
                className="w-full border border-edge bg-[#070707] px-3 py-2 font-mono text-xs uppercase tracking-wide text-neutral-200 focus:border-blue-800 focus:outline-none"
              />
            </label>
            <label>
              <span className="mb-1 block font-mono text-[9px] uppercase tracking-widest text-neutral-500">
                Reps
              </span>
              <input
                type="number"
                min="1"
                value={defaultReps}
                onChange={(event) =>
                  onDefaultRepsChange(Number(event.target.value))
                }
                className="w-full border border-edge bg-[#070707] px-3 py-2 font-mono text-xs uppercase tracking-wide text-neutral-200 focus:border-blue-800 focus:outline-none"
              />
            </label>
          </div>
          {error && (
            <p className="font-mono text-[9px] uppercase tracking-widest text-red-400">
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={onCreate}
            disabled={!name.trim() || !target.trim()}
            className="flex w-full items-center justify-center gap-2 bg-blue-600 py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-500"
          >
            <Plus className="h-3.5 w-3.5" />
            Create and add 3 x {defaultReps || 8}
          </button>
        </div>
      </div>
    </div>
  );
}
