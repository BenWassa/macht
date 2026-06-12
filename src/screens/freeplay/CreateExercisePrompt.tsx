import { Plus } from "lucide-react";

export type CreateExerciseResult = { ok: true } | { ok: false; error: string };

interface CreateExercisePromptProps {
  name: string;
  target: string;
  error: string | null;
  onTargetChange: (target: string) => void;
  onCreate: () => void;
}

export function CreateExercisePrompt({
  name,
  target,
  error,
  onTargetChange,
  onCreate,
}: CreateExercisePromptProps) {
  return (
    <div className="border border-edge bg-black p-4">
      <p className="mb-3 text-center font-mono text-[10px] uppercase tracking-widest text-neutral-500">
        No matches
      </p>
      <div className="space-y-3">
        <div>
          <span className="mb-1 block font-mono text-[9px] uppercase tracking-widest text-neutral-500">
            New exercise
          </span>
          <p className="truncate font-mono text-xs font-bold uppercase text-neutral-200">
            {name}
          </p>
        </div>
        <input
          value={target}
          onChange={(event) => onTargetChange(event.target.value)}
          placeholder="Target, e.g. Biceps"
          className="w-full border border-edge bg-[#070707] px-3 py-2 font-mono text-xs uppercase tracking-wide text-neutral-200 placeholder:text-neutral-600 focus:border-blue-800 focus:outline-none"
        />
        {error && (
          <p className="font-mono text-[9px] uppercase tracking-widest text-red-400">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={onCreate}
          disabled={!target.trim()}
          className="flex w-full items-center justify-center gap-2 bg-blue-600 py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-500"
        >
          <Plus className="h-3.5 w-3.5" />
          Create and add
        </button>
      </div>
    </div>
  );
}
