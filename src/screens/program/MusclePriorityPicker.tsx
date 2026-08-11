import type { MusclePriority } from "@/domain/exercises/muscles";
import {
  PROGRAM_MUSCLES,
} from "@/domain/training/starterProgram";
import type { Program } from "@/domain/training/types";

interface MusclePriorityPickerProps {
  program: Program;
  onChange: (muscleId: string, priority: MusclePriority) => void;
}

const priorities: Array<{ value: MusclePriority; label: string }> = [
  { value: "maintain", label: "Maintain" },
  { value: "grow", label: "Grow" },
  { value: "emphasize", label: "Emphasize" },
];

export function MusclePriorityPicker({
  program,
  onChange,
}: MusclePriorityPickerProps) {
  return (
    <section className="surface-card p-4 sm:p-5">
      <div>
        <h2 className="text-lg font-bold text-text">Muscle priorities</h2>
        <p className="mt-1 text-sm leading-5 text-text-muted">
          Emphasize can receive extra volume when recovery supports it. Maintain keeps
          programming deliberately conservative.
        </p>
      </div>

      <div className="mt-4 space-y-3">
        {PROGRAM_MUSCLES.map((muscle) => {
          const selected = program.musclePriorities[muscle.id] ?? "grow";
          return (
            <div
              key={muscle.id}
              className="flex flex-col gap-2 border-b border-divider pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="text-sm font-semibold text-text">{muscle.name}</span>
              <div className="grid grid-cols-3 gap-1 rounded-md bg-inset p-1">
                {priorities.map((priority) => (
                  <button
                    key={priority.value}
                    type="button"
                    aria-pressed={selected === priority.value}
                    onClick={() => onChange(muscle.id, priority.value)}
                    className={`min-h-10 rounded-sm px-2 text-xs font-semibold transition ${
                      selected === priority.value
                        ? "bg-surface-3 text-text shadow-card"
                        : "text-text-muted hover:text-text-secondary"
                    }`}
                  >
                    {priority.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
