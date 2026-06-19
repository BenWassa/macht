import { PROGRESS_LIFT_SHORT } from "@/domain/exercises";
import type { LiftProfile } from "@/domain/strengthProfile";

/**
 * The Big Five as a single compact row beneath the hero number. Each lift shows
 * its short label and current e1RM. Paused lifts dim rather than shout — the
 * loud red badge lives on Progress, not Home.
 */
export function LiftStrip({
  lifts,
  units,
  onOpen,
}: {
  lifts: LiftProfile[];
  units: string;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group grid w-full grid-cols-5 divide-x divide-white/[0.06] border-t border-white/[0.06] text-left"
    >
      {lifts.map((lift) => (
        <div
          key={lift.exerciseId}
          className={`flex flex-col items-center gap-1 px-1 py-3 transition-colors group-hover:bg-white/[0.02] ${
            lift.paused ? "opacity-40" : ""
          }`}
        >
          <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-neutral-500">
            {PROGRESS_LIFT_SHORT[lift.exerciseId] ?? lift.name.slice(0, 3)}
          </span>
          <span className="font-mono text-sm font-bold tabular-nums text-neutral-100">
            {lift.current ?? "—"}
          </span>
          {lift.paused ? (
            <span className="font-mono text-[8px] uppercase tracking-wider text-red-400/80">
              Paused
            </span>
          ) : lift.monthPct !== null && lift.monthPct !== 0 ? (
            <span
              className={`font-mono text-[8px] font-bold tabular-nums ${
                lift.monthPct > 0 ? "text-emerald-400" : "text-neutral-600"
              }`}
            >
              {lift.monthPct > 0 ? "+" : ""}
              {lift.monthPct}%
            </span>
          ) : (
            <span className="font-mono text-[8px] uppercase tracking-wider text-neutral-700">
              {units}
            </span>
          )}
        </div>
      ))}
    </button>
  );
}
