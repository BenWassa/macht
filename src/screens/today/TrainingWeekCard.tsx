import { CalendarDays } from "lucide-react";
import type { TodayModel } from "@/domain/today";

interface TrainingWeekCardProps {
  model: TodayModel;
}

export function TrainingWeekCard({ model }: TrainingWeekCardProps) {
  const adherence = Math.min(
    100,
    Math.round((model.completedThisWeek / Math.max(model.weeklyTarget, 1)) * 100),
  );
  const progress = model.program.progress
    ? Math.min(
        100,
        Math.round(
          (model.program.progress.current / Math.max(model.program.progress.total, 1)) *
            100,
        ),
      )
    : null;

  return (
    <section className="surface-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-text">
            <CalendarDays className="h-4 w-4 text-info" aria-hidden="true" />
            Training week
          </div>
          <p className="mt-1 text-sm text-text-muted">{model.program.label}</p>
        </div>
        {model.program.phase ? (
          <span className="rounded-full bg-surface-3 px-2.5 py-1 text-xs font-semibold capitalize text-text-secondary">
            {model.program.phase}
          </span>
        ) : null}
      </div>

      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          <span data-metric="true" className="text-3xl font-bold text-text">
            {model.completedThisWeek}
          </span>
          <span className="ml-1 text-sm font-medium text-text-muted">
            / {model.weeklyTarget} sessions
          </span>
        </div>
        <span className="text-sm font-medium text-text-secondary">{adherence}%</span>
      </div>
      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-surface-3"
        role="progressbar"
        aria-label="Weekly training completion"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={adherence}
      >
        <div
          className="h-full rounded-full bg-positive transition-[width] duration-300"
          style={{ width: `${adherence}%` }}
        />
      </div>

      <div className="mt-5 border-t border-divider pt-4">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-text-secondary">{model.program.detail}</span>
          {progress != null ? (
            <span data-metric="true" className="font-semibold text-text-muted">
              {progress}%
            </span>
          ) : null}
        </div>
        {progress != null ? (
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-3">
            <div
              className="h-full rounded-full bg-info"
              style={{ width: `${progress}%` }}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
