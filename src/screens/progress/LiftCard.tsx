import { SparklineChart } from "@/components/SparklineChart";
import type { Exercise, ExerciseConflict, Units } from "@/domain/types";

interface LiftCardProps {
  exercise?: Exercise;
  values: number[];
  conflict: ExerciseConflict | null;
  units: Units;
  streak: number;
  monthPct: number | null;
  projected: number | null;
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div>
      <span className="block font-mono text-[9px] uppercase text-neutral-500">
        {label}
      </span>
      <span
        className={`block font-mono text-sm font-bold ${tone ?? "text-neutral-200"}`}
      >
        {value}
      </span>
    </div>
  );
}

export function LiftCard({
  exercise,
  values,
  conflict,
  units,
  streak,
  monthPct,
  projected,
}: LiftCardProps) {
  const current = values[values.length - 1] ?? 0;
  const best = Math.max(...values, 0);
  const paused = conflict?.level === "avoid";

  return (
    <div className="space-y-4 border border-[#1a1a1a] bg-[#0c0c0c] p-5">
      <div className="flex flex-col justify-between gap-2 border-b border-[#1a1a1a] pb-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-mono text-sm font-bold uppercase tracking-tight text-neutral-200">
              {exercise?.name}
            </h3>
            {!paused && streak >= 2 && (
              <span className="border border-emerald-900 bg-emerald-950/40 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                ▲ {streak} in a row
              </span>
            )}
          </div>
          <p className="mt-0.5 font-mono text-[9px] uppercase text-neutral-500">
            Estimated 1RM · Brzycki
          </p>
        </div>
        <div className="flex space-x-6 text-right">
          <Stat label="Current" value={current ? `${current} ${units}` : "-"} />
          <Stat
            label="Best"
            value={best ? `${best} ${units}` : "-"}
            tone="text-neutral-300"
          />
          <Stat
            label="Month"
            value={
              paused
                ? "Paused"
                : monthPct === null
                  ? "-"
                  : `${monthPct >= 0 ? "+" : ""}${monthPct}%`
            }
            tone={
              paused || monthPct === null
                ? "text-neutral-500"
                : "text-emerald-400"
            }
          />
        </div>
      </div>
      <div className="relative">
        {paused && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center border border-[#1a1a1a] bg-black/90 p-4 text-center">
            <span className="border border-red-900 bg-red-950/40 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-red-400">
              Tracking paused
            </span>
            <p className="mt-2 max-w-sm text-[11px] text-neutral-500">
              {conflict?.injury} affects this lift.
            </p>
          </div>
        )}
        <SparklineChart
          data={values.length ? values : [0, 0]}
          paused={paused}
          projected={projected}
        />
        {!paused && projected !== null && (
          <p className="mt-1.5 font-mono text-[9px] uppercase tracking-wider text-neutral-600">
            <span className="text-emerald-500">◌</span> Projected next — from
            your suggested load
          </p>
        )}
      </div>
    </div>
  );
}
