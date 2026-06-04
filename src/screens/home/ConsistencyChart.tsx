import type { SessionLog } from "@/domain/types";

interface WeekBucket {
  week: string;
  count: number;
  restricted: boolean;
  note: string;
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
    const restricted = weekSessions.some((session) => session.adapted);
    return {
      week: index === 5 ? "NOW" : `${weeksAgo}W`,
      count: weekSessions.length,
      restricted,
      note: restricted ? "Adapted" : "",
    };
  });
}

export function ConsistencyChart({ sessions }: { sessions: SessionLog[] }) {
  const weeks = rollingWeeks(sessions);

  return (
    <div className="mb-10">
      <h2 className="mb-3 font-mono text-[11px] uppercase tracking-wider text-neutral-400">
        Consistency
      </h2>
      <div className="border border-edge bg-canvas p-4 pb-3">
        <div className="mb-6 flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
            Trailing six weeks
          </span>
          <div className="flex space-x-4 font-mono text-[10px]">
            <span className="flex items-center space-x-1.5">
              <span className="inline-block h-2 w-2 bg-blue-600" />
              <span className="uppercase text-neutral-500">Logged</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="inline-block h-2 w-2 border-t border-red-500 bg-neutral-800" />
              <span className="uppercase text-neutral-500">Injury</span>
            </span>
          </div>
        </div>
        <div className="relative grid h-24 grid-cols-6 items-end gap-2 border-b border-edge pb-2">
          <div
            className="absolute left-0 right-0 border-t border-dashed border-neutral-800/50"
            style={{ bottom: "33.3%" }}
          >
            <span className="absolute -top-2 right-0 bg-canvas pl-1 font-mono text-[10px] text-neutral-500">
              Floor: 2
            </span>
          </div>
          <div
            className="absolute left-0 right-0 border-t border-[#1f1f1f]"
            style={{ bottom: "66.6%" }}
          >
            <span className="absolute -top-2 right-0 bg-canvas pl-1 font-mono text-[10px] text-neutral-500">
              Stretch: 4
            </span>
          </div>
          {weeks.map((week) => (
            <div
              key={week.week}
              className="group flex h-full flex-col items-center justify-end"
            >
              <span className="mb-1 font-mono text-[11px] text-neutral-300">
                {week.count}
              </span>
              <div
                className={`relative w-full transition-all duration-300 ${week.restricted ? "border-t border-red-500 bg-neutral-800" : "bg-blue-600"}`}
                style={{ height: `${Math.max((week.count / 6) * 100, 6)}%` }}
              >
                {week.note && (
                  <div className="absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap border border-red-900 bg-red-950 px-1 font-mono text-[9px] uppercase text-red-400">
                    {week.note}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-6 gap-2 pt-2 text-center">
          {weeks.map((week) => (
            <span
              key={week.week}
              className="font-mono text-[10px] uppercase text-neutral-500"
            >
              {week.week}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
