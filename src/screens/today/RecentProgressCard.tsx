import { TrendingUp } from "lucide-react";
import { StatePanel } from "@/components/ui/StatePanel";
import type { TodayProgressHighlight } from "@/domain/today";

interface RecentProgressCardProps {
  highlight?: TodayProgressHighlight;
}

export function RecentProgressCard({ highlight }: RecentProgressCardProps) {
  if (!highlight) {
    return (
      <StatePanel
        tone="neutral"
        eyebrow="Progress"
        title="Build the signal"
        description="Complete a few repeat exercises and Macht will surface meaningful performance changes here."
      />
    );
  }

  return (
    <section className="surface-card p-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-positive">
        <TrendingUp className="h-4 w-4" aria-hidden="true" />
        Recent progress
      </div>
      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold tracking-[-0.02em] text-text">
            {highlight.exerciseName}
          </h3>
          <p className="mt-1 text-sm text-text-muted">Estimated 1RM trend</p>
        </div>
        <div className="text-right">
          <div data-metric="true" className="text-2xl font-bold text-positive">
            +{Math.round(highlight.delta)}
          </div>
          <div className="text-xs font-medium text-text-muted">
            {Math.round(highlight.previous)} → {Math.round(highlight.current)}
          </div>
        </div>
      </div>
    </section>
  );
}
