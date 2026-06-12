import type { LoadSuggestion } from "@/domain/progression";
import type { Units } from "@/domain/types";
import { useUiStore } from "@/state/useUiStore";

interface SuggestionMarkerProps {
  suggestion: LoadSuggestion;
  units: Units;
  onRevert: () => void;
}

const DETAILS: Record<LoadSuggestion["basis"], string> = {
  progress: "Suggested step up",
  "add-rep": "Same load, one more rep",
  deload: "Two tough sessions — ease off",
  rust: "A while since last time — ease back in",
  repeat: "",
};

export function SuggestionMarker({
  suggestion,
  units,
  onRevert,
}: SuggestionMarkerProps) {
  const hintSeen = useUiStore((state) => state.progressionHintSeen);
  const dismissHint = useUiStore((state) => state.dismissProgressionHint);

  const { basis, deltaFromLast, lastWeight, lastReps } = suggestion;
  if (basis === "repeat") return null;
  const up = basis === "progress" || basis === "add-rep";
  const label =
    basis === "progress"
      ? `▲ +${deltaFromLast} ${units}`
      : basis === "add-rep"
        ? "▲ +1 rep"
        : deltaFromLast < 0
          ? `▼ ${deltaFromLast} ${units}`
          : "▼ hold";
  const revertLabel =
    basis === "add-rep"
      ? `Keep ${lastReps} reps`
      : `Use last (${lastWeight} ${units})`;
  const canRevert = deltaFromLast !== 0 || basis === "add-rep";

  return (
    <div className="mb-2 space-y-2">
      <div className="flex items-center justify-between gap-3 border border-edge bg-well px-3 py-2">
        <div className="flex min-w-0 items-baseline gap-2">
          <span
            className={`shrink-0 font-mono text-[11px] font-bold ${
              up ? "text-emerald-400" : "text-neutral-400"
            }`}
          >
            {label}
          </span>
          <span className="truncate font-mono text-[9px] uppercase tracking-widest text-neutral-500">
            {DETAILS[basis]}
          </span>
        </div>
        {canRevert && (
          <button
            onClick={onRevert}
            className="shrink-0 border border-edge bg-black px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-neutral-400 transition hover:border-neutral-700 hover:text-white"
          >
            {revertLabel}
          </button>
        )}
      </div>
      {!hintSeen && (
        <div className="flex items-start justify-between gap-3 border border-blue-900/60 bg-blue-950/20 px-3 py-2">
          <p className="text-[11px] leading-relaxed text-blue-200/80">
            Suggested loads are a guide, not gospel — go heavier if you feel
            strong, lighter if you feel beat up.
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
