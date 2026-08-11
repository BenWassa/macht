import { CheckCircle2, RefreshCw, TimerReset, Zap } from "lucide-react";

interface PlannedWorkoutHeaderProps {
  sessionName: string;
  exerciseName: string;
  exerciseTarget?: string;
  prescriptionSummary: string;
  progressionAdjusted: boolean;
  wakeLockActive: boolean;
  onWarmup: () => void;
  onSwap: () => void;
  onToggleWakeLock: () => void;
  onFinish: () => void;
}

const actionClass =
  "flex min-h-11 items-center justify-center gap-1.5 rounded-sm bg-surface-1 px-3 text-xs font-semibold text-text-secondary transition hover:bg-surface-3 hover:text-text active:translate-y-px";

export function PlannedWorkoutHeader({
  sessionName,
  exerciseName,
  exerciseTarget,
  prescriptionSummary,
  progressionAdjusted,
  wakeLockActive,
  onWarmup,
  onSwap,
  onToggleWakeLock,
  onFinish,
}: PlannedWorkoutHeaderProps) {
  return (
    <header className="space-y-4">
      <div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-text-muted">
          <span>{sessionName}</span>
          {progressionAdjusted ? (
            <span className="rounded-full bg-signal-soft px-2 py-1 text-signal-strong">
              Progression updated
            </span>
          ) : null}
        </div>
        <h1 className="mt-1 text-3xl font-bold tracking-[-0.04em] text-text">
          {exerciseName}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          {exerciseTarget ? `${exerciseTarget} · ` : ""}
          {prescriptionSummary}
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <button type="button" onClick={onWarmup} className={actionClass}>
          <TimerReset className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Warm up</span>
        </button>
        <button type="button" onClick={onSwap} className={actionClass}>
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Swap</span>
        </button>
        <button
          type="button"
          aria-pressed={wakeLockActive}
          onClick={onToggleWakeLock}
          className={actionClass}
        >
          <Zap className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">{wakeLockActive ? "Awake" : "Wake"}</span>
        </button>
        <button type="button" onClick={onFinish} className={actionClass}>
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Finish</span>
        </button>
      </div>
    </header>
  );
}
