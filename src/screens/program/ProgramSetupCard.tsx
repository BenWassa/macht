import type { Program } from "@/domain/training/types";

interface ProgramSetupCardProps {
  program: Program;
  onNameChange: (name: string) => void;
  onSessionsChange: (sessions: 2 | 3 | 4 | 5 | 6) => void;
  onDurationChange: (minutes: number) => void;
}

const sessionOptions = [2, 3, 4, 5, 6] as const;
const durationOptions = [30, 45, 60, 75] as const;

export function ProgramSetupCard({
  program,
  onNameChange,
  onSessionsChange,
  onDurationChange,
}: ProgramSetupCardProps) {
  return (
    <section className="surface-card space-y-5 p-4 sm:p-5">
      <label className="block">
        <span className="text-xs font-semibold text-text-muted">Program name</span>
        <input
          value={program.name}
          onChange={(event) => onNameChange(event.target.value)}
          className="mt-2 min-h-11 w-full rounded-sm bg-inset px-3 text-base font-semibold text-text outline-none focus:ring-2 focus:ring-signal-strong"
        />
      </label>

      <div>
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm font-semibold text-text">Sessions per week</span>
          <span className="text-xs text-text-muted">Choose a schedule you can recover from consistently.</span>
        </div>
        <div className="mt-3 grid grid-cols-5 gap-1 rounded-md bg-inset p-1">
          {sessionOptions.map((count) => (
            <button
              key={count}
              type="button"
              aria-pressed={program.sessionsPerWeek === count}
              onClick={() => onSessionsChange(count)}
              className={`metric min-h-11 rounded-sm text-sm font-bold transition ${
                program.sessionsPerWeek === count
                  ? "bg-surface-3 text-text shadow-card"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {count}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs leading-5 text-text-muted">
          Changing days rebuilds the starter session layout. You can edit every session below.
        </p>
      </div>

      <div>
        <span className="text-sm font-semibold text-text">Target session time</span>
        <div className="mt-3 grid grid-cols-4 gap-1 rounded-md bg-inset p-1">
          {durationOptions.map((minutes) => (
            <button
              key={minutes}
              type="button"
              aria-pressed={program.defaultSessionDurationMinutes === minutes}
              onClick={() => onDurationChange(minutes)}
              className={`metric min-h-11 rounded-sm text-sm font-semibold transition ${
                program.defaultSessionDurationMinutes === minutes
                  ? "bg-surface-3 text-text shadow-card"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {minutes}m
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
