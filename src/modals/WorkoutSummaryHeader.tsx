import { Pencil, X } from "lucide-react";
import { formatWorkoutName } from "@/lib/format";

interface WorkoutSummaryHeaderProps {
  editing: boolean;
  template: string;
  name: string;
  setName: (value: string) => void;
  onStartEdit: () => void;
  onClose: () => void;
}

export function WorkoutSummaryHeader({
  editing,
  template,
  name,
  setName,
  onStartEdit,
  onClose,
}: WorkoutSummaryHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-[#1a1a1a] p-5">
      <div className="min-w-0">
        <p className="mb-1 font-mono text-[9px] uppercase tracking-widest text-neutral-500">
          {editing ? "Edit session" : "Session summary"}
        </p>
        {editing ? (
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-label="Session name"
            className="w-full border border-[#222] bg-black px-2 py-1 font-mono text-sm font-bold uppercase tracking-tight text-neutral-100 outline-none focus:border-blue-700"
          />
        ) : (
          <h2 className="truncate font-mono text-base font-bold uppercase tracking-tight text-neutral-100">
            {formatWorkoutName(template)}
          </h2>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {!editing && (
          <button
            onClick={onStartEdit}
            aria-label="Edit session details"
            className="flex items-center gap-1.5 border border-[#222] bg-black px-2.5 py-1.5 font-mono text-[9px] font-bold uppercase tracking-widest text-neutral-400 transition hover:text-neutral-100"
          >
            <Pencil className="h-3.5 w-3.5" /> Edit
          </button>
        )}
        <button
          onClick={onClose}
          aria-label="Close"
          className="border border-[#222] bg-black p-1.5 text-neutral-400 transition hover:text-neutral-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
