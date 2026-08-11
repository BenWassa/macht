import { Award, CalendarCheck2, Layers3, TrendingUp } from "lucide-react";
import type {
  ConsistencyWeek,
  MesocycleProgressSummary,
  ProgressRecord,
  ProgressWorkout,
} from "@/domain/progress/model";
import type { Units } from "@/domain/types";

interface ProgressOverviewProps {
  workouts: ProgressWorkout[];
  weeks: ConsistencyWeek[];
  plannedCoverage?: number;
  records: ProgressRecord[];
  cycles: MesocycleProgressSummary[];
  units: Units;
}

const metricCard =
  "surface-card min-w-0 p-4";

export function ProgressOverview({
  workouts,
  weeks,
  plannedCoverage,
  records,
  cycles,
  units,
}: ProgressOverviewProps) {
  const recentWeeks = weeks.slice(-4);
  const sessions = recentWeeks.reduce(
    (sum, week) => sum + week.completedSessions,
    0,
  );
  const activeWeeks = recentWeeks.filter(
    (week) => week.completedSessions > 0,
  ).length;
  const recentStart = recentWeeks[0]?.startDate ?? "9999-12-31";
  const recentRecords = records.filter((record) => record.date >= recentStart);
  const latestCycle = cycles[0];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className={metricCard}>
          <CalendarCheck2 className="h-4 w-4 text-text-muted" aria-hidden="true" />
          <p className="metric mt-3 text-3xl font-bold text-text">{sessions}</p>
          <p className="mt-1 text-xs text-text-muted">Sessions · 4 weeks</p>
        </div>
        <div className={metricCard}>
          <Layers3 className="h-4 w-4 text-text-muted" aria-hidden="true" />
          <p className="metric mt-3 text-3xl font-bold text-text">{activeWeeks}</p>
          <p className="mt-1 text-xs text-text-muted">Weeks with training</p>
        </div>
        <div className={metricCard}>
          <TrendingUp className="h-4 w-4 text-text-muted" aria-hidden="true" />
          <p className="metric mt-3 text-3xl font-bold text-text">
            {plannedCoverage == null ? "—" : `${Math.round(plannedCoverage * 100)}%`}
          </p>
          <p className="mt-1 text-xs text-text-muted">Planned sessions completed</p>
        </div>
        <div className={metricCard}>
          <Award className="h-4 w-4 text-text-muted" aria-hidden="true" />
          <p className="metric mt-3 text-3xl font-bold text-text">{recentRecords.length}</p>
          <p className="mt-1 text-xs text-text-muted">Performance records · 4 weeks</p>
        </div>
      </div>

      <section className="surface-card p-4 sm:p-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-text">Session consistency</h2>
            <p className="mt-1 text-sm text-text-muted">Eight-week completed-session history</p>
          </div>
        </div>
        <div className="mt-5 flex h-36 items-end gap-2" aria-label="Weekly completed sessions">
          {weeks.map((week) => {
            const target = Math.max(week.targetSessions ?? 1, week.completedSessions, 1);
            const height = Math.max(8, (week.completedSessions / target) * 100);
            return (
              <div key={week.startDate} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <span className="metric text-xs font-semibold text-text-secondary">
                  {week.completedSessions}
                </span>
                <div className="relative flex h-24 w-full max-w-8 items-end overflow-hidden rounded-sm bg-inset">
                  <div
                    className={`w-full rounded-sm ${
                      week.targetMet ? "bg-positive" : "bg-signal"
                    }`}
                    style={{ height: `${Math.min(100, height)}%` }}
                  />
                </div>
                <span className="truncate text-[10px] text-text-muted">
                  {week.startDate.slice(5)}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid gap-5 sm:grid-cols-2">
        <section className="surface-card p-4 sm:p-5">
          <h2 className="text-lg font-bold text-text">Current cycle</h2>
          {latestCycle ? (
            <div className="mt-4 space-y-3">
              <div>
                <p className="font-semibold text-text">{latestCycle.name}</p>
                <p className="mt-1 text-xs text-text-muted">
                  {latestCycle.status} · {latestCycle.completedSessions}/{latestCycle.plannedSessions} sessions
                </p>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-inset">
                <div
                  className="h-full rounded-full bg-positive"
                  style={{ width: `${Math.round(latestCycle.completionRate * 100)}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-sm bg-surface-2 p-3">
                  <span className="metric font-bold text-text">{latestCycle.totalSets}</span>
                  <span className="ml-1 text-xs text-text-muted">sets</span>
                </div>
                <div className="rounded-sm bg-surface-2 p-3">
                  <span className="metric font-bold text-text">{latestCycle.records}</span>
                  <span className="ml-1 text-xs text-text-muted">records</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-text-muted">
              Cycle comparison will appear after v2 program sessions are completed.
            </p>
          )}
        </section>

        <section className="surface-card p-4 sm:p-5">
          <h2 className="text-lg font-bold text-text">Recent records</h2>
          {records.length ? (
            <div className="mt-3 space-y-3">
              {records.slice(0, 4).map((record) => (
                <div key={`${record.workoutId}-${record.exerciseId}-${record.type}`}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="truncate text-sm font-semibold text-text">
                      {record.exerciseName}
                    </span>
                    <span className="metric shrink-0 text-sm font-bold text-positive">
                      {record.value.toFixed(record.type === "e1rm" ? 1 : 0)} {units}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-text-muted">
                    {record.type === "e1rm" ? "Estimated strength" : "Load"} · {record.date}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-text-muted">
              First exposures establish baselines. Later all-time improvements appear here.
            </p>
          )}
        </section>
      </div>

      {workouts.length === 0 ? (
        <p className="text-center text-sm text-text-muted">
          Complete a session to begin building Progress.
        </p>
      ) : null}
    </div>
  );
}
