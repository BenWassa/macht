import { CalendarCheck2 } from "lucide-react";
import type {
  RollingPlanStatus,
  WeeklyPlanStatus,
} from "@/domain/habit/types";

interface TrainingRhythmCardProps {
  current: WeeklyPlanStatus;
  rolling: RollingPlanStatus;
}

export function TrainingRhythmCard({
  current,
  rolling,
}: TrainingRhythmCardProps) {
  const percent = Math.round(current.coverage * 100);
  const rollingPercent = Math.round(rolling.coverage * 100);

  return (
    <section className="surface-card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-text">
            <CalendarCheck2 className="h-4 w-4 text-text-muted" aria-hidden="true" />
            Training rhythm
          </span>
          <p className="mt-1 text-xs text-text-muted">
            Weekly plan · {current.plannedSessions} session
            {current.plannedSessions === 1 ? "" : "s"}
          </p>
        </div>
        <span className="metric text-2xl font-bold text-text">
          {current.completedSessions}/{current.plannedSessions}
        </span>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-inset">
        <div
          className={`h-full rounded-full ${
            current.planMet ? "bg-positive" : "bg-signal"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 text-xs text-text-muted">
        <span>
          {current.remainingSessions > 0
            ? `${current.remainingSessions} planned this week`
            : "Weekly plan covered"}
        </span>
        <span className="metric">4-week coverage {rollingPercent}%</span>
      </div>
      <p className="mt-3 text-xs leading-5 text-text-muted">
        Sessions beyond the weekly plan are recorded, but they do not raise the target.
      </p>
    </section>
  );
}
