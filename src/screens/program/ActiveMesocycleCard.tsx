import { CalendarDays, Check, Circle, Gauge } from "lucide-react";
import { findNextPlannedSession } from "@/domain/training/activeSession";
import type { Mesocycle } from "@/domain/training/types";

interface ActiveMesocycleCardProps {
  mesocycle?: Mesocycle;
}

export function ActiveMesocycleCard({ mesocycle }: ActiveMesocycleCardProps) {
  if (!mesocycle) {
    return (
      <section className="surface-card p-4 sm:p-5">
        <p className="text-sm font-semibold text-text">No active cycle</p>
        <p className="mt-1 text-sm leading-5 text-text-muted">
          Save the program, then start a cycle to generate the prescriptions used by Today and Session.
        </p>
      </section>
    );
  }

  const next = findNextPlannedSession(mesocycle);
  const completed = mesocycle.weeks.flatMap((week) => week.sessions).filter(
    (session) => session.status === "completed",
  ).length;
  const total = mesocycle.weeks.flatMap((week) => week.sessions).length;
  const currentWeek = next?.week ?? mesocycle.weeks[mesocycle.weeks.length - 1];

  return (
    <section className="surface-raised p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-positive">Active cycle</p>
          <h2 className="mt-1 text-xl font-bold tracking-[-0.025em] text-text">
            {mesocycle.name ?? `Cycle ${mesocycle.index}`}
          </h2>
        </div>
        <span className="metric rounded-full bg-positive-soft px-3 py-1.5 text-xs font-bold text-positive">
          {completed}/{total}
        </span>
      </div>

      {currentWeek ? (
        <div className="mt-4 rounded-md bg-surface-1 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-text">
              <CalendarDays className="h-4 w-4 text-text-muted" aria-hidden="true" />
              Week {currentWeek.index} of {mesocycle.weeks.length}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                currentWeek.phase === "deload"
                  ? "bg-info-soft text-info"
                  : "bg-signal-soft text-signal-strong"
              }`}
            >
              <Gauge className="h-3.5 w-3.5" aria-hidden="true" />
              {currentWeek.phase === "deload" ? "Deload" : "Build"}
            </span>
          </div>

          <div className="mt-3 space-y-2">
            {currentWeek.sessions.map((session) => {
              const done = session.status === "completed";
              return (
                <div
                  key={session.id}
                  className="flex min-h-10 items-center justify-between gap-3 text-sm"
                >
                  <span className="inline-flex min-w-0 items-center gap-2 text-text-secondary">
                    {done ? (
                      <Check className="h-4 w-4 shrink-0 text-positive" aria-hidden="true" />
                    ) : (
                      <Circle className="h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />
                    )}
                    <span className="truncate">{session.name}</span>
                  </span>
                  <span className="shrink-0 text-xs text-text-muted">
                    {session.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      <p className="mt-3 text-xs leading-5 text-text-muted">
        Editing the program definition below affects the next cycle. This active cycle keeps its generated prescriptions and completed history intact.
      </p>
    </section>
  );
}
