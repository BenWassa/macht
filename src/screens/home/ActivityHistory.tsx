import type { SessionLog } from "@/domain/types";

interface ActivityHistoryProps {
  sessions: SessionLog[];
  onStart: () => void;
}

export function ActivityHistory({ sessions, onStart }: ActivityHistoryProps) {
  return (
    <div>
      <h2 className="mb-3 font-mono text-[11px] uppercase tracking-wider text-neutral-400">
        Activity history
      </h2>
      <div className="border-t border-edge">
        {sessions.length === 0 && (
          <button
            onClick={onStart}
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
  );
}
