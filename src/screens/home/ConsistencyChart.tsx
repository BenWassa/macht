import type { SessionLog } from "@/domain/types";

interface WeekBucket {
  week: string;
  count: number;
  restricted: boolean;
}

function rollingWeeks(sessions: SessionLog[]): WeekBucket[] {
  const now = new Date();
  return Array.from({ length: 6 }, (_, index) => {
    const weeksAgo = 5 - index;
    const start = new Date(now);
    start.setDate(now.getDate() - weeksAgo * 7 - now.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    const weekSessions = sessions.filter((session) => {
      const date = new Date(`${session.date}T00:00:00`);
      return date >= start && date < end;
    });
    return {
      week: index === 5 ? "NOW" : `${weeksAgo}W`,
      count: weekSessions.length,
      restricted: weekSessions.some((session) => session.adapted),
    };
  });
}

/**
 * Slim six-week consistency strip. No floor/stretch lines or legend — the bar
 * heights and the trailing labels carry it. Injury weeks read as a muted hatch,
 * not an alarm.
 */
export function ConsistencyChart({ sessions }: { sessions: SessionLog[] }) {
  const weeks = rollingWeeks(sessions);
  const total = weeks.reduce((sum, week) => sum + week.count, 0);

  return (
    <div className="mb-10">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-mono text-[11px] uppercase tracking-wider text-neutral-400">
          Consistency
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-600">
          {total} sessions / 6w
        </span>
      </div>
      <div className="grid grid-cols-6 gap-2">
        {weeks.map((week) => (
          <div key={week.week} className="flex flex-col items-center gap-1.5">
            <span className="font-mono text-[10px] tabular-nums text-neutral-400">
              {week.count}
            </span>
            <div className="flex h-12 w-full items-end">
              <div
                className={`w-full transition-all duration-500 ease-out ${
                  week.count === 0
                    ? "h-px bg-neutral-800"
                    : week.restricted
                      ? "bg-yellow-700/60"
                      : "bg-blue-600"
                }`}
                style={{
                  height:
                    week.count === 0
                      ? undefined
                      : `${Math.min((week.count / 4) * 100, 100)}%`,
                }}
              />
            </div>
            <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-600">
              {week.week}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
