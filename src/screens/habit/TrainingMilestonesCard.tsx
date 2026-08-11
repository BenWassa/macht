import { Award, Check } from "lucide-react";
import type { TrainingMilestone } from "@/domain/habit/types";

interface TrainingMilestonesCardProps {
  milestones: TrainingMilestone[];
}

export function TrainingMilestonesCard({
  milestones,
}: TrainingMilestonesCardProps) {
  const achieved = milestones
    .filter((milestone) => milestone.achieved)
    .sort((a, b) => (b.achievedOn ?? "").localeCompare(a.achievedOn ?? ""))
    .slice(0, 3);

  if (!achieved.length) return null;

  return (
    <section className="surface-card p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <Award className="h-4 w-4 text-positive" aria-hidden="true" />
        <h2 className="text-base font-bold text-text">Training milestones</h2>
      </div>
      <div className="mt-3 space-y-3">
        {achieved.map((milestone) => (
          <div key={milestone.type} className="flex gap-3 rounded-md bg-surface-2 p-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-positive-soft text-positive">
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <p className="text-sm font-semibold text-text">{milestone.title}</p>
                {milestone.achievedOn ? (
                  <span className="text-[11px] text-text-muted">
                    {milestone.achievedOn}
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-xs leading-5 text-text-muted">
                {milestone.detail}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
