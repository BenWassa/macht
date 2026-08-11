import { Clock3, Dumbbell, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { TodayModel } from "@/domain/today";

interface TodaySessionCardProps {
  model: TodayModel;
  onStart: () => void;
  adjusted?: boolean;
}

export function TodaySessionCard({
  model,
  onStart,
  adjusted = false,
}: TodaySessionCardProps) {
  return (
    <section className="surface-raised overflow-hidden p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-signal-strong">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Today
          </div>
          <h2 className="text-2xl font-bold tracking-[-0.035em] text-text sm:text-3xl">
            {model.sessionName}
          </h2>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-text-secondary">
            <span className="inline-flex items-center gap-1.5">
              <Dumbbell className="h-4 w-4" aria-hidden="true" />
              {model.exerciseCount} exercises
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="h-4 w-4" aria-hidden="true" />
              ≈{model.estimatedDurationMinutes} min
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex flex-wrap gap-2">
          {model.targetAreas.slice(0, 4).map((area) => (
            <span
              key={area}
              className="rounded-full bg-surface-3 px-3 py-1.5 text-xs font-medium text-text-secondary"
            >
              {area}
            </span>
          ))}
        </div>
        <div className="space-y-1 text-sm text-text-secondary">
          {model.exerciseNames.slice(0, 4).map((name, index) => (
            <div key={`${name}-${index}`} className="flex gap-3">
              <span className="metric w-5 text-right text-text-muted">{index + 1}</span>
              <span>{name}</span>
            </div>
          ))}
          {model.exerciseNames.length > 4 ? (
            <div className="pl-8 text-text-muted">
              +{model.exerciseNames.length - 4} more
            </div>
          ) : null}
        </div>
      </div>

      {adjusted ? (
        <p className="mt-4 text-xs leading-5 text-text-muted">
          Session adjusted for current training constraints.
        </p>
      ) : null}

      <Button onClick={onStart} className="mt-6 w-full py-3.5 text-base">
        <Play className="h-4 w-4 fill-current" aria-hidden="true" />
        Start workout
      </Button>
    </section>
  );
}
