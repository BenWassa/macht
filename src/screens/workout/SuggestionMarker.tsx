import { Undo2 } from "lucide-react";
import type { ProgressionForecastTarget } from "@/domain/progressionForecast";
import type { Units } from "@/domain/types";
import { useUiStore } from "@/state/useUiStore";

interface SuggestionMarkerProps {
  target: Pick<
    ProgressionForecastTarget,
    "target" | "delta" | "tactic" | "reason" | "baselineWeight" | "baselineReps"
  >;
  units: Units;
  onRevert: () => void;
}

export function SuggestionMarker({
  target,
  units,
  onRevert,
}: SuggestionMarkerProps) {
  const hintSeen = useUiStore((state) => state.progressionHintSeen);
  const dismissHint = useUiStore((state) => state.dismissProgressionHint);

  const canRevert =
    target.baselineWeight != null && target.baselineReps != null;
  const revertLabel = canRevert
    ? `Revert to baseline: ${target.baselineWeight} ${units} x ${target.baselineReps}`
    : "Revert to baseline";

  return (
    <div className="mb-3 space-y-2">
      <div className="border border-blue-900/60 bg-blue-950/15 p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="block font-mono text-[9px] font-bold uppercase tracking-widest text-blue-400">
              Forecast prefill
            </span>
            <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="font-mono text-2xl font-black tracking-tight text-neutral-100">
                {target.target}
              </span>
              <span className="font-mono text-[10px] font-bold uppercase text-blue-300">
                {target.delta}
              </span>
            </div>
          </div>
          <span className="shrink-0 border border-blue-900/60 bg-black px-2 py-1 font-mono text-[8px] font-bold uppercase tracking-widest text-blue-300">
            {target.tactic}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-blue-900/30 pt-2">
          <span className="min-w-0 font-mono text-[10px] leading-relaxed text-neutral-500">
            {target.reason}
          </span>
          {canRevert && (
            <button
              onClick={onRevert}
              className="flex shrink-0 items-center gap-1.5 border border-neutral-600 bg-black px-3 py-2 font-mono text-[9px] font-bold uppercase tracking-wider text-neutral-200 transition hover:border-blue-400 hover:text-white active:bg-blue-950/40"
            >
              <Undo2 className="h-3.5 w-3.5" />
              {revertLabel}
            </button>
          )}
        </div>
      </div>
      {!hintSeen && (
        <div className="flex items-start justify-between gap-3 border border-blue-900/60 bg-blue-950/20 px-3 py-2">
          <p className="text-[11px] leading-relaxed text-blue-200/80">
            {target.tactic}
          </p>
          <button
            onClick={dismissHint}
            className="shrink-0 font-mono text-[9px] font-bold uppercase tracking-wider text-blue-400 transition hover:text-blue-300"
          >
            Got it
          </button>
        </div>
      )}
    </div>
  );
}
