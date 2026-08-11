import { RotateCcw, Timer, X } from "lucide-react";
import { formatTime } from "@/lib/format";

interface RestTimerBannerProps {
  seconds: number;
  running: boolean;
  label?: string;
  doneText?: string;
  increments?: readonly [number, number];
  onAdd: (amount: number) => void;
  onToggle: () => void;
  onReset: () => void;
  onDismiss: () => void;
}

const incrementLabel = (amount: number): string => {
  const sign = amount > 0 ? "+" : "-";
  const abs = Math.abs(amount);
  return abs % 60 === 0 ? `${sign}${abs / 60}m` : `${sign}${abs}s`;
};

export function RestTimerBanner({
  seconds,
  running,
  label = "Rest",
  doneText = "Done — load next set",
  increments = [30, -10],
  onAdd,
  onToggle,
  onReset,
  onDismiss,
}: RestTimerBannerProps) {
  return (
    <aside
      aria-label={`${label} timer`}
      className="fixed inset-x-0 bottom-[calc(68px+env(safe-area-inset-bottom))] z-40 border-t border-divider bg-surface-1/98 px-3 py-3 shadow-raised backdrop-blur sm:px-4"
    >
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-h-11 items-center justify-between gap-3 sm:justify-start">
          <div className="flex min-w-0 items-center gap-3">
            <Timer
              className={`h-5 w-5 shrink-0 ${running ? "text-signal-strong" : "text-text-muted"}`}
              aria-hidden="true"
            />
            <div className="min-w-0">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">
                {label}
              </span>
              <span
                className={`metric block truncate text-sm font-bold ${seconds === 0 ? "text-positive" : "text-text"}`}
                aria-live="polite"
              >
                {seconds === 0 ? doneText : formatTime(seconds)}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            aria-label={`Dismiss ${label.toLowerCase()} timer`}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-sm text-text-muted transition hover:bg-surface-3 hover:text-text sm:hidden"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2 sm:flex sm:items-center">
          {increments.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => onAdd(amount)}
              className="metric min-h-11 rounded-sm bg-surface-3 px-3 text-xs font-semibold text-text-secondary transition hover:text-text"
            >
              {incrementLabel(amount)}
            </button>
          ))}
          <button
            type="button"
            onClick={onToggle}
            aria-pressed={running}
            className="min-h-11 rounded-sm bg-surface-3 px-3 text-xs font-semibold text-text-secondary transition hover:text-text"
          >
            {running ? "Pause" : "Resume"}
          </button>
          <button
            type="button"
            onClick={onReset}
            aria-label={`Reset ${label.toLowerCase()} timer`}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-sm bg-surface-3 text-text-secondary transition hover:text-text"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onDismiss}
            aria-label={`Dismiss ${label.toLowerCase()} timer`}
            className="hidden min-h-11 min-w-11 items-center justify-center rounded-sm text-text-muted transition hover:bg-surface-3 hover:text-text sm:flex"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  );
}
