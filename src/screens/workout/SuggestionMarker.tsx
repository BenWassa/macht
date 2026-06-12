import type { LoadSuggestion } from "@/domain/progression";
import type { Units } from "@/domain/types";
import { useUiStore } from "@/state/useUiStore";

interface SuggestionMarkerProps {
  suggestion: LoadSuggestion;
  units: Units;
  onRevert: () => void;
}

const DETAILS: Record<LoadSuggestion["basis"], string> = {
  progress: "Step up",
  "add-rep": "Add one rep",
  deload: "Ease off",
  rust: "Ease back in",
  repeat: "Repeat load",
};

export function SuggestionMarker({
  suggestion,
  units,
  onRevert,
}: SuggestionMarkerProps) {
  const hintSeen = useUiStore((state) => state.progressionHintSeen);
  const dismissHint = useUiStore((state) => state.dismissProgressionHint);

  const { basis, deltaFromLast, lastWeight, lastReps, lastSummary } =
    suggestion;
  const up = basis === "progress" || basis === "add-rep";
  const label =
    basis === "progress"
      ? `▲ +${deltaFromLast} ${units}`
      : basis === "add-rep"
        ? "▲ +1 rep"
        : basis === "repeat" || deltaFromLast === 0
          ? "Hold"
        : deltaFromLast < 0
          ? `▼ ${deltaFromLast} ${units}`
          : "Hold";
  const revertLabel =
    basis === "add-rep"
      ? `Keep ${lastReps} reps`
      : `Use last (${lastWeight} ${units})`;
  const canRevert = deltaFromLast !== 0 || basis === "add-rep";

  return (
    <div className="mb-3 space-y-2">
      <div className="border border-blue-900/50 bg-blue-950/15 p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="block font-mono text-[9px] font-bold uppercase tracking-widest text-blue-400">
              Suggested load
            </span>
            <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="font-mono text-2xl font-black tracking-tight text-neutral-100">
                {suggestion.weight}
              </span>
              <span className="font-mono text-[10px] font-bold uppercase text-neutral-500">
                {units} x {suggestion.repTarget}
              </span>
              <span
                className={`font-mono text-[10px] font-bold ${
                  up ? "text-emerald-400" : "text-neutral-400"
                }`}
              >
                {label}
              </span>
            </div>
          </div>
          <span className="shrink-0 border border-blue-900/60 bg-black px-2 py-1 font-mono text-[8px] font-bold uppercase tracking-widest text-blue-300">
            {DETAILS[basis]}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-blue-900/30 pt-2">
          <span className="min-w-0 truncate font-mono text-[10px] text-neutral-500">
            Last top set: {lastSummary}
          </span>
          {canRevert && (
            <button
              onClick={onRevert}
              className="shrink-0 border border-edge bg-black px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-neutral-400 transition hover:border-neutral-700 hover:text-white"
            >
              {revertLabel}
            </button>
          )}
        </div>
      </div>
      {!hintSeen && (
        <div className="flex items-start justify-between gap-3 border border-blue-900/60 bg-blue-950/20 px-3 py-2">
          <p className="text-[11px] leading-relaxed text-blue-200/80">
            Guide only. Log the set you can actually lift today.
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
