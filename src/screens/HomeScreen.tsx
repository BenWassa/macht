import { Play } from "lucide-react";
import { DEFAULT_TEMPLATE } from "@/domain/exercises";
import type { TabId } from "@/App";
import { useHistoryStore } from "@/state/useHistoryStore";
import { useWorkoutStore } from "@/state/useWorkoutStore";

interface HomeScreenProps {
  setActiveTab: (tab: TabId) => void;
}

function rollingWeeks(
  sessions: ReturnType<typeof useHistoryStore.getState>["sessions"],
) {
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
      note: weekSessions.some((session) => session.adapted) ? "Adapted" : "",
    };
  });
}

export function HomeScreen({ setActiveTab }: HomeScreenProps) {
  const sessions = useHistoryStore((state) => state.sessions);
  const startTemplate = useWorkoutStore((state) => state.startTemplate);
  const weeks = rollingWeeks(sessions);

  const start = () => {
    startTemplate(DEFAULT_TEMPLATE);
    setActiveTab("workout");
  };

  return (
    <div className="animate-fadeIn">
      <div className="mb-8">
        <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.15em] text-neutral-400">
          Strength log
        </p>
        <h1 className="font-mono text-2xl font-bold uppercase tracking-tight text-white">
          Console
        </h1>
      </div>

      <div className="mb-10 flex flex-col items-start justify-between gap-5 border border-edge bg-canvas p-6 sm:flex-row sm:items-center">
        <div>
          <span className="mb-1 block font-mono text-[11px] uppercase tracking-[0.2em] font-bold text-blue-500">
            Next session
          </span>
          <h3 className="font-mono text-base font-bold uppercase tracking-tight text-neutral-200">
            {DEFAULT_TEMPLATE.name}
          </h3>
          <p className="mt-1 font-mono text-xs text-neutral-400">
            {DEFAULT_TEMPLATE.notes}
          </p>
        </div>
        <button
          onClick={start}
          className="flex w-full items-center justify-center gap-2 bg-blue-600 px-6 py-4 font-mono text-sm font-bold uppercase tracking-widest text-white transition hover:bg-blue-700 active:bg-blue-800 sm:w-auto"
        >
          <Play className="h-4 w-4 fill-white" /> Start session
        </button>
      </div>

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

      <div>
        <h2 className="mb-3 font-mono text-[11px] uppercase tracking-wider text-neutral-400">
          Activity history
        </h2>
        <div className="border-t border-edge">
          {sessions.length === 0 && (
            <button
              onClick={start}
              className="mt-4 w-full border border-dashed border-edge bg-well p-6 text-center font-mono text-[11px] uppercase tracking-widest text-neutral-500 transition hover:border-[#252525] hover:bg-canvas hover:text-neutral-400 active:bg-[#111]"
            >
              No sessions yet. Start your first session.
            </button>
          )}
          {sessions.slice(0, 6).map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between border-b border-edge py-3"
            >
              <div>
                <p className="font-mono text-sm font-bold uppercase text-neutral-200">
                  {session.template}
                </p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                  {session.date} · {session.duration} · {session.sets} sets
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm font-bold text-neutral-300">
                  {session.volume.toLocaleString()}{" "}
                  <span className="font-mono text-[10px] text-neutral-500">
                    lbs
                  </span>
                </p>
                {session.adapted && (
                  <span className="mt-0.5 block font-mono text-[10px] uppercase text-blue-400">
                    Adapted
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
