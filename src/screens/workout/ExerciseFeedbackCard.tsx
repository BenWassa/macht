import type { ExerciseFeedback } from "@/domain/feedback/types";
import type { ExerciseFeedbackPatch } from "@/domain/execution/plannedWorkout";

interface ExerciseFeedbackCardProps {
  feedback?: ExerciseFeedback;
  onUpdate: (patch: ExerciseFeedbackPatch) => void;
}

const recoveryOptions: Array<{
  value: NonNullable<ExerciseFeedback["recovery"]>;
  label: string;
}> = [
  { value: "recovered", label: "Recovered" },
  { value: "mild_fatigue", label: "Some fatigue" },
  { value: "meaningful_fatigue", label: "Still fatigued" },
];

const stimulusOptions: Array<{
  value: NonNullable<ExerciseFeedback["stimulus"]>;
  label: string;
}> = [
  { value: "low", label: "Low" },
  { value: "adequate", label: "Good" },
  { value: "high", label: "High" },
];

export function ExerciseFeedbackCard({
  feedback,
  onUpdate,
}: ExerciseFeedbackCardProps) {
  return (
    <section className="surface-card space-y-4 p-4">
      <div>
        <h3 className="text-sm font-bold text-text">Training feedback</h3>
        <p className="mt-1 text-xs leading-5 text-text-muted">
          Optional. Recovery plus stimulus gives the volume engine enough evidence to consider a small set change. Leaving either blank keeps volume stable.
        </p>
      </div>

      <fieldset>
        <legend className="text-xs font-semibold text-text-secondary">
          Recovery coming into this exercise
        </legend>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {recoveryOptions.map((option) => {
            const selected = feedback?.recovery === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={selected}
                onClick={() =>
                  onUpdate({ recovery: selected ? undefined : option.value })
                }
                className={`min-h-11 rounded-sm px-2 text-xs font-semibold transition ${
                  selected
                    ? "bg-signal-soft text-signal-strong"
                    : "bg-surface-3 text-text-secondary hover:bg-surface-2"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xs font-semibold text-text-secondary">
          Target-muscle stimulus from this exercise
        </legend>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {stimulusOptions.map((option) => {
            const selected = feedback?.stimulus === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={selected}
                onClick={() =>
                  onUpdate({ stimulus: selected ? undefined : option.value })
                }
                className={`min-h-11 rounded-sm px-2 text-xs font-semibold transition ${
                  selected
                    ? "bg-signal-soft text-signal-strong"
                    : "bg-surface-3 text-text-secondary hover:bg-surface-2"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </fieldset>
    </section>
  );
}
