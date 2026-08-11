import type { MuscleProgress } from "@/domain/progress/model";

interface MuscleProgressViewProps {
  muscles: MuscleProgress[];
  windowDays?: number;
}

const priorityLabel = (priority?: MuscleProgress["priority"]) => {
  switch (priority) {
    case "emphasize":
      return "Emphasize";
    case "maintain":
      return "Maintain";
    case "grow":
      return "Grow";
    default:
      return "Unassigned";
  }
};

export function MuscleProgressView({
  muscles,
  windowDays = 28,
}: MuscleProgressViewProps) {
  if (!muscles.length) {
    return (
      <div className="surface-card p-6 text-center text-sm text-text-muted">
        Muscle training exposure will appear after completed sessions are recorded.
      </div>
    );
  }

  const maxSets = Math.max(1, ...muscles.map((muscle) => muscle.targetedSets));

  return (
    <section className="surface-card p-4 sm:p-5">
      <div>
        <h2 className="text-lg font-bold text-text">Muscle training exposure</h2>
        <p className="mt-1 text-sm leading-5 text-text-muted">
          Completed targeted sets across the last {windowDays} days. Multi-muscle exercises
          contribute to each listed target muscle.
        </p>
      </div>

      <div className="mt-5 space-y-4">
        {muscles.map((muscle) => (
          <div key={muscle.muscleId}>
            <div className="flex items-end justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-text">{muscle.name}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      muscle.priority === "emphasize"
                        ? "bg-signal-soft text-signal-strong"
                        : muscle.priority === "maintain"
                          ? "bg-info-soft text-info"
                          : "bg-surface-3 text-text-muted"
                    }`}
                  >
                    {priorityLabel(muscle.priority)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-text-muted">
                  {muscle.sessions} session{muscle.sessions === 1 ? "" : "s"}
                  {muscle.latestDate ? ` · latest ${muscle.latestDate}` : ""}
                </p>
              </div>
              <span className="metric text-xl font-bold text-text">
                {muscle.targetedSets}
                <span className="ml-1 text-xs font-medium text-text-muted">sets</span>
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-inset">
              <div
                className="h-full rounded-full bg-[var(--chart-volume)]"
                style={{ width: `${(muscle.targetedSets / maxSets) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
